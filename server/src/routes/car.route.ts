import express from "express";
import {
	cancelSellCarRequest,
	getCarById,
	getCarsPaginated,
	evaluateCar,
	getMyListings,
	sellCarRequest,
} from "../controllers/car.controller.ts";
import { parseSellCarPayload, uploadSellCarImages } from "../middlewares/upload.middleware.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.route("/").get(getCarsPaginated);
router.route("/my-listings").get(authMiddleware.authMiddlewareUser, getMyListings);
router.route("/evaluate").post(evaluateCar);
router
	.route("/sell")
	.post(authMiddleware.authMiddlewareUser, uploadSellCarImages, parseSellCarPayload, sellCarRequest);
router.route("/:carId/cancel").patch(authMiddleware.authMiddlewareUser, cancelSellCarRequest);
router.route("/:carId").get(getCarById);

export default router;
