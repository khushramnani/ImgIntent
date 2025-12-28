import { useState, useCallback } from 'react';
import { TransformOperation, buildImageKitUrl, parseAIResponse, describeOperations } from '@/lib/imagekit';
import { addToHistory } from '@/lib/storage';
import { toast } from 'sonner';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export interface TransformResult {
  originalUrl: string;
  transformedUrl: string;
  operations: TransformOperation[];
  description: string;
}

interface UseImageTransformReturn {
  images: ImageFile[];
  isProcessing: boolean;
  results: TransformResult[];
  addImages: (files: FileList | File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  processPrompt: (prompt: string) => Promise<void>;
  clearResults: () => void;
}

// Demo ImageKit endpoint - in production, this would be configured
const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/demo';

export function useImageTransform(): UseImageTransformReturn {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransformResult[]>([]);

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResults([]);
  }, [images]);

  const processPrompt = useCallback(async (prompt: string) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    
    try {
      // In demo mode, we'll parse the prompt locally
      // In production, this would call the AI edge function
      const operations = parseAIResponse(prompt);
      
      if (operations.length === 0) {
        // Default operations if parsing fails
        operations.push(
          { type: 'quality', params: { value: 85 } }
        );
        toast.info('Using default transformations. Enable Cloud for AI-powered parsing.');
      }

      const description = describeOperations(operations);
      
      const newResults: TransformResult[] = images.map(img => {
        // For demo, we'll use the preview URL
        // In production, this would use the ImageKit uploaded URL
        const transformedUrl = buildImageKitUrl(
          IMAGEKIT_ENDPOINT,
          `/sample.jpg`,
          operations
        );

        // Save to history
        addToHistory({
          originalUrl: img.preview,
          transformedUrl,
          prompt,
          operations: JSON.stringify(operations),
          fileName: img.name,
        });

        return {
          originalUrl: img.preview,
          transformedUrl,
          operations,
          description,
        };
      });

      setResults(newResults);
      toast.success(`Applied: ${description}`);
    } catch (error) {
      console.error('Transform error:', error);
      toast.error('Failed to process transformations');
    } finally {
      setIsProcessing(false);
    }
  }, [images]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    images,
    isProcessing,
    results,
    addImages,
    removeImage,
    clearImages,
    processPrompt,
    clearResults,
  };
}
