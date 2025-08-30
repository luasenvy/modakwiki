import { headers } from "next/headers";
import { AppSidebar } from "@/components/core/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";

export default async function DefaultLayout({ params, children }: LayoutProps<"/[lng]">) {
  const lngParam = (await params).lng;
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <SidebarProvider className="max-w-screen">
      <AppSidebar lng={lngParam as Language} session={session} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
