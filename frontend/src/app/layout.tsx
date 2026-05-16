import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Salary Management System",
  description: "Manage employee salaries and view insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
