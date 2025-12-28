// Client-side ImageKit utilities for URL generation

export interface TransformOperation {
  type: string;
  params: Record<string, string | number>;
}

// Map transformation operations to ImageKit URL parameters
export function buildImageKitUrl(
  baseUrl: string,
  filePath: string,
  operations: TransformOperation[]
): string {
  if (operations.length === 0) {
    return `${baseUrl}${filePath}`;
  }

  const transformations = operations
    .map((op) => {
      switch (op.type) {
        case "resize":
          return buildResizeTransform(op.params);
        case "crop":
          return buildCropTransform(op.params);
        case "blur":
          return `bl-${op.params.sigma || 10}`;
        case "sharpen":
          return `e-sharpen-${op.params.amount || 10}`;
        case "rotate":
          return `rt-${op.params.angle || 90}`;
        case "format":
          return `f-${op.params.format || "auto"}`;
        case "quality":
          return `q-${op.params.value || 80}`;
        case "grayscale":
          return "e-grayscale";
        case "contrast":
          return `e-contrast-${op.params.value || 0}`;
        case "brightness":
          return `e-brightness-${op.params.value || 0}`;
        default:
          return "";
      }
    })
    .filter(Boolean);

  const transformString = transformations.join(",");
  return `${baseUrl}/tr:${transformString}${filePath}`;
}

function buildResizeTransform(
  params: Record<string, string | number>
): string {
  const parts: string[] = [];
  if (params.width) parts.push(`w-${params.width}`);
  if (params.height) parts.push(`h-${params.height}`);
  if (params.mode) {
    const modeMap: Record<string, string> = {
      fill: "c-maintain_ratio",
      fit: "c-at_max",
      cover: "c-force",
    };
    if (modeMap[params.mode as string]) {
      parts.push(modeMap[params.mode as string]);
    }
  }
  return parts.join(",");
}

function buildCropTransform(params: Record<string, string | number>): string {
  const parts: string[] = [];
  if (params.width) parts.push(`w-${params.width}`);
  if (params.height) parts.push(`h-${params.height}`);

  const cropMode = params.mode || "fill";
  const cropModeMap: Record<string, string> = {
    fill: "c-maintain_ratio",
    extract: "cm-extract",
    pad: "cm-pad_resize",
  };

  if (cropModeMap[cropMode as string]) {
    parts.push(cropModeMap[cropMode as string]);
  }

  if (params.focus) {
    const focusMap: Record<string, string> = {
      face: "fo-face",
      center: "fo-center",
      top: "fo-top",
      bottom: "fo-bottom",
      left: "fo-left",
      right: "fo-right",
    };
    if (focusMap[params.focus as string]) {
      parts.push(focusMap[params.focus as string]);
    }
  }

  return parts.join(",");
}

// Generate a human-readable description of operations
export function describeOperations(operations: TransformOperation[]): string {
  if (operations.length === 0) return "No transformations applied";

  const descriptions = operations.map((op) => {
    switch (op.type) {
      case "resize":
        const dims = [];
        if (op.params.width) dims.push(`width: ${op.params.width}px`);
        if (op.params.height) dims.push(`height: ${op.params.height}px`);
        return `Resize (${dims.join(", ")})`;
      case "crop":
        return `Crop to ${op.params.width}x${op.params.height}`;
      case "blur":
        return `Blur (${op.params.sigma})`;
      case "sharpen":
        return `Sharpen (${op.params.amount})`;
      case "rotate":
        return `Rotate ${op.params.angle}°`;
      case "format":
        return `Convert to ${(op.params.format as string).toUpperCase()}`;
      case "quality":
        return `Quality: ${op.params.value}%`;
      case "grayscale":
        return "Grayscale";
      case "brightness":
        return `Brightness: ${op.params.value}`;
      case "contrast":
        return `Contrast: ${op.params.value}`;
      default:
        return op.type;
    }
  });

  return descriptions.join(" → ");
}
