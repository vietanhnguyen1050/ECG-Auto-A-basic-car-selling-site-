import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    unique: true,
  },
  models: [{
    model: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    versions: [{
      version: {
        type: String,
        required: true,
      },
      fuel: {
        type: String,
        required: true,
      },
      years: [{
        year: {
          type: String,
          required: true,
        },
        transmission: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      }],
    }],
  }],
});
export const Brand = mongoose.model("Brand", BrandSchema);
