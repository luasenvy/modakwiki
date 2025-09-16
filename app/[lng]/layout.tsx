import "@/styles/style.css";

import { dir } from "i18next";

import type { Metadata } from "next";
import { Icons } from "next/dist/lib/metadata/types/metadata-types";
import { Inter, Nanum_Gothic_Coding, Ubuntu_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { logo, site } from "@/config";
import type { Language } from "@/lib/i18n/config";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const pretendard = localFont({
  src: [{ path: "../../public/fonts/pretendard/PretendardVariable.woff2" }],
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const ubuntuMono = Ubuntu_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ubuntu-mono",
});

const nanumGothicCoding = Nanum_Gothic_Coding({
  weight: ["400", "700"],
  preload: false,
  variable: "--font-nanum-gothic-coding",
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
    <html
      lang={lng}
      dir={dir(lng)}
      className={`${inter.variable} ${pretendard.variable} ${nanumGothicCoding.variable} ${ubuntuMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
