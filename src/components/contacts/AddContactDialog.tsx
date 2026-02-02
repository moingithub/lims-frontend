import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ContactForm, ContactFormData } from "./ContactForm";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ContactFormData;
  onFormChange: (data: ContactFormData) => void;
  onConfirm: () => void;
}

export function AddContactDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>Add a new contact person to the system</DialogDescription>
        </DialogHeader>
        <ContactForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}