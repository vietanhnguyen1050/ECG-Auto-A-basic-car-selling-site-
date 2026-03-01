import express from "express";
import { addFavorites, deleteFavorites, getFavorites, getUserInfo } from "../controllers/user.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
const router = express.Router();

router.use(authMiddleware.authMiddlewareUser);

router.route("/favorites").post(addFavorites).delete(deleteFavorites).get(getFavorites);
router.route("/info").get(getUserInfo);

export default router;