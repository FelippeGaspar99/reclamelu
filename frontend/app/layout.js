import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "ReclameLU | Gestão de Reclamações",
  description:
    "Plataforma interna para registro, acompanhamento e análise de reclamações.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${grotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
