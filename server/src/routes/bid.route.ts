import express from "express";
import { getBidders, getMyBids, placeBid } from "../controllers/bid.controller.js";
import { processBiddersForResponse } from "../middlewares/bid.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/place").post(authMiddleware.authMiddlewareUser, placeBid);
router.route("/list").post(getBidders, processBiddersForResponse);
router.route("/my-bids").get(authMiddleware.authMiddlewareUser, getMyBids);

export default router;

