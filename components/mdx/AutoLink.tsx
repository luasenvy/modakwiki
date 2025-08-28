import { ExternalLink } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { ExtraProps } from "react-markdown";
import { UrlObject } from "url";
import { cn } from "@/lib/utils";

type AutoLinkProps = React.ClassAttributes<HTMLAnchorElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps &
  Omit<LinkProps, "href"> & {
    icon?: boolean;
    href?: string;
  };

export function AutoLink({ href, children, className, icon = true, ...props }: AutoLinkProps) {
  const isExternal = /^(https?:)?\/\//.test(href as string);

  return (
    <Link
      {...props}
      // Avoid Nextjs Type
      href={href as string | UrlObject}
      className={cn(className, "group text-blue-500 no-underline hover:underline")}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {icon && isExternal && <ExternalLink className="inline size-3" />}
    </Link>
  );
}
