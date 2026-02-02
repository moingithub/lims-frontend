import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ContactForm, ContactFormData } from "./ContactForm";

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ContactFormData;
  onFormChange: (data: ContactFormData) => void;
  onConfirm: () => void;
}

export function EditContactDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update the contact details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ContactForm formData={formData} onChange={onFormChange} />
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