import yup from "yup";

const correctBrand = yup.object({
  brand: yup.string().required("Brand name is required"),
  models: yup
    .array()
    .of(
      yup.object({
        model: yup.string().required("Model name is required"),
        type: yup.string().required("Type is required"),
        versions: yup
          .array()
          .of(
            yup.object({
              version: yup.string().required("Version is required"),
              fuel: yup.string().required("Fuel type is required"),
              years: yup
                .array()
                .of(
                  yup.object({
                    year: yup.string().required("Year is required"),
                    transmission: yup
                      .string()
                      .required("Transmission is required"),
                    originalprice: yup.number().required("Price is required"),
                  }),
                )
                .required("Years are required"),
            }),
          )
          .required("Versions are required"),
      }),
    )
    .required("Models are required"),
});

const validateBrand = async (data: any) => {
  try {
    await correctBrand.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

export { validateBrand };