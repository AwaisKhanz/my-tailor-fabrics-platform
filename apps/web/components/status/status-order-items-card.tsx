import { type Order } from "@tbms/shared-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tbms/ui/components/table";
import { Text } from "@tbms/ui/components/typography";
import { formatPKR } from "@/lib/utils";

interface StatusOrderItemsCardProps {
  order: Order;
}

export function StatusOrderItemsCard({ order }: StatusOrderItemsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="px-4 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4 whitespace-normal">
                  <Text as="p" className="font-medium">
                    {item.garmentTypeName}
                  </Text>
                  {item.description ? (
                    <Text as="p" variant="muted" className="text-xs">
                      {item.description}
                    </Text>
                  ) : null}
                </TableCell>
                <TableCell className="text-right font-medium">
                  x{item.quantity}
                </TableCell>
                <TableCell className="px-4 text-right font-medium">
                  {formatPKR(item.unitPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
