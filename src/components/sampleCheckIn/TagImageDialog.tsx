import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";

interface TagImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

export function TagImageDialog({ open, onOpenChange, imageUrl }: TagImageDialogProps) {
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
          {imageUrl && (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img src={imageUrl} alt="Sample Tag" className="w-full h-auto" />
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