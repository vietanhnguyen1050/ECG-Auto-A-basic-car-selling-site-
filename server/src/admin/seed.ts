import { connectDB, closeDB } from "../config/database.config.js";
import { Brand } from "../models/brand.model.js";
import { Car } from "../models/car.model.js";
import { branddata, cardata } from "./uploaddata.js";

async function seedBrands() {
  const operations = branddata.map((brand) => ({
    updateOne: {
      filter: { brand: brand.brand },
      update: { $set: brand },
      upsert: true,
    },
  }));

  if (operations.length === 0) return { matchedCount: 0, upsertedCount: 0 };

  return Brand.bulkWrite(operations as any);
}

async function seedCars() {
  const operations = cardata.map((car) => {
    const plateNumber = car?.car?.platenumber;

    return {
      updateOne: {
        filter: {
          "car.platenumber": plateNumber,
          "model.brand": car.model.brand,
          "model.model": car.model.model,
          "model.version": car.model.version,
          "model.year": car.model.year,
        },
        update: { $set: car },
        upsert: true,
      },
    };
  });

  if (operations.length === 0) return { matchedCount: 0, upsertedCount: 0 };

  return Car.bulkWrite(operations as any);
}

async function runSeed() {
  try {
    await connectDB();

    const brandResult = await seedBrands();
    const carResult = await seedCars();

    console.log("Seed completed successfully");
    console.log({
      brands: {
        matched: (brandResult as any).matchedCount ?? 0,
        upserted: (brandResult as any).upsertedCount ?? 0,
        modified: (brandResult as any).modifiedCount ?? 0,
      },
      cars: {
        matched: (carResult as any).matchedCount ?? 0,
        upserted: (carResult as any).upsertedCount ?? 0,
        modified: (carResult as any).modifiedCount ?? 0,
      },
    });
  } catch (error) {
    console.error("Seed failed", error);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
}

runSeed();

