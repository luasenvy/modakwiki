"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement, useMemo } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavItems } from "@/hooks/use-nav";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

interface NavMenuProps {
  lng: Language;
  session?: Session["user"];
}

export function SidebarNav({ lng: lngParam, session }: NavMenuProps) {
  const lng = localePrefix(lngParam);
  const pathname = usePathname();

  const mainNavs = useNavItems((state) => state.mainNavs);
  const subNavs = useNavItems((state) => state.subNavs);

  const userScope = session?.scope || 0;

  const scopedMainNavs = useMemo(
    () => mainNavs.filter(({ scope }) => (!scope ? true : scope <= userScope)),
    [mainNavs, userScope],
  );
  const scopedSubNavs = useMemo(
    () => subNavs.filter(({ scope }) => (!scope ? true : scope <= userScope)),
    [subNavs, userScope],
  );

  return (
    <>
      {scopedMainNavs.map((item) => (
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
            {scopedSubNavs.map((item) => (
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
