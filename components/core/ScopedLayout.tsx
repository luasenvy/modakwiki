import { forbidden, notFound } from "next/navigation";
import { AppSidebar } from "@/components/core/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { ScopeEnum } from "@/lib/schema/user";

interface ScopedLayoutProps extends React.PropsWithChildren {
  lng: Language;
  above: ScopeEnum;
  session?: Session["user"];
}

export async function ScopedLayout({ lng: lngParam, session, above, children }: ScopedLayoutProps) {
  if (!session) return notFound();
  if (session.scope < above) return forbidden();

  return (
    <SidebarProvider>
      <AppSidebar lng={lngParam as Language} session={session} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
