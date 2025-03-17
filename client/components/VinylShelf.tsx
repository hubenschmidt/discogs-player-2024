import React, { useState, useEffect, useContext, useRef, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../interfaces';
import {
    ChevronLeft,
    ChevronRight,
    SkipBack,
    SkipForward,
    List,
} from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { ReleaseContext } from '../context/releaseContext';
import { Container, Paper, Box, Group, ActionIcon, Text } from '@mantine/core';

const reorderReleases = (
    records: Release[],
    selectedIndex: number,
): Release[] => {
    const n = records.length;
    if (n < 2) return records;
    const middleIndex = Math.floor((n - 1) / 2);
    const newArr = new Array<Release>(n);
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
};

const VinylShelf: FC = () => {
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { releases, totalPages } = collectionState;
    const { dispatchRelease, releaseState } = useContext(ReleaseContext);
    const { selectedRelease } = releaseState;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const offset = 1; // maintains odd number so records center in carousel
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);
    const shelfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getCollection({
            username: 'hubenschmidt',
            page: currentPage,
            limit: itemsPerPage,
        })
            .then((collection: CollectionResponse) => {
                dispatchCollection({
                    type: 'SET_COLLECTION',
                    payload: collection,
                });
            })
            .catch(error =>
                console.error(
                    'something went wrong with fetching collection,',
                    error.response,
                ),
            );
    }, [currentPage, itemsPerPage]);

    const handleRecordClick = (release: Release, index: number) => {
        const reorderedReleases = reorderReleases(releases, index);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { releases: reorderedReleases },
        });
        dispatchRelease({
            type: 'SET_SELECTED_RELEASE',
            payload: release,
        });

        if (shelfRef.current) {
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleShelfPrev = () => {
        if (releases.length < 2) return;
        const n = releases.length;
        const mid = Math.floor((n - 1) / 2);
        const newIndex = (mid - 1 + n) % n;
        const reorderedReleases = reorderReleases(releases, newIndex);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { releases: reorderedReleases },
        });
        if (shelfRef.current) {
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleShelfNext = () => {
        if (releases.length < 2) return;
        const n = releases.length;
        const mid = Math.floor((n - 1) / 2);
        const newIndex = (mid + 1) % n;
        const reorderedReleases = reorderReleases(releases, newIndex);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { releases: reorderedReleases },
        });
        if (shelfRef.current) {
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleFirstPage = () => setCurrentPage(1);
    const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const handleNextPage = () =>
        setCurrentPage(p => Math.min(totalPages, p + 1));
    const handleLastPage = () => setCurrentPage(totalPages);

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
                        disabled={releases?.length < 2}
                    >
                        <ChevronLeft size={16} />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handleShelfNext}
                        disabled={releases?.length < 2}
                    >
                        <ChevronRight size={16} />
                    </ActionIcon>
                </Group>

                {/* The shelf itself, with ref */}
                <div className="vinyl-shelf" ref={shelfRef}>
                    {releases?.map((release, i) => {
                        const n = releases?.length;
                        let angle = 0;
                        if (n > 1) {
                            angle = -90 + 180 * (i / (n - 1));
                        }
                        const isSelected =
                            selectedRelease?.Release_Id === release.Release_Id;
                        return (
                            <Box
                                key={release.Release_Id}
                                className="vinyl-record"
                                style={{
                                    transform: `rotateY(${angle.toFixed(
                                        2,
                                    )}deg)`,
                                }}
                                onClick={() => handleRecordClick(release, i)}
                            >
                                <Box
                                    className={`record-cover ${
                                        isSelected
                                            ? 'selected-record-cover'
                                            : ''
                                    }`}
                                    style={{
                                        backgroundImage: `url(${
                                            release.Thumb || '/default-img.jpg'
                                        })`,
                                    }}
                                />
                                <Text className="record-title">
                                    {release.Title}
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
                        <option value={100 + offset}>100</option>
                        <option value={250 + offset}>250</option>
                    </select>
                </Group>
            </Paper>
        </Container>
    );
};

export default VinylShelf;
