import { v2 as cloudinary } from "cloudinary";

console.log("ENV CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("ENV CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

console.log("CLOUDINARY CONFIG:", cloudinary.config());

export default cloudinary;
