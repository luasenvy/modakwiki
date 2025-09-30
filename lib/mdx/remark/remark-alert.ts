import {
  BlockContent,
  DefinitionContent,
  FootnoteDefinition,
  Paragraph,
  PhrasingContent,
  Root,
} from "mdast";
import type { Processor } from "unified";
import { visit } from "unist-util-visit";

export default function remarkBanner(this: Processor) {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!node.children?.length) return;

      const [first] = node.children;
      if (first.type !== "text" || !first.value.startsWith("!")) return;

      const [levels] = first.value.match(/^!{1,3}/)!;

      parent!.children.splice(index!, 1, {
        type: "mdxJsxFlowElement",
        name: "Alert",
        attributes: [{ type: "mdxJsxAttribute", name: "level", value: levels.length.toString() }],
        children: node.children.reduce(
          (acc, child) => {
            if (acc.length < 1) acc.push({ type: "paragraph", children: [] });

            console.info(child, "<<<");
            // Last paragraph
            const block = acc[acc.length - 1];
            if (child.type === "text") {
              const contents = (child.value.match(/(?!!{1,3})([^\n$]+)/gm) || []).join(" ");
              if (block.type === "paragraph")
                block.children.push({ type: "text", value: contents });
            } else if (
              child.type === "link" ||
              child.type === "emphasis" ||
              child.type === "strong" ||
              child.type === "image" ||
              // @ts-expect-error: type definition missing
              child.type === "superscript" ||
              // @ts-expect-error: type definition missing
              child.type === "subscript" ||
              child.type === "inlineCode"
            ) {
              if (block.type === "paragraph") block.children.push(child);
            } else if (child.type === "break") {
              if (block.type === "paragraph" && block.children.length > 1)
                block.children.push(child);
            }

            return acc;

            // if (["text"].includes(child.type)) {
            //   const contents = child.value.match(/(?!!+)([^\n$]+)/gm) || [];
            //   console.info(contents);
            //   const value = contents.join(" ").trim();

            //   if (acc.length > 0) {
            //     const prevParagraph: BlockContent | DefinitionContent = acc[acc.length - 1];
            //     if (prevParagraph.type === "paragraph") {
            //       return acc.toSpliced(acc.length - 1, 1, {
            //         ...prevParagraph,
            //         children: prevParagraph.children.concat({ type: "text", value }),
            //       });
            //     }

            //     return acc.concat({ type: "paragraph", children: [{ type: "text", value }] });
            //   } else {
            //     // 제목
            //     const [title, ...descriptions] = contents;
            //     return acc.concat([
            //       {
            //         type: "paragraph",
            //         children: [{ type: "text", value: title?.trim() || "" }],
            //       },
            //       {
            //         type: "paragraph",
            //         children: [{ type: "text", value: descriptions.join(" ").trim() }],
            //       },
            //     ]);
            //   }
            // }
            // return acc;
          },
          [] as (BlockContent | FootnoteDefinition)[],
        ),
      } as BlockContent);
    });
  };
}
