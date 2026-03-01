import type { NextFunction, Request, Response } from "express";
import { Car } from "../models/car.model.ts";
import { validateBid, validateGetBidders } from "../validations/bid.validation.ts";
import { withPlateColorLabel } from "../utils/plate-color.ts";

async function placeBid(req: Request, res: Response) {
	try {
		const { data } = await validateBid(req.body);
		const { carId, userid, amount, time } = data;
		const authUserId = String((req as any)?.user?.userid || "");

		if (!authUserId) {
			return res.status(401).json({ message: "Không có quyền truy cập" });
		}

		if (String(userid) !== authUserId) {
			return res.status(403).json({
				message: "Bạn chỉ có thể trả giá bằng chính tài khoản của mình",
				reason: "bid_user_mismatch",
			});
		}

		const car = await Car.findById(carId);

		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		const sellerId = String(car?.car?.seller ?? "");
		if (sellerId && sellerId === authUserId) {
			return res.status(409).json({
				message: "Người bán không thể trả giá cho xe của chính mình",
				reason: "seller_cannot_bid_own_car",
			});
		}

		const auctionEndTime = car.bid?.auctionSessionEndTime;
		if (car.progress !== "In auction" || !auctionEndTime) {
			return res.status(409).json({
				message: "Xe hiện không ở phiên đấu giá đang hoạt động",
				reason: "not_in_session",
			});
		}

		const requestBidTime = new Date(time);
		const endTime = new Date(auctionEndTime);
		if (requestBidTime > endTime || new Date() > endTime) {
			return res.status(409).json({
				message: "Trả giá trễ: phiên đấu giá đã kết thúc",
				reason: "late_bid",
			});
		}

		const previousBid = car.bid ?? {
			followers: 0,
			currentprice: 0,
			bidders: [],
			auctioncounter: 0,
			auctionSessionEndTime: null,
		};

		const latestBid = (previousBid.bidders ?? []).at(-1);
		const latestBidderId = String(latestBid?.userid ?? "");
		if (latestBidderId && latestBidderId === String(userid)) {
			return res.status(409).json({
				message: "Bạn không thể trả giá liên tiếp 2 lần",
				reason: "consecutive_bid_not_allowed",
			});
		}

		const currentPrice = previousBid.currentprice ?? 0;
		const newBidAmount = currentPrice + amount;

		const updatedBidders = [
			...(previousBid.bidders ?? []),
			{
				userid,
				amount: newBidAmount,
				time,
			},
		];

		car.bid = {
			followers: previousBid.followers ?? 0,
			currentprice: newBidAmount,
			bidders: updatedBidders,
			auctioncounter: previousBid.auctioncounter ?? 0,
			auctionSessionEndTime: previousBid.auctionSessionEndTime ?? auctionEndTime,
		} as any;

		await car.save();

		res.status(201).json({
			message: "Trả giá thành công",
			bid: {
				carId,
				userid,
				incrementAmount: amount,
				currentprice: newBidAmount,
				time,
			},
		});
		return;
	} catch (error: Error | any) {
		if (error?.name === "ValidationError") {
			return res.status(400).json({
				message: "Dữ liệu không hợp lệ",
				errors: error?.errors ?? [error?.message],
			});
		}

		return res.status(500).json({
			message: "Lỗi khi trả giá",
			error: error?.message,
		});
	}
}

async function getBidders(req: Request, res: Response, next: NextFunction) {
	try {
		const { data } = await validateGetBidders(req.body);
		const { carId } = data;

		const car = await Car.findById(carId)
			.populate({
				path: "bid.bidders.userid",
				select: "phonenumber displayname email role",
			})
			.lean();

		if (!car) {
			return res.status(404).json({ message: "Không tìm thấy xe" });
		}

		res.locals.bidders = car.bid?.bidders ?? [];
		next();
		return;
	} catch (error: Error | any) {
		if (error?.name === "ValidationError") {
			return res.status(400).json({
				message: "Dữ liệu không hợp lệ",
				errors: error?.errors ?? [error?.message],
			});
		}

		return res.status(500).json({
			message: "Lỗi khi lấy danh sách bidder",
			error: error?.message,
		});
	}
}

async function getMyBids(req: Request, res: Response) {
	try {
		const userId = (req as any)?.user?.userid;
		if (!userId) {
			return res.status(401).json({ message: "Không có quyền truy cập" });
		}

		const cars = await Car.find({ "bid.bidders.userid": userId })
			.sort({ "car.posteddate": -1 })
			.populate({ path: "car.seller", select: "displayname email" })
			.populate({ path: "bid.bidders.userid", select: "displayname email" })
			.lean();

		const mappedCars = cars.map((car) => withPlateColorLabel(car as any));
		return res.status(200).json({ data: mappedCars });
	} catch (error: Error | any) {
		return res.status(500).json({
			message: "Lỗi khi lấy danh sách xe đã trả giá",
			error: error?.message,
		});
	}
}

export { placeBid, getBidders, getMyBids };

