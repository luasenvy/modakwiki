"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavItems } from "@/hooks/use-nav";
import { Language } from "@/lib/i18n/config";

interface NavMenuProps {
  lng: Language;
}

export function SidebarNav({ lng: lngParam }: NavMenuProps) {
  const lng = lngParam ? `/${lngParam}` : "";
  const pathname = usePathname();

  const mainNavs = useNavItems((state) => state.mainNavs);
  const subNavs = useNavItems((state) => state.subNavs);

  return (
    <>
      {mainNavs.map((item) => (
        <SidebarGroup key={item.title}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {item.items?.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={`${lng}${item.url}` === pathname}
                    data-url={`${lng}${item.url}`}
                  >
                    <Link href={item.url}>
                      {item.icon && createElement(item.icon)}
                      <span>{item.title}</span>
                    </Link>
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
            {subNavs.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm" isActive={`${lng}${item.url}` === pathname}>
                  <Link href={item.url}>
                    {item.icon && createElement(item.icon)}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
