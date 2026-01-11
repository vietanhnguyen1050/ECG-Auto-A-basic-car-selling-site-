import express from "express";
import { SignUp, logIn } from "../controllers/user.controller.ts";
const router = express.Router();

router.route("/signup").post(SignUp);
router.route("/login").post(logIn);

export default router;