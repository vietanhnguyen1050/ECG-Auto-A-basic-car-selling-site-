import mongoose from "mongoose";
import { ref } from "node:process";

const UserSchema = new mongoose.Schema({
  phonenumber: {
    type: String,
    required: true,
    unique: true,
  },
  displayname: {
    type: String,
  },
  passworddbhash: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  refreshToken: {
    type: String,
    default: null,
  },
  valuationhistory: [
    {
      Date: {
        type: Date,
        default: Date.now,
      },
      carid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
      milage: {
        type: Number,
      },
    },
  ],
  favoritecars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
  soldcars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
});
export const User = mongoose.model("User", UserSchema);
