import type { Metadata } from "next";
import { Inter, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoMm = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "MVPMMSHOP - Game Top Up",
  description: "Game Top Up Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoMm.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
