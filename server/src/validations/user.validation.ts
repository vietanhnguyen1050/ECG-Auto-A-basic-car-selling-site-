import yup from "yup";

const correctUserCreate = yup.object({
  phonenumber: yup
    .string()
    .matches(/^0\d{9,10}$/, "Số điện thoại không đúng định dạng")
    .required("Số điện thoại là bắt buộc"),
  displayname: yup.string().max(50, "Tên hiển thị không được vượt quá 50 ký tự"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  email: yup.string().email("Email không đúng định dạng"),
});
const correctUserUpdate = yup.object({
  displayname: yup.string().max(50, "Tên hiển thị không được vượt quá 50 ký tự"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  email: yup.string().email("Email không đúng định dạng"),
  role: yup
    .string()
    .oneOf(["user", "admin"], "Vai trò chỉ có thể là user hoặc admin"),
  refreshToken: yup.string().nullable(),
  valuationhistory: yup
    .array()
    .of(
      yup.object({
        Date: yup.date().default(() => new Date()),
        model: yup
          .object({
            brand: yup.string().required("Tên hãng là bắt buộc"),
            model: yup.string().required("Tên mẫu xe là bắt buộc"),
            type: yup.string().required("Loại xe là bắt buộc"),
            version: yup.string().required("Phiên bản là bắt buộc"),
            fuel: yup.string().required("Nhiên liệu là bắt buộc"),
            year: yup.string().required("Năm là bắt buộc"),
            transmission: yup.string().required("Hộp số là bắt buộc"),
            tier: yup.number().oneOf([1, 2, 3, 4, 5], "Tier phải nằm trong khoảng 1 đến 5"),
          })
          .required("Thông tin mẫu xe là bắt buộc"),
        mileage: yup.number().min(0, "Số km không được âm"),
      }),
    )
    .default([]),
  favoritecars: yup.array().of(yup.string()).default([]),
  biddingcars: yup.array().of(yup.string()).default([]),
  soldcars: yup.array().of(yup.string()).default([]),
});
const correctLogin = yup.object({
  phonenumber: yup
    .string()
    .matches(/^0\d{9,10}$/, "Số điện thoại không đúng định dạng"),
  email: yup.string().email("Email không đúng định dạng"),
  password: yup.string().required("Mật khẩu là bắt buộc"),
}).test(
  "phone-or-email-required",
  "Cần nhập số điện thoại hoặc email",
  (value) => {
    if (!value) return false;
    return Boolean(value.phonenumber || value.email);
  },
);

const updateProfileSchema = yup.object({
  displayname: yup
    .string()
    .trim()
    .min(1, "Tên hiển thị không được để trống")
    .max(50, "Tên hiển thị không được vượt quá 50 ký tự")
    .required("Tên hiển thị là bắt buộc"),
});

const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Mật khẩu hiện tại là bắt buộc")
    .min(8, "Mật khẩu hiện tại phải có ít nhất 8 ký tự"),
  newPassword: yup
    .string()
    .required("Mật khẩu mới là bắt buộc")
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});
const createNewUserValidate = async (data: any) => {
  try {
    await correctUserCreate.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};
const logInUserValidate = async (data: any) => {
  try {
    await correctLogin.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

const updateExistingUserValidate = async (data: any) => {
  try {
    await correctUserUpdate.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

const updateProfileValidate = async (data: any) => {
  try {
    await updateProfileSchema.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

const changePasswordValidate = async (data: any) => {
  try {
    await changePasswordSchema.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

export const userValidation = {
  createNewUserValidate,
  updateExistingUserValidate,
  logInUserValidate,
  updateProfileValidate,
  changePasswordValidate,
};
