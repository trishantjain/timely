import { useCallback, useEffect, useRef, useState } from "react";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ConfirmDialogContext } from "./ConfirmDialogContext";

export function ConfirmDialogProvider({ children }) {
  const [open, setOpen] = useState(false);

  const [options, setOptions] = useState({
    title: "Are you sure?",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
  });

  const resolverRef = useRef(null);

  const closeDialog = useCallback((result) => {
    setOpen(false);

    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const confirm = useCallback((config = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;

      setOptions({
        title: "Are you sure?",
        description: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "default",
        ...config,
      });

      setOpen(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      closeDialog(false);
    }
  };

  const isDestructive = options.variant === "destructive";

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`
    sm:max-w-[430px]
    overflow-hidden
    border
    p-0
    ${isDestructive ? "border-red-200" : "border-slate-200"}
  `}
        >
          <DialogHeader className="px-6 pt-6 pb-4">
            <div
              className={`
    mb-4
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-full
    ${isDestructive ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}
  `}
            >
              <AlertTriangle size={20} />
            </div>

            <DialogTitle>{options.title}</DialogTitle>

            {options.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>

          <DialogFooter
            className={`
    border-t
    px-6
    py-4
    ${isDestructive ? "border-red-100 bg-red-50/30" : "border-slate-200"}
  `}
          >
            <Button
              variant="outline"
              onClick={() => closeDialog(false)}
              className=" border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
            >
              {options.cancelText}
            </Button>

            <Button
              onClick={() => closeDialog(true)}
              className={
                isDestructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}
