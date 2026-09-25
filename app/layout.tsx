import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulator Bisnis Asuransi | Kalkulator Kompensasi BE & BP",
  description:
    "Aplikasi simulasi kompensasi agensi asuransi: kualifikasi BP (4 skema), komisi personal, direct overriding, dan BP-on-BP berbasis status riil ALP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
