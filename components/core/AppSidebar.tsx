import { NavUser } from "@/components/core/NavUser";
import { SearchForm } from "@/components/core/SearchForm";
import { SidebarNav } from "@/components/core/SidebarNav";
import { RollingText } from "@/components/ui/shadcn-io/rolling-text";
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
        <SearchForm lng={lngParam} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav lng={lngParam} scope={session?.user.scope} />
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
    <a href="mailto:luas.envy@gmail.com" target="_blank" rel="noopener noreferrer">
      <Skeleton className="hover:animation-duration-[0s] flex w-full cursor-pointer rounded-xl border px-4 py-12 shadow-sm">
        <RollingText
          text="Advertisement"
          className="mx-auto"
          inViewOnce={false}
          transition={{
            duration: 0.6,
            delay: 0.08,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 30,
          }}
        />
      </Skeleton>
    </a>
  );
}
