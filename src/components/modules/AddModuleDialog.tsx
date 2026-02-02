import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { ModuleForm, ModuleFormData } from "./ModuleForm";

interface AddModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ModuleFormData;
  onFormChange: (data: ModuleFormData) => void;
  onConfirm: () => void;
}

export function AddModuleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Record</DialogTitle>
          <DialogDescription>Add a new module to the system</DialogDescription>
        </DialogHeader>
        <ModuleForm formData={formData} onChange={onFormChange} />
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
