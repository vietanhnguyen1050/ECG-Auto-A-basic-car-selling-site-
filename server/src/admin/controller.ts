import type { Request, Response } from "express";
import { Readable } from "node:stream";
import { Brand } from "../models/brand.model.js";
import { Car } from "../models/car.model.js";
import { User } from "../models/user.model.js";
import { cloudinary } from "../config/cloudinary.config.js";
import { withPlateColorLabel } from "../utils/plate-color.js";
import {
	validateId,
	validateStartAuction,
	validateCreateBrand,
	validateUpdateBrand,
	validateUpdateCar,
	validateUpdateUserRole,
} from "./validation.js";

const noEditStatuses = ["Sold", "Cancelled", "Rejected", "Cancel request"];
const allowedStartAuctionStatuses = [
	"Verified",
	"Finished auction",
	"Verifying bidders",
];

function uploadImageToCloudinary(file: Express.Multer.File): Promise<string> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: "ecg/cars/admin",
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

function handleValidationError(error: Error | any, res: Response) {
	if (error?.name === "ValidationError") {
		return res.status(400).json({
			message: "Dữ liệu không hợp lệ",
			errors: error?.errors ?? [error?.message],
		});
	}

	return null;
}

async function getAllBrandsAdmin(req: Request, res: Response) {
	try {
		const brands = await Brand.find({});
		return res.status(200).json(brands);
	} catch (error: Error | any) {
		return res
			.status(500)
			.json({ message: "Lỗi khi lấy danh sách hãng", error: error?.message });
	}
}

async function getAllUsersAdmin(req: Request, res: Response) {
	try {
		const users = await User.find({});
		return res.status(200).json(users);
	} catch (error: Error | any) {
		return res
			.status(500)
			.json({ message: "Lỗi khi lấy danh sách người dùng", error: error?.message });
	}
}

async function getAllCarsAdmin(req: Request, res: Response) {
	try {
		const cars = await Car.find({})
			.populate({ path: "car.seller", select: "phonenumber displayname email role" })
			.populate({ path: "car.buyer", select: "phonenumber displayname email role" })
			.populate({ path: "bid.bidders.userid", select: "phonenumber displayname email role" })
			.lean();
		const mappedCars = cars.map((car) => withPlateColorLabel(car));
		return res.status(200).json(mappedCars);
	} catch (error: Error | any) {
		return res
			.status(500)
			.json({ message: "Lỗi khi lấy danh sách xe", error: error?.message });
	}
}

async function getAdminOverview(req: Request, res: Response) {
	try {
		const [brands, users, cars] = await Promise.all([
			Brand.find({}),
			User.find({}),
			Car.find({}),
		]);

		return res.status(200).json({ brands, users, cars });
	} catch (error: Error | any) {
		return res.status(500).json({
			message: "Lỗi khi lấy tổng quan admin",
			error: error?.message,
		});
	}
}

async function getUserByIdAdmin(req: Request, res: Response) {
	try {
		const { userId } = req.params;
		if (!userId) {
			return res.status(400).json({ message: "Thiếu userId" });
		}
		await validateId(userId, "userId");

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "Không tìm thấy người dùng" });
		}

		return res.status(200).json(user);
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res
			.status(500)
			.json({ message: "Lỗi khi lấy thông tin người dùng", error: error?.message });
	}
}

async function getCarByIdAdmin(req: Request, res: Response) {
	try {
		const { carId } = req.params;
		if (!carId) {
			return res.status(400).json({ message: "Thiếu carId" });
		}
		await validateId(carId, "carId");

		const car = await Car.findById(carId)
			.populate({ path: "car.seller", select: "phonenumber displayname email role" })
			.populate({ path: "car.buyer", select: "phonenumber displayname email role" })
			.populate({ path: "bid.bidders.userid", select: "phonenumber displayname email role" })
			.lean();

		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		return res.status(200).json(withPlateColorLabel(car));
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res
			.status(500)
			.json({ message: "Lỗi khi lấy thông tin xe", error: error?.message });
	}
}

async function updateUserRoleAdmin(req: Request, res: Response) {
	try {
		const { userId } = req.params;
		if (!userId) {
			return res.status(400).json({ message: "Thiếu userId" });
		}
		await validateId(userId, "userId");
		const { role } = await validateUpdateUserRole(req.body);

		const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
		if (!user) {
			return res.status(404).json({ message: "Không tìm thấy người dùng" });
		}

		return res.status(200).json({ message: "Cập nhật vai trò người dùng thành công", user });
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res
			.status(500)
			.json({ message: "Lỗi khi cập nhật vai trò người dùng", error: error?.message });
	}
}

async function updateCarAdmin(req: Request, res: Response) {
	try {
		const { carId } = req.params;
		if (!carId) {
			return res.status(400).json({ message: "Thiếu carId" });
		}
		await validateId(carId, "carId");
		const payload = await validateUpdateCar(req.body);

		const car = await Car.findById(carId);
		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		if (noEditStatuses.includes(car.progress)) {
			return res.status(409).json({
				message: "Xe này không thể chỉnh sửa ở trạng thái hiện tại",
				progress: car.progress,
			});
		}

		const now = new Date();
		const sessionEndTime = car.bid?.auctionSessionEndTime;
		if (
			car.progress === "In auction" &&
			(!sessionEndTime || now <= new Date(sessionEndTime))
		) {
			return res.status(409).json({
				message: "Không thể chỉnh sửa khi phiên đấu giá đang diễn ra",
			});
		}

		const currentProgress = car.progress;
		const nextProgress =
			typeof payload.progress === "string" ? payload.progress : currentProgress;

		if (payload.buyerId !== undefined) {
			if (currentProgress !== "Setting up legal documents") {
				return res.status(409).json({
					message: "Chỉ được cập nhật buyer khi xe ở trạng thái Setting up legal documents",
					progress: currentProgress,
				});
			}

			const bidderUserIds = new Set(
				(car.bid?.bidders ?? []).map((bidder: any) => String(bidder?.userid)),
			);
			if (!bidderUserIds.has(String(payload.buyerId))) {
				return res.status(409).json({
					message: "Buyer phải nằm trong danh sách bidder của phiên đấu giá",
				});
			}

			if (car.car) {
				car.car.buyer = payload.buyerId as any;
			}
		}

		if (nextProgress === "Sold") {
			const buyerAfterUpdate = payload.buyerId ?? car.car?.buyer;
			if (currentProgress !== "Setting up legal documents") {
				return res.status(409).json({
					message: "Chỉ được chuyển sang Sold từ trạng thái Setting up legal documents",
					progress: currentProgress,
				});
			}

			if (!buyerAfterUpdate) {
				return res.status(409).json({
					message: "Cần chọn buyer trước khi chuyển xe sang Sold",
				});
			}
		}

		if (typeof payload.progress === "string") {
			car.progress = payload.progress;
		}

		if (typeof payload.brand === "string") {
			car.model.brand = payload.brand;
		}
		if (typeof payload.model === "string") {
			car.model.model = payload.model;
		}
		if (typeof payload.version === "string") {
			car.model.version = payload.version;
		}
		if (typeof payload.year === "string") {
			car.model.year = payload.year;
		}
		if (typeof payload.type === "string") {
			car.model.type = payload.type;
		}
		if (typeof payload.fuel === "string") {
			car.model.fuel = payload.fuel;
		}
		if (typeof payload.transmission === "string") {
			car.model.transmission = payload.transmission;
		}
		if (payload.tier !== undefined) {
			car.model.tier = payload.tier;
		}

		if (payload.startingprice !== undefined && car.car) {
			car.car.startingprice = payload.startingprice;
			if (car.bid) {
				const bidData = car.bid as any;
				bidData.currentprice = payload.startingprice;
			}
		}

		if (payload.description !== undefined && car.car) {
			car.car.description = payload.description;
		}

		if (payload.mileage !== undefined && car.car) {
			car.car.mileage = payload.mileage;
		}

		if (payload.condition !== undefined && car.car) {
			car.car.condition = payload.condition;
		}

		if (payload.platecolor !== undefined && car.car) {
			car.car.platecolor = payload.platecolor;
		}

		if (payload.platenumber !== undefined && car.car) {
			car.car.platenumber = payload.platenumber;
		}

		if (payload.location !== undefined && car.car) {
			car.car.location = payload.location;
		}

		if (Array.isArray(payload.images) && car.car) {
			const normalizedImages = payload.images
				.map((imagePath: string) => String(imagePath || "").trim())
				.filter((imagePath: string) => imagePath.length > 0);
			const uniqueImages = Array.from(new Set(normalizedImages));

			if (uniqueImages.length > 5) {
				return res.status(400).json({
					message: "Tối đa 5 ảnh cho mỗi xe",
				});
			}

			car.car.images = uniqueImages;
		}

		if (Array.isArray(payload.removeImages) && payload.removeImages.length > 0 && car.car) {
			car.car.images = (car.car.images ?? []).filter(
				(imagePath: string) => !payload.removeImages?.includes(imagePath),
			);
		}

		await car.save();

		const populatedCar = await Car.findById(car._id)
			.populate({ path: "car.seller", select: "phonenumber displayname email role" })
			.populate({ path: "car.buyer", select: "phonenumber displayname email role" })
			.populate({ path: "bid.bidders.userid", select: "phonenumber displayname email role" })
			.lean();

		return res.status(200).json({
			message: "Cập nhật xe thành công",
			car: populatedCar ? withPlateColorLabel(populatedCar) : car,
		});
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res
			.status(500)
			.json({ message: "Lỗi khi cập nhật xe", error: error?.message });
	}
}

async function startAuctionSessionAdmin(req: Request, res: Response) {
	try {
		const { carId } = req.params;
		if (!carId) {
			return res.status(400).json({ message: "Thiếu carId" });
		}
		await validateId(carId, "carId");
		const { auctionSessionEndTime } = await validateStartAuction(req.body);

		const car = await Car.findById(carId);
		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		if (!allowedStartAuctionStatuses.includes(car.progress)) {
			return res.status(409).json({
				message: "Không thể đưa xe vào đấu giá từ trạng thái hiện tại",
				progress: car.progress,
			});
		}

		const endTime = new Date(auctionSessionEndTime);

		if (!car.bid) {
			car.bid = {
				followers: 0,
				currentprice: car.car?.startingprice ?? 0,
				bidders: [],
				auctioncounter: 0,
				auctionSessionEndTime: null,
			} as any;
		}

		const bidData = car.bid as any;

		car.progress = "In auction";
		if (car.car) {
			car.car.buyer = null;
		}
		bidData.bidders = [];
		bidData.auctioncounter = (bidData.auctioncounter ?? 0) + 1;
		bidData.currentprice = car.car?.startingprice ?? bidData.currentprice ?? 0;
		bidData.auctionSessionEndTime = endTime;

		await car.save();

		return res.status(200).json({
			message: "Bắt đầu phiên đấu giá thành công",
			progress: car.progress,
			auctioncounter: bidData.auctioncounter,
			auctionSessionEndTime: bidData.auctionSessionEndTime,
		});
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi bắt đầu phiên đấu giá",
			error: error?.message,
		});
	}
}

async function uploadCarImagesAdmin(req: Request, res: Response) {
	try {
		const { carId } = req.params;
		if (!carId) {
			return res.status(400).json({ message: "Thiếu carId" });
		}
		await validateId(carId, "carId");

		const requestWithFiles = req as Request & { files?: Express.Multer.File[] };
		const uploadedFiles = requestWithFiles.files ?? [];
		if (uploadedFiles.length === 0) {
			return res.status(400).json({ message: "Vui lòng chọn ít nhất một ảnh" });
		}

		const car = await Car.findById(carId);
		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		const existingImages = car.car?.images ?? [];
		const remainingSlots = 5 - existingImages.length;

		if (remainingSlots <= 0) {
			return res.status(409).json({ message: "Xe này đã đủ tối đa 5 ảnh" });
		}

		if (uploadedFiles.length > remainingSlots) {
			return res.status(400).json({
				message: `Chỉ có thể tải thêm ${remainingSlots} ảnh cho xe này`,
			});
		}

		const newImageUrls = await Promise.all(uploadedFiles.map((file) => uploadImageToCloudinary(file)));

		if (car.car) {
			car.car.images = [...existingImages, ...newImageUrls];
		}

		await car.save();

		return res.status(200).json({
			message: "Tải ảnh lên thành công",
			addedImages: newImageUrls,
			images: car.car?.images ?? [],
		});
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi tải ảnh xe lên",
			error: error?.message,
		});
	}
}

async function updateBrandAdmin(req: Request, res: Response) {
	try {
		const { brandId } = req.params;
		if (!brandId) {
			return res.status(400).json({ message: "Thiếu brandId" });
		}
		await validateId(brandId, "brandId");

		const payload = await validateUpdateBrand(req.body);

		const brandDoc = await Brand.findByIdAndUpdate(
			brandId,
			{
				brand: payload.brand,
				activation: payload.activation,
				models: payload.models,
			},
			{ new: true },
		);

		if (!brandDoc) {
			return res.status(404).json({ message: "Không tìm thấy hãng xe" });
		}

		return res.status(200).json({
			message: "Cập nhật hãng xe thành công",
			brand: brandDoc,
		});
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi cập nhật hãng xe",
			error: error?.message,
		});
	}
}

async function createBrandAdmin(req: Request, res: Response) {
	try {
		const payload = await validateCreateBrand(req.body);

		const existedBrand = await Brand.findOne({ brand: payload.brand });
		if (existedBrand) {
			return res.status(409).json({ message: "Hãng xe đã tồn tại" });
		}

		const brandDoc = await Brand.create({
			brand: payload.brand,
			activation: payload.activation,
			models: payload.models,
		});

		return res.status(201).json({
			message: "Tạo hãng xe thành công",
			brand: brandDoc,
		});
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi tạo hãng xe",
			error: error?.message,
		});
	}
}

async function deleteUserAdmin(req: Request, res: Response) {
	try {
		const { userId } = req.params;
		if (!userId) {
			return res.status(400).json({ message: "Thiếu userId" });
		}
		await validateId(userId, "userId");

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "Không tìm thấy người dùng" });
		}

		const linkedCar = await Car.findOne({
			$or: [
				{ "car.seller": user._id },
				{ "car.buyer": user._id },
				{ "bid.bidders.userid": user._id },
			],
		});

		if (linkedCar) {
			return res.status(409).json({
				message: "Không thể xóa người dùng vì đang liên kết với dữ liệu xe hoặc trả giá",
			});
		}

		await user.deleteOne();

		return res.status(200).json({ message: "Xóa người dùng thành công" });
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi xóa người dùng",
			error: error?.message,
		});
	}
}

async function deleteCarAdmin(req: Request, res: Response) {
	try {
		const { carId } = req.params;
		if (!carId) {
			return res.status(400).json({ message: "Thiếu carId" });
		}
		await validateId(carId, "carId");

		const car = await Car.findById(carId);
		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		const now = new Date();
		const sessionEndTime = car.bid?.auctionSessionEndTime;
		if (
			car.progress === "In auction" &&
			sessionEndTime &&
			now <= new Date(sessionEndTime)
		) {
			return res.status(409).json({
				message: "Không thể xóa xe khi phiên đấu giá đang diễn ra",
			});
		}

		await Car.findByIdAndDelete(carId);

		await User.updateMany(
			{},
			{
				$pull: {
					favoritecars: car._id,
					biddingcars: car._id,
					soldcars: car._id,
				},
			},
		);

		return res.status(200).json({ message: "Xóa xe thành công" });
	} catch (error: Error | any) {
		const validationResponse = handleValidationError(error, res);
		if (validationResponse) return validationResponse;
		return res.status(500).json({
			message: "Lỗi khi xóa xe",
			error: error?.message,
		});
	}
}

export {
	getAllBrandsAdmin,
	getAllUsersAdmin,
	getAllCarsAdmin,
	getAdminOverview,
	getUserByIdAdmin,
	getCarByIdAdmin,
	updateUserRoleAdmin,
	updateCarAdmin,
	startAuctionSessionAdmin,
	uploadCarImagesAdmin,
	createBrandAdmin,
	updateBrandAdmin,
	deleteUserAdmin,
	deleteCarAdmin,
};

