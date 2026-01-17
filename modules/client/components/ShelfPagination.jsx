import React from 'react';
import { Group, ActionIcon, Text } from '@mantine/core';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';

const ShelfPagination = ({
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    onFirstPage,
    onPrevPage,
    onNextPage,
    onLastPage,
    onItemsPerPageChange,
}) => {
    const offset = 1;

    return (
        <Group className="shelf-pagination">
            <ActionIcon
                onClick={onFirstPage}
                disabled={isLoading || currentPage <= 1}
            >
                <SkipBack />
            </ActionIcon>
            <ActionIcon
                onClick={onPrevPage}
                disabled={isLoading || currentPage <= 1}
            >
                <ChevronLeft />
            </ActionIcon>
            <Text c="white" mt="10">
                {currentPage}
            </Text>
            <ActionIcon
                onClick={onNextPage}
                disabled={isLoading || currentPage >= totalPages}
            >
                <ChevronRight />
            </ActionIcon>
            <ActionIcon
                onClick={onLastPage}
                disabled={isLoading || currentPage >= totalPages}
            >
                <SkipForward />
            </ActionIcon>
            <select
                value={itemsPerPage}
                onChange={onItemsPerPageChange}
                disabled={isLoading}
            >
                <option value={5}>5</option>
                <option value={10 + offset}>10</option>
                <option value={25}>25</option>
                <option value={50 + offset}>50</option>
                <option value={100 + offset}>100</option>
                <option value={250 + offset}>250</option>
            </select>
        </Group>
    );
};

export default ShelfPagination;
