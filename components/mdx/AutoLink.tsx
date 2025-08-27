import { ExternalLink } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

type AutoLinkProps = React.HTMLAttributes<HTMLAnchorElement> &
  LinkProps & {
    icon?: boolean;
  };

export function AutoLink({ href, children, className, icon = true, ...props }: AutoLinkProps) {
  const isExternal = /^(https?:)?\/\//.test(href as string);

  return (
    <Link
      {...props}
      href={href}
      className={cn(className, "group text-blue-500 no-underline hover:underline")}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {icon && isExternal && <ExternalLink className="inline size-3" />}
    </Link>
  );
}
