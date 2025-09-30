import { Toaster } from "sonner";

export default async function DefaultLayout({ children }: LayoutProps<"/[lng]">) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
