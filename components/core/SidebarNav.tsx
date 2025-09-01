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
import { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

interface NavMenuProps {
  lng: Language;
  scope?: number;
}

export function SidebarNav({ lng: lngParam, scope: userScope = 0 }: NavMenuProps) {
  const lng = localePrefix(lngParam);
  const pathname = usePathname();

  const mainNavs = useNavItems((state) => state.mainNavs);
  const subNavs = useNavItems((state) => state.subNavs);

  const scopedMainNavs = useMemo(
    () => mainNavs.filter(({ scope }) => (!scope ? true : scope <= userScope)),
    [mainNavs],
  );
  const scopedSubNavs = useMemo(
    () => subNavs.filter(({ scope }) => (!scope ? true : scope <= userScope)),
    [subNavs],
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
