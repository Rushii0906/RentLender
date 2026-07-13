import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Samarth Services | Rent Agreement Management",
  description: "Leave & License rent agreement tracking and renewal management for real estate agencies and consultants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
