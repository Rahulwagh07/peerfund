import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { config } from "@/wagmi/index";
import { headers } from "next/headers";
import Providers from "@/context";
import { cookieToInitialState } from "wagmi";
import {Appbar} from "@/components/appbar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PeerFund",
  description: "Peer to peer lending network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const initialState = cookieToInitialState(
    config,
    headersList.get('cookie')
  );

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen font-sans",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers initialState={initialState}>
            <Toaster />
            <Appbar />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}