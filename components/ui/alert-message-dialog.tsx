"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface AlertMessageDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  variant?: "success" | "error" | "warning";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export function AlertMessageDialog({
  title,
  description,
  isOpen,
  onClose,
  variant = "success",
  onConfirm,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  autoClose = true,
  autoCloseTime = 3000,
}: AlertMessageDialogProps) {
  // Auto close for success and error alerts
  React.useEffect(() => {
    if (isOpen && autoClose && variant !== "warning") {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, variant, autoClose, autoCloseTime]);

  // Don't render anything if not open
  if (!isOpen) return null;

  // Use createPortal to render the dialog directly to the body
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="w-[95%] max-w-[32rem] rounded-xl overflow-hidden shadow-xl sm:w-full mx-auto bg-card border border-border"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-4">
            {variant === "success" ? (
              <div className="rounded-full bg-primary/20 p-3">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            ) : variant === "warning" ? (
              <div className="rounded-full bg-amber-500/20 p-3">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
            ) : (
              <div className="rounded-full bg-destructive/20 p-3">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
            )}
            <h2
              className={cn("text-2xl font-semibold", {
                "text-primary": variant === "success",
                "text-destructive": variant === "error",
                "text-amber-500": variant === "warning",
              })}
            >
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-center text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-4 bg-muted/50 border-t border-border",
            variant === "warning"
              ? "flex justify-between"
              : "flex justify-center"
          )}
        >
          {variant === "warning" && onConfirm ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="min-w-[120px] text-base font-medium"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  try {
                    onConfirm();
                  } finally {
                    onClose();
                  }
                }}
                className="min-w-[120px] text-base font-medium bg-amber-500 hover:bg-amber-600 text-white"
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className={cn(
                "min-w-[120px] text-base font-medium",
                "bg-primary hover:bg-primary/90"
              )}
            >
              ตกลง
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

type ShowAlertParams = Omit<AlertMessageDialogProps, "isOpen" | "onClose">;
type ConfirmParams = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
};

let showAlert: (params: ShowAlertParams) => void;
let showConfirm: (params: ConfirmParams) => void;
let closeAlert: () => void;

export function MyAlert() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [alertProps, setAlertProps] = React.useState<ShowAlertParams>({
    title: "",
  });

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  React.useEffect(() => {
    showAlert = (params: ShowAlertParams) => {
      setAlertProps(params);
      setIsOpen(true);
    };

    showConfirm = (params: ConfirmParams) => {
      setAlertProps({
        ...params,
        variant: "warning",
        autoClose: false,
      });
      setIsOpen(true);
    };

    closeAlert = handleClose;

    // Clean up any open alerts when component unmounts
    return () => {
      handleClose();
    };
  }, [handleClose]);

  // Use a key to force re-render when dialog closes
  return (
    <AlertMessageDialog
      key={isOpen ? "open" : "closed"}
      {...alertProps}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
}

export const Alert = {
  success: (title: string, description?: string) =>
    showAlert({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    showAlert({ title, description, variant: "error" }),
  warning: (title: string, description?: string) =>
    showAlert({ title, description, variant: "warning" }),
  confirm: ({
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
  }: ConfirmParams) =>
    showConfirm({
      title,
      description,
      confirmText,
      cancelText,
      onConfirm,
    }),
  close: () => closeAlert(),
};
