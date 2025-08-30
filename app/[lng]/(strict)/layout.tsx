import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/core/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";

export default async function StrictLayout({ params, children }: LayoutProps<"/[lng]">) {
  const lngParam = (await params).lng;
  const lng = lngParam ? `/${lngParam}` : "";

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return redirect(`${lng}/signin`);

  return (
    <SidebarProvider>
      <AppSidebar lng={lngParam as Language} session={session} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
