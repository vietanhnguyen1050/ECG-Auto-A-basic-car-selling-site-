import express from "express";
import { getBidders, getMyBids, placeBid } from "../controllers/bid.controller.ts";
import { processBiddersForResponse } from "../middlewares/bid.middleware.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.route("/place").post(authMiddleware.authMiddlewareUser, placeBid);
router.route("/list").post(getBidders, processBiddersForResponse);
router.route("/my-bids").get(authMiddleware.authMiddlewareUser, getMyBids);

export default router;
