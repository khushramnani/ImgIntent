// ImageKit transformation utilities

export interface TransformOperation {
  type: string;
  params: Record<string, string | number>;
}

export interface ParsedTransformations {
  operations: TransformOperation[];
  raw: string;
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

  const transformations = operations.map(op => {
    switch (op.type) {
      case 'resize':
        return buildResizeTransform(op.params);
      case 'crop':
        return buildCropTransform(op.params);
      case 'blur':
        return `bl-${op.params.sigma || 10}`;
      case 'sharpen':
        return `e-sharpen-${op.params.amount || 10}`;
      case 'rotate':
        return `rt-${op.params.angle || 90}`;
      case 'format':
        return `f-${op.params.format || 'auto'}`;
      case 'quality':
        return `q-${op.params.value || 80}`;
      case 'grayscale':
        return 'e-grayscale';
      case 'contrast':
        return `e-contrast-${op.params.value || 0}`;
      case 'brightness':
        return `e-brightness-${op.params.value || 0}`;
      default:
        return '';
    }
  }).filter(Boolean);

  const transformString = transformations.join(',');
  return `${baseUrl}/tr:${transformString}${filePath}`;
}

function buildResizeTransform(params: Record<string, string | number>): string {
  const parts: string[] = [];
  if (params.width) parts.push(`w-${params.width}`);
  if (params.height) parts.push(`h-${params.height}`);
  if (params.mode) {
    const modeMap: Record<string, string> = {
      'fill': 'c-maintain_ratio',
      'fit': 'c-at_max',
      'cover': 'c-force',
    };
    if (modeMap[params.mode as string]) {
      parts.push(modeMap[params.mode as string]);
    }
  }
  return parts.join(',');
}

function buildCropTransform(params: Record<string, string | number>): string {
  const parts: string[] = [];
  if (params.width) parts.push(`w-${params.width}`);
  if (params.height) parts.push(`h-${params.height}`);
  
  const cropMode = params.mode || 'fill';
  const cropModeMap: Record<string, string> = {
    'fill': 'c-maintain_ratio',
    'extract': 'cm-extract',
    'pad': 'cm-pad_resize',
  };
  
  if (cropModeMap[cropMode as string]) {
    parts.push(cropModeMap[cropMode as string]);
  }
  
  if (params.focus) {
    const focusMap: Record<string, string> = {
      'face': 'fo-face',
      'center': 'fo-center',
      'top': 'fo-top',
      'bottom': 'fo-bottom',
      'left': 'fo-left',
      'right': 'fo-right',
    };
    if (focusMap[params.focus as string]) {
      parts.push(focusMap[params.focus as string]);
    }
  }
  
  return parts.join(',');
}

// Parse AI response into transformation operations
export function parseAIResponse(response: string): TransformOperation[] {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    if (parsed.operations && Array.isArray(parsed.operations)) {
      return parsed.operations;
    }
    return [];
  } catch {
    // If not JSON, try to extract operations from text
    return extractOperationsFromText(response);
  }
}

function extractOperationsFromText(text: string): TransformOperation[] {
  const operations: TransformOperation[] = [];
  const lowerText = text.toLowerCase();

  // Simple pattern matching for common operations
  if (lowerText.includes('blur')) {
    const match = lowerText.match(/blur[:\s]*(\d+)/i);
    operations.push({ type: 'blur', params: { sigma: match ? parseInt(match[1]) : 10 } });
  }

  if (lowerText.includes('sharpen')) {
    const match = lowerText.match(/sharpen[:\s]*(\d+)/i);
    operations.push({ type: 'sharpen', params: { amount: match ? parseInt(match[1]) : 10 } });
  }

  if (lowerText.includes('rotate')) {
    const match = lowerText.match(/rotate[:\s]*(\d+)/i);
    operations.push({ type: 'rotate', params: { angle: match ? parseInt(match[1]) : 90 } });
  }

  if (lowerText.includes('resize') || lowerText.includes('width') || lowerText.includes('height')) {
    const widthMatch = lowerText.match(/width[:\s]*(\d+)/i);
    const heightMatch = lowerText.match(/height[:\s]*(\d+)/i);
    if (widthMatch || heightMatch) {
      operations.push({
        type: 'resize',
        params: {
          ...(widthMatch && { width: parseInt(widthMatch[1]) }),
          ...(heightMatch && { height: parseInt(heightMatch[1]) }),
        },
      });
    }
  }

  if (lowerText.includes('grayscale') || lowerText.includes('black and white')) {
    operations.push({ type: 'grayscale', params: {} });
  }

  if (lowerText.includes('quality')) {
    const match = lowerText.match(/quality[:\s]*(\d+)/i);
    operations.push({ type: 'quality', params: { value: match ? parseInt(match[1]) : 80 } });
  }

  const formatMatch = lowerText.match(/convert to (png|jpg|jpeg|webp|avif)/i);
  if (formatMatch) {
    operations.push({ type: 'format', params: { format: formatMatch[1].toLowerCase() } });
  }

  return operations;
}

// Generate a human-readable description of operations
export function describeOperations(operations: TransformOperation[]): string {
  if (operations.length === 0) return 'No transformations applied';

  const descriptions = operations.map(op => {
    switch (op.type) {
      case 'resize':
        const dims = [];
        if (op.params.width) dims.push(`width: ${op.params.width}px`);
        if (op.params.height) dims.push(`height: ${op.params.height}px`);
        return `Resize (${dims.join(', ')})`;
      case 'crop':
        return `Crop to ${op.params.width}x${op.params.height}`;
      case 'blur':
        return `Blur (${op.params.sigma})`;
      case 'sharpen':
        return `Sharpen (${op.params.amount})`;
      case 'rotate':
        return `Rotate ${op.params.angle}°`;
      case 'format':
        return `Convert to ${(op.params.format as string).toUpperCase()}`;
      case 'quality':
        return `Quality: ${op.params.value}%`;
      case 'grayscale':
        return 'Grayscale';
      case 'brightness':
        return `Brightness: ${op.params.value}`;
      case 'contrast':
        return `Contrast: ${op.params.value}`;
      default:
        return op.type;
    }
  });

  return descriptions.join(' → ');
}

// Sample transformations for demo mode
export const sampleTransformations: TransformOperation[] = [
  { type: 'resize', params: { width: 800, height: 600 } },
  { type: 'quality', params: { value: 85 } },
];
