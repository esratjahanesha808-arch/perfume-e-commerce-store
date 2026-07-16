import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminRatelimit } from "@/lib/redis";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/v1/admin/upload
// Body: multipart/form-data — field "file" (image), optional "folder"
export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-upload:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  if (!isCloudinaryConfigured) {
    return apiError(
      "SERVICE_UNAVAILABLE",
      "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      503
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = typeof formData.get("folder") === "string"
      ? (formData.get("folder") as string)
      : undefined;

    if (!(file instanceof File)) {
      return apiError(
        "BAD_REQUEST",
        '"file" field is required and must be an image file.',
        400
      );
    }

    if (file.size > MAX_BYTES) {
      return apiError("FILE_TOO_LARGE", "File must be under 5 MB.", 413);
    }

    if (!file.type.startsWith("image/")) {
      return apiError("INVALID_FILE_TYPE", "Only image files are accepted.", 415);
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await uploadImage(dataUri, { folder: folder ?? "luxora/products" });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    logApiError("POST /api/v1/admin/upload", err);
    return apiError("UPLOAD_FAILED", "Image upload failed.", 500);
  }
}
