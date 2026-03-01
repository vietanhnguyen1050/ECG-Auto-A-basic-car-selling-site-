import type { Request, Response } from "express";
import { Brand } from "../models/brand.model.js";

async function getAllBrands(req: Request, res: Response) {
  try {
    const brands = await Brand.find({ activation: true });
    res.status(200).json(brands);
  } catch (error: Error | any) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách hãng xe", error: error?.message });
  }
}

export { getAllBrands };
