import { GoogleGenerativeAI } from "@google/generative-ai";
import { TransformOperation } from "./imagekit-client";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function parsePromptWithGemini(
  prompt: string
): Promise<TransformOperation[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an image transformation parser. Convert natural language prompts into JSON operations for ImageKit transformations.

Available operations:
- resize: { width?: number, height?: number, mode?: "fill"|"fit"|"cover" }
- crop: { width: number, height: number, mode?: "fill"|"extract"|"pad", focus?: "face"|"center"|"top"|"bottom"|"left"|"right" }
- blur: { sigma: number } (1-100)
- sharpen: { amount: number } (0-10)
- rotate: { angle: number } (degrees)
- format: { format: "png"|"jpg"|"jpeg"|"webp"|"avif" }
- quality: { value: number } (1-100)
- grayscale: {}
- contrast: { value: number } (-100 to 100)
- brightness: { value: number } (-100 to 100)

Examples:
Input: "resize to 800x600 and blur it"
Output: [{"type":"resize","params":{"width":800,"height":600}},{"type":"blur","params":{"sigma":10}}]

Input: "make it grayscale, sharpen, and convert to webp"
Output: [{"type":"grayscale","params":{}},{"type":"sharpen","params":{"amount":5}},{"type":"format","params":{"format":"webp"}}]

Return ONLY a valid JSON array of operations, no explanation.`;

    const result = await model.generateContent([
      systemPrompt,
      `User prompt: ${prompt}`,
    ]);

    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const operations = JSON.parse(jsonMatch[0]) as TransformOperation[];
    
    // Validate operations
    if (!Array.isArray(operations)) {
      throw new Error("Invalid operations format");
    }

    return operations;
  } catch (error) {
    console.error("Gemini parsing error:", error);
    // Fallback to simple text parsing
    return parsePromptFallback(prompt);
  }
}

// Fallback parser for when Gemini is unavailable or fails
function parsePromptFallback(prompt: string): TransformOperation[] {
  const operations: TransformOperation[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // Resize detection
  const resizeMatch = lowerPrompt.match(/(\d+)\s*x\s*(\d+)/);
  if (resizeMatch) {
    operations.push({
      type: "resize",
      params: { width: parseInt(resizeMatch[1]), height: parseInt(resizeMatch[2]) },
    });
  }

  // Blur detection
  if (lowerPrompt.includes("blur")) {
    const blurMatch = lowerPrompt.match(/blur[:\s]*(\d+)/);
    operations.push({
      type: "blur",
      params: { sigma: blurMatch ? parseInt(blurMatch[1]) : 10 },
    });
  }

  // Sharpen detection
  if (lowerPrompt.includes("sharpen")) {
    const sharpenMatch = lowerPrompt.match(/sharpen[:\s]*(\d+)/);
    operations.push({
      type: "sharpen",
      params: { amount: sharpenMatch ? parseInt(sharpenMatch[1]) : 5 },
    });
  }

  // Rotate detection
  if (lowerPrompt.includes("rotate")) {
    const rotateMatch = lowerPrompt.match(/rotate[:\s]*(\d+)/);
    operations.push({
      type: "rotate",
      params: { angle: rotateMatch ? parseInt(rotateMatch[1]) : 90 },
    });
  }

  // Grayscale detection
  if (lowerPrompt.includes("grayscale") || lowerPrompt.includes("black and white") || lowerPrompt.includes("greyscale")) {
    operations.push({ type: "grayscale", params: {} });
  }

  // Quality detection
  if (lowerPrompt.includes("quality")) {
    const qualityMatch = lowerPrompt.match(/quality[:\s]*(\d+)/);
    operations.push({
      type: "quality",
      params: { value: qualityMatch ? parseInt(qualityMatch[1]) : 80 },
    });
  }

  // Format detection
  const formatMatch = lowerPrompt.match(/convert to (png|jpg|jpeg|webp|avif)/i);
  if (formatMatch) {
    operations.push({
      type: "format",
      params: { format: formatMatch[1].toLowerCase() },
    });
  }

  // Brightness detection
  if (lowerPrompt.includes("bright")) {
    const brightMatch = lowerPrompt.match(/bright(?:en|ness)?[:\s]*(-?\d+)/);
    operations.push({
      type: "brightness",
      params: { value: brightMatch ? parseInt(brightMatch[1]) : 20 },
    });
  }

  // Contrast detection
  if (lowerPrompt.includes("contrast")) {
    const contrastMatch = lowerPrompt.match(/contrast[:\s]*(-?\d+)/);
    operations.push({
      type: "contrast",
      params: { value: contrastMatch ? parseInt(contrastMatch[1]) : 20 },
    });
  }

  return operations;
}
