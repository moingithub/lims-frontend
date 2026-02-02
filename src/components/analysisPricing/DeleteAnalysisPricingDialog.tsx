import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface DeleteAnalysisPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisCode: string | null;
  onConfirm: () => void;
}

export function DeleteAnalysisPricingDialog({
  open,
  onOpenChange,
  analysisCode,
  onConfirm,
}: DeleteAnalysisPricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Analysis Pricing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete analysis "{analysisCode}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
