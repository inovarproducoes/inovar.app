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
  title: "Inovar App",
  description: "Next Generation Enterprise Platform — Gestão Educacional",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%237D539F'/><text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-family='Arial Black,sans-serif' font-weight='900' font-size='20' fill='white'>I</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
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
