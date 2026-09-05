import { createContext, useContext } from "react";

export const ConfirmDialogContext = createContext(null);

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used inside ConfirmDialogProvider",
    );
  }

  return context;
}

/**
 * Shares the same underlying dialog as useConfirmDialog, but returns the
 * `alert` helper for single-button info/success/error pop-ups. Reuses the
 * existing custom dialog UI instead of window.alert().
 */
export function useAlertDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useAlertDialog must be used inside ConfirmDialogProvider",
    );
  }

  return context.alert;
}
