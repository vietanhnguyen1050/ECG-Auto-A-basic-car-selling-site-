import { User } from "../models/user.model.ts";

async function getUserAndPopulate(userId: any, population: any) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    let user;
    if (population) {
      user = await User.findById(userId).populate(population);
    } else {
      user = await User.findById(userId);
    }
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error("Middleware error");
  }
}

export { getUserAndPopulate };
