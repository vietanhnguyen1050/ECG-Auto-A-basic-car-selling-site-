import yup from "yup";

const correctCar = yup.object({
  brand: yup.string().required("Brand name is required"),
  model: yup.string().required("Model name is required"),
  type: yup.string().required("Type is required"),
  version: yup.string().required("Version is required"),
  fuel: yup.string().required("Fuel type is required"),
  year: yup.string().required("Year is required"),
  transmission: yup.string().required("Transmission is required"),
  mileage: yup.number().min(0, "Mileage cannot be negative"),
  verified: yup.boolean().required("Verified status is required"),
  condition: yup.number().oneOf([1, 2, 3, 4, 5], "Condition is required"),
  plate: yup.object({
    color: yup.number().oneOf([1, 2, 3, 4, 5, 6], "Plate color is required"),
    number: yup.string().when("color", (color: any, schema: any) => {
      return [1, 2, 3, 4, 5].includes(color)
        ? schema.required("Plate number is required")
        : schema.notRequired();
    }),
  }),
  startingprice: yup.number().min(0, "Starting price cannot be negative"),
  currentprice: yup.number().min(0, "Current price cannot be negative"),
  followers: yup.number().min(0, "Followers cannot be negative"),
  bidders: yup.array().of(
    yup.object({
      userid: yup.string().required("Bidder user ID is required"),
      bidamount: yup
        .number()
        .min(1000000, "Bid amount cannot be less than 1,000,000")
        .required("Bid amount is required"),
      bidtime: yup.date().required("Bid time is required"),
    }),
  ),
  images: yup.array().of(yup.string().url("Each image must be a valid URL")),
  description: yup
    .string()
    .max(1000, "Description cannot exceed 1000 characters"),
  posteddate: yup.date().required("Posted date is required"),
  location: yup
    .string()
    .required("Location is required")
    .oneOf(
      ["Hanoi", "Ho Chi Minh City", "Da Nang"],
      "Location must be either Hanoi, Ho Chi Minh City, or Da Nang",
    ),
  sold: yup.boolean().required("Sold status is required"),
  seller: yup.string().required("Seller ID is required"),
  buyer: yup.string().when("sold", (sold: any, schema: any) => {
    return sold === true
      ? schema.required("Buyer ID is required when the car is sold")
      : schema.notRequired();
  }),
});

const validateCar = async (data: any) => {
  try {
    await correctCar.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

export { validateCar };