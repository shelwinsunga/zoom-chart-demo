import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zoomable Shadcn Chart",
  description: "A simple zoomable shadcn chart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <div className="hidden sm:block">
            {children}
          </div>
          <div className="sm:hidden flex p-4 items-center justify-center h-screen">
            <p className="text-center text-lg">
              This demo is not viewable on mobile devices.
            </p>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
