import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "CARC STORE", template: "%s | CARC STORE" },
  description: "Tienda en línea: catálogo, carrito y órdenes de compra.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} CARC STORE de Carlos Rivas - FSJ35. Derechos reservados.
        </footer>
      </body>
    </html>
  );
}
