import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/providers";
import AppShell from "./providers/app-shell";

export const metadata: Metadata = {
  title: "Tech Service | საოჯახო ტექნიკის სერვის-ცენტრი",
  description: "სერვისი დაგეხმარება საოჯახო ტექნიკის შეკეთებაში",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center ">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
