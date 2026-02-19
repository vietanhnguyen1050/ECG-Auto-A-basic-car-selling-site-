import express from "express";
import { addFavorites, deleteFavorites, getFavorites, getUserInfo } from "../controllers/user.controller.ts";
const router = express.Router();

router.route("/favorites").post(addFavorites).delete(deleteFavorites).get(getFavorites);
router.route("/info").get(getUserInfo);

export default router;