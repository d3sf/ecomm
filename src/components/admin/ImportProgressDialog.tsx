import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ImportProgressDialogProps {
  isOpen: boolean;
  progress: number;
  status: string;
  totalItems?: number;
  processedItems?: number;
}

export function ImportProgressDialog({
  isOpen,
  progress,
  status,
  totalItems,
  processedItems,
}: ImportProgressDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importing Products</DialogTitle>
          <DialogDescription>
            Please wait while we import your products...
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{status}</span>
            {totalItems && processedItems && (
              <span>
                {processedItems} of {totalItems} items
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 