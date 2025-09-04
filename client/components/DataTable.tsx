import React from 'react';
import {
    Box,
    Group,
    Pagination,
    Table,
    Text,
    type MantineBreakpoint,
} from '@mantine/core';

export type PageData<T> = {
    items: T[];
    currentPage: number;
    totalPages: number;
    total?: number;
    pageSize?: number;
};

export type Column<T> = {
    /** Header label/node */
    header: React.ReactNode;
    /** Render cell (preferred) */
    render?: (row: T) => React.ReactNode;
    /** Fallback accessor if you don’t provide render */
    accessor?: keyof T | ((row: T) => React.ReactNode);
    /** Optional header/cell width */
    width?: number | string;
    /** Show this column from breakpoint and up (hidden on smaller screens) */
    visibleFrom?: MantineBreakpoint; // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    /** Extra props for header/cell if you need them */
    thProps?: React.ComponentProps<typeof Table.Th>;
    tdProps?: React.ComponentProps<typeof Table.Td>;
};

export type DataTableProps<T> = {
    data?: PageData<T> | null;
    columns: Column<T>[];
    onPageChange?: (page: number) => void;

    /** Row key extractor; defaults to index */
    rowKey?: (row: T, index: number) => React.Key;
    /** Optional row click */
    onRowClick?: (row: T) => void;

    /** Text shown when items is empty */
    emptyText?: string;

    /** Table look-and-feel */
    highlightOnHover?: boolean;
    withTableBorder?: boolean;
    withColumnBorders?: boolean;

    /** Scroll/size */
    scrollMinWidth?: number | string;
    tableStyle?: React.CSSProperties;

    /** Top/bottom extra controls (e.g., page size selector) */
    topRight?: React.ReactNode;
    bottomRight?: React.ReactNode;
};

export function DataTable<T>({
    data,
    columns,
    onPageChange,
    rowKey,
    onRowClick,
    emptyText = 'No records',
    highlightOnHover = true,
    withTableBorder = true,
    withColumnBorders = true,
    scrollMinWidth = 340,
    tableStyle = { tableLayout: 'fixed', width: '100%' },
    topRight,
    bottomRight,
}: DataTableProps<T>) {
    const items = data?.items ?? [];
    const page = data?.currentPage ?? 1;
    const totalPages = data?.totalPages ?? 1;

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
                <Group gap="xs">
                    {topRight}
                    <Pagination
                        total={totalPages}
                        value={page}
                        onChange={onPageChange}
                        size="sm"
                        disabled={totalPages <= 1}
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

            {/* Bottom pager */}
            <Group justify="flex-end" mt="sm">
                <Group gap="xs">
                    {bottomRight}
                    <Pagination
                        total={totalPages}
                        value={page}
                        onChange={onPageChange}
                        size="sm"
                        disabled={totalPages <= 1}
                    />
                </Group>
            </Group>
        </Box>
    );
}
