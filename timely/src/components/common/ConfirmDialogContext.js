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
