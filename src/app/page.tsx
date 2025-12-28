"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { PromptInput } from "@/components/PromptInput";
import { ImagePreview } from "@/components/ImagePreview";
import { useImageTransform } from "@/hooks/useImageTransform";
import { Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function EditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    images,
    isProcessing,
    results,
    addImages,
    removeImage,
    clearImages,
    processPrompt,
  } = useImageTransform();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Transform Images with{" "}
              <span className="gradient-text">Natural Language</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload your images and describe the transformations you want.
              Our AI will parse your prompt and apply the edits instantly.
            </p>
          </div>

          {/* Info Notice */}
          <div className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-in border-primary/20 border">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">AI-Powered Transformations</p>
              <p className="text-muted-foreground">
                Powered by ImageKit for image processing and Google Gemini for intelligent prompt parsing.
              </p>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="space-y-6">
            {/* Upload Section */}
            <section className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Upload Images</h2>
                {images.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearImages}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <ImageUploader
                images={images}
                onAddImages={addImages}
                onRemoveImage={removeImage}
                disabled={isProcessing}
              />
            </section>

            {/* Prompt Section */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold px-1">Describe Your Edits</h2>
              <PromptInput
                onSubmit={processPrompt}
                isProcessing={isProcessing}
                disabled={images.length === 0}
              />
            </section>

            {/* Preview Section */}
            {results.length > 0 && (
              <section>
                <ImagePreview results={results} />
              </section>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            {[
              { label: "Resize & Crop", desc: "Any dimensions" },
              { label: "Format Convert", desc: "PNG, JPG, WebP" },
              { label: "Effects", desc: "Blur, Sharpen, etc." },
              { label: "Bulk Processing", desc: "Up to 10 images" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="glass rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
              >
                <p className="font-medium text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
