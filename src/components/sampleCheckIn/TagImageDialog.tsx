import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface TagImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  filename?: string | null;
}

export function TagImageDialog({
  open,
  onOpenChange,
  imageUrl,
  filename,
}: TagImageDialogProps) {
  // Convert file path to accessible URL
  const getImageUrl = (url: string | null): string => {
    if (!url) return "";

    // If it's already a URL (starts with http, https, or /), use as-is
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/")
    ) {
      return url;
    }

    // If it's a file path, extract filename and construct API URL
    // Path format: D:\Projects\LIMS-Backend\uploads\ocr\1779032769195-ORC-Image.PNG
    const lastSlash = Math.max(url.lastIndexOf("\\"), url.lastIndexOf("/"));
    if (lastSlash >= 0) {
      const uploadDir = url.substring(0, lastSlash);
      const file = url.substring(lastSlash + 1);

      // Check if path contains 'uploads'
      if (uploadDir.includes("uploads")) {
        const uploadsIndex = uploadDir.lastIndexOf("uploads");
        const relativePath = uploadDir.substring(uploadsIndex) + "/" + file;
        return `/api/${relativePath}`;
      }
    }

    // Fallback: use filename to construct URL
    if (filename) {
      return `/api/uploads/ocr/${filename}`;
    }

    return url;
  };

  const displayImageUrl = getImageUrl(imageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>OCR Scanned Sample Tag</DialogTitle>
          <DialogDescription>
            View the scanned sample tag image
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {filename && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900">
                <span className="font-bold">Filename:</span> {filename}
              </p>
            </div>
          )}
          {imageUrl && (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={displayImageUrl}
                alt="Sample Tag"
                className="w-full h-auto"
                onError={(e) => {
                  console.error("Failed to load image:", displayImageUrl);
                  (e.target as HTMLImageElement).alt = "Failed to load image";
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
