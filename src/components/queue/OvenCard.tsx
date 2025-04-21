
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CakeFlavor, CakeShape } from "@/types/queue";
import { format } from "date-fns";

interface OvenCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  requestedQuantity: number;
  producedQuantity: number;
}

const OvenCard: React.FC<OvenCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  requestedQuantity, // We'll keep this in the props but not display it
  producedQuantity,
}) => {
  const bgColor =
    flavor === "vanilla"
      ? "bg-amber-50 text-amber-950"
      : "bg-amber-900 text-amber-50";
  const orderNumber = batchLabel.match(/\d+/)?.[0] || "001";
  const uniqueCode = `#A${orderNumber.padStart(3, "0")}`;

  return (
    <Card
      className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? "border-2 border-red-500 animate-flash-priority" : "border border-gray-200"}
      hover:shadow-md w-full
      h-[100px]
      rounded-lg
    `}
    >
      <CardContent className="p-2 h-full flex flex-col space-y-1">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap items-center gap-1">
            <div className="font-mono text-[10px] opacity-70">{uniqueCode}</div>
            <div className="text-[10px] opacity-70">
              {format(new Date(requestedAt), "dd MMM HH:mm")}
            </div>
            {isPriority && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0.5 h-4 leading-none">
                PRIORITY
              </Badge>
            )}
          </div>
        </div>
        {/* Flavor, Shape & Size */}
        <div className="text-base font-bold">
          {`${flavor.toUpperCase()} | ${shape.toUpperCase()} ${size}CM`}
        </div>
        {/* Only Actual Qty */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold">Final Qty: {producedQuantity}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenCard;
