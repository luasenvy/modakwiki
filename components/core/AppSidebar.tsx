import { Inbox } from "lucide-react";
import Link from "next/link";
import { NavUser } from "@/components/core/NavUser";
import { SearchForm } from "@/components/core/SearchForm";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/config";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "모닥위키",
          url: "/what-is-this",
        },
      ],
    },
    {
      title: "문서",
      url: "#",
      items: [
        {
          title: "임의문서",
          url: "#",
        },
        {
          title: "변경내역",
          url: "#",
        },
      ],
    },
    {
      title: "에디터",
      url: "#",
      items: [
        {
          title: "위키문법",
          url: "/editors/syntax",
        },
        {
          title: "작성요령",
          url: "/editors/tip",
        },
      ],
    },
  ],
  navSub: [
    {
      title: "내 문서",
      url: "#",
      icon: Inbox,
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.webp",
  },
};

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
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSub.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
