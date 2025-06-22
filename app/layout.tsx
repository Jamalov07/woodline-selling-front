import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Toaster } from "@/components/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "CRM System",
    description: "Customer Relationship Management System",
    generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="uz" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <LanguageProvider>
                        <AuthProvider>{children}</AuthProvider>
                        <Toaster />
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
