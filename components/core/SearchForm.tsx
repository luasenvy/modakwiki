import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";

interface SearchFormProps extends React.ComponentProps<"form"> {
  lng: Language;
}

export async function SearchForm({ lng: lngParam, ...props }: SearchFormProps) {
  const { t } = await useTranslation(lngParam);

  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput id="search" placeholder={t("Search the document")} className="pl-8" />
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-4 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
