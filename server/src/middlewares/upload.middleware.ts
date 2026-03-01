import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Chỉ cho phép tệp hình ảnh"));
      return;
    }
    cb(null, true);
  },
});

export function uploadSellCarImages(req: Request, res: Response, next: NextFunction) {
  imageUpload.array("images", 5)(req, res, (err: any) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_COUNT") {
        res.status(400).json({ message: "Chỉ được tải lên tối đa 5 ảnh cho mỗi lần gửi" });
        return;
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Mỗi ảnh phải nhỏ hơn 5MB" });
        return;
      }
    }

    res.status(400).json({ message: err.message || "Tải ảnh thất bại" });
  });
}

export function parseSellCarPayload(req: Request, res: Response, next: NextFunction) {
  try {
    const rawCar = req.body.car;
    if (!rawCar) {
      res.status(400).json({ message: "Thiếu trường 'car'" });
      return;
    }

    if (typeof rawCar === "string") {
      req.body.car = JSON.parse(rawCar);
    }

    next();
  } catch {
    res.status(400).json({ message: "Trường 'car' phải là JSON hợp lệ" });
  }
}
