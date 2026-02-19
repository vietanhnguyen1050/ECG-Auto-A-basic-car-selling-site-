import mongoose from "mongoose";

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
    // 1-5, where 1 is poor and 5 is excellent
    enum: [1, 2, 3, 4, 5],
  },
  plate: {
    color: {
      type: Number,
      // 1 White, 2 Yellow, 3 Blue, 4 Red, 5 Foreign, 6 No plate
      enum: [1, 2, 3, 4, 5, 6],
    },
    number: {
      type: String,
    },
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
  posteddate: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    enum: ["Hanoi", "Ho Chi Minh City", "Da Nang"],
  },
  sold: {
    type: Boolean,
    default: false,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

export const Car = mongoose.model("Car", CarSchema);
