import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getImageKitInstance } from "@/lib/imagekit-server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      );
    }

    const imagekit = getImageKitInstance();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: `/users/${session.user.id}`,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      fileId: result.fileId,
      url: result.url,
      filePath: result.filePath,
      name: result.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Get ImageKit auth params for client-side upload
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imagekit = getImageKitInstance();
    const authParams = imagekit.getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    console.error("Auth params error:", error);
    return NextResponse.json(
      { error: "Failed to get auth parameters" },
      { status: 500 }
    );
  }
}
