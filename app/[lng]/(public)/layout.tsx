import { headers } from "next/headers";
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

export default async function DefaultLayout({ params, children }: LayoutProps<"/[lng]">) {
  const lngParam = (await params).lng;
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <SidebarProvider className="max-w-screen">
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

        <div className="flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full scroll-pt-8 overflow-auto xl:justify-center">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
