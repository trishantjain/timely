import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ConfirmDialogProvider } from "./components/common/ConfirmDialog";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfirmDialogProvider>
      <App />
    </ConfirmDialogProvider>{" "}
  </StrictMode>,
);
