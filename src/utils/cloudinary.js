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
    });

    fs.unlinkSync(localFilepath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilepath);
    return null;
  }
};

export { uploadOnCloudinary };
