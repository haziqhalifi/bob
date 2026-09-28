import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextStep — Turn Information Into Action",
  description:
    "Paste any message, email, notice or instruction and instantly understand what matters and what to do next.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: "var(--font-jakarta), -apple-system, 'Segoe UI', system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
