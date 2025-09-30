import Link from "next/link";
import { Advertisement } from "@/components/core/button/Advertisement";
import { NavUser } from "@/components/core/NavUser";
import { SearchForm } from "@/components/core/SearchForm";
import { SidebarNav } from "@/components/core/SidebarNav";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { isDev, site } from "@/config";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lng: Language;
  session?: Session["user"];
}

export async function AppSidebar({ lng: lngParam, session, ...props }: AppSidebarProps) {
  const { t } = await useTranslation(lngParam);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser lng={lngParam} sitename={site.name} session={session} dev={isDev} />
        <SearchForm lng={lngParam} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav lng={lngParam} session={session} />
      </SidebarContent>

      <SidebarFooter className="space-y-2">
        <div>
          <SidebarFooterAddon />
        </div>

        <div className="space-y-2">
          <p className="text-center text-xs">
            &copy; 2025 {site.copyrights || new URL(site.baseurl).hostname} All rights reserved.
          </p>

          {isDev && (
            <div className="flex items-center justify-center">
              <Link href="/privacy" className="font-semibold text-blue-600 text-xs hover:underline">
                {t("Privacy Policy")}
              </Link>

              <Separator orientation="vertical" className="mx-2 w-px" />

              <Link href="/terms" className="text-blue-600 text-xs hover:underline">
                {t("Terms of Service")}
              </Link>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarFooterAddon() {
  return <Advertisement />;
}
