import mongoose from "mongoose";

const CarSchema = new mongoose.Schema({
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
  car: {
    mileage: {
      type: Number,
    },
    condition: {
      type: Number,
      // 1-5, where 1 is poor and 5 is excellent
      enum: [1, 2, 3, 4, 5],
    },
    platecolor: {
      type: Number,
      // 1 White, 2 Yellow, 3 Blue, 4 Red, 5 Foreign, 6 No plate
      enum: [1, 2, 3, 4, 5, 6],
    },
    platenumber: {
      type: String,
    },
    startingprice: {
      type: Number,
    },
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
  },
  progress: {
    type: String,
    enum: [
      "Pending verification",
      "Verified",
      "In auction",
      "Finished auction",
      "Verifying bidders",
      "Setting up legal documents",
      "Sold",
      "Rejected",
      "Cancel request",
      "Cancelled",
    ],
    default: "Pending verification",
  },
  bid: {
    followers: {
      type: Number,
      default: 0,
    },
    currentprice: {
      type: Number,
    },
    bidders: [
      {
        userid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        time: {
          type: Date,
          required: true,
        },
      },
    ],
    auctioncounter: {
      type: Number,
      default: 0,
    },
    auctionSessionEndTime: {
      type: Date,
      default: null,
    },
  },
});

export const Car = mongoose.model("Car", CarSchema);
