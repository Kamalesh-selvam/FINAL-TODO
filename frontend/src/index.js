import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#ffffff",
          color: "#111827",
          padding: "14px 16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
    <App />
  </React.StrictMode>
);
