import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilepath) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!localFilepath) return null;
    const uploadResult = await cloudinary.uploader.upload(localFilepath, {
      resource_type: "auto",
      folder: "backend",
    });

    fs.unlinkSync(localFilepath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilepath);
    return null;
  }
};

const destroyOnCloudinary = async (ID) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const response = await cloudinary.uploader.destroy(ID);
    if (response.result == "ok") {
      return true;
    }

    return false;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, destroyOnCloudinary };
