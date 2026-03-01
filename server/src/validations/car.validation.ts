import yup from "yup";

const correctCar = yup.object({
  model: yup
    .object({
      brand: yup.string().required("Tên hãng xe là bắt buộc"),
      model: yup.string().required("Tên mẫu xe là bắt buộc"),
      type: yup.string().required("Loại xe là bắt buộc"),
      version: yup.string().required("Phiên bản là bắt buộc"),
      fuel: yup.string().required("Nhiên liệu là bắt buộc"),
      year: yup.string().required("Năm là bắt buộc"),
      transmission: yup.string().required("Hộp số là bắt buộc"),
      tier: yup.number().oneOf([1, 2, 3, 4, 5], "Tier phải nằm trong khoảng 1 đến 5"),
    })
    .required("Thông tin mẫu xe là bắt buộc"),

  car: yup
    .object({
      mileage: yup.number().min(0, "Số km không được âm"),
      condition: yup.number().oneOf([1, 2, 3, 4, 5], "Tình trạng phải trong khoảng 1-5"),
      platecolor: yup
        .number()
        .oneOf([1, 2, 3, 4, 5, 6], "Màu biển số phải trong khoảng 1-6"),
      platenumber: yup
        .string()
        .when("platecolor", (platecolor: any, schema: any) => {
          const color = Array.isArray(platecolor) ? platecolor[0] : platecolor;
          const plateFormat = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{1,4}-(\d{4}|\d{5}|\d{3}\.\d{2})$/;

          if ([1, 2, 3, 4, 5].includes(color)) {
            return schema
              .required("Biển số là bắt buộc")
              .matches(
                plateFormat,
                "Biển số phải viết hoa và đúng định dạng: 29A-123.45 hoặc 29A-1234",
              );
          }

          return schema.notRequired();
        }),
      startingprice: yup.number().min(0, "Giá khởi điểm không được âm"),
      images: yup
        .array()
        .of(yup.string().url("Mỗi ảnh phải là URL hợp lệ")),
      description: yup
        .string()
        .max(1000, "Mô tả không được vượt quá 1000 ký tự"),
      posteddate: yup.date(),
      location: yup
        .string()
        .oneOf(
          ["Hanoi", "Ho Chi Minh City", "Da Nang"],
          "Khu vực chỉ có thể là Hanoi, Ho Chi Minh City hoặc Da Nang",
        ),
      seller: yup.string().required("ID người bán là bắt buộc"),
      buyer: yup.string().nullable(),
    })
    .required("Thông tin xe là bắt buộc"),

  progress: yup
    .string()
    .oneOf(
      [
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
      ],
      "Giá trị tiến trình không hợp lệ",
    ),

  bid: yup
    .object({
      followers: yup.number().min(0, "Số người theo dõi không được âm"),
      currentprice: yup.number().min(0, "Giá hiện tại không được âm"),
      bidders: yup.array().of(
        yup.object({
          userid: yup.string().required("ID người trả giá là bắt buộc"),
          amount: yup
            .number()
            .integer("Số tiền trả giá phải là số nguyên")
            .min(1000000, "Số tiền trả giá tối thiểu là 1,000,000")
            .max(50000000, "Số tiền trả giá tối đa là 50,000,000")
            .test("bid-step", "Số tiền trả giá phải tăng theo bội số 1,000,000", (value) => {
              if (value === undefined || value === null) return true;
              return value % 1000000 === 0;
            })
            .required("Số tiền trả giá là bắt buộc"),
          time: yup.date().required("Thời gian trả giá là bắt buộc"),
        }),
      ),
      auctioncounter: yup.number().min(0, "Số phiên đấu giá không được âm"),
      auctionSessionEndTime: yup.date().nullable(),
    })
    .notRequired(),
});

const correctEvaluation = yup.object({
  Date: yup.date().default(() => new Date()),
  model: yup
    .object({
      brand: yup.string().required("Tên hãng xe là bắt buộc"),
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
});

const correctSellCarRequest = yup.object({
  car: yup
    .object({
      model: yup
        .object({
          brand: yup.string().required("Tên hãng xe là bắt buộc"),
          model: yup.string().required("Tên mẫu xe là bắt buộc"),
          version: yup.string().required("Phiên bản là bắt buộc"),
          year: yup.string().required("Năm là bắt buộc"),
        })
        .required("Thông tin mẫu xe là bắt buộc")
        .noUnknown(true),
      car: yup
        .object({
          mileage: yup.number().min(0, "Số km không được âm").required("Số km là bắt buộc"),
          condition: yup
            .number()
            .oneOf([1, 2, 3, 4, 5], "Tình trạng phải trong khoảng 1-5")
            .required("Tình trạng là bắt buộc"),
          platecolor: yup
            .number()
            .oneOf([1, 2, 3, 4, 5, 6], "Màu biển số phải trong khoảng 1-6")
            .required("Màu biển số là bắt buộc"),
          platenumber: yup
            .string()
            .when("platecolor", (platecolor: any, schema: any) => {
              const color = Array.isArray(platecolor) ? platecolor[0] : platecolor;
              const plateFormat = /^(?=.*\d)(?=.*[A-Z])[A-Z0-9]{1,4}-(\d{4}|\d{5}|\d{3}\.\d{2})$/;

              if ([1, 2, 3, 4, 5].includes(color)) {
                return schema
                  .required("Biển số là bắt buộc")
                  .matches(
                    plateFormat,
                    "Biển số phải viết hoa và đúng định dạng: 29A-123.45 hoặc 29A-1234",
                  );
              }

              return schema.notRequired();
            }),
          description: yup
            .string()
            .max(1000, "Mô tả không được vượt quá 1000 ký tự")
            .required("Mô tả là bắt buộc"),
          location: yup
            .string()
            .oneOf(
              ["Hanoi", "Ho Chi Minh City", "Da Nang"],
              "Khu vực chỉ có thể là Hanoi, Ho Chi Minh City hoặc Da Nang",
            )
            .required("Khu vực là bắt buộc"),
          seller: yup.string().notRequired(),
        })
        .required("Thông tin xe là bắt buộc")
        .noUnknown(true),
    })
    .required("Thông tin xe là bắt buộc")
    .noUnknown(true),
});

const validateCar = async (data: any) => {
  try {
    await correctCar.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

const validateEvaluation = async (data: any) => {
  try {
    await correctEvaluation.validate(data, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

const validateSellCarRequest = async (data: any, imageCount: number) => {
  try {
    await correctSellCarRequest.validate(data, { abortEarly: false });
    if (imageCount > 5) {
      throw new Error("Chỉ được tải lên tối đa 5 ảnh cho mỗi lần gửi");
    }
  } catch (error) {
    throw error;
  }
};

export { validateCar, validateEvaluation, validateSellCarRequest };