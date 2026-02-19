import express from "express";
import { signUp, logIn, logOut, refreshAccessToken } from "../controllers/auth.controller.ts";
import { token, authMiddleware } from "../middlewares/auth.middleware.ts";
const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(logIn);
router.route("/logout").post(logOut);
router.route("/refresh").post(refreshAccessToken);

export default router;