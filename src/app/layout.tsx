import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeAccess",
  description: "Painel administrativo de controle de acesso industrial"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
