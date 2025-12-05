import { ThemeProvider } from "@/app/providers/theme-provider";
import { DM_Sans, Space_Mono, Lexend } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/app/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata = {
  title: "OTSI - AI Invoice Parser",
  description: "Automate Invoice Processing with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceMono.variable} ${lexend.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <Toaster closeButton position="top-center" autoClose={5000} />
      </body>
    </html>
  );
}
