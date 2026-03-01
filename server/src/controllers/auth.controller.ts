import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
import { token } from "../middlewares/auth.middleware.js";
import { userValidation } from "../validations/user.validation.js";

async function signUp(req: Request, res: Response) {
  try {
    const { phonenumber, displayname, email, password } = req.body;
    await userValidation.createNewUserValidate(req.body);
    const existingByPhone = await User.findOne({ phonenumber });
    const existingByEmail = email ? await User.findOne({ email }) : null;
    const existingUser = existingByPhone || existingByEmail;
    if (existingUser) {
      return res.status(409).json({
        message: "Số điện thoại hoặc email đã tồn tại",
      });
    }
    await User.create({
      phonenumber,
      displayname,
      email,
      passworddbhash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ message: "Đăng ký tài khoản thành công" });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function logIn(req: Request, res: Response) {
  try {
    const { phonenumber, email, password } = req.body;
    await userValidation.logInUserValidate(req.body);
    const user = await User.findOne(
      phonenumber ? { phonenumber } : { email },
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    if (!bcrypt.compareSync(password, user.passworddbhash)) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }
    const userId = user._id.toString();
    const accessToken = await token.giveAccessToken(userId);
    const refreshToken = await token.giveRefreshToken(userId);
    res
      .status(200)
      .json({
        message: "Đăng nhập thành công",
        userId,
        role: user.role,
        displayname: user.displayname ?? null,
        email: user.email ?? null,
        accessToken,
        refreshToken,
      });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function logOut(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function refreshAccessToken(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Thiếu refresh token" });
  }
  try {
    const newAccessToken = await token.verifyRefreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error: Error | any) {
    res.status(401).json({ message: "Refresh token không hợp lệ", error: error?.message });
  }
}

async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }

    const user = await User.findById(userId).select("displayname email phonenumber role");
    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({
      userId: user._id.toString(),
      displayname: user.displayname ?? null,
      email: user.email ?? null,
      phonenumber: user.phonenumber ?? null,
      role: user.role,
    });
  } catch (error: Error | any) {
    return res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }

    await userValidation.updateProfileValidate(req.body);
    const displayname = String(req.body.displayname || "").trim();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { displayname },
      { new: true },
    ).select("displayname email phonenumber role");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        userId: updatedUser._id.toString(),
        displayname: updatedUser.displayname ?? null,
        email: updatedUser.email ?? null,
        phonenumber: updatedUser.phonenumber ?? null,
        role: updatedUser.role,
      },
    });
  } catch (error: Error | any) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error?.errors ?? [error?.message],
      });
    }
    return res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }

    await userValidation.changePasswordValidate(req.body);
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passworddbhash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "Mật khẩu mới phải khác mật khẩu hiện tại" });
    }

    user.passworddbhash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error: Error | any) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: error?.errors ?? [error?.message],
      });
    }
    return res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

export { signUp, logIn, logOut, refreshAccessToken, getMe, updateProfile, changePassword };
