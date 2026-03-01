import express from "express";
import { signUp, logIn, logOut, refreshAccessToken, getMe, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").post(authMiddleware.authMiddlewareUser, logOut);
router.route("/refresh").post(refreshAccessToken);
router.route("/me").get(authMiddleware.authMiddlewareUser, getMe);
router.route("/profile").put(authMiddleware.authMiddlewareUser, updateProfile);
router.route("/password").put(authMiddleware.authMiddlewareUser, changePassword);

export default router;
