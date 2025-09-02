import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { AppSidebar } from "@/components/core/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth, Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { ScopeEnum } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

interface ScopedLayoutProps extends React.PropsWithChildren {
  lng: Language;
  session: Session;
  above: ScopeEnum;
}

export async function ScopedLayout({ lng: lngParam, session, above, children }: ScopedLayoutProps) {
  if (session.user.scope < above) return forbidden();

  return (
    <SidebarProvider>
      <AppSidebar lng={lngParam as Language} session={session} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
