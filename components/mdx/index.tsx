import { MDXComponents } from "mdx/types";
import { Children } from "react";
import { Alert } from "@/components/mdx/Alert";
import { AutoLink } from "@/components/mdx/AutoLink";
import { Image as MdxImage } from "@/components/mdx/Image";
import { Youtube } from "@/components/mdx/Youtube";
import { cn } from "@/lib/utils";

export default {
  a: AutoLink,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) =>
    Children.toArray(props.children).some((child) =>
      // @ts-expect-error: i18next conflicts
      Boolean(child.props?.src),
    ) ? (
      props.children
    ) : (
      <p {...props} />
    ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <MdxImage {...props} />;
  },
  sub: ({ children, ...props }: React.DelHTMLAttributes<HTMLElement>) => {
    return <sub {...props}>({children})</sub>;
  },
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
      <div className="mb-[1.25em] max-h-[calc(var(--spacing)_*_100)] overflow-auto rounded-none border">
        <table
          className={cn(
            "[&>thead>tr>th]:pt-2",
            "[&>thead>tr>th:first-child]:pl-2",
            "[&>thead>tr>th:last-child]:pr-2",
            "[&>tbody>tr>td:first-child]:pl-2",
            "[&>tbody>tr>td:last-child]:pr-2",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
  Alert,
  Youtube,
} satisfies MDXComponents;
