import { useState } from 'react';
import { Download, ArrowRight, ZoomIn, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransformResult } from '@/hooks/useImageTransform';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  results: TransformResult[];
}

export function ImagePreview({ results }: ImagePreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');

  if (results.length === 0) {
    return null;
  }

  const currentResult = results[activeIndex];

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transformed_${filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Preview</h3>
          <p className="text-sm text-muted-foreground">
            {currentResult.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-muted/50 p-1">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all",
                viewMode === 'side-by-side'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all",
                viewMode === 'slider'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Slider
            </button>
          </div>
        </div>
      </div>

      {/* Image Thumbnails (if multiple) */}
      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                activeIndex === idx
                  ? "border-primary glow-primary-sm"
                  : "border-border/50 hover:border-border"
              )}
            >
              <img
                src={result.originalUrl}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Preview */}
      <div className="glass rounded-2xl p-4 overflow-hidden">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Original</span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
                <img
                  src={currentResult.originalUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
                <button className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="p-2 rounded-full bg-primary/10">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Transformed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Transformed</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(currentResult.originalUrl, 'image')}
                  className="gap-1.5 text-xs"
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group border-2 border-primary/20">
                <img
                  src={currentResult.originalUrl}
                  alt="Transformed"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <div className="text-center p-4">
                    <p className="text-sm font-medium text-foreground">Preview Mode</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable Cloud for real-time transformations
                    </p>
                  </div>
                </div>
                <button className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <img
              src={currentResult.originalUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Slider view coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Operations Summary */}
      <div className="flex flex-wrap gap-2">
        {currentResult.operations.map((op, idx) => (
          <span
            key={idx}
            className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border/50"
          >
            {op.type}
          </span>
        ))}
      </div>
    </div>
  );
}
