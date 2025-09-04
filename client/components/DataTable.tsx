import React from 'react';
import {
    Box,
    Group,
    Pagination,
    Table,
    Text,
    Select,
    type MantineBreakpoint,
} from '@mantine/core';

export type DataTableProps<T> = {
    data?: PageData<T> | null;
    columns: Column<T>[];

    // paging
    onPageChange?: (page: number) => void;
    pageValue?: number; // optional: requested/controlled page
    onPageSizeChange?: (size: number) => void;
    pageSizeValue?: number; // requested/controlled page size
    pageSizeOptions?: number[]; // defaults below

    // rows
    rowKey?: (row: T, index: number) => React.Key;
    onRowClick?: (row: T) => void;

    // UI
    emptyText?: string;
    highlightOnHover?: boolean;
    withTableBorder?: boolean;
    withColumnBorders?: boolean;
    scrollMinWidth?: number | string;
    tableStyle?: React.CSSProperties;
    topRight?: React.ReactNode;
    bottomRight?: React.ReactNode;
};

export type PageData<T> = {
    items: T[];
    currentPage: number;
    totalPages: number;
    total?: number;
    pageSize?: number;
};

export type Column<T> = {
    header: React.ReactNode;
    render?: (row: T) => React.ReactNode;
    accessor?: keyof T | ((row: T) => React.ReactNode);
    width?: number | string;
    visibleFrom?: MantineBreakpoint;
    thProps?: React.ComponentProps<typeof Table.Th>;
    tdProps?: React.ComponentProps<typeof Table.Td>;
};

export const DataTable = <T,>({
    data,
    columns,
    onPageChange,
    pageValue,
    onPageSizeChange,
    pageSizeValue,
    pageSizeOptions = [5, 10, 20, 25, 50, 100],

    rowKey,
    onRowClick,

    emptyText = 'No records',
    highlightOnHover = true,
    withTableBorder = true,
    withColumnBorders = true,
    scrollMinWidth = 340,
    tableStyle = {
        tableLayout: 'fixed',
        width: '100%',
        ['--table-hover-color' as any]: 'rgba(73, 80, 87, 0.6)',
    },
    topRight,
    bottomRight,
}: DataTableProps<T>) => {
    const items = data?.items ?? [];
    const page = data?.currentPage ?? 1;
    const totalPages = Math.max(data?.totalPages ?? 1, 1);
    const effectivePage = Math.min(pageValue ?? page, totalPages);

    const sizeFromData = data?.pageSize ?? items.length;
    const effectivePageSize =
        pageSizeValue ?? sizeFromData ?? pageSizeOptions[0];

    const getCellContent = (col: Column<T>, row: T) => {
        if (col.render) return col.render(row);
        if (typeof col.accessor === 'function') return col.accessor(row);
        if (typeof col.accessor === 'string') {
            const v = (row as any)[col.accessor];
            return v ?? '—';
        }
        return '—';
    };

    return (
        <Box>
            {/* Top summary + pager */}
            <Group justify="space-between" mb="xs">
                <Text c="dimmed" size="sm">
                    {items.length
                        ? `Showing ${items.length} item(s)`
                        : emptyText}
                </Text>

                <Group gap="xs" align="center">
                    {onPageSizeChange && (
                        <Group gap={6} align="center">
                            <Select
                                size="sm"
                                aria-label="Rows per page"
                                value={String(effectivePageSize)}
                                onChange={val => {
                                    if (val)
                                        onPageSizeChange?.(parseInt(val, 10));
                                }}
                                w={60}
                                data={pageSizeOptions.map(n => ({
                                    value: String(n),
                                    label: String(n),
                                }))}
                                classNames={{
                                    input: 'pg-select-input',
                                    dropdown: 'pg-select-dropdown',
                                    option: 'pg-select-option',
                                }}
                            />
                        </Group>
                    )}
                    {topRight}
                    <Pagination
                        total={totalPages}
                        value={effectivePage}
                        onChange={next => onPageChange?.(next)}
                        withControls
                        withEdges
                        size="sm"
                        radius="md"
                        classNames={{ control: 'pg-control' }} // you already style these
                    />
                </Group>
            </Group>

            <Table.ScrollContainer mt="xs" minWidth={scrollMinWidth}>
                <Table
                    highlightOnHover={highlightOnHover}
                    withTableBorder={withTableBorder}
                    withColumnBorders={withColumnBorders}
                    style={tableStyle}
                >
                    <Table.Thead>
                        <Table.Tr>
                            {columns.map((col, i) => (
                                <Table.Th
                                    key={i}
                                    visibleFrom={col.visibleFrom}
                                    style={{ width: col.width }}
                                    {...col.thProps}
                                >
                                    {col.header}
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {items.map((row, idx) => {
                            const key = rowKey ? rowKey(row, idx) : idx;
                            const clickable = !!onRowClick;

                            return (
                                <Table.Tr
                                    key={key}
                                    onClick={
                                        clickable
                                            ? () => onRowClick!(row)
                                            : undefined
                                    }
                                    style={
                                        clickable
                                            ? { cursor: 'pointer' }
                                            : undefined
                                    }
                                >
                                    {columns.map((col, ci) => (
                                        <Table.Td
                                            key={ci}
                                            visibleFrom={col.visibleFrom}
                                            {...col.tdProps}
                                        >
                                            {getCellContent(col, row)}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            );
                        })}

                        {items.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Text c="dimmed" ta="center">
                                        {emptyText}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            {/* Bottom area (optional) */}
            {bottomRight && (
                <Group justify="flex-end" mt="sm">
                    {bottomRight}
                </Group>
            )}
        </Box>
    );
};
