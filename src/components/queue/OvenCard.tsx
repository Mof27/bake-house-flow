
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CakeFlavor, CakeShape } from "@/types/queue";

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
  isPriority = false,
  producedQuantity,
  requestedQuantity,
}) => {
  // Choose colors based on flavor for slight visual context
  const bgColor =
    flavor === "vanilla"
      ? "bg-[#FEF7CD] text-[#403E43]"
      : "bg-[#E5DEFF] text-[#403E43]";
  const borderColor = isPriority
    ? "border-2 border-[color:hsl(var(--bakery-danger))]"
    : "border border-gray-200";

  return (
    <Card
      className={`relative transition-all ${bgColor} ${borderColor} hover:shadow-md w-full h-[100px] rounded-xl`}
    >
      <CardContent className="p-3 h-full flex items-center justify-between">
        {/* Left column: Cake details */}
        <div className="flex flex-col gap-0.5 justify-center w-1/2">
          <div className="text-base font-bold mb-1">
            {flavor.toUpperCase()} | {shape.toUpperCase()} {size}CM
          </div>
          <div className="text-xs text-muted-foreground">
            Requested: <span className="font-semibold">{requestedQuantity}</span>
          </div>
        </div>
        {/* Right column: Final quantity & priority */}
        <div className="flex flex-col gap-1 items-end w-1/2">
          <span className="text-sm font-medium">
            Final Qty:{" "}
            <span className="font-bold text-lg">{producedQuantity}</span>
          </span>
          {isPriority && (
            <Badge
              variant="destructive"
              className="text-[12px] px-2 py-0.5 h-5 animate-flash-priority"
            >
              PRIORITY
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenCard;

