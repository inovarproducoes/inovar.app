"use client";
import React, { useEffect } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

export function MainLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(title, subtitle);
  }, [title, subtitle, setPageTitle]);

  return <>{children}</>;
}
