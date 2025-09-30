"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ColumnDef,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/ui/shadcn-io/table";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { scopeEnum, User } from "@/lib/schema/user";

const columns: Array<ColumnDef<User>> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => {
      if (row.original.scope === scopeEnum.sysop) return null;

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "name", header: "이름" },
  { accessorKey: "email", header: "이메일" },
  {
    accessorKey: "emailVerified",
    header: "이메일 검증",
    cell: ({ row }) => {
      if (row.original.scope === scopeEnum.sysop) return null;

      return <Checkbox checked={row.original.emailVerified} disabled aria-label="email verified" />;
    },
  },
];

interface UserTableProps {
  lng: Language;
  rows: Array<User>;
}

export function UserTable({ lng: lngParam, rows }: UserTableProps) {
  const { t } = useTranslation(lngParam);

  const handleChangeScope = (id: string, scope: string) => {
    console.info(id, scope, "changed");
  };

  const scopeColumns: Array<ColumnDef<User>> = [
    {
      accessorKey: "scope",
      header: "권한",
      cell: ({ row }) => {
        t(
          `scope.${Object.entries(scopeEnum).find(([, scope]) => scope === row.original.scope)?.[0] || "guest"}`,
        );

        return row.original.scope >= scopeEnum.sysop ? (
          t("scope.sysop")
        ) : (
          <Select
            defaultValue={String(row.original.scope)}
            onValueChange={(scope: string) => handleChangeScope(row.original.id, scope)}
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder={t("Select a scope")} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(scopeEnum).map(([key, value]) => (
                <SelectItem key={value} value={String(value)}>
                  {t(`scope.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  return (
    <TableProvider columns={columns.concat(scopeColumns)} data={rows}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
            {({ header }) => <TableHead header={header} key={header.id} />}
          </TableHeaderGroup>
        )}
      </TableHeader>
      <TableBody>
        {({ row }) => (
          <TableRow key={row.id} row={row}>
            {({ cell }) => <TableCell cell={cell} key={cell.id} />}
          </TableRow>
        )}
      </TableBody>
    </TableProvider>
  );
}
