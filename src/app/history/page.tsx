"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Clock, ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditHistoryItem {
  id: string;
  original_url: string;
  transformed_url: string;
  prompt: string;
  operations: string;
  file_name: string;
  created_at: string;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<EditHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        toast.success("Removed from history");
      } else {
        throw new Error("Failed to remove");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove from history");
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch("/api/history?clearAll=true", {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory([]);
        toast.success("History cleared");
      } else {
        throw new Error("Failed to clear");
      }
    } catch (error) {
      console.error("Clear error:", error);
      toast.error("Failed to clear history");
    }
  };

  if (status === "loading" || isLoading) {
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
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit History</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your recent transformations ({history.length} items)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchHistory}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                No history yet
              </h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
                Your transformation history will appear here after you process
                some images.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "glass rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-all",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.original_url}
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/></svg>';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.file_name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(item.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.prompt}
                    </p>

                    {/* Operations Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {JSON.parse(item.operations)
                        .slice(0, 4)
                        .map(
                          (
                            op: { type: string },
                            opIdx: number
                          ) => (
                            <span
                              key={opIdx}
                              className="px-2 py-0.5 text-xs rounded-full bg-accent text-accent-foreground"
                            >
                              {op.type}
                            </span>
                          )
                        )}
                      {JSON.parse(item.operations).length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                          +{JSON.parse(item.operations).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>History is stored securely in Supabase.</p>
          </div>
        </div>
      </div>
    </>
  );
}
