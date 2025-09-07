import { Toaster } from "sonner";

export default async function DefaultLayout({ params, children }: LayoutProps<"/[lng]">) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
