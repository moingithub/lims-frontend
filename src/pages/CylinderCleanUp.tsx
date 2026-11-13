import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cylinderMasterService } from "../services/cylinderMasterService";
import {
  CylinderCleanupLine,
  cylinderCleanupService,
} from "../services/cylinderCleanupService";
import { CylinderCleanUpTable } from "../components/cylinderCleanUp/CylinderCleanUpTable";

export function CylinderCleanUp() {
  const [cylinderInput, setCylinderInput] = useState("");
  const [lines, setLines] = useState<CylinderCleanupLine[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    cylinderMasterService
      .fetchCylinders(true)
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load cylinders";
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMaster(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cylinders = cylinderMasterService.getCylinders();

  const addCylinder = useCallback(async () => {
    const validation = cylinderCleanupService.validateCylinderForCleanup(
      cylinderInput,
      lines,
      cylinders,
    );
    if (!validation.valid || !validation.cylinder) {
      toast.error(validation.error || "Cannot add this cylinder");
      return;
    }

    setLines((prev) => [
      ...prev,
      cylinderCleanupService.buildCleanupLine(validation.cylinder),
    ]);
    setCylinderInput("");
  }, [cylinderInput, lines, cylinders]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void addCylinder();
    }
  };

  const handleConfirm = async () => {
    if (lines.length === 0) {
      toast.error("Add at least one cylinder to confirm clean-up.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cylinderCleanupService.confirmCleanUp(lines);
      await cylinderMasterService.fetchCylinders(true);
      toast.success(
        `${lines.length} cylinder${lines.length === 1 ? "" : "s"} marked clean.`,
      );
      setLines([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to confirm clean-up";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldsDisabled = isLoadingMaster || isSubmitting;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl">Cylinder Clean-Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="cylinder-cleanup-input">
              Scan Cylinder Barcode / Cylinder Number
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="cylinder-cleanup-input"
                placeholder="Scan or type a cylinder number"
                value={cylinderInput}
                onChange={(e) => setCylinderInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={fieldsDisabled}
                className="flex-1"
              />
              <Button
                onClick={() => void addCylinder()}
                disabled={fieldsDisabled || !cylinderInput.trim()}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cylinder number must exist in Cylinder Master with status "Checked
              In" (not checked out or already clean)
            </p>
          </div>

          <CylinderCleanUpTable
            lines={lines}
            onRemove={(id) =>
              setLines((prev) => prev.filter((row) => row.cylinderId !== id))
            }
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => void handleConfirm()}
              disabled={fieldsDisabled || lines.length === 0}
              className="sm:min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Confirm Clean-Up"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLines([])}
              disabled={fieldsDisabled || lines.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
