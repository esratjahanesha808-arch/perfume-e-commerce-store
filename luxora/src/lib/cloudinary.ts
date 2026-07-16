import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });
}

export type UploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
};

/**
 * Upload a file buffer or data URI to Cloudinary.
 * Throws when Cloudinary is not configured.
 */
export async function uploadImage(
  source: string,
  options: { folder?: string; publicId?: string } = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const result = await cloudinary.uploader.upload(source, {
    folder: options.folder ?? "luxora/products",
    public_id: options.publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Delete an image by its Cloudinary public_id.
 * Safe no-op when Cloudinary is not configured.
 */
export async function deleteImage(publicId: string) {
  if (!isCloudinaryConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("[cloudinary] deleteImage failed:", err);
  }
}
