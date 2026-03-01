import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Readable } from "node:stream";
import { Car } from "../models/car.model.js";
import { validateSellCarRequest } from "../validations/car.validation.js";
import { withPlateColorLabel } from "../utils/plate-color.js";
import { redactUserForViewer, resolveViewerContext } from "../utils/user-privacy.js";
import { cloudinary } from "../config/cloudinary.config.js";
import { closeExpiredAuctionSessions } from "../admin/auction-session.js";
import {
  UnsupportedCarModelError,
  getModelInfo,
  calculatePrice,
  formatPlateNumber,
} from "../middlewares/car.middleware.js";

const visibleProgress = [
  "Verified",
  "In auction",
  "Finished auction",
  "Verifying bidders",
];

function uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecg/cars",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Tải ảnh lên Cloudinary thất bại"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

async function getCarById(req: Request, res: Response) {
  try {
    await closeExpiredAuctionSessions();

    const { carId } = req.params;
    const viewer = await resolveViewerContext(req);
    const car = await Car.findById(carId)
      .populate({
        path: "car.seller",
        select: "phonenumber displayname email role",
      })
      .populate({
        path: "car.buyer",
        select: "phonenumber displayname email role",
      })
      .lean();

    if (!car) {
      return res.status(404).json({ message: "Không tìm thấy xe" });
    }

    const carData = car as any;

    if (carData?.car && typeof carData.car === "object") {
      carData.car.seller = redactUserForViewer(carData.car.seller, viewer);
      carData.car.buyer = redactUserForViewer(carData.car.buyer, viewer);
    }

    res.status(200).json(withPlateColorLabel(carData));
  } catch (error: Error | any) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết xe", error: error?.message });
  }
}

async function getCarsPaginated(req: Request, res: Response) {
  try {
    await closeExpiredAuctionSessions();

    const viewer = await resolveViewerContext(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { brand, location, maxPrice, auctionStatus } = req.query;

    const filter: any = { progress: { $in: visibleProgress } };

    if (typeof brand === "string" && brand.trim()) {
      filter["model.brand"] = brand.trim();
    }

    if (typeof location === "string" && location.trim()) {
      filter["car.location"] = location.trim();
    }

    const parsedMaxPrice = Number(maxPrice);
    if (!Number.isNaN(parsedMaxPrice) && parsedMaxPrice > 0) {
      filter["car.startingprice"] = { $lte: parsedMaxPrice };
    }

    if (auctionStatus === "auction") {
      filter.progress = "In auction";
      filter["bid.auctionSessionEndTime"] = { $gt: new Date() };
    }

    const [total, cars] = await Promise.all([
      Car.countDocuments(filter),
      Car.find(filter)
        .sort({ "car.posteddate": -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "car.seller", select: "displayname email" })
        .lean(),
    ]);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const mappedCars = cars.map((car: any) => {
      const formattedCar = withPlateColorLabel(car);
      if (formattedCar?.car && typeof formattedCar.car === "object") {
        formattedCar.car.seller = redactUserForViewer(formattedCar.car.seller, viewer);
      }
      return formattedCar;
    });
    res.status(200).json({
      data: mappedCars,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: Error | any) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách xe", error: error?.message });
  }
}

async function evaluateCar(req: Request, res: Response) {
  try {
    const car = req.body.car;
    // car will have brand, model, version, year, condition, mileage

    const modelInfo = await getModelInfo(car);
    if (!modelInfo) {
      return res.status(400).json({ message: "Thông tin xe không hợp lệ" });
    }
    const currentPrice = await calculatePrice(modelInfo);
    if (currentPrice === null) {
      return res.status(400).json({ message: "Không thể tính giá xe" });
    }
    res.status(200).json({ price: currentPrice });
  } catch (error: Error | any) {
    if (error instanceof UnsupportedCarModelError) {
      return res
        .status(400)
        .json({ message: "Mẫu xe này hiện chưa được hỗ trợ" });
    }
    res
      .status(500)
      .json({ message: "Lỗi khi định giá xe", error: error?.message });
  }
}

async function sellCarRequest(req: Request, res: Response) {
  try {
    const car = req.body.car;
    const sellerId = (req as any)?.user?.userid;

    if (!sellerId) {
      return res.status(401).json({ message: "Không có quyền tạo tin bán xe" });
    }

    if (car?.car && typeof car.car === "object") {
      car.car.seller = sellerId;
    }

    const requestWithFiles = req as Request & {
      files?: Express.Multer.File[];
    };
    const uploadedFiles = requestWithFiles.files ?? [];
    await validateSellCarRequest({ car }, uploadedFiles.length);

    const modelInfo = await getModelInfo(car);
    if (!modelInfo) {
      return res.status(400).json({ message: "Thông tin xe không hợp lệ" });
    }
    const currentPrice = await calculatePrice(modelInfo);
    if (currentPrice === null) {
      return res.status(400).json({ message: "Không thể tính giá xe" });
    }
    const formattedPlateNumber = await formatPlateNumber(car.car.platenumber);
    const uploadedImagePaths = await Promise.all(
      uploadedFiles.map((file) => uploadImageToCloudinary(file)),
    );

    const newCar = new Car({
      model: {
        brand: car.model.brand,
        model: car.model.model,
        type: modelInfo[5],
        version: car.model.version,
        fuel: modelInfo[6],
        year: car.model.year,
        transmission: modelInfo[7],
        tier: modelInfo[1],
      },
      car: {
        mileage: car.car.mileage,
        condition: car.car.condition,
        platecolor: car.car.platecolor,
        platenumber: formattedPlateNumber,
        startingprice: currentPrice,
        images: uploadedImagePaths,
        description: car.car.description,
        posteddate: new Date(),
        location: car.car.location,
        seller: car.car.seller,
        buyer: null,
      },
      progress: "Pending verification",
      bid: {
        followers: 0,
        currentprice: currentPrice,
        bidders: [],
        auctioncounter: 0,
        auctionSessionEndTime: null,
      },
    });
    await newCar.save();
    res.status(201).json({
      message: "Tạo yêu cầu bán xe thành công",
      imageCount: uploadedImagePaths.length,
      carId: newCar._id,
    });
  } catch (error: Error | any) {
    if (error instanceof UnsupportedCarModelError) {
      return res
        .status(400)
        .json({ message: "Mẫu xe này hiện chưa được hỗ trợ" });
    }

    if (error?.name === "ValidationError") {
      console.error("Chi tiết lỗi dữ liệu:", error.errors);
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error?.errors ?? [error?.message],
      });
    }

    return res.status(500).json({
      message: "Lỗi khi tạo yêu cầu bán xe",
      error: error?.message,
    });
  }
}

async function cancelSellCarRequest(req: Request, res: Response) {
  try {
    const { carId } = req.params as { carId: string };
    const userId = String((req as any)?.user?.userid || "");

    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: "carId không hợp lệ" });
    }

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: "Không tìm thấy xe" });
    }

    const sellerId = String(car?.car?.seller ?? "");
    if (!sellerId || sellerId !== userId) {
      return res.status(403).json({
        message: "Bạn chỉ có thể hủy tin bán của chính mình",
      });
    }

    const immediateCancelStatuses = ["Pending verification"];
    const requestCancelStatuses = ["Verified", "Finished auction", "Verifying bidders"];

    if (immediateCancelStatuses.includes(car.progress)) {
      car.progress = "Cancelled";
      await car.save();
      return res.status(200).json({
        message: "Đã hủy yêu cầu bán xe thành công",
        progress: car.progress,
      });
    }

    if (requestCancelStatuses.includes(car.progress)) {
      car.progress = "Cancel request";
      await car.save();
      return res.status(200).json({
        message:
          "Đã gửi yêu cầu hủy và đang chờ admin phê duyệt",
        progress: car.progress,
      });
    }

    return res.status(409).json({
      message: "Chỉ được hủy ở các trạng thái: Chờ duyệt, Đã duyệt, Kết thúc phiên, Đang xác minh bidder",
      reason: "invalid_status",
      progress: car.progress,
    });
  } catch (error: Error | any) {
    return res.status(500).json({
      message: "Lỗi khi hủy yêu cầu bán xe",
      error: error?.message,
    });
  }
}

async function getMyListings(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }

    const cars = await Car.find({ "car.seller": userId })
      .sort({ "car.posteddate": -1 })
      .populate({ path: "car.seller", select: "phonenumber displayname email role" })
      .populate({ path: "car.buyer", select: "phonenumber displayname email role" })
      .populate({ path: "bid.bidders.userid", select: "displayname email" })
      .lean();

    const mappedCars = cars.map((car) => withPlateColorLabel(car as any));
    return res.status(200).json({ data: mappedCars });
  } catch (error: Error | any) {
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách xe đã đăng",
      error: error?.message,
    });
  }
}

export {
  getCarById,
  getCarsPaginated,
  evaluateCar,
  sellCarRequest,
  cancelSellCarRequest,
  getMyListings,
};

