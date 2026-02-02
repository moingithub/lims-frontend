export interface ImportRecord {
  id: number;
  import_id: string;
  source_machine: string;
  status: "Imported" | "Validated" | "Error" | "Archived";
  file_name: string;
  uploaded_by: string;
  imported_date_time: string;
  created_by: number;
}

const initialRecords: ImportRecord[] = [
  {
    id: 1,
    import_id: "IMP-001",
    source_machine: "Inficon",
    status: "Validated",
    file_name: "Inficon 1.2.xlsx",
    uploaded_by: "Admin User",
    imported_date_time: "2025-11-21T10:30:00",
    created_by: 1,
  },
  {
    id: 2,
    import_id: "IMP-002",
    source_machine: "GC",
    status: "Imported",
    file_name: "GC 1.2.xlsx",
    uploaded_by: "Admin User",
    imported_date_time: "2025-11-21T11:45:00",
    created_by: 1,
  },
  {
    id: 3,
    import_id: "IMP-003",
    source_machine: "Inficon",
    status: "Error",
    file_name: "Inficon 1.3.xlsx",
    uploaded_by: "John Doe",
    imported_date_time: "2025-11-20T14:20:00",
    created_by: 2,
  },
  {
    id: 4,
    import_id: "IMP-004",
    source_machine: "GC",
    status: "Archived",
    file_name: "GC 1.1.xlsx",
    uploaded_by: "Jane Smith",
    imported_date_time: "2025-11-19T09:15:00",
    created_by: 3,
  },
];

export const importMachineReportService = {
  getImportRecords: (): ImportRecord[] => {
    return initialRecords;
  },

  searchRecords: (records: ImportRecord[], searchTerm: string): ImportRecord[] => {
    return records.filter(record =>
      Object.values(record).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  },

  getStatusBadgeVariant: (status: string): string => {
    switch (status) {
      case "Validated":
        return "bg-green-100 text-green-800";
      case "Imported":
        return "bg-blue-100 text-blue-800";
      case "Error":
        return "bg-red-100 text-red-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  formatDateTime: (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  },

  validateFile: (file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type. Please upload Excel or CSV files only." };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 10MB limit." };
    }

    return { valid: true };
  },

  uploadFile: (file: File, sourceMachine: string, currentUserId: number = 1): ImportRecord => {
    const newRecord: ImportRecord = {
      id: Date.now(), // Generate unique ID
      import_id: `IMP-${Date.now()}`,
      source_machine: sourceMachine,
      status: "Imported",
      file_name: file.name,
      uploaded_by: "Current User",
      imported_date_time: new Date().toISOString(),
      created_by: currentUserId,
    };

    return newRecord;
  },

  archiveRecord: (recordId: string): boolean => {
    console.log(`Archiving record ${recordId}`);
    return true;
  },

  deleteRecord: (recordId: string): boolean => {
    console.log(`Deleting record ${recordId}`);
    return true;
  },
};