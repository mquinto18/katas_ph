"use client";

import { createContext, useContext, useState } from "react";
import {
  connectPrinter,
  disconnectPrinter,
  isPrinterConnected,
  printReceipt,
  type ReceiptData,
} from "@/lib/printerService";
import toast from "react-hot-toast";

interface PrinterContextValue {
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  print: (data: ReceiptData) => Promise<void>;
}

const PrinterContext = createContext<PrinterContextValue>({
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  print: async () => {},
});

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      await connectPrinter();
      setConnected(true);
      toast.success("Printer connected!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect printer.");
    }
    setConnecting(false);
  };

  const disconnect = () => {
    disconnectPrinter();
    setConnected(false);
    toast("Printer disconnected.", { icon: " ", style: { background: "#616161", color: "#fff" } });
  };

  const print = async (data: ReceiptData) => {
    if (!isPrinterConnected()) return;
    try {
      await printReceipt(data);
    } catch {
      toast.error("Failed to print receipt.");
    }
  };

  return (
    <PrinterContext.Provider value={{ connected, connecting, connect, disconnect, print }}>
      {children}
    </PrinterContext.Provider>
  );
}

export const usePrinter = () => useContext(PrinterContext);
