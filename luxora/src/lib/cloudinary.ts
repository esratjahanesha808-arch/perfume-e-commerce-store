// Cloudinary removed for portfolio mode.
// All upload/delete operations are disabled; the admin upload endpoint returns 503.

export const isCloudinaryConfigured = false;

export type UploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
};

export async function uploadImage(
  _source: string,
  _options: { folder?: string; publicId?: string } = {}
): Promise<UploadResult> {
  throw new Error("Image upload is not available in portfolio mode.");
}

export async function deleteImage(_publicId: string) {
  // no-op
}
