import express from "express";
import { SignUp, LogIn, LogOut } from "../controllers/auth.controller.ts";
const router = express.Router();

router.route("/signup").post(SignUp);
router.route("/login").post(LogIn);
router.route("/logout").post(LogOut);


export default router;