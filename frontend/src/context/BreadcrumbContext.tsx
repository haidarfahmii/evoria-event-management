"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbContextType {
  labels: Record<string, string>; // { "id-transaksi": "Nama Event" }
  setLabel: (segment: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = (segment: string, label: string) => {
    setLabels((prev) => ({
      ...prev,
      [segment]: label,
    }));
  };

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
};
