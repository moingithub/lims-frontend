import React, { useRef } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Invoice as InvoiceType } from "../../services/invoicesService";

interface InvoiceProps {
  data: InvoiceType;
}

export function Invoice({ data }: InvoiceProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const safe = (val: string | number | null | undefined) =>
    val === undefined || val === null || val === "" ? "-" : val;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>INVOICE</h2>

      <div style={styles.row}>
        <div>
          <h3>{safe(data.company?.name)}</h3>
          <p>Location: {safe(data.location)}</p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p>
            <strong>Invoice #:</strong> {safe(data.invoice_number)}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(data.invoice_date)}
          </p>
          <p>
            <strong>Status:</strong> {safe(data.status)}
          </p>
          <p>
            <strong>Payment:</strong> {safe(data.payment_status)}
          </p>
        </div>
      </div>

      <div style={styles.section}>
        <p>
          <strong>Service Period:</strong> {formatDate(data.service_start_date)}{" "}
          - {formatDate(data.service_end_date)}
        </p>
        <p>
          <strong>PO Number:</strong> {safe(data.po_number)}
        </p>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Analysis No</th>
            <th style={styles.th}>Method</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Rate</th>
            <th style={styles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.invoiceLines?.map((line, index) => (
            <tr key={line.id}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{safe(line.description)}</td>
              <td style={styles.td}>{safe(line.analysis_number)}</td>
              <td style={styles.td}>{safe(line.analysis_method)}</td>
              <td style={styles.td}>{formatDate(line.service_date)}</td>
              <td style={styles.td}>{safe(line.quantity)}</td>
              <td style={styles.td}>{safe(line.unit_price)}</td>
              <td style={styles.td}>{safe(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.summary}>
        <p>
          Mileage: {safe(data.miles)} × {safe(data.rate_per_mile)} ={" "}
          {safe(data.mileage_fee)}
        </p>
        <p>Misc Charges: {safe(data.miscellaneous_charges)}</p>
        <p>Hourly Fee: {safe(data.hourly_fee)}</p>
        <p>Subtotal: {safe(data.subtotal)}</p>
        <p>Tax: {safe(data.tax_amount)}</p>

        <h3>Total: {safe(data.total_amount)}</h3>
      </div>

      <div style={styles.footer}>
        <p>Authorized By: {safe(data.authorized_by)}</p>
      </div>
    </div>
  );
}

export async function downloadInvoicePdf(data: InvoiceType) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.padding = "20px";
  container.style.background = "#fff";
  container.style.color = "#000";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.lineHeight = "1.6";

  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<Invoice data={data} />);

  // Wait for React to render - multiple checks to ensure full render
  await new Promise<void>((resolve) => {
    let checks = 0;
    const maxChecks = 5;

    const checkRender = () => {
      checks++;
      if (checks >= maxChecks) {
        resolve();
      } else {
        requestAnimationFrame(checkRender);
      }
    };

    requestAnimationFrame(checkRender);
  });

  // Additional wait to ensure images and content are loaded
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas has invalid dimensions");
    }

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${data.invoice_number || "invoice"}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "800px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    color: "#000",
    lineHeight: "1.6",
  },
  header: {
    textAlign: "center",
    borderBottom: "2px solid #000",
    paddingBottom: "10px",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    marginBottom: "20px",
  },
  section: {
    marginTop: "15px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid #000",
  },
  th: {
    border: "1px solid #000",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "left",
    fontSize: "12px",
  },
  td: {
    border: "1px solid #000",
    padding: "8px",
    fontSize: "12px",
  },
  summary: {
    marginTop: "20px",
    marginBottom: "20px",
    textAlign: "right",
    fontSize: "14px",
  },
  footer: {
    marginTop: "40px",
    borderTop: "1px solid #ccc",
    paddingTop: "10px",
    fontSize: "12px",
  },
};

export default Invoice;
