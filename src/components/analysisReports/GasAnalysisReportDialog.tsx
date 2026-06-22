import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Download, Loader2 } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import nattyGasLogo from "figma:asset/509bd1171d6cdbf113bf0bb7c8be00f47c2fdad0.png";
import { isoToUSDate, formatDateTimeUS } from "../../utils/dateUtils";
import {
  GasAnalysisReport,
  GasAnalysisConditionValues,
} from "../../services/analysisReportsService";

interface GasAnalysisReportDialogProps {
  open: boolean;
  report: GasAnalysisReport | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLACEHOLDER = "—";

function displayValue(value?: string | number | null): string {
  if (value == null || value === "") return PLACEHOLDER;
  return String(value);
}

function formatAnalyzedOn(value?: string): string {
  if (!value) return PLACEHOLDER;
  const formatted = formatDateTimeUS(value);
  return formatted || value;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="gar-info-field">
      <span className="gar-info-label">{label}</span>
      <span className="gar-info-value">{value}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="invoice-detail-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}

function ConditionTableRow({
  label,
  values,
}: {
  label: string;
  values: GasAnalysisConditionValues;
}) {
  return (
    <tr>
      <td>{label}</td>
      <td className="text-right">{displayValue(values.dry_ideal)}</td>
      <td className="text-right">{displayValue(values.dry_real)}</td>
      <td className="text-right">{displayValue(values.wet_ideal)}</td>
      <td className="text-right">{displayValue(values.wet_real)}</td>
    </tr>
  );
}

const S = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 55,
    paddingHorizontal: 45,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  logo: { width: 110, height: 34, objectFit: "contain" },
  companyAddress: {
    textAlign: "right",
    fontSize: 7.5,
    color: "#444444",
    lineHeight: 1.6,
  },
  companyNameText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#1a1a1a",
    marginBottom: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 2,
    borderTopColor: "#1a1a1a",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 14,
  },
  reportTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    letterSpacing: 0.5,
    color: "#1a1a1a",
  },
  reportNumberText: {
    fontFamily: "Courier",
    fontSize: 9.5,
    color: "#555555",
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#888888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  leftSection: { flex: 1 },
  rightSection: { alignItems: "flex-end" },
  label: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#888888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  detailText: { fontSize: 8, color: "#555555", lineHeight: 1.45 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 3,
    gap: 8,
  },
  detailLabel: {
    fontSize: 6.5,
    color: "#888888",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    minWidth: 75,
    textAlign: "right",
  },
  detailValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    minWidth: 95,
    textAlign: "right",
  },
  sampleGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 20,
  },
  sampleColumn: { flex: 1 },
  sampleField: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 6,
  },
  sampleFieldLabel: { fontSize: 7.5, color: "#555555", minWidth: 95 },
  sampleFieldValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#1a1a1a",
    flex: 1,
  },
  conditionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  conditionItem: { fontSize: 7.5, color: "#1a1a1a" },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#ffffff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableCell: { fontSize: 7.5, color: "#1a1a1a" },
  tableCellRight: { fontSize: 7.5, color: "#1a1a1a", textAlign: "right" },
  colComponent: { width: "40%" },
  colMole: { width: "20%" },
  colWt: { width: "20%" },
  colGpm: { width: "20%" },
  colLabel: { width: "36%" },
  colDryIdeal: { width: "16%" },
  colDryReal: { width: "16%" },
  colWetIdeal: { width: "16%" },
  colWetReal: { width: "16%" },
  footerNote: {
    fontSize: 7,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 45,
    right: 45,
    borderTopWidth: 0.5,
    borderTopColor: "#dddddd",
    paddingTop: 5,
    alignItems: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: "#999999",
    textAlign: "center",
    lineHeight: 1.5,
  },
});

function GasAnalysisReportPDFDocument({
  report,
}: {
  report: GasAnalysisReport;
}) {
  const renderConditionRow = (
    label: string,
    values: GasAnalysisConditionValues,
  ) => (
    <View style={S.tableRow} wrap={false}>
      <Text style={[S.tableCell, S.colLabel]}>{label}</Text>
      <Text style={[S.tableCellRight, S.colDryIdeal]}>
        {displayValue(values.dry_ideal)}
      </Text>
      <Text style={[S.tableCellRight, S.colDryReal]}>
        {displayValue(values.dry_real)}
      </Text>
      <Text style={[S.tableCellRight, S.colWetIdeal]}>
        {displayValue(values.wet_ideal)}
      </Text>
      <Text style={[S.tableCellRight, S.colWetReal]}>
        {displayValue(values.wet_real)}
      </Text>
    </View>
  );

  return (
    <Document
      title={`Gas Analysis Report ${report.analysis_number}`}
      author="Natty Gas Lab"
      subject="Gas Analysis Report"
    >
      <Page size="A4" style={S.page} wrap>
        <View style={S.header} fixed>
          <Image src={nattyGasLogo} style={S.logo} />
          <View style={S.companyAddress}>
            <Text style={S.companyNameText}>Natty Gas Lab</Text>
            <Text>10700 FM 307</Text>
            <Text>Midland, TX 79706</Text>
            <Text>Phone: 432-686-2719</Text>
            <Text>www.nattygaslab.com</Text>
          </View>
        </View>

        <View style={S.titleRow}>
          <Text style={S.reportTitle}>GAS ANALYSIS REPORT</Text>
          <Text style={S.reportNumberText}>{report.analysis_number}</Text>
        </View>

        <View style={S.metaGrid}>
          <View style={S.leftSection}>
            <Text style={S.label}>Customer Information</Text>
            <Text style={S.companyName}>{report.customer}</Text>
            {report.customer_contact_person ? (
              <Text style={S.detailText}>{report.customer_contact_person}</Text>
            ) : null}
            {report.customer_email ? (
              <Text style={S.detailText}>{report.customer_email}</Text>
            ) : null}
            {report.customer_phone ? (
              <Text style={S.detailText}>{report.customer_phone}</Text>
            ) : null}
          </View>
          <View style={S.rightSection}>
            {[
              ["Method", report.method],
              ["Analysis#", report.analysis_number],
              ["Cylinder#", report.cylinder_number],
              ["Analyzed On", formatAnalyzedOn(report.analyzed_on)],
              ["Analyzed By", report.analyzed_by],
            ].map(([label, value]) => (
              <View style={S.detailRow} key={label}>
                <Text style={S.detailLabel}>{label}</Text>
                <Text style={S.detailValue}>{displayValue(value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={S.sectionLabel}>Sample Information</Text>
        <View style={S.sampleGrid}>
          <View style={S.sampleColumn}>
            {[
              ["Producer", report.producer],
              ["Well/Lease", report.well_lease],
              ["Meter#", report.meter_number],
              ["Sample Type", report.sample_type],
              ["Remarks", report.remarks],
            ].map(([label, value]) => (
              <View style={S.sampleField} key={label}>
                <Text style={S.sampleFieldLabel}>{label}:</Text>
                <Text style={S.sampleFieldValue}>{displayValue(value)}</Text>
              </View>
            ))}
          </View>
          <View style={S.sampleColumn}>
            {[
              ["Sampled By", report.sampled_by],
              ["Sample Date", report.sample_date ? isoToUSDate(report.sample_date) : ""],
              ["Sample Pressure", report.sample_pressure],
              ["Sample Temperature", report.sample_temperature],
              ["Sample Method", report.sample_method],
              ["Field H2S", report.field_h2s],
              ["Flow Rate", report.flow_rate],
            ].map(([label, value]) => (
              <View style={S.sampleField} key={label}>
                <Text style={S.sampleFieldLabel}>{label}:</Text>
                <Text style={S.sampleFieldValue}>{displayValue(value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.conditionsRow}>
          <Text style={S.conditionItem}>
            Base Condition: {displayValue(report.base_condition)}
          </Text>
          <Text style={S.conditionItem}>
            Physical Constant: {displayValue(report.physical_constant)}
          </Text>
        </View>

        <View>
          <View style={S.tableHeaderRow}>
            <Text style={[S.tableHeaderCell, S.colComponent]}>Component</Text>
            <Text style={[S.tableHeaderCell, S.colMole, { textAlign: "right" }]}>
              Mole%
            </Text>
            <Text style={[S.tableHeaderCell, S.colWt, { textAlign: "right" }]}>
              Wt%
            </Text>
            <Text style={[S.tableHeaderCell, S.colGpm, { textAlign: "right" }]}>
              GPM
            </Text>
          </View>
          {(report.components.length > 0
            ? report.components
            : [{ component: "", mole_pct: "", wt_pct: "", gpm: "" }]
          ).map((row, idx) => (
            <View style={S.tableRow} key={idx} wrap={false}>
              <Text style={[S.tableCell, S.colComponent]}>
                {displayValue(row.component)}
              </Text>
              <Text style={[S.tableCellRight, S.colMole]}>
                {displayValue(row.mole_pct)}
              </Text>
              <Text style={[S.tableCellRight, S.colWt]}>
                {displayValue(row.wt_pct)}
              </Text>
              <Text style={[S.tableCellRight, S.colGpm]}>
                {displayValue(row.gpm)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={S.sectionLabel}>Analysis Results</Text>
        <View>
          <View style={S.tableHeaderRow}>
            <Text style={[S.tableHeaderCell, S.colLabel]} />
            <Text style={[S.tableHeaderCell, S.colDryIdeal, { textAlign: "right" }]}>
              Dry Ideal
            </Text>
            <Text style={[S.tableHeaderCell, S.colDryReal, { textAlign: "right" }]}>
              Dry Real
            </Text>
            <Text style={[S.tableHeaderCell, S.colWetIdeal, { textAlign: "right" }]}>
              Wet Ideal
            </Text>
            <Text style={[S.tableHeaderCell, S.colWetReal, { textAlign: "right" }]}>
              Wet Real
            </Text>
          </View>
          {renderConditionRow(
            "Gross Heating Value (BTU/ft3)",
            report.gross_heating_value,
          )}
          {renderConditionRow(
            "Specific Gravity (air=1.000)",
            report.specific_gravity,
          )}
          {renderConditionRow(
            "Compressibility Factor (Z)",
            report.compressibility_factor,
          )}
          {renderConditionRow("GPM", report.gpm_totals)}
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={S.sampleFieldLabel}>GPM (Dry Real)</Text>
          <Text style={S.sampleFieldValue}>
            C2+: {displayValue(report.gpm_c2_plus)}
          </Text>
          <Text style={S.sampleFieldValue}>
            C3+: {displayValue(report.gpm_c3_plus)}
          </Text>
        </View>

        <Text style={S.footerNote}>
          *Field H2S rounded to nearest whole ppm
        </Text>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            Natty Gas Lab · 10700 FM 307, Midland, TX 79706 · 432-686-2719 ·
            www.nattygaslab.com
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export function GasAnalysisReportDialog({
  open,
  report,
  isLoading = false,
  onOpenChange,
}: GasAnalysisReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!report) return;
    try {
      setIsGenerating(true);
      const blob = await pdf(
        <GasAnalysisReportPDFDocument report={report} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Gas-Analysis-Report-${report.analysis_number}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const componentRows =
    report && report.components.length > 0
      ? report.components
      : [{ component: "", mole_pct: "", wt_pct: "", gpm: "" }];

  return (
    <>
      <style>{`
        @media print {
          body > *:not(.gar-print-root) { display: none !important; }
          [role="dialog"], [data-radix-dialog-overlay], .gar-dialog-content {
            all: unset !important; display: block !important; position: static !important;
            overflow: visible !important; max-height: none !important;
            box-shadow: none !important; border: none !important; background: white !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
          .invoice-a4-sheet {
            width: 100% !important; max-width: 100% !important;
            margin: 0 !important; padding: 0 !important;
            box-shadow: none !important; border: none !important;
          }
        }

        .invoice-a4-sheet {
          width: 210mm; min-height: 297mm; padding: 16mm 18mm;
          margin: 0 auto; background: #fff;
          box-shadow: 0 4px 32px rgba(0,0,0,0.10); border-radius: 2px;
          box-sizing: border-box; font-family: 'Georgia', serif;
          color: #1a1a1a; font-size: 9.5pt; line-height: 1.5;
        }
        .invoice-brand-bar { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10mm; gap:12px; }
        .invoice-brand-address { text-align:right; font-size:8.5pt; color:#444; line-height:1.6; }
        .invoice-brand-address p { margin:0; }
        .invoice-brand-address .brand-name { font-weight:700; font-size:9.5pt; color:#1a1a1a; }
        .invoice-title-row { display:flex; align-items:baseline; justify-content:space-between; border-top:2.5px solid #1a1a1a; border-bottom:1px solid #d0d0d0; padding:5px 0 6px; margin-bottom:8mm; }
        .invoice-title-row h1 { font-size:18pt; font-weight:900; letter-spacing:0.04em; margin:0; color:#1a1a1a; }
        .invoice-number { font-size:10pt; color:#555; font-family:'Courier New',monospace; font-weight:600; }
        .invoice-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:6mm; margin-bottom:8mm; }
        .invoice-bill-to h2 { font-size:7.5pt; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#888; margin:0 0 3px; }
        .invoice-bill-to .company-name { font-size:11pt; font-weight:700; margin:0 0 2px; }
        .invoice-bill-to .bill-detail { font-size:8.5pt; color:#555; margin:0 0 1px; line-height:1.45; }
        .invoice-detail-row { display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-bottom:3px; font-size:8.5pt; }
        .invoice-detail-row .label { color:#888; min-width:90px; text-align:right; font-size:7.5pt; text-transform:uppercase; letter-spacing:0.08em; }
        .invoice-detail-row .value { font-weight:600; min-width:100px; text-align:right; }
        .invoice-services-title { font-size:7.5pt; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#888; margin:6mm 0 4px; }
        .invoice-table { width:100%; border-collapse:collapse; font-size:7.8pt; margin-bottom:5mm; table-layout:fixed; }
        .invoice-table thead tr { background:#1a1a1a; color:#fff; }
        .invoice-table thead th { padding:5px 8px; text-align:left; font-weight:600; letter-spacing:0.06em; font-size:7.5pt; text-transform:uppercase; white-space:nowrap; }
        .invoice-table thead th.text-right, .invoice-table tbody td.text-right { text-align:right; }
        .invoice-table tbody tr { border-bottom:1px solid #e8e8e8; }
        .invoice-table tbody tr:last-child { border-bottom:2px solid #1a1a1a; }
        .invoice-table tbody tr:nth-child(even) { background:#f9f9f9; }
        .invoice-table tbody td { padding:5px 8px; vertical-align:top; }
        .gar-sample-grid { display:grid; grid-template-columns:1fr 1fr; gap:6mm; margin-bottom:6mm; }
        .gar-info-field { display:flex; gap:6px; margin-bottom:3px; font-size:8.5pt; }
        .gar-info-label { color:#555; min-width:105px; }
        .gar-info-value { font-weight:600; color:#1a1a1a; flex:1; }
        .gar-conditions-row { display:flex; justify-content:space-between; margin-bottom:4mm; font-size:8.5pt; font-weight:600; }
        .gar-gpm-summary { margin-top:4mm; font-size:8.5pt; }
        .gar-gpm-summary p { margin:0 0 2px; }
        .gar-footer-note { margin-top:6mm; font-size:8pt; color:#666; font-style:italic; }
        .invoice-footer { margin-top:auto; padding-top:6mm; border-top:1px solid #e0e0e0; text-align:center; font-size:7.5pt; color:#999; }
        .invoice-dialog-scroll { overflow-y:auto; max-height:85vh; background:#f0f0ef; padding:24px 12px; }
        .invoice-action-bar { display:flex; justify-content:flex-end; gap:10px; padding:12px 0 4px; width:210mm; margin:0 auto; }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="no-print gar-dialog-content"
          style={{
            maxWidth: "none",
            width: "auto",
            padding: 0,
            background: "#f0f0ef",
            border: "none",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <DialogHeader className="no-print" style={{ display: "none" }}>
            <DialogTitle>Gas Analysis Report</DialogTitle>
            <DialogDescription>
              View complete gas analysis report information.
            </DialogDescription>
          </DialogHeader>

          <div className="invoice-dialog-scroll">
            {isLoading ? (
              <div
                className="invoice-a4-sheet"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                }}
              >
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : report ? (
              <>
                <div className="invoice-a4-sheet">
                  <div className="invoice-brand-bar">
                    <img
                      src={nattyGasLogo}
                      alt="Natty Gas Lab"
                      style={{
                        height: "36px",
                        width: "auto",
                        objectFit: "contain",
                      }}
                    />
                    <div className="invoice-brand-address">
                      <p className="brand-name">Natty Gas Lab</p>
                      <p>10700 FM 307</p>
                      <p>Midland, TX 79706</p>
                      <p>Phone: 432-686-2719</p>
                      <p>www.nattygaslab.com</p>
                    </div>
                  </div>

                  <div className="invoice-title-row">
                    <h1>GAS ANALYSIS REPORT</h1>
                    <span className="invoice-number">
                      {report.analysis_number}
                    </span>
                  </div>

                  <div className="invoice-meta-grid">
                    <div className="invoice-bill-to">
                      <h2>Customer Information</h2>
                      <p className="company-name">{report.customer}</p>
                      {report.customer_contact_person && (
                        <p className="bill-detail">
                          {report.customer_contact_person}
                        </p>
                      )}
                      {report.customer_email && (
                        <p className="bill-detail">{report.customer_email}</p>
                      )}
                      {report.customer_phone && (
                        <p className="bill-detail">{report.customer_phone}</p>
                      )}
                    </div>
                    <div>
                      <DetailRow
                        label="Method"
                        value={displayValue(report.method)}
                      />
                      <DetailRow
                        label="Analysis#"
                        value={displayValue(report.analysis_number)}
                      />
                      <DetailRow
                        label="Cylinder#"
                        value={displayValue(report.cylinder_number)}
                      />
                      <DetailRow
                        label="Analyzed On"
                        value={formatAnalyzedOn(report.analyzed_on)}
                      />
                      <DetailRow
                        label="Analyzed By"
                        value={displayValue(report.analyzed_by)}
                      />
                    </div>
                  </div>

              <p className="invoice-services-title">Sample Information</p>
              <div className="gar-sample-grid">
                <div>
                  <InfoField
                    label="Producer:"
                    value={displayValue(report.producer)}
                  />
                  <InfoField
                    label="Well/Lease:"
                    value={displayValue(report.well_lease)}
                  />
                  <InfoField
                    label="Meter#:"
                    value={displayValue(report.meter_number)}
                  />
                  <InfoField
                    label="Sample Type:"
                    value={displayValue(report.sample_type)}
                  />
                  <InfoField
                    label="Remarks:"
                    value={displayValue(report.remarks)}
                  />
                </div>
                <div>
                  <InfoField
                    label="Sampled By:"
                    value={displayValue(report.sampled_by)}
                  />
                  <InfoField
                    label="Sample Date:"
                    value={
                      report.sample_date
                        ? isoToUSDate(report.sample_date)
                        : PLACEHOLDER
                    }
                  />
                  <InfoField
                    label="Sample Pressure:"
                    value={displayValue(report.sample_pressure)}
                  />
                  <InfoField
                    label="Sample Temperature:"
                    value={displayValue(report.sample_temperature)}
                  />
                  <InfoField
                    label="Sample Method:"
                    value={displayValue(report.sample_method)}
                  />
                  <InfoField
                    label="Field H2S:"
                    value={displayValue(report.field_h2s)}
                  />
                  <InfoField
                    label="Flow Rate:"
                    value={displayValue(report.flow_rate)}
                  />
                </div>
              </div>

              <div className="gar-conditions-row">
                <span>
                  Base Condition: {displayValue(report.base_condition)}
                </span>
                <span>
                  Physical Constant: {displayValue(report.physical_constant)}
                </span>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th className="text-right">Mole%</th>
                    <th className="text-right">Wt%</th>
                    <th className="text-right">GPM</th>
                  </tr>
                </thead>
                <tbody>
                  {componentRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{displayValue(row.component)}</td>
                      <td className="text-right">
                        {displayValue(row.mole_pct)}
                      </td>
                      <td className="text-right">{displayValue(row.wt_pct)}</td>
                      <td className="text-right">{displayValue(row.gpm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="invoice-services-title">Analysis Results</p>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th />
                    <th className="text-right">Dry Ideal</th>
                    <th className="text-right">Dry Real</th>
                    <th className="text-right">Wet Ideal</th>
                    <th className="text-right">Wet Real</th>
                  </tr>
                </thead>
                <tbody>
                  <ConditionTableRow
                    label="Gross Heating Value (BTU/ft3)"
                    values={report.gross_heating_value}
                  />
                  <ConditionTableRow
                    label="Specific Gravity (air=1.000)"
                    values={report.specific_gravity}
                  />
                  <ConditionTableRow
                    label="Compressibility Factor (Z)"
                    values={report.compressibility_factor}
                  />
                  <ConditionTableRow label="GPM" values={report.gpm_totals} />
                </tbody>
              </table>

              <div className="gar-gpm-summary">
                <p>
                  <strong>GPM (Dry Real)</strong>
                </p>
                <p>C2+: {displayValue(report.gpm_c2_plus)}</p>
                <p>C3+: {displayValue(report.gpm_c3_plus)}</p>
              </div>

              <p className="gar-footer-note">
                *Field H2S rounded to nearest whole ppm
              </p>

              <div className="invoice-footer">
                <p>
                  Natty Gas Lab · 10700 FM 307, Midland, TX 79706 · 432-686-2719
                  · www.nattygaslab.com
                </p>
              </div>
            </div>

            <div className="invoice-action-bar no-print">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating || !report}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
