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
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavItems } from "@/hooks/use-nav";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

interface NavMenuProps {
  lng: Language;
  session?: Session["user"];
}

export function SidebarNav({ lng: lngParam, session }: NavMenuProps) {
  const lng = localePrefix(lngParam);
  const { t } = useTranslation(lngParam);
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

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
      {scopedMainNavs.map((item) => {
        const hasChild = Number(item.items?.length) > 0;
        return (
          <SidebarGroup key={t(item.title)}>
            {hasChild && <SidebarGroupLabel>{t(item.title)}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {hasChild ? (
                  item.items?.map((item) => (
                    <SidebarMenuItem key={t(item.title)}>
                      <SidebarMenuButton
                        asChild
                        isActive={`${lng}${item.url}` === pathname}
                        data-url={`${lng}${item.url}`}
                      >
                        <Link href={`${lng}${item.url}`} onClick={() => setOpenMobile(false)}>
                          {item.icon && createElement(item.icon)}
                          <span>{t(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <SidebarMenuItem key={t(item.title)}>
                    <SidebarMenuButton asChild isActive={`${lng}${item.url}` === pathname}>
                      <Link href={`${lng}${item.url}`} onClick={() => setOpenMobile(false)}>
                        {item.icon && createElement(item.icon)}
                        <span>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}

      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            {scopedSubNavs.map((item) => (
              <SidebarMenuItem key={t(item.title)}>
                <SidebarMenuButton asChild size="sm" isActive={`${lng}${item.url}` === pathname}>
                  <Link href={`${lng}${item.url}`} onClick={() => setOpenMobile(false)}>
                    {item.icon && createElement(item.icon)}
                    <span>{t(item.title)}</span>
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
