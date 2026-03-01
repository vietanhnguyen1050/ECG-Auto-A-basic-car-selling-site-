import express from "express";
import { getAllBrands } from "../controllers/brand.controller.ts";

const router = express.Router();

router.route("/").get(getAllBrands);

export default router;