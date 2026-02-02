import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { ImportRecord, importMachineReportService } from "../services/importMachineReportService";
import { ImportUploadForm } from "../components/importMachineReport/ImportUploadForm";
import { ImportRecordsTable } from "../components/importMachineReport/ImportRecordsTable";

export function ImportMachineReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceMachine, setSourceMachine] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importRecords, setImportRecords] = useState<ImportRecord[]>(
    importMachineReportService.getImportRecords()
  );

  const filteredRecords = importMachineReportService.searchRecords(importRecords, searchTerm);

  const handleUpload = () => {
    if (!sourceMachine) {
      toast.error("Please select a source machine");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    // Create new import record with audit fields
    const currentTimestamp = new Date().toISOString();
    const newRecord: ImportRecord = {
      id: importRecords.length > 0 ? Math.max(...importRecords.map(r => r.id)) + 1 : 1,
      import_id: `IMP-${String(importRecords.length + 1).padStart(3, "0")}`,
      source_machine: sourceMachine,
      status: "Imported",
      file_name: selectedFile.name,
      uploaded_by: "Admin User",
      imported_date_time: currentTimestamp,
      created_by: 1, // TODO: Replace with actual logged-in user ID
    };

    setImportRecords([newRecord, ...importRecords]);
    toast.success("File uploaded successfully");

    // Reset form
    setSourceMachine("");
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleArchive = (record: ImportRecord) => {
    const updatedRecords = importRecords.map((r) =>
      r.import_id === record.import_id
        ? { ...r, status: "Archived" as const }
        : r
    );
    setImportRecords(updatedRecords);
    toast.success(`${record.file_name} archived successfully`);
  };

  const handleDelete = (record: ImportRecord) => {
    if (confirm(`Are you sure you want to delete ${record.file_name}?`)) {
      setImportRecords(
        importRecords.filter((r) => r.import_id !== record.import_id)
      );
      toast.success("Import record deleted successfully");
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
          />

          {/* Search */}
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

          <ImportRecordsTable
            records={filteredRecords}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onImportToSystem={handleImportToSystem}
          />

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