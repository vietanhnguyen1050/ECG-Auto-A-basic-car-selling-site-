import type { Request } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/environment.js";
import { User } from "../models/user.model.js";

type ViewerContext = {
  userId?: string;
  isAdmin: boolean;
};

function redactFirstSevenDigits(phoneNumber: string) {
  let redactedCount = 0;
  return phoneNumber
    .split("")
    .map((char) => {
      if (/\d/.test(char) && redactedCount < 7) {
        redactedCount += 1;
        return "*";
      }
      return char;
    })
    .join("");
}

function redactEmail(email: string) {
  const [localPart, domainPart] = email.split("@");
  if (!domainPart) {
    return "***";
  }

  const visible = localPart?.slice(0, Math.min(2, localPart.length)) || "*";
  return `${visible}***@${domainPart}`;
}

async function resolveViewerContext(req: Request): Promise<ViewerContext> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isAdmin: false };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { isAdmin: false };
  }

  const secret = ENV.JWT_SECRET_ACCESS;
  if (typeof secret !== "string" || !secret) {
    return { isAdmin: false };
  }

  try {
    const decoded = jwt.verify(String(token), String(secret)) as { userid?: string };
    const viewerUserId = decoded?.userid;
    if (!viewerUserId) {
      return { isAdmin: false };
    }

    const viewer = await User.findById(viewerUserId).select("role").lean();
    return {
      userId: viewerUserId,
      isAdmin: viewer?.role === "admin",
    };
  } catch {
    return { isAdmin: false };
  }
}

function canViewSensitiveInfo(targetUser: any, viewer: ViewerContext) {
  if (viewer.isAdmin) return true;
  const targetUserId = String(targetUser?._id ?? targetUser?.id ?? "");
  if (!targetUserId || !viewer.userId) return false;
  return targetUserId === viewer.userId;
}

function redactUserForViewer(user: any, viewer: ViewerContext) {
  if (!user || typeof user !== "object") {
    return user;
  }

  if (canViewSensitiveInfo(user, viewer)) {
    return user;
  }

  return {
    ...user,
    email: typeof user.email === "string" ? redactEmail(user.email) : user.email,
    phonenumber:
      typeof user.phonenumber === "string"
        ? redactFirstSevenDigits(user.phonenumber)
        : user.phonenumber,
  };
}

export {
  redactFirstSevenDigits,
  redactUserForViewer,
  resolveViewerContext,
};
