import React, { useState, useEffect, useRef, FC } from 'react';
import { getCollection, getRelease } from '../api';
import { Release, CollectionResponse } from '../interfaces'; // your local types

import {
    ChevronLeft,
    ChevronRight,
    SkipBack,
    SkipForward,
    List,
} from 'lucide-react';

// Mantine components
import { Container, Paper, Box, Group, ActionIcon, Text } from '@mantine/core';

function reorderRecords<T>(records: T[], selectedIndex: number): T[] {
    const n = records.length;
    if (n < 2) return records;

    const middleIndex = Math.floor((n - 1) / 2);
    const newArr = new Array<T>(n);

    newArr[middleIndex] = records[selectedIndex];

    // Fill to the right
    let newPos = middleIndex + 1;
    let oldPos = selectedIndex + 1;
    while (newPos < n) {
        newArr[newPos] = records[oldPos % n];
        newPos++;
        oldPos++;
    }

    // Fill to the left
    newPos = middleIndex - 1;
    oldPos = selectedIndex - 1;
    while (newPos >= 0) {
        newArr[newPos] = records[(oldPos + n) % n];
        newPos--;
        oldPos--;
    }

    return newArr;
}

const VinylShelf: FC = () => {
    const [records, setRecords] = useState<Release[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const offset = 1; // maintains odd number so records center in carousel

    // Items per page (limit)
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);

    // For “Go to Page” input
    const [goToPage, setGoToPage] = useState<string>('');

    // Reference to the shelf container so we can reset scrollLeft
    const shelfRef = useRef<HTMLDivElement>(null);

    // Fetch data from server whenever currentPage or itemsPerPage changes
    useEffect(() => {
        setRecords([]); // Clear existing while fetching
        getCollection({
            username: 'hubenschmidt',
            page: currentPage,
            limit: itemsPerPage,
        })
            .then((collection: CollectionResponse) => {
                setRecords(collection.releases || []);
                setTotalPages(collection.totalPages || 1);
            })
            .catch(error => console.error(error));
    }, [currentPage, itemsPerPage]);

    // Click a record => reorder so that record is center, then reset scroll
    const handleRecordClick = (record: Release, index: number) => {
        setRecords(prevRecords => {
            const reordered = reorderRecords(prevRecords, index);
            if (shelfRef.current) {
                shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
            return reordered;
        });

        getRelease(record.Release_Id)
            .then(release => console.log(release))
            .catch(error => console.log(error));
    };

    // LOCAL "SHELF" PAGING
    const handleShelfPrev = () => {
        setRecords(prev => {
            if (prev.length < 2) return prev;
            const n = prev.length;
            const mid = Math.floor((n - 1) / 2);
            const newIndex = (mid - 1 + n) % n;
            const reordered = reorderRecords(prev, newIndex);
            if (shelfRef.current) {
                shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
            return reordered;
        });
    };

    const handleShelfNext = () => {
        setRecords(prev => {
            if (prev.length < 2) return prev;
            const n = prev.length;
            const mid = Math.floor((n - 1) / 2);
            const newIndex = (mid + 1) % n;
            const reordered = reorderRecords(prev, newIndex);
            if (shelfRef.current) {
                shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
            return reordered;
        });
    };

    // SERVER PAGING CONTROLS
    const handleFirstPage = () => setCurrentPage(1);
    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () =>
        setCurrentPage(p => Math.min(totalPages, p + 1));
    const handleLastPage = () => setCurrentPage(totalPages);

    // “Go to Page”
    const handleGoToPage = () => {
        if (!goToPage) return;
        let target = parseInt(goToPage, 10);
        if (isNaN(target)) return;
        if (target < 1) target = 1;
        if (target > totalPages) target = totalPages;
        setCurrentPage(target);
        setGoToPage('');
    };

    // Items Per Page
    const handleItemsPerPageChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const newLimit = parseInt(e.target.value, 10);
        setItemsPerPage(newLimit);
        setCurrentPage(1);
    };

    return (
        <Container className="vinyl-shelf-container">
            <Paper shadow="sm" p="md" withBorder>
                {/* Local Shelf Paging Buttons */}
                <Group className="shelf-pagination" mb="md">
                    <ActionIcon
                        onClick={handleShelfPrev}
                        disabled={records.length < 2}
                    >
                        <ChevronLeft size={16} />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handleShelfNext}
                        disabled={records.length < 2}
                    >
                        <ChevronRight size={16} />
                    </ActionIcon>
                </Group>

                {/* The shelf itself, with ref */}
                <div className="vinyl-shelf" ref={shelfRef}>
                    {records.map((record, i) => {
                        const n = records.length;
                        let angle = 0;
                        if (n > 1) {
                            angle = -90 + 180 * (i / (n - 1));
                        }

                        return (
                            <Box
                                key={record.Release_Id}
                                className="vinyl-record"
                                style={{
                                    transform: `rotateY(${angle.toFixed(
                                        2,
                                    )}deg)`,
                                }}
                                onClick={() => handleRecordClick(record, i)}
                            >
                                <Box
                                    className="record-cover"
                                    style={{
                                        backgroundImage: `url(${
                                            record.Thumb || '/default-img.jpg'
                                        })`,
                                    }}
                                />
                                <Text className="record-title">
                                    {record.Title}
                                </Text>
                            </Box>
                        );
                    })}
                </div>

                {/* Server Pagination Controls */}
                <Group className="shelf-pagination">
                    <ActionIcon
                        onClick={handleFirstPage}
                        disabled={currentPage <= 1}
                    >
                        <SkipBack size={16} />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft size={16} />
                    </ActionIcon>
                    <Text>
                        {currentPage} of {totalPages}
                    </Text>
                    <ActionIcon
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight size={16} />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handleLastPage}
                        disabled={currentPage >= totalPages}
                    >
                        <SkipForward size={16} />
                    </ActionIcon>
                </Group>

                {/* Items Per Page */}
                <Group className="shelf-pagination">
                    <List size={16} />
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10 + offset}>10</option>
                        <option value={25}>25</option>
                        <option value={50 + offset}>50</option>
                    </select>
                </Group>
            </Paper>
        </Container>
    );
};

export default VinylShelf;
