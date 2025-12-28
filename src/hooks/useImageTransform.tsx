"use client";

import { useState, useCallback } from 'react';
import { TransformOperation } from '@/lib/imagekit-client';
import { toast } from 'sonner';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  uploaded?: {
    fileId: string;
    url: string;
    filePath: string;
  };
}

export interface TransformResult {
  originalUrl: string;
  transformedUrl: string;
  operations: TransformOperation[];
  description: string;
  fileName: string;
}

interface UseImageTransformReturn {
  images: ImageFile[];
  isProcessing: boolean;
  isUploading: boolean;
  results: TransformResult[];
  addImages: (files: FileList | File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  processPrompt: (prompt: string) => Promise<void>;
  clearResults: () => void;
}

export function useImageTransform(): UseImageTransformReturn {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const uploadImages = async (imagesToUpload: ImageFile[]) => {
    const uploadedImages: ImageFile[] = [];

    for (const image of imagesToUpload) {
      if (image.uploaded) {
        uploadedImages.push(image);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', image.file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        uploadedImages.push({
          ...image,
          uploaded: {
            fileId: data.fileId,
            url: data.url,
            filePath: data.filePath,
          },
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${image.name}`);
      }
    }

    return uploadedImages;
  };

  const processPrompt = useCallback(async (prompt: string) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsProcessing(true);
    
    try {
      // First, upload images if not already uploaded
      setIsUploading(true);
      const uploadedImages = await uploadImages(images);
      setIsUploading(false);

      if (uploadedImages.length === 0) {
        toast.error('No images uploaded successfully');
        setIsProcessing(false);
        return;
      }

      // Update images with upload info
      setImages(uploadedImages);

      // Transform images
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          images: uploadedImages.map(img => ({
            url: img.uploaded!.url,
            filePath: img.uploaded!.filePath,
            name: img.name,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Transform failed');
      }

      const data = await response.json();
      setResults(data.results);

      // Save to history
      for (const result of data.results) {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original_url: result.originalUrl,
            transformed_url: result.transformedUrl,
            prompt,
            operations: JSON.stringify(result.operations),
            file_name: result.fileName,
          }),
        }).catch(err => console.error('Failed to save to history:', err));
      }

      toast.success(`Applied: ${data.description}`);
    } catch (error) {
      console.error('Transform error:', error);
      toast.error('Failed to process transformations');
    } finally {
      setIsProcessing(false);
      setIsUploading(false);
    }
  }, [images]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    images,
    isProcessing,
    isUploading,
    results,
    addImages,
    removeImage,
    clearImages,
    processPrompt,
    clearResults,
  };
}
