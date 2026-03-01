import { match } from "node:assert";
import { Brand } from "../models/brand.model.js";

class UnsupportedCarModelError extends Error {
  constructor(message = "The model is not supported by the company") {
    super(message);
    this.name = "UnsupportedCarModelError";
  }
}

async function getModelInfo(car: any) {
  const brandName = car?.model?.brand;
  const modelName = car?.model?.model;
  const versionName = car?.model?.version;
  const yearValue = car?.model?.year;
  const condition = car?.car?.condition;
  const mileage = car?.car?.mileage;

  if (!brandName || !modelName || !versionName || !yearValue) {
    return null;
  }
  const brandDoc = await Brand.findOne({
    brand: brandName,
    models: {
      $elemMatch: {
        model: modelName,
        versions: {
          $elemMatch: {
            version: versionName,
            years: {
              $elemMatch: {
                year: yearValue,
              },
            },
          },
        },
      },
    },
  }).lean();
  if (!brandDoc) {
    throw new UnsupportedCarModelError();
  }
  const matchedModel = brandDoc.models?.find(
    (modelItem: any) =>
      modelItem.model === modelName && modelItem.activation !== false,
  );
  if (!matchedModel) {
    throw new UnsupportedCarModelError();
  }
  const matchedVersion = matchedModel.versions?.find(
    (versionItem: any) =>
      versionItem.version === versionName && versionItem.activation !== false,
  );
  if (!matchedVersion) {
    throw new UnsupportedCarModelError();
  }
  const matchedYear = matchedVersion.years?.find(
    (yearItem: any) =>
      yearItem.year === yearValue && yearItem.activation !== false,
  );
  if (!matchedYear) {
    throw new UnsupportedCarModelError();
  }

  if (matchedYear.originalprice == null || matchedYear.tier == null) {
    throw new UnsupportedCarModelError();
  }
  const productionYear = Number.parseInt(String(matchedYear.year), 10);
  if (Number.isNaN(productionYear)) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const yearSinceProduction = currentYear - productionYear;

  return [
    matchedYear.originalprice,
    matchedYear.tier,
    yearSinceProduction,
    calculateCondition(condition),
    mileage,
    matchedModel.type,
    matchedVersion.fuel,
    matchedYear.transmission,
  ];
  // return originalPrice, tier, yearSinceProduction, conditionFactor, mileage, type, fuel, transmission
}

function calculateCondition(condition: any) {
  if (condition === 1) {
    return 0.6;
  } else if (condition === 2) {
    return 0.8;
  } else if (condition === 3) {
    return 0.9;
  } else if (condition === 4) {
    return 1;
  } else if (condition === 5) {
    return 1.1;
  } else {
    throw new UnsupportedCarModelError();
  }
}

function calculateTier(tier: any) {
  if (tier === 1) {
    return 0.7;
  } else if (tier === 2) {
    return 0.9;
  } else if (tier === 3) {
    return 1;
  } else if (tier === 4) {
    return 1.1;
  } else if (tier === 5) {
    return 1.3;
  } else {
    throw new UnsupportedCarModelError();
  }
}

async function calculatePrice(modelInfo: any) {
  // numbers that depends on the car
  const originalPrice = modelInfo[0] as number;
  const tier = calculateTier(modelInfo[1] as number);
  const yearSinceProduction = modelInfo[2] as number;
  const condition = modelInfo[3] as number;
  const mileage = modelInfo[4] as number;

  // numbers that can be adjusted but are fixed for simplicity
  const buyShock = 0.05; // reduction in price after purchase [0.05 ; 0.2] keep price - lose price
  const shockDuration = 1; // duration of the buy shock [0.5 ; 0.15] long shock - short shock
  const depreciationRate = 0.08; // annual depreciation rate [0.08 ; 0.15] slow depreciation - fast depreciation
  const mileageFactor = 0.15; // price reduction per mile [0.15 ; 0.3] low mileage impact - high mileage impact
  const averageAnnualMileage = 12000; // average annual mileage [12000 ; 15000] low average mileage - high average mileage

  // Calculate depreciation based on shock
  const shockDepreciation =
    1 - buyShock * Math.exp(-yearSinceProduction * shockDuration);

  // Calculate depreciation based on age
  const ageDepreciation = Math.exp(
    -(depreciationRate * yearSinceProduction) / tier,
  );

  // Calculate depreciation based on mileage
  const mileageDepreciation =
    1 -
    mileageFactor *
      (mileage / (averageAnnualMileage * yearSinceProduction + 0.01) - 1);

  // Final price calculation
  const finalPrice =
    originalPrice *
    shockDepreciation *
    ageDepreciation *
    mileageDepreciation *
    condition;
  return formatPrice(finalPrice);
}

function formatPrice(price: number) {
  if (price < 0) {
    return 0;
  }
  const formatedPrice = Math.floor(price / 1000000) * 1000000;
  return formatedPrice;
}

async function formatPlateNumber(plateNumber: string) {
  // Step 1: validate basic input
  if (
    !plateNumber ||
    typeof plateNumber !== "string" ||
    plateNumber.length > 12 ||
    plateNumber.length < 7 ||
    !plateNumber.includes("-")
  ) {
    return null;
  }

  // Step 2: remove all spaces and normalize to uppercase
  const normalized = plateNumber.replace(/\s+/g, "").toUpperCase();

  // Step 3: split plate number into 2 parts using "-"
  const parts = normalized.split("-");
  if (parts.length < 2) {
    return null;
  }

  // If user enters multiple "-", merge everything after the first as part 2
  const rawPart1 = parts[0] ?? "";
  const rawPart2 = parts.slice(1).join("");

  // Step 4: process part 1 (keep letters+numbers, uppercase letters, length <= 4)
  const part1 = rawPart1.replace(/[^A-Z0-9]/g, "");
  if (part1.length === 0 || part1.length > 4) {
    return null;
  }

  // Part 1 must contain both digits and letters
  if (!/\d/.test(part1) || !/[A-Z]/.test(part1)) {
    return null;
  }

  // Step 5: process part 2 (keep only digits, remove dots/commas/other symbols)
  const numericPart2 = rawPart2.replace(/\D/g, "");

  // Part 2 is valid only when it has 4 or 5 digits
  if (numericPart2.length !== 4 && numericPart2.length !== 5) {
    return null;
  }

  // Step 6: reformat part 2
  // - 5 digits => 123.45
  // - 4 digits => 1234
  const part2 =
    numericPart2.length === 5
      ? `${numericPart2.slice(0, 3)}.${numericPart2.slice(3)}`
      : numericPart2;

  // Step 7: combine final result as PART1-PART2
  return `${part1}-${part2}`;
}

export {
  UnsupportedCarModelError,
  getModelInfo,
  calculatePrice,
  formatPlateNumber,
};

