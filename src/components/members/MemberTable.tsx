'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel
} from '@tanstack/react-table';
import { QRCodeGenerator } from './QRCodeGenerator';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { Member } from '@/lib/types';
import Link from 'next/link';
import { EnrichedMember } from '@/utils/types/supabase';

interface MemberTableProps {
  data: EnrichedMember[];
}


export function MemberTable({ data }: MemberTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nom',
      cell: ({ row }) => (
        <Link 
          href={`/members/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue('full_name')}
        </Link>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'subscription_status',
      header: 'Statut',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.getValue('subscription_status') === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.getValue('subscription_status')}
        </span>
      )
    },
    {
      id: 'qr_code',
      header: 'Badge',
      cell: ({ row }) => (
        <QRCodeGenerator 
          value={row.original.qr_code} 
          size={80}
          className="mx-auto"
        />
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun membre trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}