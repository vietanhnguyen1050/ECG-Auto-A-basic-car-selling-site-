import yup from "yup";
import mongoose from "mongoose";

const correctBid = yup.object({
  carId: yup
    .string()
    .required("ID xe là bắt buộc")
    .test("car-id-format", "Định dạng ID xe không hợp lệ", (value) => {
      if (!value) return false;
      return mongoose.Types.ObjectId.isValid(value);
    }),
  userid: yup
    .string()
    .required("ID người dùng là bắt buộc")
    .test("user-id-format", "Định dạng ID người dùng không hợp lệ", (value) => {
      if (!value) return false;
      return mongoose.Types.ObjectId.isValid(value);
    }),
  amount: yup
    .number()
    .integer("Bước giá phải là số nguyên")
    .min(1000000, "Bước giá tối thiểu là 1,000,000")
    .max(50000000, "Bước giá tối đa là 50,000,000")
    .test("bid-step", "Bước giá phải tăng theo bội số 1,000,000", (value) => {
      if (value === undefined || value === null) return true;
      return value % 1000000 === 0;
    })
    .required("Bước giá là bắt buộc"),
  time: yup.date().required("Thời gian trả giá là bắt buộc"),
});

const correctGetBidders = yup.object({
  carId: yup
    .string()
    .required("ID xe là bắt buộc")
    .test("car-id-format", "Định dạng ID xe không hợp lệ", (value) => {
      if (!value) return false;
      return mongoose.Types.ObjectId.isValid(value);
    }),
});

const validateBid = async (bidData: any) => {
  try {
    const validatedBid = await correctBid.validate(bidData, { abortEarly: false });
    return { valid: true, data: validatedBid };
  } catch (error) {
    throw error;
  }};

const validateGetBidders = async (payload: any) => {
  try {
    const validatedPayload = await correctGetBidders.validate(payload, {
      abortEarly: false,
    });
    return { valid: true, data: validatedPayload };
  } catch (error) {
    throw error;
  }
};

export { validateBid, validateGetBidders };