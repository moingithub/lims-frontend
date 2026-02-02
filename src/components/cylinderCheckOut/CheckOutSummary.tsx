import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { getCurrentDateUS } from "../../utils/dateUtils";

interface CheckOutSummaryProps {
  customerName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  checkOutCompleted: boolean;
  completedCylinders: string[];
}

export function CheckOutSummary({
  customerName,
  contactName,
  contactEmail,
  contactPhone,
  checkOutCompleted,
  completedCylinders,
}: CheckOutSummaryProps) {
  const handlePrint = () => {
    // Create a printable version of the summary
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const checkOutDate = getCurrentDateUS();
    
    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Check-Out Summary - ${customerName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 30px;
      max-width: 800px;
      margin: 0 auto;
      font-size: 12pt;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #f97316;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #f97316;
      margin: 0;
      font-size: 24pt;
    }
    .header h2 {
      color: #666;
      margin: 5px 0 0 0;
      font-size: 14pt;
      font-weight: normal;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table td {
      padding: 8px 12px;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    .info-table td:first-child {
      font-weight: bold;
      background-color: #f5f5f5;
      width: 35%;
    }
    .info-table td:nth-child(2) {
      width: 65%;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      color: #f97316;
      margin: 25px 0 10px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #f97316;
    }
    .cylinder-list {
      margin: 10px 0;
      padding: 0;
      list-style: none;
    }
    .cylinder-item {
      padding: 6px 10px;
      margin: 3px 0;
      background-color: #f9f9f9;
      border-left: 3px solid #f97316;
      font-family: 'Courier New', monospace;
      font-size: 11pt;
    }
    .cylinder-item:nth-child(odd) {
      background-color: #fff;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 9pt;
    }
    @media print {
      body {
        padding: 15px;
      }
      .info-table td:first-child {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .cylinder-item {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Natty Gas Lab</h1>
    <h2>Cylinder Check-Out Summary</h2>
  </div>
  
  <table class="info-table">
    <tr>
      <td>Company</td>
      <td>${customerName}</td>
    </tr>
    <tr>
      <td>Contact Person</td>
      <td>${contactName}</td>
    </tr>
    <tr>
      <td>Email</td>
      <td>${contactEmail}</td>
    </tr>
    <tr>
      <td>Phone</td>
      <td>${contactPhone}</td>
    </tr>
    <tr>
      <td>Check-Out Date</td>
      <td>${checkOutDate}</td>
    </tr>
    <tr>
      <td>Total Cylinders</td>
      <td>${completedCylinders.length}</td>
    </tr>
  </table>
  
  <div class="section-title">Checked Out Cylinders</div>
  <ul class="cylinder-list">
    ${completedCylinders.map((cylinder, index) => `<li class="cylinder-item">${index + 1}. ${cylinder}</li>`).join('')}
  </ul>
  
  <div class="footer">
    <p><strong>Natty Gas Lab</strong> - Laboratory Information Management System</p>
    <p>Printed on: ${new Date().toLocaleString()}</p>
  </div>
  
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Check-Out Summary</CardTitle>
          {checkOutCompleted && completedCylinders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {checkOutCompleted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-green-800">
              Check-out completed successfully!
            </p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Company</p>
          <p>{customerName || "Not selected"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Contact</p>
          <p>{contactName || "Not selected"}</p>
          {contactEmail && (
            <p className="text-sm text-muted-foreground mt-1">
              {contactEmail}
            </p>
          )}
          {contactPhone && (
            <p className="text-sm text-muted-foreground mt-1">
              {contactPhone}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Check Out Date</p>
          <p>{getCurrentDateUS()}</p>
        </div>
        {checkOutCompleted && completedCylinders.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Checked Out Cylinders
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {completedCylinders.map((cylinderNum, index) => (
                <p key={index} className="text-sm pl-2">
                  {cylinderNum}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
