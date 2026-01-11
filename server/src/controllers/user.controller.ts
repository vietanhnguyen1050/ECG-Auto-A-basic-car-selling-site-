import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.ts";

export const SignUp = async (req: Request, res: Response) => {
  try {
    debugger;
    console.log("req", req);
    const { phonenumber, displayname, email, password } = req.body;
    if (!phonenumber || !password || !email) {
      return res
        .status(400)
        .json({ message: "Phonenumber, email, and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!/^0\d{8,14}$/.test(phonenumber)) {
      return res.status(400).json({ message: "Invalid phonenumber format" });
    }
    if (displayname && displayname.length > 50) {
      return res
        .status(400)
        .json({ message: "Display name cannot exceed 50 characters" });
    }
    const existingUser =
      (await User.findOne({ phonenumber })) || (await User.findOne({ email }));
    if (existingUser) {
      return res.status(409).json({
        message: "User with this phonenumber or email already exists",
      });
    }
    const newUser = await User.create({
      phonenumber,
      displayname,
      email,
      passworddbhash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logIn = async (req: Request, res: Response) => {
  try {
    const { phonenumber, email, password } = req.body;
    if ((!phonenumber && !email) || !password) {
      return res
        .status(400)
        .json({ message: "Phonenumber or email and password are required" });
    }
    const user = await User.findOne(
      phonenumber ? { phonenumber } : { email }
    ).select("+passwordhash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else if (!bcrypt.compareSync(password, user.passworddbhash)) {
      return res.status(401).json({ message: "Wrong password" });
    } else {
      res.status(200).json({ message: "Login successful" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
