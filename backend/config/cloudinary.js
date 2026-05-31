import { v2 as cloudinary } from 'cloudinary';

let isMockCloudinary = false;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    console.log('Cloudinary configuration initialized.');
  } catch (error) {
    console.warn(`Cloudinary config failed: ${error.message}. Running in Mock storage mode.`);
    isMockCloudinary = true;
  }
} else {
  console.warn('Cloudinary credentials missing in .env. Running in Local Image Simulation mode.');
  isMockCloudinary = true;
}

export { cloudinary, isMockCloudinary };
