import express from "express";
import {
	getAllBrandsAdmin,
	getAllCarsAdmin,
	getAdminOverview,
	getAllUsersAdmin,
	getCarByIdAdmin,
	deleteCarAdmin,
	deleteUserAdmin,
	createBrandAdmin,
	getUserByIdAdmin,
	startAuctionSessionAdmin,
	uploadCarImagesAdmin,
	updateBrandAdmin,
	updateCarAdmin,
	updateUserRoleAdmin,
} from "./controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { uploadSellCarImages } from "../middlewares/upload.middleware.ts";

const router = express.Router();

router.use(authMiddleware.authMiddlewareAdmin);

router.route("/overview").get(getAdminOverview);
router.route("/brands").get(getAllBrandsAdmin).post(createBrandAdmin);
router.route("/users").get(getAllUsersAdmin);
router.route("/cars").get(getAllCarsAdmin);

router.route("/users/:userId").get(getUserByIdAdmin);
router.route("/cars/:carId").get(getCarByIdAdmin);
router.route("/users/:userId").delete(deleteUserAdmin);
router.route("/cars/:carId").delete(deleteCarAdmin);

router.route("/users/:userId/role").patch(updateUserRoleAdmin);
router.route("/cars/:carId").patch(updateCarAdmin);
router.route("/cars/:carId/images").post(uploadSellCarImages, uploadCarImagesAdmin);
router.route("/cars/:carId/start-auction").patch(startAuctionSessionAdmin);

router.route("/brands/:brandId").put(updateBrandAdmin);

export default router;
