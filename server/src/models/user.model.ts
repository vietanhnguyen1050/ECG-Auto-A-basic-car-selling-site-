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
});
export const User = mongoose.model("User", UserSchema);
