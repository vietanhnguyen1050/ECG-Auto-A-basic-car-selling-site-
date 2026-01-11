import mongoose from "mongoose";
import { start } from "node:repl";

const CarSchema = new mongoose.Schema({
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
  mileage: {
    type: Number,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  condition: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
  },
  startingprice: {
    type: Number,
  },
  currentprice: {
    type: Number,
  },
  followers: {
    type: Number,
    default: 0,
  },
  bidders: [
    {
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      bidamount: {
        type: Number,
        required: true,
      },
      bidtime: {
        type: Date,
        required: true,
      },
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  comments: [
    {
      userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      commenttime: {
        type: Date,
        required: true,
      },
    },
  ],
  posteddate: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    enum: ["Hanoi", "Ho Chi Minh City", "Da Nang"],
  },
});

export const Car = mongoose.model("Car", CarSchema);
