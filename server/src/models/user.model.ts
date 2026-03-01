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
      model: {
        brand: {
          type: String,
          required: true,
        },
        model: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        version: {
          type: String,
          required: true,
        },
        fuel: {
          type: String,
          required: true,
        },
        year: {
          type: String,
          required: true,
        },
        transmission: {
          type: String,
          required: true,
        },
        tier: {
          type: Number,
          // 1-5, where 1 is entry-level and 5 is luxury
          enum: [1, 2, 3, 4, 5],
        },
      },
      mileage: {
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
  biddingcars: [
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
