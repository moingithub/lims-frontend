import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ModuleForm, ModuleFormData } from "./ModuleForm";

interface EditModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ModuleFormData;
  onFormChange: (data: ModuleFormData) => void;
  onConfirm: () => void;
}

export function EditModuleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>Update the module information</DialogDescription>
        </DialogHeader>
        <ModuleForm formData={formData} onChange={onFormChange} />
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
