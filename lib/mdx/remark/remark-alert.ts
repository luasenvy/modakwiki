import { BlockContent, DefinitionContent, Root } from "mdast";
import type { Processor } from "unified";
import { visit } from "unist-util-visit";

export default function remarkBanner(this: Processor) {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!node.children?.length) return;

      const [first] = node.children;
      if (first.type !== "text" || !first.value.startsWith("!")) return;

      const [levels] = first.value.match(/^!+/)!;
      parent!.children.splice(index!, 1, {
        type: "mdxJsxFlowElement",
        name: "Alert",
        attributes: [{ type: "mdxJsxAttribute", name: "level", value: levels.length.toString() }],
        children: node.children.reduce(
          (acc, child) => {
            if (child.type === "text") {
              const contents = child.value.match(/(?!!+)([^\n$]+)/gm) || [];
              const value = contents.join(" ").trim();

              if (acc.length > 0) {
                const prevParagraph: BlockContent | DefinitionContent = acc[acc.length - 1];
                if (prevParagraph.type === "paragraph") {
                  return acc.toSpliced(acc.length - 1, 1, {
                    ...prevParagraph,
                    children: prevParagraph.children.concat({ type: "text", value }),
                  });
                }

                return acc.concat({ type: "paragraph", children: [{ type: "text", value }] });
              } else {
                // 제목
                const [title, ...descriptions] = contents;
                return acc.concat([
                  {
                    type: "paragraph",
                    children: [{ type: "text", value: title?.trim() || "" }],
                  },
                  {
                    type: "paragraph",
                    children: [{ type: "text", value: descriptions.join(" ").trim() }],
                  },
                ]);
              }
            }

            return acc;
          },
          [] as (BlockContent | DefinitionContent)[],
        ),
      } satisfies BlockContent);
    });
  };
}
