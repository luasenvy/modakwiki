import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Children } from "react";
import { AppSidebar } from "@/components/core/AppSidebar";
import { ThemeToggler } from "@/components/core/ThemeToggler";
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
      <SidebarInset>
        <header className="sticky top-0 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>October 2024</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <ThemeToggler className="ml-auto" />
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
