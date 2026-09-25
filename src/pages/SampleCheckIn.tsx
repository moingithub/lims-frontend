import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Plus, FileCheck, X, CheckCircle2, Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { getCurrentDateUS, toIsoDateInputValue } from "../utils/dateUtils";
import { validateImageFileForOCRQuick } from "../utils/imageValidation";
import { compressImageForOCR } from "../utils/imageCompression";
import { Badge } from "../components/ui/badge";
import {
  CheckedInSample,
  resolveOcrSampleDateAndTime,
  sampleCheckInService,
} from "../services/sampleCheckInService";
import { analysisPricingService } from "../services/analysisPricingService";
import {
  companyMasterService,
  Company,
} from "../services/companyMasterService";
import { contactsService, Contact } from "../services/contactsService";
import {
  companyAreaService,
  CompanyArea,
} from "../services/companyAreaService";
import { cylinderMasterService } from "../services/cylinderMasterService";
import { cylinderCheckOutService } from "../services/cylinderCheckOutService";
import { CompanyMasterFormData } from "../components/companyMaster/CompanyMasterForm";
import { CompanyContactSelector } from "../components/sampleCheckIn/CompanyContactSelector";
import { AnalysisOptionsForm } from "../components/sampleCheckIn/AnalysisOptionsForm";
import { SampleDetailsForm } from "../components/sampleCheckIn/SampleDetailsForm";
import { CheckedInCylindersTable } from "../components/sampleCheckIn/CheckedInCylindersTable";
import { WorkOrderSummary } from "../components/sampleCheckIn/WorkOrderSummary";
import { TagImageDialog } from "../components/sampleCheckIn/TagImageDialog";
import { TagCameraDialog } from "../components/sampleCheckIn/TagCameraDialog";
import {
  OcrProgressStepper,
  OcrProgressStage,
  waitForOcrStepVisibility,
} from "../components/sampleCheckIn/OcrProgressStepper";
import { AddCompanyMasterDialog } from "../components/companyMaster/AddCompanyMasterDialog";
import { AddContactDialog } from "../components/contacts/AddContactDialog";
import { WorkOrderReportDialog } from "../components/sampleCheckIn/WorkOrderReportDialog";
import { ContactFormData } from "../components/contacts/ContactForm";

// Use the CheckedInSample interface from the service instead of duplicating
type CheckedInCylinder = CheckedInSample;

export function SampleCheckIn({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  // Customer and Contact state
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null,
  );

  // Current customer context (persists across form clears)
  const [currentCustomer, setCurrentCustomer] = useState("");
  const [monthlyCustomerCylinders, setMonthlyCustomerCylinders] = useState(0);

  // Analysis number counter
  const [analysisCounter, setAnalysisCounter] = useState(1);

  // Dialog states
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isWorkOrderDialogOpen, setIsWorkOrderDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  // Company Master form data
  const [companyFormData, setCompanyFormData] = useState<CompanyMasterFormData>(
    {
      id: 0,
      company_code: "",
      company_name: "",
      phone: "",
      email: "",
      billing_reference_type: "NA",
      billing_reference_number: "",
      billing_address: "",
      charge_h2_pop_fee: false,
      h2_pop_fee_rate: "",
      pressure_base: "",
      pressure_base_factor: "",
      active: true,
    },
  );

  // Contact form data
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    id: 0,
    company_id: 0,
    company_area_id: null,
    name: "",
    phone: "",
    email: "",
    active: true,
  });

  // Pre-select company when opening add contact dialog
  useEffect(() => {
    if (isAddContactDialogOpen && selectedCompanyId) {
      setContactFormData((prev) => ({
        ...prev,
        company_id: selectedCompanyId,
      }));
    }
  }, [isAddContactDialogOpen, selectedCompanyId]);

  // Prefer GPA 2261 as the default when it is available.
  const getDefaultAnalysisType = () => {
    const activeTypes = analysisPricingService.getActiveAnalysisPrices();
    const preferredType = activeTypes.find(
      (analysis) => analysis.analysis_code.trim().toLowerCase() === "gpa 2261",
    );
    return preferredType?.analysis_code ?? activeTypes[0]?.analysis_code ?? "";
  };

  // Form fields for scanned data
  const [analysisType, setAnalysisType] = useState(getDefaultAnalysisType());
  const [checkInType, setCheckInType] = useState<
    "Cylinder" | "Bottle" | "CP Cylinder"
  >("Cylinder");
  const [customerCylinder, setCustomerCylinder] = useState(false);
  const [rushed, setRushed] = useState(false);
  const [invoiceRefName, setInvoiceRefName] = useState("NA");
  const [invoiceRefValue, setInvoiceRefValue] = useState("");
  const [date, setDate] = useState("");
  const [producer, setProducer] = useState("");
  const [company, setCompany] = useState("");
  const [area, setArea] = useState("NA");
  const [wellName, setWellName] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [sampleType, setSampleType] = useState("spot");
  const [flowRate, setFlowRate] = useState("");
  const [pressure, setPressure] = useState("");
  const [pressureUnit, setPressureUnit] = useState("PSIG");
  const [temperature, setTemperature] = useState("");
  const [fieldH2S, setFieldH2S] = useState("");
  const [costCode, setCostCode] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [sampleDate, setSampleDate] = useState("");
  const [ambTemp, setAmbTemp] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [sampledBy, setSampledBy] = useState("");
  const [cylinderNumber, setCylinderNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [scannedTagImage, setScannedTagImage] = useState("");
  const [uploadedTagImagePath, setUploadedTagImagePath] = useState("");
  const [uploadedTagImageFilename, setUploadedTagImageFilename] = useState("");
  const [sampledByNatty, setSampledByNatty] = useState(false);

  // Data - Load from Company Master and Contacts services
  const [checkedInCylinders, setCheckedInCylinders] = useState<
    CheckedInSample[]
  >([]);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [lastWorkOrderCylinders, setLastWorkOrderCylinders] = useState<
    CheckedInSample[]
  >([]);
  const [selectedTagImage, setSelectedTagImage] = useState<string | null>(null);
  const [selectedTagImageFilename, setSelectedTagImageFilename] = useState<
    string | null
  >(null);
  const [ocrStage, setOcrStage] = useState<OcrProgressStage | null>(null);
  const [ocrComplete, setOcrComplete] = useState(false);
  const [tagPreviewUrl, setTagPreviewUrl] = useState<string | null>(null);
  const tagPreviewUrlRef = useRef<string | null>(null);
  const ocrAbortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [companies, setCompanies] = useState<Company[]>(
    companyMasterService.getActiveCompanies(),
  );
  const [contacts, setContacts] = useState<Contact[]>(
    contactsService.getActiveContacts(),
  );
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>(
    companyAreaService.getActiveCompanyAreas(),
  );

  // Load dropdown data on first render
  useEffect(() => {
    return () => {
      if (tagPreviewUrlRef.current) {
        URL.revokeObjectURL(tagPreviewUrlRef.current);
      }
      ocrAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDropdownData = async () => {
      try {
        const [companiesData, contactsData, areasData, _cylinders] =
          await Promise.all([
            companyMasterService.fetchCompanies(),
            contactsService.fetchContacts(),
            companyAreaService.fetchCompanyAreas(),
            cylinderMasterService.fetchCylinders(),
          ]);
        void _cylinders;

        await analysisPricingService.fetchAnalysisPrices();

        let nextSequence = analysisCounter;
        try {
          nextSequence = await sampleCheckInService.getNextAnalysisSequence();
        } catch (sequenceError) {
          void sequenceError;
        }

        if (!isMounted) return;

        const activeCompanies = companiesData.filter(
          (company) => company.active,
        );
        const activeContacts = contactsData.filter((contact) => contact.active);
        const activeAreas = areasData.filter((area) => area.active);

        setCompanies(activeCompanies);
        setContacts(activeContacts);
        setCompanyAreas(activeAreas);

        const activeAnalysisTypes =
          analysisPricingService.getActiveAnalysisPrices();
        if (activeAnalysisTypes.length > 0) {
          const defaultAnalysisType =
            activeAnalysisTypes.find(
              (analysis) =>
                analysis.analysis_code.trim().toLowerCase() === "gpa 2261",
            )?.analysis_code ?? activeAnalysisTypes[0].analysis_code;
          if (
            !analysisType ||
            !activeAnalysisTypes.some((a) => a.analysis_code === analysisType)
          ) {
            setAnalysisType(defaultAnalysisType);
          }
        }

        setAnalysisCounter(nextSequence);
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };

    loadDropdownData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      setMonthlyCustomerCylinders(0);
      return;
    }

    let isMounted = true;

    const loadMonthlyCount = async () => {
      try {
        const count =
          await sampleCheckInService.getMonthlyCheckInCountForCompany(
            selectedCompanyId,
          );
        if (isMounted) {
          setMonthlyCustomerCylinders(count);
        }
      } catch {
        if (isMounted) {
          setMonthlyCustomerCylinders(0);
        }
      }
    };

    loadMonthlyCount();

    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId, workOrderNumber]);

  const ensureNextAnalysisSequence = async (): Promise<number> => {
    try {
      const nextSequence = await sampleCheckInService.getNextAnalysisSequence();
      const resolved = Math.max(analysisCounter, nextSequence);
      if (resolved !== analysisCounter) {
        setAnalysisCounter(resolved);
      }
      return resolved;
    } catch (error) {
      return analysisCounter;
    }
  };

  const applyCompanyBillingRefs = (company: Company) => {
    const billingRef = company.billing_reference_type?.trim() || "NA";
    setInvoiceRefName(billingRef);
    setInvoiceRefValue(company.billing_reference_number?.trim() || "");
  };

  const handleCustomerSelect = (code: string) => {
    const company = companies.find((c) => c.company_code === code);
    if (company) {
      setCustomerCode(code);
      setCustomerName(company.company_name);
      setCurrentCustomer(company.company_name);
      setSelectedContact(""); // Reset contact when customer changes
      setSelectedCompanyId(company.id);
      setArea("NA");
      setCostCode("");
      setAuthorizedBy("");
      applyCompanyBillingRefs(company);
    }
  };

  const getCustomerContacts = () => {
    if (!selectedCompanyId) return [];
    return contactsService.getActiveContactsByCompanyId(selectedCompanyId);
  };

  const handleContactSelect = (contactIdString: string) => {
    setSelectedContact(contactIdString);
    const contactId = parseInt(contactIdString);
    setSelectedContactId(contactId);

    // Auto-select Area based on the contact's company_area_id, if available
    const contact = contacts.find((c) => c.id === contactId);
    if (contact && contact.company_area_id != null) {
      const linkedArea = companyAreas.find(
        (areaItem) =>
          areaItem.id === contact.company_area_id && areaItem.active,
      );
      if (linkedArea) {
        setArea(linkedArea.area);
        setCostCode(linkedArea.cost_code);
        setAuthorizedBy(linkedArea.authorized_by);
      }
    }
  };

  const handleAreaSelect = (areaName: string) => {
    setArea(areaName);

    const selectedArea = companyAreas.find(
      (areaItem) =>
        areaItem.area === areaName &&
        areaItem.company_id === selectedCompanyId &&
        areaItem.active,
    );
    setCostCode(selectedArea?.cost_code ?? "");
    setAuthorizedBy(selectedArea?.authorized_by ?? "");
  };

  const handleAddCompanyConfirm = () => {
    if (
      !companyFormData.company_code ||
      !companyFormData.company_name ||
      !companyFormData.email
    ) {
      toast.error(
        "Please fill in all required fields (Company Code, Company Name, Email)",
      );
      return;
    }

    const newCompany: Company = {
      id: 0,
      company_code: companyFormData.company_code.toUpperCase(),
      company_name: companyFormData.company_name,
      phone: companyFormData.phone,
      email: companyFormData.email,
      billing_reference_type: companyFormData.billing_reference_type,
      billing_reference_number: companyFormData.billing_reference_number,
      billing_address: companyFormData.billing_address,
      charge_h2_pop_fee: companyFormData.charge_h2_pop_fee,
      h2_pop_fee_rate:
        companyFormData.h2_pop_fee_rate === ""
          ? 0
          : companyFormData.h2_pop_fee_rate,
      pressure_base:
        companyFormData.pressure_base === ""
          ? 0
          : companyFormData.pressure_base,
      pressure_base_factor:
        companyFormData.pressure_base_factor === ""
          ? 0
          : companyFormData.pressure_base_factor,
      active: companyFormData.active,
      created_by: 1, // TODO: Replace with actual logged-in user ID
    };

    const createCompany = async () => {
      try {
        const addedCompany = await companyMasterService.addCompany(newCompany);
        setCompanies([...companies, addedCompany]);
        setCustomerCode(companyFormData.company_code.toUpperCase());
        setCustomerName(companyFormData.company_name);
        setCurrentCustomer(companyFormData.company_name);
        setSelectedCompanyId(addedCompany.id);
        applyCompanyBillingRefs(addedCompany);

        // Reset form data
        setCompanyFormData({
          id: 0,
          company_code: "",
          company_name: "",
          phone: "",
          email: "",
          billing_reference_type: "NA",
          billing_reference_number: "",
          billing_address: "",
          charge_h2_pop_fee: false,
          h2_pop_fee_rate: 0,
          pressure_base: "",
          pressure_base_factor: "",
          active: true,
        });

        setIsAddCompanyDialogOpen(false);
        toast.success(
          `Company ${companyFormData.company_name} added successfully`,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add company";
        toast.error(message);
      }
    };

    void createCompany();

    return;
  };

  const handleAddContactConfirm = () => {
    if (
      !contactFormData.company_id ||
      !contactFormData.name ||
      !contactFormData.phone ||
      !contactFormData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newContact: Contact = {
      id: 0,
      company_id: contactFormData.company_id,
      name: contactFormData.name,
      phone: contactFormData.phone,
      email: contactFormData.email,
      active: contactFormData.active,
      created_by: 1, // TODO: Replace with actual logged-in user ID
    };

    const createContact = async () => {
      try {
        const addedContact = await contactsService.addContact(newContact);

        // Refresh contacts list from service to ensure dropdown updates
        setContacts(contactsService.getActiveContacts());

        // Auto-select the newly added contact
        setSelectedContact(addedContact.id.toString());
        setSelectedContactId(addedContact.id);

        // Reset form data
        setContactFormData({
          id: 0,
          company_id: 0,
          company_area_id: null,
          name: "",
          phone: "",
          email: "",
          active: true,
        });

        setIsAddContactDialogOpen(false);
        toast.success(`Contact ${contactFormData.name} added successfully`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add contact";
        toast.error(message);
      }
    };

    void createContact();
  };

  const revokeTagPreview = () => {
    if (tagPreviewUrlRef.current) {
      URL.revokeObjectURL(tagPreviewUrlRef.current);
      tagPreviewUrlRef.current = null;
    }
    setTagPreviewUrl(null);
  };

  const setTagPreviewFromFile = (file: File) => {
    revokeTagPreview();
    if (!file.type.startsWith("image/")) {
      return;
    }
    const url = URL.createObjectURL(file);
    tagPreviewUrlRef.current = url;
    setTagPreviewUrl(url);
  };

  const applyOcrDataToForm = (ocrData: Partial<CheckedInSample>) => {
    const { sampleDate: resolvedSampleDate, sampleTime: resolvedSampleTime } =
      resolveOcrSampleDateAndTime(ocrData.sample_date, ocrData.sample_time);

    setDate(resolvedSampleDate || ocrData.date || getCurrentDateUS());
    setProducer(ocrData.producer || "");
    setWellName(ocrData.well_name || "");
    setMeterNumber(ocrData.meter_number || "");
    setSampleType(ocrData.sample_type || "spot");
    setFlowRate(ocrData.flow_rate || "");
    setPressure(ocrData.pressure || "");
    setPressureUnit(
      ocrData.pressure_unit?.toUpperCase() === "PSIA" ? "PSIA" : "PSIG",
    );
    setTemperature(ocrData.temperature || "");
    setFieldH2S(ocrData.field_h2s != null ? String(ocrData.field_h2s) : "");
    setCylinderNumber(ocrData.cylinder_number || "");
    setRemarks(ocrData.remarks || "");
    setCostCode(ocrData.cost_code || "");
    setSampleDate(
      toIsoDateInputValue(resolvedSampleDate || ocrData.date || ""),
    );
    setAmbTemp(ocrData.amb_temp || "");
    setSampleTime(resolvedSampleTime);
    setSampledBy(ocrData.sampled_by || "");
  };

  const handleCancelOcr = () => {
    ocrAbortRef.current?.abort();
    ocrAbortRef.current = null;
    setOcrStage(null);
    setOcrComplete(false);
    toast.message("OCR cancelled");
  };

  const resetTagUploadState = () => {
    revokeTagPreview();
    setOcrComplete(false);
    setScannedTagImage("");
    setUploadedTagImagePath("");
    setUploadedTagImageFilename("");
  };

  const ensureReadyForTagUpload = (): boolean => {
    if (!customerCode) {
      toast.error("Please select a company before uploading");
      return false;
    }

    if (!selectedContactId) {
      toast.error("Please select a contact before uploading");
      return false;
    }

    return true;
  };

  const handleUploadedImage = async (file: File) => {
    if (!ensureReadyForTagUpload()) {
      return;
    }

    ocrAbortRef.current?.abort();
    setOcrComplete(false);
    setTagPreviewFromFile(file);

    setOcrStage("optimizing");
    try {
      const validation = await validateImageFileForOCRQuick(file);
      if (!validation.valid) {
        validation.errors.forEach((error) => toast.error(error));
        validation.warnings.forEach((warning) => toast.warning(warning));
        revokeTagPreview();
        return;
      }

      validation.warnings.forEach((warning) => toast.warning(warning));

      const uploadFile = await compressImageForOCR(file);
      if (uploadFile !== file) {
        setTagPreviewFromFile(uploadFile);
      }

      setOcrStage("reading");
      const controller = new AbortController();
      ocrAbortRef.current = controller;

      const { path, filename, ocrData } =
        await sampleCheckInService.uploadTagImage(uploadFile, {
          signal: controller.signal,
        });

      setUploadedTagImagePath(path);
      setUploadedTagImageFilename(filename);
      setScannedTagImage(path);
      setSelectedTagImage(path);

      setOcrStage("updating");
      applyOcrDataToForm(ocrData);
      await waitForOcrStepVisibility();
      setOcrComplete(true);

      toast.success("Sample tag read — form fields updated.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setOcrComplete(false);
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      ocrAbortRef.current = null;
      setOcrStage(null);
    }
  };

  const handleImageInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    await handleUploadedImage(file);

    // Reset input to allow re-uploading same file if needed
    e.target.value = "";
  };

  const triggerImageUpload = () => {
    if (!ensureReadyForTagUpload()) {
      return;
    }

    fileInputRef.current?.click();
  };

  const triggerCameraCapture = () => {
    if (!ensureReadyForTagUpload()) {
      return;
    }

    setIsCameraDialogOpen(true);
  };

  const handleCameraCapture = async (file: File) => {
    await handleUploadedImage(file);
  };

  const renderTagCaptureButtons = (replaceLabel = false) => (
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={triggerCameraCapture}
        className="h-10 flex-1 bg-blue-600 text-white hover:bg-blue-700"
      >
        <Camera className="mr-2 h-4 w-4" />
        {replaceLabel ? "Retake Photo" : "Take Photo"}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={triggerImageUpload}
        className="h-10 flex-1"
      >
        <Upload className="mr-2 h-4 w-4" />
        {replaceLabel ? "Replace Image" : "Upload Image"}
      </Button>
    </div>
  );

  const handleAddCylinder = async () => {
    if (!cylinderNumber) {
      toast.error("Please enter or scan a cylinder number first");
      return;
    }

    if (!customerCode) {
      toast.error("Please select a company first");
      return;
    }

    // Normalize cylinder number to uppercase
    const normalizedCylinderNumber = cylinderNumber.trim().toUpperCase();

    // Check for duplicate cylinder number in the check-in list (case-insensitive)
    const isDuplicate = checkedInCylinders.some(
      (cylinder) =>
        cylinder.cylinder_number.toUpperCase() === normalizedCylinderNumber,
    );

    if (isDuplicate) {
      toast.error(
        `Cylinder Number "${normalizedCylinderNumber}" has already been added to the check-in list. Please use a different cylinder.`,
        { duration: 5000 },
      );
      return;
    }

    // Validate cylinder number against Cylinder Master if NOT customer-owned
    const matchedCylinder = cylinderMasterService.getCylinderByCylinderNumber(
      normalizedCylinderNumber,
    );

    if (!customerCylinder) {
      const cylinder = matchedCylinder;

      if (!cylinder) {
        toast.error(
          `Cylinder Number "${normalizedCylinderNumber}" not found in Cylinder Master. Please add it first or check "This is a customer-owned cylinder" if applicable.`,
          { duration: 5000 },
        );
        return;
      }

      if (!cylinder.active) {
        toast.error(
          `Cylinder Number "${normalizedCylinderNumber}" is inactive in Cylinder Master.`,
          { duration: 5000 },
        );
        return;
      }

      if (cylinder.id) {
        try {
          const checkoutRecord =
            await cylinderCheckOutService.getActiveCheckOutRecord(
              cylinder.id,
              true,
            );
          if (!checkoutRecord) {
            toast.error(
              "Invalid Check-In: The cylinder is currently not in “Checked-Out” status. Please check out the cylinder before attempting to check it in.",
              { duration: 5000 },
            );
            return;
          }

          if (
            selectedCompanyId &&
            checkoutRecord.company_id !== selectedCompanyId
          ) {
            const expectedCompany = companies.find(
              (company) => company.id === checkoutRecord.company_id,
            )?.company_name;
            const selectedCompany = companies.find(
              (company) => company.id === selectedCompanyId,
            )?.company_name;
            toast.error(
              `Invalid Check-In: Cylinder is checked out to ${expectedCompany ?? "another company"}. Please select ${expectedCompany ?? "the correct company"} before checking it in.`,
              { duration: 5000 },
            );
            return;
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to validate cylinder checkout status";
          toast.error(message);
          return;
        }
      }
    }

    // Generate unique analysis number
    const generatedAnalysisNumber =
      sampleCheckInService.generateAnalysisNumber(analysisCounter);

    const analysisTypeId =
      analysisPricingService.getAnalysisPriceByCode(analysisType)?.id;
    const areaId = companyAreaService.getAreaByName(area)?.id;
    const normalizedSampleType = sampleType === "spot" ? "Spot" : "Composite";

    // Prepare cylinder data (without id, created_by - service will add them)
    const cylinderData: Partial<CheckedInCylinder> = {
      company_id: selectedCompanyId ?? 0,
      company_contact_id: selectedContactId ?? undefined,
      analysis_type_id: analysisTypeId,
      area_id: areaId,
      customer_cylinder: customerCylinder,
      sampled_by_lab: sampledByNatty,
      cylinder_id: matchedCylinder?.id ?? null,
      analysis_number: generatedAnalysisNumber,
      analysis_type: analysisType,
      area,
      customer_owned_cylinder: customerCylinder,
      cylinder_number: normalizedCylinderNumber,
      date: date || getCurrentDateUS(),
      producer,
      sampled_by_natty: sampledByNatty,
      well_name: wellName,
      meter_number: meterNumber,
      sample_type: normalizedSampleType,
      flow_rate: flowRate,
      pressure,
      pressure_unit: pressureUnit,
      temperature,
      field_h2s: fieldH2S.trim() ? parseFloat(fieldH2S) : 0,
      cost_code: costCode,
      authorized_by: authorizedBy,
      sample_date: sampleDate,
      amb_temp: ambTemp,
      sample_time: sampleTime,
      sampled_by: sampledBy,
      remarks,
      check_in_type: checkInType,
      checkin_type: checkInType,
      check_in_time: new Date().toLocaleString("en-US"),
      rushed: rushed,
      tag_image: uploadedTagImageFilename || "",
      scanned_tag_image: uploadedTagImagePath || null,
      billing_reference_type: invoiceRefName,
      billing_reference_number: invoiceRefValue,
      invoice_ref_name: invoiceRefName,
      invoice_ref_value: invoiceRefValue,
      work_order_number: "",
      status: "Pending",
    };

    // ✅ SAVE cylinder individually to sampleCheckInService
    const savedCylinder = sampleCheckInService.saveCheckIn(
      selectedCompanyId!,
      selectedContactId!,
      cylinderData,
      1, // TODO: Replace with actual logged-in user ID
    );

    // Add to component state for display in the table
    setCheckedInCylinders([...checkedInCylinders, savedCylinder]);

    // Increment the analysis counter for next cylinder
    setAnalysisCounter(analysisCounter + 1);

    // Clear all fields except customer/contact
    clearForm();
  };

  const clearForm = () => {
    setAnalysisType(getDefaultAnalysisType());
    setCustomerCylinder(false);
    setRushed(false);
    const selectedCompany = selectedCompanyId
      ? companies.find((c) => c.id === selectedCompanyId)
      : undefined;
    if (selectedCompany) {
      applyCompanyBillingRefs(selectedCompany);
    } else {
      setInvoiceRefName("NA");
      setInvoiceRefValue("");
    }
    setDate("");
    setProducer("");
    setCompany("");
    setArea("NA");
    setWellName("");
    setMeterNumber("");
    setSampleType("spot");
    setFlowRate("");
    setPressure("");
    setTemperature("");
    setFieldH2S("");
    setCostCode("");
    setAuthorizedBy("");
    setSampleDate("");
    setAmbTemp("");
    setSampleTime("");
    setSampledBy("");
    setCylinderNumber("");
    setRemarks("");
    resetTagUploadState();
  };

  const handleViewUploadedTag = () => {
    const imageUrl = uploadedTagImagePath || scannedTagImage;
    if (!imageUrl) return;
    handleViewTagImage(imageUrl, uploadedTagImageFilename || undefined);
  };

  const handleViewTagImage = (imageUrl: string, filename?: string) => {
    setSelectedTagImage(imageUrl);
    setSelectedTagImageFilename(filename || null);
    setIsImageDialogOpen(true);
  };

  const handleRemoveCylinder = (index: number) => {
    const cylinderToRemove = checkedInCylinders[index];

    // Remove from service storage
    if (cylinderToRemove?.id) {
      sampleCheckInService.deleteCheckedInSample(cylinderToRemove.id);
    }

    // Remove from component state
    setCheckedInCylinders(checkedInCylinders.filter((_, i) => i !== index));
    toast.success("Cylinder removed from list");
  };

  const handleGenerateWorkOrder = async () => {
    if (checkedInCylinders.length === 0) {
      toast.error("No cylinders to generate sales order for");
      return;
    }

    if (!selectedCompanyId || !selectedContactId) {
      toast.error("Please select both company and contact");
      return;
    }

    // Create work order with header and lines
    try {
      let sequence = analysisCounter;
      const samplesForWorkOrder = checkedInCylinders.map((sample) => {
        if (sample.analysis_number?.trim()) {
          return sample;
        }
        const generated = sampleCheckInService.generateAnalysisNumber(sequence);
        sequence += 1;
        return {
          ...sample,
          analysis_number: generated,
        };
      });

      if (sequence !== analysisCounter) {
        setAnalysisCounter(sequence);
        setCheckedInCylinders(samplesForWorkOrder);
      }

      const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
      const parsedH2Pop = Number(selectedCompany?.h2_pop_fee_rate);
      const h2PopFee =
        selectedCompany?.charge_h2_pop_fee && Number.isFinite(parsedH2Pop)
          ? parsedH2Pop
          : 0;
      const parsedPressureBase = Number(selectedCompany?.pressure_base_factor);
      const pressureBaseFactor = Number.isFinite(parsedPressureBase)
        ? parsedPressureBase
        : 0;

      const payloads = samplesForWorkOrder.map((sample) => ({
        ...sampleCheckInService.serializeCheckInForPost(sample),
        status: "Pending",
        h2_pop_fee: h2PopFee,
        pressure_base_factor: pressureBaseFactor,
      }));

      const createdCheckIns =
        await sampleCheckInService.postSampleCheckIns(payloads);

      const generatedWorkOrderNumber =
        createdCheckIns[0]?.work_order_number?.trim() || "";

      if (!generatedWorkOrderNumber) {
        throw new Error("API did not return a work order number");
      }

      setWorkOrderNumber(generatedWorkOrderNumber);

      const cylinderIdsToReturn = samplesForWorkOrder
        .filter(
          (sample) =>
            !(
              sample.customer_cylinder ??
              sample.customer_owned_cylinder ??
              false
            ) && typeof sample.cylinder_id === "number",
        )
        .map((sample) => sample.cylinder_id as number);

      if (cylinderIdsToReturn.length > 0) {
        try {
          await cylinderCheckOutService.markCylindersReturned(
            cylinderIdsToReturn,
          );
          await cylinderMasterService.fetchCylinders(true);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update cylinder checkout status";
          toast.error(message);
        }
      }

      setLastWorkOrderCylinders(
        samplesForWorkOrder.map((sample, index) => ({
          ...sample,
          work_order_number:
            createdCheckIns[index]?.work_order_number ??
            generatedWorkOrderNumber,
          invoice_ref_name: "WO",
          invoice_ref_value: generatedWorkOrderNumber,
        })),
      );
      toast.success("Work order generated and sample check-ins submitted");
      setCheckedInCylinders([]);
      clearForm();
    } catch (error) {
      let message = "Failed to generate work order or submit check-ins";
      if (error instanceof Error && error.message.trim()) {
        message = error.message;
      } else if (error && typeof error === "object") {
        const body = error as { error?: unknown; message?: unknown };
        if (typeof body.error === "string" && body.error.trim()) {
          message = body.error;
        } else if (typeof body.message === "string" && body.message.trim()) {
          message = body.message;
        }
      }
      toast.error(message);
    }
  };

  const handleClearAll = () => {
    setCheckedInCylinders([]);
    setWorkOrderNumber("");
    clearForm();
  };

  // Calculate total including current check-in
  const totalMonthlyCount =
    monthlyCustomerCylinders + checkedInCylinders.length;

  // Note: Pricing is now calculated when creating Work Orders, not at check-in
  // Volume discounts (5% at 50+ analyses) and rushed pricing (1.5x) are handled by analysisPricingService
  const discountPercentage = 0; // Display only, actual pricing happens in Work Orders
  const subtotal = 0;
  const discountAmount = 0;
  const totalAmount = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-bold">Sample Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <CompanyContactSelector
                customerCode={customerCode}
                selectedContact={selectedContact}
                customers={companies}
                contacts={getCustomerContacts()}
                onCustomerChange={handleCustomerSelect}
                onContactChange={handleContactSelect}
                onAddCompany={() => setIsAddCompanyDialogOpen(true)}
                onAddContact={() => setIsAddContactDialogOpen(true)}
              />

              <AnalysisOptionsForm
                analysisType={analysisType}
                area={area}
                customerCylinder={customerCylinder}
                rushed={rushed}
                sampledByNatty={sampledByNatty}
                companyAreas={companyAreas}
                customerName={customerName}
                selectedCompanyId={selectedCompanyId}
                onAnalysisTypeChange={setAnalysisType}
                onAreaChange={handleAreaSelect}
                onCustomerCylinderChange={setCustomerCylinder}
                onRushedChange={setRushed}
                onSampledByNattyChange={setSampledByNatty}
              />

              <Separator />

              <div className="w-full space-y-3">
                {tagPreviewUrl && (
                  <div
                    className={`relative overflow-hidden rounded-md border bg-muted/30 ${
                      ocrComplete ? "border-2 border-green-500" : ""
                    }`}
                  >
                    {ocrComplete && (
                      <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-600">
                        Uploaded
                      </Badge>
                    )}
                    <img
                      src={tagPreviewUrl}
                      alt="Selected sample tag preview"
                      className="max-h-40 w-full object-contain bg-white"
                    />
                  </div>
                )}

                {ocrStage ? (
                  <div className="space-y-2">
                    <OcrProgressStepper stage={ocrStage} />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleCancelOcr}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel OCR
                    </Button>
                  </div>
                ) : ocrComplete ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">
                          Sample tag read successfully
                        </p>
                        <p className="text-xs text-green-700">
                          Review populated fields and edit if needed.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleViewUploadedTag}
                      >
                        View tag
                      </Button>
                      {renderTagCaptureButtons(true)}
                    </div>
                  </div>
                ) : (
                  renderTagCaptureButtons()
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageInputChange}
                />
              </div>
              {/* {uploadedTagImagePath && (
                <div className="text-sm text-gray-500">
                  Uploaded image path: <code>{uploadedTagImagePath}</code>
                </div>
              )}

              <Separator /> */}
            </div>

            {/* Sample Tag Details Form - Always visible */}
            <SampleDetailsForm
              cylinderNumber={cylinderNumber}
              producer={producer}
              wellName={wellName}
              meterNumber={meterNumber}
              sampleType={sampleType}
              flowRate={flowRate}
              pressure={pressure}
              pressureUnit={pressureUnit}
              temperature={temperature}
              fieldH2S={fieldH2S}
              costCode={costCode}
              authorizedBy={authorizedBy}
              sampleDate={sampleDate}
              ambTemp={ambTemp}
              sampleTime={sampleTime}
              sampledBy={sampledBy}
              checkInType={checkInType}
              billingReferenceType={invoiceRefName}
              billingReferenceNumber={invoiceRefValue}
              remarks={remarks}
              onCylinderNumberChange={setCylinderNumber}
              onProducerChange={setProducer}
              onWellNameChange={setWellName}
              onMeterNumberChange={setMeterNumber}
              onSampleTypeChange={setSampleType}
              onFlowRateChange={setFlowRate}
              onPressureChange={setPressure}
              onPressureUnitChange={setPressureUnit}
              onTemperatureChange={setTemperature}
              onFieldH2SChange={setFieldH2S}
              onCostCodeChange={setCostCode}
              onSampleDateChange={setSampleDate}
              onAmbTempChange={setAmbTemp}
              onSampleTimeChange={setSampleTime}
              onSampledByChange={setSampledBy}
              onCheckInTypeChange={setCheckInType}
              onBillingReferenceTypeChange={setInvoiceRefName}
              onBillingReferenceNumberChange={setInvoiceRefValue}
              onRemarksChange={setRemarks}
            />

            <div className="flex gap-2">
              <Button onClick={handleAddCylinder}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Check-In List
              </Button>
              <Button variant="outline" onClick={clearForm}>
                Clear Form
              </Button>
            </div>

            <Separator />

            <CheckedInCylindersTable
              cylinders={checkedInCylinders}
              onRemove={handleRemoveCylinder}
              onViewImage={handleViewTagImage}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateWorkOrder}
                disabled={!!workOrderNumber || checkedInCylinders.length === 0}
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Generate Work Order
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <WorkOrderSummary
          workOrderNumber={workOrderNumber}
          currentCustomer={currentCustomer}
          totalMonthlyCount={totalMonthlyCount}
          monthlyCustomerCylinders={monthlyCustomerCylinders}
          currentCylindersCount={checkedInCylinders.length}
          onViewWorkOrder={() => setIsWorkOrderDialogOpen(true)}
        />
      </div>

      {/* Tag Image Viewer Dialog */}
      <TagImageDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        imageUrl={selectedTagImage}
        filename={selectedTagImageFilename}
      />

      <TagCameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCameraCapture}
      />

      {/* Add Company Dialog */}
      <AddCompanyMasterDialog
        open={isAddCompanyDialogOpen}
        onOpenChange={setIsAddCompanyDialogOpen}
        formData={companyFormData}
        onFormChange={setCompanyFormData}
        onConfirm={handleAddCompanyConfirm}
      />

      {/* Add Contact Dialog */}
      <AddContactDialog
        open={isAddContactDialogOpen}
        onOpenChange={setIsAddContactDialogOpen}
        formData={contactFormData}
        onFormChange={setContactFormData}
        onConfirm={handleAddContactConfirm}
      />

      {/* Work Order Report Dialog */}
      <WorkOrderReportDialog
        open={isWorkOrderDialogOpen}
        onOpenChange={setIsWorkOrderDialogOpen}
        workOrderNumber={workOrderNumber}
        customerName={customerName}
        customerCode={customerCode}
        cylinders={lastWorkOrderCylinders}
        subtotal={subtotal}
        discountPercentage={discountPercentage}
        discountAmount={discountAmount}
        totalAmount={totalAmount}
        contactName={
          contacts.find((c) => c.id.toString() === selectedContact)?.name
        }
        contactEmail={
          contacts.find((c) => c.id.toString() === selectedContact)?.email
        }
        contactPhone={
          contacts.find((c) => c.id.toString() === selectedContact)?.phone
        }
      />
    </div>
  );
}
