"use client";

import { Checkbox } from "@/components/ui/checkbox";
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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "name", header: "이름" },
  { accessorKey: "email", header: "이메일" },
  {
    accessorKey: "emailVerified",
    header: "이메일 검증",
    cell: ({ row }) => (
      <Checkbox checked={row.original.emailVerified} disabled aria-label="email verified" />
    ),
  },
];

interface UserTableProps {
  rows: Array<User>;
}

export function UserTable({ rows }: UserTableProps) {
  const { t } = useTranslation();
  const scopeColumns: Array<ColumnDef<User>> = [
    {
      accessorKey: "scope",
      header: "권한",
      cell: ({ row }) =>
        t(
          `scope.${Object.entries(scopeEnum).find(([, scope]) => scope === row.original.scope)?.[0] || "guest"}`,
        ),
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
