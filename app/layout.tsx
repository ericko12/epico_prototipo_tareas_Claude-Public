import type { Metadata } from "next";
import "@fontsource-variable/quicksand";
import "./globals.css";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "Epico Movil · Sintético",
  description: "Versión sintética de Épico Móvil con el módulo Agenda V8.2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
