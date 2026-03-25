"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface PageTitleContextType {
  title: string;
  subtitle?: string;
  setPageTitle: (title: string, subtitle?: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType>({
  title: "Inovar App",
  subtitle: undefined,
  setPageTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("Inovar App");
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);

  const setPageTitle = useCallback((t: string, s?: string) => {
    setTitle(t);
    setSubtitle(s);
  }, []);

  return (
    <PageTitleContext.Provider value={{ title, subtitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export const usePageTitle = () => useContext(PageTitleContext);
