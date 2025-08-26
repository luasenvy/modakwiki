import "@/styles/style.css";

import { dir } from "i18next";

import type { Metadata } from "next";
import { Icons } from "next/dist/lib/metadata/types/metadata-types";
import { Nanum_Gothic_Coding } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { logo, site } from "@/config";
import type { Language } from "@/lib/i18n/config";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/pretendard/PretendardVariable.woff2",
    },
  ],
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const nanumGothicCoding = Nanum_Gothic_Coding({
  weight: ["400", "700"],
  subsets: [],
  variable: "--font-mono",
  display: "swap",
});

const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

const [, type] = logo.light?.match(/^data:([^;]+)/) ?? [];
if (type) metadata.icons = { icon: { url: logo.light, type } } as Icons;

export { metadata };

export default async function RootLayout({ children, params }: LayoutProps<"/[lng]">) {
  const lng = (await params).lng as Language;

  return (
    <html lang={lng} dir={dir(lng)} className="scroll-pt-13 scroll-smooth" suppressHydrationWarning>
      <body className={`${pretendard.className} ${nanumGothicCoding.variable}`}>
        <ThemeProvider defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
