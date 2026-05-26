import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { Provider as ReduxProvider } from "react-redux";
import { router } from "./routes/index.tsx";
import { store } from "./redux/store.ts";
import { Toaster } from "sonner";
import { ThemeProvider } from "./providers/theme.provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
      <Toaster />
    </ReduxProvider>
  </React.StrictMode>
);
