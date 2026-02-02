import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Pencil } from "lucide-react";
import { Invoice } from "../../services/invoicesService";

interface EditStatusDialogProps {
  open: boolean;
  invoice: Invoice | null;
  newStatus: string;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: string) => void;
  onConfirm: () => void;
}

export function EditStatusDialog({
  open,
  invoice,
  newStatus,
  onOpenChange,
  onStatusChange,
  onConfirm,
}: EditStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Invoice Status</DialogTitle>
          <DialogDescription>
            Update the payment status for invoice {invoice?.invoice_number}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select value={newStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Pencil className="w-4 h-4 mr-2" />
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}