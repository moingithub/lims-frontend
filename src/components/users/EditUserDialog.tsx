import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserForm, UserFormData } from "./UserForm";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  onConfirm: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Update the details for this record. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          formData={formData}
          onChange={onFormChange}
          requirePassword={false}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
