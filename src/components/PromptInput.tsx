import { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const examplePrompts = [
  "Resize to 800x600, add slight blur, convert to WebP",
  "Rotate 90 degrees, sharpen, reduce quality to 70%",
  "Crop to square, apply grayscale, convert to PNG",
  "Resize width to 1200, compress to 50%, sharpen edges",
];

export function PromptInput({ onSubmit, isProcessing, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (prompt.trim() && !isProcessing && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Main Input */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "glow-primary-sm"
        )}
      >
        <div
          className={cn(
            "glass rounded-2xl overflow-hidden transition-all duration-300",
            isFocused && "border-primary/50"
          )}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe the transformations you want..."
            disabled={isProcessing || disabled}
            rows={2}
            className={cn(
              "w-full px-5 py-4 bg-transparent resize-none outline-none",
              "text-foreground placeholder:text-muted-foreground",
              "min-h-[80px] max-h-[200px]"
            )}
          />
          
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-powered parsing</span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isProcessing || disabled}
              className="gradient-primary text-primary-foreground gap-2 glow-primary-sm hover:opacity-90 transition-opacity"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Transform
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium px-1">
          Try these examples:
        </p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              disabled={isProcessing || disabled}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg transition-all",
                "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
                "border border-border/50 hover:border-primary/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
