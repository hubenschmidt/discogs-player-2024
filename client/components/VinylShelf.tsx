import React, { useState, useEffect, useContext, useRef, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../interfaces';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Box, Group, ActionIcon, Text } from '@mantine/core';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { SearchContext } from '../context/searchContext';
import TrackDetail from './TrackDetail';

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
    const { userState } = useContext(UserContext);
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { items, totalPages } = collectionState;
    const { dispatchDiscogsRelease, discogsReleaseState } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedRelease, selectedDiscogsRelease, previewRelease } =
        discogsReleaseState;
    const { searchState } = useContext(SearchContext);
    const { searchSelection } = searchState;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const offset = 1; // maintains odd number so records center in carousel
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);
    const shelfRef = useRef<HTMLDivElement>(null);
    const bearerToken = useBearerToken();

    useEffect(() => {
        const params: any = {
            username: userState.username,
            page: currentPage,
            limit: itemsPerPage,
            ...(searchSelection?.Artist_Id && {
                artistId: searchSelection.Artist_Id,
            }),
            ...(searchSelection?.Label_Id && {
                labelId: searchSelection.Label_Id,
            }),
            ...(searchSelection?.Release_Id && {
                releaseId: searchSelection.Release_Id,
            }),
        };

        getCollection(params, bearerToken)
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
    }, [currentPage, itemsPerPage, searchSelection]);

    const handleRecordClick = (release: Release, index: number) => {
        const reorderedReleases = reorderReleases(items, index);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { releases: reorderedReleases },
        });

        if (shelfRef.current) {
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }

        if (!selectedRelease) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_RELEASE',
                payload: release,
            });
            return;
        }

        // else if release is already playing, set preview
        dispatchDiscogsRelease({
            type: 'SET_PREVIEW_RELEASE',
            payload: release,
        });
    };

    const handleShelfPrev = () => {
        if (items.length < 2) return;
        const n = items.length;
        const mid = Math.floor((n - 1) / 2);
        const newIndex = (mid - 1 + n) % n;
        const reorderedReleases = reorderReleases(items, newIndex);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { items: reorderedReleases },
        });
        if (shelfRef.current) {
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const handleShelfNext = () => {
        if (items.length < 2) return;
        const n = items.length;
        const mid = Math.floor((n - 1) / 2);
        const newIndex = (mid + 1) % n;
        const reorderedReleases = reorderReleases(items, newIndex);
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
        <div className="vinyl-shelf-container">
            <TrackDetail selectedDiscogsRelease={selectedDiscogsRelease} />
            <div className="vinyl-shelf" ref={shelfRef}>
                {items?.map((release, i) => {
                    const n = items?.length;
                    let angle = 0;
                    if (n > 1) {
                        angle = -90 + 180 * (i / (n - 1));
                    }
                    const isSelected =
                        selectedRelease?.Release_Id === release.Release_Id;

                    // preview highlight only if preview exists AND it's not the same as selected
                    const isPreview =
                        previewRelease &&
                        previewRelease.Release_Id === release.Release_Id &&
                        previewRelease.Release_Id !==
                            selectedRelease?.Release_Id;

                    return (
                        <Box
                            key={release.Release_Id}
                            className="vinyl-record"
                            onClick={() => handleRecordClick(release, i)}
                        >
                            <Box
                                className={`record-cover ${
                                    isSelected ? 'selected-record-cover' : ''
                                } ${isPreview ? 'preview-record-cover' : ''}`}
                                style={{
                                    backgroundImage: `url(${release.Thumb})`,
                                }}
                            />
                            <Text className="record-title">
                                {release.Title}
                            </Text>
                        </Box>
                    );
                })}
            </div>
            <div className="shelf-controls">
                <ActionIcon
                    onClick={handleShelfPrev}
                    disabled={items?.length < 2}
                >
                    <ChevronLeft />
                </ActionIcon>
                <ActionIcon
                    onClick={handleShelfNext}
                    disabled={items?.length < 2}
                >
                    <ChevronRight />
                </ActionIcon>
            </div>
            {/* Server Pagination Controls */}
            {items?.length > 1 && (
                <Group className="shelf-pagination">
                    <ActionIcon
                        onClick={handleFirstPage}
                        disabled={currentPage <= 1}
                    >
                        <SkipBack />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handlePrevPage}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft />
                    </ActionIcon>
                    <Text c={'white'}>{currentPage}</Text>
                    <ActionIcon
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight />
                    </ActionIcon>
                    <ActionIcon
                        onClick={handleLastPage}
                        disabled={currentPage >= totalPages}
                    >
                        <SkipForward />
                    </ActionIcon>
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
            )}
        </div>
    );
};

export default VinylShelf;
