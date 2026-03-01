import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    unique: true,
  },
  activation: {
    type: Boolean,
    default: true,
  },
  models: [
    {
      activation: {
        type: Boolean,
        default: true,
      },
      model: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      versions: [
        {
          activation: {
            type: Boolean,
            default: true,
          },
          version: {
            type: String,
            required: true,
          },
          fuel: {
            type: String,
            required: true,
          },
          years: [
            {
              activation: {
                type: Boolean,
                default: true,
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
              originalprice: {
                type: Number,
                required: true,
              },
            },
          ],
        },
      ],
    },
  ],
});
export const Brand = mongoose.model("Brand", BrandSchema);
