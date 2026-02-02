import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface DeleteCylinderMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serialNumber: string | null; // Note: This is still called serialNumber in props but refers to cylinder_number
  onConfirm: () => void;
}

export function DeleteCylinderMasterDialog({
  open,
  onOpenChange,
  serialNumber,
  onConfirm,
}: DeleteCylinderMasterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Cylinder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete cylinder "{serialNumber}"? This action cannot be undone.
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