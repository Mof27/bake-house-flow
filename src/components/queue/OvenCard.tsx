
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
  isPriority = false,
  producedQuantity,
}) => {
  const bgColor =
    flavor === "vanilla"
      ? "bg-amber-50 text-amber-950"
      : "bg-amber-900 text-amber-50";

  // Extract batch codes for display
  const batchCodes = batchLabel.includes(',') 
    ? batchLabel  // Already consolidated format
    : batchLabel.match(/#A\d+/)?.[0] || batchLabel;

  return (
    <Card
      className={`
      relative overflow-hidden transition-all
      ${bgColor}
      ${isPriority ? "border-2 border-red-500" : "border border-gray-200"}
      hover:shadow-md w-full
      h-[100px]
      rounded-lg
    `}
    >
      <CardContent className="p-2 h-full flex flex-col justify-between">
        {/* Header with batch identifier */}
        <div className="flex justify-between items-center">
          <div className="font-mono text-sm font-bold">{batchCodes}</div>
          {isPriority && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0.5 h-4">
              PRIORITY
            </Badge>
          )}
        </div>
        
        {/* Flavor, Shape & Size */}
        <div className="text-base font-bold">
          {`${flavor.toUpperCase()} | ${shape.toUpperCase()} ${size}CM`}
        </div>
        
        {/* Only Final Qty */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Final Qty: {producedQuantity}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenCard;
