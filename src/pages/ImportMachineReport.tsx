import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  ImportRecord,
  importMachineReportService,
} from "../services/importMachineReportService";
import { ImportUploadForm } from "../components/importMachineReport/ImportUploadForm";
import { ImportRecordsTable } from "../components/importMachineReport/ImportRecordsTable";

export function ImportMachineReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceMachine, setSourceMachine] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      try {
        const records = await importMachineReportService.fetchImportRecords();
        if (isMounted) setImportRecords(records);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load import records";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRecords = importMachineReportService.searchRecords(
    importRecords,
    searchTerm,
  );

  const resetUploadForm = () => {
    setSourceMachine("");
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleUpload = async () => {
    if (!sourceMachine) {
      toast.error("Please select a source machine");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      const created = await importMachineReportService.uploadFile(
        selectedFile,
        sourceMachine,
      );
      setImportRecords((prev) => [created, ...prev]);
      toast.success("File uploaded successfully");
      resetUploadForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload file";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleArchive = async (record: ImportRecord) => {
    try {
      const updated = await importMachineReportService.updateStatus(
        record.id,
        "Archived",
      );
      setImportRecords((prev) =>
        prev.map((r) => (r.id === record.id ? updated : r)),
      );
      toast.success(`${record.file_name} archived successfully`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to archive record";
      toast.error(message);
    }
  };

  const handleDelete = async (record: ImportRecord) => {
    if (!confirm(`Are you sure you want to delete ${record.file_name}?`)) {
      return;
    }

    try {
      await importMachineReportService.deleteRecord(record.id);
      setImportRecords((prev) => prev.filter((r) => r.id !== record.id));
      toast.success("Import record deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete record";
      toast.error(message);
    }
  };

  const handleImportToSystem = (record: ImportRecord) => {
    toast.success(`${record.file_name} imported to system successfully`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Import Machine Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportUploadForm
            sourceMachine={sourceMachine}
            selectedFile={selectedFile}
            onSourceMachineChange={setSourceMachine}
            onFileChange={setSelectedFile}
            onUpload={handleUpload}
            isUploading={isUploading}
          />

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading import records...
            </p>
          ) : (
            <ImportRecordsTable
              records={filteredRecords}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onImportToSystem={handleImportToSystem}
            />
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredRecords.length} of {importRecords.length} records
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
