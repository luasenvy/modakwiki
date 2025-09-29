"use client";

import { ChevronsUpDown, LogIn, LogOut, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Session, signOut } from "@/lib/auth/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";
import Logo from "@/public/brand/32x32.webp";

interface NavUserProps {
  lng: Language;
  sitename: string;
  dev?: boolean;
  session?: Session["user"];
}

export function NavUser({ lng: lngParam, sitename, session, dev }: NavUserProps) {
  const lng = localePrefix(lngParam);

  const { isMobile } = useSidebar();
  const router = useRouter();

  const { t } = useTranslation(lngParam);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <AvatarProfile
                  profile={
                    {
                      name: session.name,
                      image: session.image,
                      email: session.email,
                      emailVerified: session.emailVerified,
                    } as User
                  }
                  size="lg"
                  flatten
                />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`${lng}/me`}>
                    <UserIcon /> {t("My Account")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={async () => {
                  await signOut();
                  router.refresh();
                }}
              >
                <LogOut />
                {t("Log out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton size="lg" asChild>
            {dev ? (
              <Link href={`${lng}/signin`}>
                <LogIn />
                {t("Sign In")}
              </Link>
            ) : (
              <Link href={`${lng}/`}>
                <Image src={Logo} alt={t(sitename)} className="size-[32px]" />
                {t(sitename)}
              </Link>
            )}
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
