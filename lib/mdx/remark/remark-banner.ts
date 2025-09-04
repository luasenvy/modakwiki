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
        name: "div",
        attributes: [
          { type: "mdxJsxAttribute", name: "component", value: "banner" },
          { type: "mdxJsxAttribute", name: "level", value: levels.length.toString() },
        ],
        children: node.children.reduce(
          (acc, child) => {
            if (child.type === "text") {
              const contents = child.value.match(/(?!!+)([^\n$]+)/gm) || [];

              return acc.concat(
                contents.map((content) => ({
                  type: "paragraph",
                  children: [{ type: "text", value: content.trim() }],
                })),
              );
            }

            return acc;
          },
          [] as (BlockContent | DefinitionContent)[],
        ),
      } satisfies BlockContent);
    });
  };
}
