import jwt from "jsonwebtoken";
import { ENV } from "../config/environment.ts";
import { User } from "../models/user.model.ts";
const JWT_SECRET_ACCESS = ENV.JWT_SECRET_ACCESS;
const JWT_SECRET_REFRESH = ENV.JWT_SECRET_REFRESH;

function giveAccessToken(userid: string) {
  if (!JWT_SECRET_ACCESS) {
    throw new Error(
      "JWT_SECRET_ACCESS is not defined in environment variables",
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
      "JWT_SECRET_REFRESH is not defined in environment variables",
    );
  }
  const user = await User.findById(userid);
  if (!user) {
    throw new Error("User not found");
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
      "JWT_SECRET_ACCESS is not defined in environment variables",
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
      "JWT_SECRET_REFRESH is not defined in environment variables",
    );
  }
  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      JWT_SECRET_REFRESH,
    ) as { userid: string };
    const user = await User.findById(decodedRefreshToken.userid);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
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
      .json({ message: "Authorization header missing or malformed" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
async function authMiddlewareAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userid);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Admin access required or user not found" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
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
