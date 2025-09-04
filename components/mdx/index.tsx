import { Children } from "react";
import { Components } from "react-markdown";
import { Alert } from "@/components/mdx/Alert";
import { AutoLink } from "@/components/mdx/AutoLink";
// import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
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
  // img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  //   return (
  //     <ImageZoom>
  //       <img {...props} loading="lazy" />
  //     </ImageZoom>
  //   );
  // },
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
  // Render Banner when a div has component="banner"
  div: ({ children, ...props }: React.ComponentProps<"div">) => {
    const { component, level, ...domProps } = props as React.ComponentProps<"div"> & {
      component?: string;
      level?: number;
    };

    if (component === "banner")
      return (
        <Alert level={Number(level)} {...domProps}>
          {children}
        </Alert>
      );

    return <div {...domProps}>{children}</div>;
  },
} satisfies Components;
