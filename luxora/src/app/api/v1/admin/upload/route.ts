import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// POST /api/v1/admin/upload
// Body: multipart/form-data — field "file" (image), optional "folder"
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isCloudinaryConfigured) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        },
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = typeof formData.get("folder") === "string"
      ? (formData.get("folder") as string)
      : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "\"file\" field is required and must be an image file." } },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "File must be under 5 MB." } },
        { status: 413 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE_TYPE", message: "Only image files are accepted." } },
        { status: 415 }
      );
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await uploadImage(dataUri, { folder: folder ?? "luxora/products" });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/v1/admin/upload]", err);
    return NextResponse.json(
      { error: { code: "UPLOAD_FAILED", message: "Image upload failed." } },
      { status: 500 }
    );
  }
}
