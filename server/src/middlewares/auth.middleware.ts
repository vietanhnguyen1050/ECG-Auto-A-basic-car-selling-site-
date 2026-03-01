import jwt from "jsonwebtoken";
import { ENV } from "../config/environment.js";
import { User } from "../models/user.model.js";
const JWT_SECRET_ACCESS = ENV.JWT_SECRET_ACCESS;
const JWT_SECRET_REFRESH = ENV.JWT_SECRET_REFRESH;

function giveAccessToken(userid: string) {
  if (!JWT_SECRET_ACCESS) {
    throw new Error(
      "Thiếu JWT_SECRET_ACCESS trong biến môi trường",
    );
  }
  const accessToken = jwt.sign({ userid }, JWT_SECRET_ACCESS, {
    expiresIn: "30m",
  });
  return accessToken;
}

async function giveRefreshToken(userid: string) {
  if (!JWT_SECRET_REFRESH) {
    throw new Error(
      "Thiếu JWT_SECRET_REFRESH trong biến môi trường",
    );
  }
  const user = await User.findById(userid);
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }
  const refreshToken = jwt.sign({ userid }, JWT_SECRET_REFRESH, {
    expiresIn: "7d",
  });
  user.refreshToken = refreshToken;
  await user.save();
  return refreshToken;
}

function verifyAccessToken(accessToken: string): any {
  if (!JWT_SECRET_ACCESS) {
    throw new Error(
      "Thiếu JWT_SECRET_ACCESS trong biến môi trường",
    );
  }
  try {
    const decodedAccessToken = jwt.verify(accessToken, JWT_SECRET_ACCESS);
    return decodedAccessToken;
  } catch (error) {
    throw error;
  }
}

async function verifyRefreshToken(refreshToken: string): Promise<any> {
  if (!JWT_SECRET_REFRESH) {
    throw new Error(
      "Thiếu JWT_SECRET_REFRESH trong biến môi trường",
    );
  }
  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      JWT_SECRET_REFRESH,
    ) as { userid: string };
    const user = await User.findById(decodedRefreshToken.userid);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Refresh token không hợp lệ");
    }
    return giveAccessToken(decodedRefreshToken.userid);
  } catch (error) {
    throw error;
  }
}

function authMiddlewareUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Thiếu header xác thực hoặc sai định dạng" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}
async function authMiddlewareAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Thiếu header xác thực hoặc sai định dạng" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userid);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Yêu cầu quyền admin hoặc không tìm thấy người dùng" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

export const token = {
  giveAccessToken,
  giveRefreshToken,
  verifyRefreshToken,
};

export const authMiddleware = {
  authMiddlewareUser,
  authMiddlewareAdmin,
};

