
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import OvenCard from "./OvenCard";
import { OvenReadyBatch } from "@/types/queue";

interface OvenSectionProps {
  ovenReadyBatches: OvenReadyBatch[];
}

const OvenSection: React.FC<OvenSectionProps> = ({ ovenReadyBatches }) => {
  return (
    <Card className="flex-1 h-full overflow-hidden">
      <CardContent className="p-4 h-full">
        <h2 className="text-xl font-bold mb-4">Oven Ready</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-200px)] pb-4">
          {ovenReadyBatches.map((batch) => (
            <OvenCard
              key={batch.id}
              flavor={batch.flavor}
              shape={batch.shape}
              size={batch.size}
              batchLabel={batch.batchLabel}
              requestedAt={batch.requestedAt}
              isPriority={batch.isPriority}
              requestedQuantity={batch.requestedQuantity}
              producedQuantity={batch.producedQuantity}
            />
          ))}
          {ovenReadyBatches.length === 0 && (
            <div className="text-sm text-gray-500 col-span-3 text-center p-4 border border-dashed rounded-md">
              No batches ready for baking
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OvenSection;
