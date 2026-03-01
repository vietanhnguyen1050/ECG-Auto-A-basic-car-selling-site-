import yup from "yup";

const correctBrand = yup.object({
  brand: yup.string().required("Tên hãng xe là bắt buộc"),
  activation: yup.boolean(),
  models: yup
    .array()
    .of(
      yup.object({
        activation: yup.boolean(),
        model: yup.string().required("Tên mẫu xe là bắt buộc"),
        type: yup.string().required("Loại xe là bắt buộc"),
        versions: yup
          .array()
          .of(
            yup.object({
              activation: yup.boolean(),
              version: yup.string().required("Phiên bản là bắt buộc"),
              fuel: yup.string().required("Nhiên liệu là bắt buộc"),
              years: yup
                .array()
                .of(
                  yup.object({
                    activation: yup.boolean(),
                    year: yup.string().required("Năm là bắt buộc"),
                    transmission: yup
                      .string()
                      .required("Hộp số là bắt buộc"),
                    tier: yup
                      .number()
                      .oneOf([1, 2, 3, 4, 5], "Tier phải nằm trong khoảng 1 đến 5"),
                    originalprice: yup.number().required("Giá là bắt buộc"),
                  }),
                )
                .required("Danh sách năm là bắt buộc"),
            }),
          )
          .required("Danh sách phiên bản là bắt buộc"),
      }),
    )
    .required("Danh sách mẫu xe là bắt buộc"),
});

const validateBrand = async (data: any) => {
  try {
    await correctBrand.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

export { validateBrand };