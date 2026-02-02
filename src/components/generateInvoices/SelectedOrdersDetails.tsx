import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { WorkOrder } from "../../types/generateInvoices";
import { getCompanyNameById } from "../../services/generateInvoicesService";

interface SelectedOrdersDetailsProps {
  orders: WorkOrder[];
}

export function SelectedOrdersDetails({ orders }: SelectedOrdersDetailsProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Orders Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                {order.work_order_number} - {getCompanyNameById(order.company_id)}
              </h4>
              <Badge variant="outline">{order.cylinders} cylinders</Badge>
            </div>
            
            {/* Billing Reference if exists */}
            {order.billing_reference_type !== "NA" && order.billing_reference_number && (
              <div className="text-sm text-muted-foreground">
                {order.billing_reference_type}: {order.billing_reference_number}
              </div>
            )}
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cylinder #</TableHead>
                    <TableHead>Analysis #</TableHead>
                    <TableHead>Analysis Type</TableHead>
                    <TableHead>Meter #</TableHead>
                    <TableHead>Well Name</TableHead>
                    <TableHead>Rushed</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.cylinder_number}</TableCell>
                      <TableCell>{item.analysis_number}</TableCell>
                      <TableCell>{item.analysis_type}</TableCell>
                      <TableCell>{item.meter_number}</TableCell>
                      <TableCell>{item.well_name}</TableCell>
                      <TableCell>
                        {item.rushed ? (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            Rushed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Additional Fees */}
            {(order.mileage_fee > 0 || order.miscellaneous_charges > 0 || order.hourly_fee > 0) && (
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <div className="font-medium">Additional Charges:</div>
                {order.mileage_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Mileage Fee:</span>
                    <span>${order.mileage_fee.toFixed(2)}</span>
                  </div>
                )}
                {order.miscellaneous_charges > 0 && (
                  <div className="flex justify-between">
                    <span>Miscellaneous Charges:</span>
                    <span>${order.miscellaneous_charges.toFixed(2)}</span>
                  </div>
                )}
                {order.hourly_fee > 0 && (
                  <div className="flex justify-between">
                    <span>Hourly Fee:</span>
                    <span>${order.hourly_fee.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}