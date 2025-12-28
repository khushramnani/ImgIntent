import { useCallback, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageFile } from '@/hooks/useImageTransform';

interface ImageUploaderProps {
  images: ImageFile[];
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (id: string) => void;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onAddImages,
  onRemoveImage,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      onAddImages(e.dataTransfer.files);
    },
    [onAddImages, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddImages(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer group",
          "border-border/50 hover:border-primary/50",
          "bg-surface/50 hover:bg-accent/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-accent/50 group-hover:bg-accent transition-colors">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Up to 10 images, max 10MB each
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded bg-muted">PNG</span>
            <span className="px-2 py-1 rounded bg-muted">JPG</span>
            <span className="px-2 py-1 rounded bg-muted">WebP</span>
            <span className="px-2 py-1 rounded bg-muted">GIF</span>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-muted animate-fade-in"
            >
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(image.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-foreground truncate font-medium">
                  {image.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
          <ImageIcon className="w-5 h-5" />
          <span className="text-sm">No images uploaded yet</span>
        </div>
      )}
    </div>
  );
}
