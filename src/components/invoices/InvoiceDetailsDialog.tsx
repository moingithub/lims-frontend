import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Printer, Download, Loader2 } from "lucide-react";
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
import { isoToUSDate } from "../../utils/dateUtils";
import { Invoice } from "../../services/invoicesService";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface InvoiceDetailsDialogProps {
  open: boolean;
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onPrint: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  getStatusBadgeClass: (status: string) => string;
}

// ---------------------------------------------------------------------------
// @react-pdf/renderer StyleSheet
// Sizes in pt. A4 = 595 x 842 pt. Margins = 45pt (~16mm) each side.
// ---------------------------------------------------------------------------
const S = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 55, // room for fixed footer
    paddingHorizontal: 45,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },

  // ── Header (repeated on every page via fixed) ────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  logo: {
    width: 110,
    height: 34,
    objectFit: "contain",
  },
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

  // ── Title bar ────────────────────────────────────────────────────────────
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
  invoiceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    letterSpacing: 1,
    color: "#1a1a1a",
  },
  invoiceNumberText: {
    fontFamily: "Courier",
    fontSize: 9.5,
    color: "#555555",
  },

  // ── Meta grid ────────────────────────────────────────────────────────────
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  billToSection: { flex: 1 },
  billToLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#888888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  billToCompany: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  billToLocation: { fontSize: 8, color: "#555555" },

  detailsSection: { alignItems: "flex-end" },
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
  authorizedLine: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#aaaaaa",
    width: 110,
    height: 13,
  },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#888888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  // ── Table ─────────────────────────────────────────────────────────────────
  table: { width: "100%", marginBottom: 16 },

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
  tableRowEven: { backgroundColor: "#f9f9f9" },
  tableRowLast: { borderBottomWidth: 1.5, borderBottomColor: "#1a1a1a" },

  tableCell: { fontSize: 7.5, color: "#1a1a1a" },
  tableCellRight: { fontSize: 7.5, color: "#1a1a1a", textAlign: "right" },

  // Column widths (must sum to 100%)
  colAnalysis: { width: "12%" },
  colDescription: { width: "26%" },
  colDate: { width: "12%" },
  colMethod: { width: "16%" },
  colQty: { width: "8%" },
  colUnitPrice: { width: "13%" },
  colAmount: { width: "13%" },

  // ── Totals ────────────────────────────────────────────────────────────────
  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 22,
  },
  totalsBox: { width: 155 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
  },
  totalsLabel: { fontSize: 7.5, color: "#555555" },
  totalsValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#1a1a1a",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderTopColor: "#1a1a1a",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1a1a1a",
  },
  totalsFinalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#1a1a1a",
  },
  totalsFinalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#1a1a1a",
  },

  // ── Footer (fixed — appears on every page) ────────────────────────────────
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

  // ── Page number ───────────────────────────────────────────────────────────
  pageNumber: {
    position: "absolute",
    bottom: 10,
    right: 45,
    fontSize: 6.5,
    color: "#bbbbbb",
  },
});

// ---------------------------------------------------------------------------
// PDF Document — rendered by @react-pdf/renderer
// wrap={false} on each table row prevents rows being split across pages.
// fixed on header/footer repeats them on every page automatically.
// ---------------------------------------------------------------------------
function InvoicePDFDocument({ invoice }: { invoice: Invoice }) {
  const fmt = (val: string) => `$${parseFloat(val).toFixed(2)}`;

  return (
    <Document
      title={`Invoice ${invoice.invoice_number}`}
      author="Natty Gas Lab"
      subject="Invoice"
    >
      <Page size="A4" style={S.page} wrap>
        {/* Header — fixed so it repeats on page 2, 3… */}
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

        {/* Title bar */}
        <View style={S.titleRow}>
          <Text style={S.invoiceTitle}>INVOICE</Text>
          <Text style={S.invoiceNumberText}>{invoice.invoice_number}</Text>
        </View>

        {/* Meta: Bill To + Details */}
        <View style={S.metaGrid}>
          <View style={S.billToSection}>
            <Text style={S.billToLabel}>Bill To</Text>
            <Text style={S.billToCompany}>{invoice.company.name}</Text>
            {invoice.location && (
              <Text style={S.billToLocation}>{invoice.location}</Text>
            )}
          </View>

          <View style={S.detailsSection}>
            <View style={S.detailRow}>
              <Text style={S.detailLabel}>Invoice Date</Text>
              <Text style={S.detailValue}>
                {isoToUSDate(invoice.invoice_date)}
              </Text>
            </View>
            <View style={S.detailRow}>
              <Text style={S.detailLabel}>Service Period</Text>
              <Text style={S.detailValue}>
                {isoToUSDate(invoice.service_start_date)} –{" "}
                {isoToUSDate(invoice.service_end_date)}
              </Text>
            </View>
            {invoice.po_number && (
              <View style={S.detailRow}>
                <Text style={S.detailLabel}>PO Number</Text>
                <Text style={S.detailValue}>{invoice.po_number}</Text>
              </View>
            )}
            <View style={S.detailRow}>
              <Text style={S.detailLabel}>Status</Text>
              <Text style={S.detailValue}>{invoice.payment_status}</Text>
            </View>
            <View style={[S.detailRow, { marginTop: 6 }]}>
              <Text style={S.detailLabel}>Authorized By</Text>
              <View style={S.authorizedLine} />
            </View>
          </View>
        </View>

        {/* Services table */}
        <Text style={S.sectionLabel}>Services Rendered</Text>
        <View style={S.table}>
          {/* Column headers — fixed so they repeat at top of each new page */}
          <View style={S.tableHeaderRow} fixed>
            <Text style={[S.tableHeaderCell, S.colAnalysis]}>Analysis #</Text>
            <Text style={[S.tableHeaderCell, S.colDescription]}>
              Description
            </Text>
            <Text style={[S.tableHeaderCell, S.colDate]}>Svc Date</Text>
            <Text style={[S.tableHeaderCell, S.colMethod]}>Method</Text>
            <Text style={[S.tableHeaderCell, S.colQty, { textAlign: "right" }]}>
              Qty
            </Text>
            <Text
              style={[
                S.tableHeaderCell,
                S.colUnitPrice,
                { textAlign: "right" },
              ]}
            >
              Unit Price
            </Text>
            <Text
              style={[S.tableHeaderCell, S.colAmount, { textAlign: "right" }]}
            >
              Amount
            </Text>
          </View>

          {invoice.invoiceLines.map((line, idx) => {
            const isEven = idx % 2 === 1;
            const isLast = idx === invoice.invoiceLines.length - 1;
            return (
              // wrap={false} keeps the entire row on one page — no mid-row splits
              <View
                key={line.id}
                style={[
                  S.tableRow,
                  isEven ? S.tableRowEven : {},
                  isLast ? S.tableRowLast : {},
                ]}
                wrap={false}
              >
                <Text style={[S.tableCell, S.colAnalysis]}>
                  {line.analysis_number}
                </Text>
                <Text style={[S.tableCell, S.colDescription]}>
                  {line.description}
                </Text>
                <Text style={[S.tableCell, S.colDate]}>
                  {isoToUSDate(line.service_date)}
                </Text>
                <Text style={[S.tableCell, S.colMethod]}>
                  {line.analysis_method}
                </Text>
                <Text style={[S.tableCellRight, S.colQty]}>
                  {line.quantity}
                </Text>
                <Text style={[S.tableCellRight, S.colUnitPrice]}>
                  {fmt(line.unit_price)}
                </Text>
                <Text style={[S.tableCellRight, S.colAmount]}>
                  {fmt(line.amount)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={S.totalsWrapper}>
          <View style={S.totalsBox}>
            <View style={S.totalsRow}>
              <Text style={S.totalsLabel}>Subtotal</Text>
              <Text style={S.totalsValue}>{fmt(invoice.subtotal)}</Text>
            </View>
            {parseFloat(invoice.hourly_fee) > 0 && (
              <View style={S.totalsRow}>
                <Text style={S.totalsLabel}>Hourly Fee</Text>
                <Text style={S.totalsValue}>{fmt(invoice.hourly_fee)}</Text>
              </View>
            )}
            {parseFloat(invoice.mileage_fee) > 0 && (
              <View style={S.totalsRow}>
                <Text style={S.totalsLabel}>
                  Mileage ({invoice.miles} mi @ ${invoice.rate_per_mile})
                </Text>
                <Text style={S.totalsValue}>{fmt(invoice.mileage_fee)}</Text>
              </View>
            )}
            {parseFloat(invoice.miscellaneous_charges) > 0 && (
              <View style={S.totalsRow}>
                <Text style={S.totalsLabel}>Misc. Charges</Text>
                <Text style={S.totalsValue}>
                  {fmt(invoice.miscellaneous_charges)}
                </Text>
              </View>
            )}
            {parseFloat(invoice.tax_amount) > 0 && (
              <View style={S.totalsRow}>
                <Text style={S.totalsLabel}>Tax</Text>
                <Text style={S.totalsValue}>{fmt(invoice.tax_amount)}</Text>
              </View>
            )}
            <View style={S.totalsFinalRow}>
              <Text style={S.totalsFinalLabel}>Total Due</Text>
              <Text style={S.totalsFinalValue}>
                {fmt(invoice.total_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer — fixed: appears at the bottom of every page */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            Thank you for your business. Please remit payment within 30 days of
            invoice date.
          </Text>
          <Text style={S.footerText}>
            Natty Gas Lab · 10700 FM 307, Midland, TX 79706 · 432-686-2719 ·
            www.nattygaslab.com
          </Text>
        </View>

        {/* Page number — only shows when there is more than 1 page */}
        <Text
          style={S.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------
export function InvoiceDetailsDialog({
  open,
  invoice,
  onOpenChange,
  onPrint,
  onDownload,
  getStatusBadgeClass,
}: InvoiceDetailsDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!invoice) return null;

  const printInvoice = () => window.print();

  /**
   * Uses @react-pdf/renderer to produce a proper vector PDF.
   * - Header + table column headers repeat on every page (fixed prop)
   * - Each table row has wrap={false} so no row is ever split mid-page
   * - Footer + page numbers appear on every page automatically
   */
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const blob = await pdf(<InvoicePDFDocument invoice={invoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Invoice-${invoice.invoice_number}.pdf`;
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

  return (
    <>
      {/* Screen preview + browser-print styles */}
      <style>{`
        @media print {
          body > *:not(.invoice-print-root) { display: none !important; }
          [role="dialog"], [data-radix-dialog-overlay], .invoice-dialog-content {
            all: unset !important; display: block !important; position: static !important;
            overflow: visible !important; max-height: none !important;
            box-shadow: none !important; border: none !important; background: white !important;
          }
          .no-print  { display: none !important; }
          .print-only { display: block !important; }
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
        .invoice-title-row h1 { font-size:22pt; font-weight:900; letter-spacing:0.04em; margin:0; color:#1a1a1a; }
        .invoice-number { font-size:10pt; color:#555; font-family:'Courier New',monospace; font-weight:600; }
        .invoice-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:6mm; margin-bottom:8mm; }
        .invoice-bill-to h2 { font-size:7.5pt; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#888; margin:0 0 3px; }
        .invoice-bill-to .company-name { font-size:11pt; font-weight:700; margin:0 0 2px; }
        .invoice-bill-to .location { font-size:8.5pt; color:#555; margin:0; }
        .invoice-detail-row { display:flex; justify-content:flex-end; gap:10px; margin-bottom:3px; font-size:8.5pt; }
        .invoice-detail-row .label { color:#888; min-width:90px; text-align:right; font-size:7.5pt; text-transform:uppercase; letter-spacing:0.08em; }
        .invoice-detail-row .value { font-weight:600; min-width:100px; text-align:right; }
        .invoice-services-title { font-size:7.5pt; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#888; margin:0 0 4px; }
        .invoice-table { width:100%; border-collapse:collapse; font-size:8.2pt; margin-bottom:8mm; }
        .invoice-table thead tr { background:#1a1a1a; color:#fff; }
        .invoice-table thead th { padding:5px 8px; text-align:left; font-weight:600; letter-spacing:0.06em; font-size:7.5pt; text-transform:uppercase; white-space:nowrap; }
        .invoice-table thead th.text-right, .invoice-table tbody td.text-right { text-align:right; }
        .invoice-table tbody tr { border-bottom:1px solid #e8e8e8; }
        .invoice-table tbody tr:last-child { border-bottom:2px solid #1a1a1a; }
        .invoice-table tbody tr:nth-child(even) { background:#f9f9f9; }
        .invoice-table tbody td { padding:5px 8px; vertical-align:top; }
        .invoice-totals-wrapper { display:flex; justify-content:flex-end; margin-bottom:8mm; }
        .invoice-totals-box { width:58mm; }
        .invoice-totals-row { display:flex; justify-content:space-between; padding:3px 0; font-size:8.5pt; border-bottom:1px solid #e8e8e8; }
        .invoice-totals-row:last-child { border-bottom:none; }
        .invoice-totals-row.total-final { border-top:2px solid #1a1a1a; border-bottom:2px solid #1a1a1a; margin-top:3px; padding:5px 0; font-size:10pt; font-weight:800; }
        .invoice-totals-row .tot-label { color:#555; }
        .invoice-totals-row .tot-value { font-weight:600; font-variant-numeric:tabular-nums; }
        .invoice-totals-row.total-final .tot-label,
        .invoice-totals-row.total-final .tot-value { color:#1a1a1a; }
        .status-badge-print { font-size:7.5pt; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:1px 7px; border-radius:2px; border:1.5px solid currentColor; display:inline-block; }
        .invoice-footer { margin-top:auto; padding-top:6mm; border-top:1px solid #e0e0e0; text-align:center; font-size:7.5pt; color:#999; }
        .invoice-dialog-scroll { overflow-y:auto; max-height:85vh; background:#f0f0ef; padding:24px 12px; }
        .invoice-action-bar { display:flex; justify-content:flex-end; gap:10px; padding:12px 0 4px; width:210mm; margin:0 auto; }
        .print-only { display:none; }
      `}</style>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="no-print invoice-dialog-content"
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
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View complete invoice information.
            </DialogDescription>
          </DialogHeader>

          <div className="invoice-dialog-scroll">
            {/* ── A4 screen preview ── */}
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
                <h1>INVOICE</h1>
                <span className="invoice-number">{invoice.invoice_number}</span>
              </div>

              <div className="invoice-meta-grid">
                <div className="invoice-bill-to">
                  <h2>Bill To</h2>
                  <p className="company-name">{invoice.company.name}</p>
                  {invoice.location && (
                    <p className="location">{invoice.location}</p>
                  )}
                </div>
                <div>
                  <div className="invoice-detail-row">
                    <span className="label">Invoice Date</span>
                    <span className="value">
                      {isoToUSDate(invoice.invoice_date)}
                    </span>
                  </div>
                  <div className="invoice-detail-row">
                    <span className="label">Service Period</span>
                    <span className="value">
                      {isoToUSDate(invoice.service_start_date)} –{" "}
                      {isoToUSDate(invoice.service_end_date)}
                    </span>
                  </div>
                  {invoice.po_number && (
                    <div className="invoice-detail-row">
                      <span className="label">PO Number</span>
                      <span className="value">{invoice.po_number}</span>
                    </div>
                  )}
                  <div
                    className="invoice-detail-row"
                    style={{ marginTop: "4px" }}
                  >
                    <span className="label">Status</span>
                    <span className="value">
                      <span className="no-print">
                        <Badge
                          className={getStatusBadgeClass(
                            invoice.payment_status,
                          )}
                          variant="outline"
                          style={{ fontSize: "7.5pt" }}
                        >
                          {invoice.payment_status}
                        </Badge>
                      </span>
                      <span className="print-only status-badge-print">
                        {invoice.payment_status}
                      </span>
                    </span>
                  </div>
                  <div
                    className="invoice-detail-row"
                    style={{ marginTop: "8px" }}
                  >
                    <span className="label">Authorized By</span>
                    <span
                      className="value"
                      style={{
                        borderBottom: "1px solid #aaa",
                        minWidth: "120px",
                        display: "inline-block",
                      }}
                    >
                      &nbsp;
                    </span>
                  </div>
                </div>
              </div>

              <p className="invoice-services-title">Services Rendered</p>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Analysis #</th>
                    <th>Description</th>
                    <th>Service Date</th>
                    <th>Method</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoiceLines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.analysis_number}</td>
                      <td>{line.description}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {isoToUSDate(line.service_date)}
                      </td>
                      <td>{line.analysis_method}</td>
                      <td className="text-right">{line.quantity}</td>
                      <td className="text-right">
                        ${parseFloat(line.unit_price).toFixed(2)}
                      </td>
                      <td className="text-right">
                        ${parseFloat(line.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals-wrapper">
                <div className="invoice-totals-box">
                  <div className="invoice-totals-row">
                    <span className="tot-label">Subtotal</span>
                    <span className="tot-value">
                      ${parseFloat(invoice.subtotal).toFixed(2)}
                    </span>
                  </div>
                  {parseFloat(invoice.hourly_fee) > 0 && (
                    <div className="invoice-totals-row">
                      <span className="tot-label">Hourly Fee</span>
                      <span className="tot-value">
                        ${parseFloat(invoice.hourly_fee).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {parseFloat(invoice.mileage_fee) > 0 && (
                    <div className="invoice-totals-row">
                      <span className="tot-label">
                        Mileage ({invoice.miles} mi @ ${invoice.rate_per_mile})
                      </span>
                      <span className="tot-value">
                        ${parseFloat(invoice.mileage_fee).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {parseFloat(invoice.miscellaneous_charges) > 0 && (
                    <div className="invoice-totals-row">
                      <span className="tot-label">Misc. Charges</span>
                      <span className="tot-value">
                        ${parseFloat(invoice.miscellaneous_charges).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {parseFloat(invoice.tax_amount) > 0 && (
                    <div className="invoice-totals-row">
                      <span className="tot-label">Tax</span>
                      <span className="tot-value">
                        ${parseFloat(invoice.tax_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="invoice-totals-row total-final">
                    <span className="tot-label">Total Due</span>
                    <span className="tot-value">
                      ${parseFloat(invoice.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="invoice-footer">
                <p>
                  Thank you for your business. Please remit payment within 30
                  days of invoice date.
                </p>
                <p style={{ marginTop: "2px" }}>
                  Natty Gas Lab · 10700 FM 307, Midland, TX 79706 · 432-686-2719
                  · www.nattygaslab.com
                </p>
              </div>
            </div>
            {/* ── End A4 sheet ── */}

            {/* ── Action buttons ── */}
            <div className="invoice-action-bar no-print">
              {/* <Button variant="outline" onClick={printInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button> */}
              <Button onClick={handleDownloadPDF} disabled={isGenerating}>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
