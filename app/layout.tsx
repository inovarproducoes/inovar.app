import { Providers } from "@/components/providers/Providers";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata = {
  title: "Inovar OS",
  description: "Next Generation Enterprise Platform — Gestão Educacional",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable} dark`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
