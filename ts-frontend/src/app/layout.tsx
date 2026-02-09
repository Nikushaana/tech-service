import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./providers/providers";
import AppShell from "./providers/app-shell";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";

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
          <Suspense
            fallback={
              <div className="flex justify-center w-full mt-10">
                <Loader2Icon className="animate-spin size-6 text-gray-600" />
              </div>
            }
          >
            <AppShell>{children}</AppShell>
          </Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
