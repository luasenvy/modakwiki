import { NavUser } from "@/components/core/NavUser";
import { SearchForm } from "@/components/core/SearchForm";
import { SidebarNav } from "@/components/core/SidebarNav";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/config";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lng: Language;
  session: Session | null;
}

export function AppSidebar({ lng: lngParam, session, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavUser lng={lngParam} user={session?.user} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav lng={lngParam} />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-1">
          <SidebarFooterAddon />
        </div>

        <p className="py-4 text-center text-xs">
          &copy; 2025 {new URL(site.baseurl).hostname} All rights reserved.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SidebarFooterAddon() {
  return (
    <Skeleton className="w-full rounded-xl px-4 py-16">
      <p className="text-center text-muted-foreground text-sm">Advertisement</p>
    </Skeleton>
  );
}
