import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.ts";
// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
import {
  token, authMiddleware
} from "../middlewares/auth.middleware.ts";
import { userValidation } from "../validations/user.validation.ts";

async function signUp(req: Request, res: Response) {
  try {
    const { phonenumber, displayname, email, password } = req.body;
    await userValidation.createNewUserValidate(req.body);
    const existingUser =
      (await User.findOne({ phonenumber })) || (await User.findOne({ email }));
    if (existingUser) {
      return res.status(409).json({
        message: "User with this phonenumber or email already exists",
      });
    }
    await User.create({
      phonenumber,
      displayname,
      email,
      passworddbhash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function logIn(req: Request, res: Response) {
  try {
    const { phonenumber, email, password } = req.body;
    await userValidation.logInUserValidate(req.body);
    const user = await User.findOne(
      phonenumber ? { phonenumber } : { email },
    ).select("+passwordhash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!bcrypt.compareSync(password, user.passworddbhash)) {
      return res.status(401).json({ message: "Wrong password" });
    }
    const userId = user._id.toString();
    const accessToken = await token.giveAccessToken(userId);
    const refreshToken = await token.giveRefreshToken(userId);
    res
      .status(200)
      .json({ message: "Login successful", userId, accessToken, refreshToken });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function logOut(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    res.status(200).json({ message: "Logout successful" });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function refreshAccessToken(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  try {
    const newAccessToken = await token.verifyRefreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error: Error | any) {
    res.status(401).json({ message: "Invalid refresh token", error: error?.message });
  }
}

export { signUp, logIn, logOut, refreshAccessToken };