export default async function HistoryPage(ctx: PageProps<"/[lng]/[doctype]/history">) {
  const id = (await ctx.searchParams).id;
  return <div>History Page: {id}</div>;
}
