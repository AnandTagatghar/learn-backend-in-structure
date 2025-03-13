import mongoose from "mongoose";
import { mongoDB_name } from "../constant.js";
import { ApiError } from "../utils/ApiError.js";

const connectDB = async () => {
  try {
    await mongoose
      .connect(`${process.env.MONGODB_URI}/${mongoDB_name}`)
      .then(() => {
        // console.log(`MONGODB connection successfull`);
      })
      .catch((err) => {
        // console.log(`Error in Connection to MONGODB: ${err}`);
        throw new ApiError(500, "Error connecting MongoDB");
      });
  } catch (error) {
    // console.log(`Connect to MONGODB is failed: ${error}`);
    process.exit(1);
  }
};

export { connectDB };
