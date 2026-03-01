import mongoose from "mongoose";
import yup from "yup";

const carProgressValues = [
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
] as const;

const objectIdSchema = yup
  .string()
  .required("ID là bắt buộc")
  .test("is-object-id", "Định dạng ID không hợp lệ", (value) => {
    if (!value) return false;
    return mongoose.Types.ObjectId.isValid(value);
  });

const updateUserRoleSchema = yup.object({
  role: yup
    .string()
    .oneOf(["user", "admin"], "Vai trò chỉ có thể là user hoặc admin")
    .required("Vai trò là bắt buộc"),
});

const updateCarSchema = yup
  .object({
    progress: yup
      .string()
      .oneOf([...carProgressValues], "Giá trị tiến trình không hợp lệ")
      .notRequired(),
    startingprice: yup
      .number()
      .integer("Giá khởi điểm phải là số nguyên")
      .min(0, "Giá khởi điểm không được âm")
      .notRequired(),
    description: yup
      .string()
      .max(1000, "Mô tả không được vượt quá 1000 ký tự")
      .notRequired(),
    brand: yup.string().trim().notRequired(),
    model: yup.string().trim().notRequired(),
    version: yup.string().trim().notRequired(),
    year: yup.string().trim().notRequired(),
    type: yup.string().trim().notRequired(),
    fuel: yup.string().trim().notRequired(),
    transmission: yup.string().trim().notRequired(),
    tier: yup
      .number()
      .integer("Tier phải là số nguyên")
      .oneOf([1, 2, 3, 4, 5], "Tier phải nằm trong khoảng 1 đến 5")
      .notRequired(),
    mileage: yup
      .number()
      .integer("Số km phải là số nguyên")
      .min(0, "Số km không được âm")
      .notRequired(),
    condition: yup
      .number()
      .integer("Tình trạng phải là số nguyên")
      .oneOf([1, 2, 3, 4, 5], "Tình trạng phải nằm trong khoảng 1 đến 5")
      .notRequired(),
    platecolor: yup
      .number()
      .integer("Màu biển số phải là số nguyên")
      .oneOf([1, 2, 3, 4, 5, 6], "Màu biển số phải nằm trong khoảng 1 đến 6")
      .notRequired(),
    platenumber: yup.string().trim().notRequired(),
    location: yup
      .string()
      .oneOf(["Hanoi", "Ho Chi Minh City", "Da Nang"], "Khu vực không hợp lệ")
      .notRequired(),
    buyerId: yup
      .string()
      .test("is-object-id", "Định dạng buyerId không hợp lệ", (value) => {
        if (value === undefined || value === null || value === "") return true;
        return mongoose.Types.ObjectId.isValid(value);
      })
      .notRequired(),
    removeImages: yup
      .array()
      .of(yup.string().required("Đường dẫn ảnh là bắt buộc"))
      .notRequired(),
    images: yup
      .array()
      .of(yup.string().trim().required("Đường dẫn ảnh là bắt buộc"))
      .max(5, "Tối đa 5 ảnh")
      .notRequired(),
  })
  .test("has-update-field", "Cần có ít nhất một trường để cập nhật", (value) => {
    if (!value) return false;
    return (
      value.progress !== undefined ||
      value.startingprice !== undefined ||
      value.description !== undefined ||
      value.brand !== undefined ||
      value.model !== undefined ||
      value.version !== undefined ||
      value.year !== undefined ||
      value.type !== undefined ||
      value.fuel !== undefined ||
      value.transmission !== undefined ||
      value.tier !== undefined ||
      value.mileage !== undefined ||
      value.condition !== undefined ||
      value.platecolor !== undefined ||
      value.platenumber !== undefined ||
      value.location !== undefined ||
      value.buyerId !== undefined ||
      (Array.isArray(value.removeImages) && value.removeImages.length > 0) ||
      value.images !== undefined
    );
  });

const startAuctionSchema = yup.object({
  auctionSessionEndTime: yup
    .date()
    .typeError("auctionSessionEndTime phải là ngày giờ hợp lệ")
    .required("auctionSessionEndTime là bắt buộc")
    .test(
      "is-future-time",
      "auctionSessionEndTime phải lớn hơn thời điểm hiện tại",
      (value) => {
        if (!value) return false;
        return value.getTime() > Date.now();
      },
    ),
});

const brandYearSchema = yup.object({
  activation: yup.boolean().required("Trạng thái năm là bắt buộc"),
  year: yup.string().required("Năm là bắt buộc"),
  transmission: yup.string().required("Hộp số là bắt buộc"),
  tier: yup.number().oneOf([1, 2, 3, 4, 5], "Tier phải nằm trong khoảng 1 đến 5").required("Tier là bắt buộc"),
  originalprice: yup
    .number()
    .integer("Giá gốc phải là số nguyên")
    .min(0, "Giá gốc không được âm")
    .required("Giá gốc là bắt buộc"),
});

const brandVersionSchema = yup.object({
  activation: yup.boolean().required("Trạng thái phiên bản là bắt buộc"),
  version: yup.string().required("Phiên bản là bắt buộc"),
  fuel: yup.string().required("Nhiên liệu là bắt buộc"),
  years: yup.array().of(brandYearSchema).required("Danh sách năm là bắt buộc"),
});

const brandModelSchema = yup.object({
  activation: yup.boolean().required("Trạng thái mẫu xe là bắt buộc"),
  model: yup.string().required("Mẫu xe là bắt buộc"),
  type: yup.string().required("Loại xe là bắt buộc"),
  versions: yup.array().of(brandVersionSchema).required("Danh sách phiên bản là bắt buộc"),
});

const updateBrandSchema = yup.object({
  brand: yup.string().required("Tên hãng là bắt buộc"),
  activation: yup.boolean().required("Trạng thái hãng là bắt buộc"),
  models: yup.array().of(brandModelSchema).required("Danh sách mẫu xe là bắt buộc"),
});

async function validateId(value: string, fieldName: string) {
  await objectIdSchema.validate(value, {
    abortEarly: false,
    context: { fieldName },
  });
}

async function validateUpdateUserRole(data: unknown) {
  return updateUserRoleSchema.validate(data, { abortEarly: false });
}

async function validateUpdateCar(data: unknown) {
  return updateCarSchema.validate(data, { abortEarly: false });
}

async function validateStartAuction(data: unknown) {
  return startAuctionSchema.validate(data, { abortEarly: false });
}

async function validateUpdateBrand(data: unknown) {
  return updateBrandSchema.validate(data, { abortEarly: false });
}

async function validateCreateBrand(data: unknown) {
  return updateBrandSchema.validate(data, { abortEarly: false });
}

export {
  carProgressValues,
  validateId,
  validateUpdateUserRole,
  validateUpdateCar,
  validateStartAuction,
  validateUpdateBrand,
  validateCreateBrand,
};
