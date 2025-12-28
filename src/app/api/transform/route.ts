import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parsePromptWithGemini } from "@/lib/gemini";
import { buildImageKitUrl, describeOperations } from "@/lib/imagekit-client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, images } = body;

    if (!prompt || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Prompt and images are required" },
        { status: 400 }
      );
    }

    // Parse prompt with Gemini
    const operations = await parsePromptWithGemini(prompt);

    if (operations.length === 0) {
      return NextResponse.json(
        { error: "Could not parse transformations from prompt" },
        { status: 400 }
      );
    }

    const description = describeOperations(operations);

    // Generate transformed URLs for each image
    const results = images.map((image: { url: string; filePath: string; name: string }) => {
      const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
      const transformedUrl = buildImageKitUrl(
        urlEndpoint,
        image.filePath,
        operations
      );

      return {
        originalUrl: image.url,
        transformedUrl,
        operations,
        description,
        fileName: image.name,
      };
    });

    return NextResponse.json({
      results,
      operations,
      description,
    });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json(
      { error: "Failed to process transformations" },
      { status: 500 }
    );
  }
}
