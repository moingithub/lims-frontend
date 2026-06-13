import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useAuthenticatedUploadUrl } from "../../utils/uploadAssetUrl";

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
  const { objectUrl, loading, error } = useAuthenticatedUploadUrl(
    imageUrl,
    filename,
    open && Boolean(imageUrl),
  );

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
            <div className="border rounded-lg overflow-hidden bg-gray-50 min-h-[200px] flex items-center justify-center">
              {loading && (
                <p className="text-sm text-muted-foreground">Loading image...</p>
              )}
              {error && !loading && (
                <p className="text-sm text-destructive">
                  Failed to load image. Please sign in and try again.
                </p>
              )}
              {objectUrl && !loading && !error && (
                <img
                  src={objectUrl}
                  alt="Sample Tag"
                  className="w-full h-auto"
                />
              )}
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
