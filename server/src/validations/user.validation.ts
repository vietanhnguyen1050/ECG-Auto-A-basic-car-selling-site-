import { ref } from "node:process";
import yup from "yup";

const correctUserCreate = yup.object({
  phonenumber: yup
    .string()
    .matches(/^0\d{9,10}$/, "Invalid phone number format")
    .required("Phone number is required"),
  displayname: yup
    .string()
    .max(50, "Display name cannot exceed 50 characters"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters long"),
  email: yup.string().email("Invalid email format"),
});
const correctUserUpdate = yup.object({
  displayname: yup
    .string()
    .max(50, "Display name cannot exceed 50 characters"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters long"),
  refreshToken: yup.string(),
  valuationhistory: yup
    .array()
    .of(
      yup.object({
        Date: yup.date().default(() => new Date()),
        carid: yup
          .string(),
        milage: yup.number().min(0, "Milage cannot be negative"),
      }),
    )
    .default([]),
  favoritecars: yup
    .array()
    .default([]),
});
const correctLogin = yup.object({
  phonenumber: yup
    .string()
    .matches(/^0\d{9,10}$/, "Invalid phone number format"),
  email: yup.string().email("Invalid email format"),
  password: yup.string().required("Password is required"),
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
export const userValidation = {
  createNewUserValidate,
  updateExistingUserValidate,
  logInUserValidate,
};
