import React, { useState, useEffect, useContext, useRef, FC } from 'react';
import { getCollection, getPlaylist } from '../api';
import { Release, CollectionResponse } from '../interfaces';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Box, Group, ActionIcon, Text, Loader } from '@mantine/core'; // ⬅️ Loader
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { SearchContext } from '../context/searchContext';
import TrackDetail from './TrackDetail';
import { NavContext } from '../context/navContext';
import { reorderReleases } from '../lib/reorder-releases';
import { PlaylistContext } from '../context/playlistContext';

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
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { navState, dispatchNav } = useContext(NavContext);
    const { playlistOpen } = navState;
    const { searchSelection } = searchState;

    const [currentPage, setCurrentPage] = useState<number>(1);
    const offset = 1; // keeps odd # so center is a single record
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);
    const shelfRef = useRef<HTMLDivElement>(null);
    const bearerToken = useBearerToken();

    // ⬇️ NEW loading flags
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingCenter, setLoadingCenter] = useState(false);
    const isLoading = loadingFetch || loadingCenter;

    const MIN_SPINNER_MS = 300;
    const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const centerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = (
        r: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
    ) => {
        if (r.current) {
            clearTimeout(r.current);
            r.current = null;
        }
    };

    // ---- fetch collection when not viewing a playlist
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

        if (!playlistOpen) {
            setLoadingFetch(true);
            const started = Date.now();
            let aborted = false;

            getCollection(params, bearerToken)
                .then((collection: CollectionResponse) => {
                    dispatchCollection({
                        type: 'SET_COLLECTION',
                        payload: collection,
                    });
                })
                .catch(error => {
                    console.error(
                        'something went wrong with fetching collection,',
                        error?.response || error,
                    );
                })
                .finally(() => {
                    if (aborted) return;
                    const elapsed = Date.now() - started;
                    const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
                    clearTimer(fetchTimerRef);
                    fetchTimerRef.current = setTimeout(() => {
                        setLoadingFetch(false);
                        fetchTimerRef.current = null;
                    }, remain);
                });

            return () => {
                aborted = true;
                clearTimer(fetchTimerRef);
            };
        }
    }, [
        currentPage,
        itemsPerPage,
        searchSelection,
        playlistOpen,
        bearerToken,
        userState.username,
        dispatchCollection,
    ]);

    // ---- fetch playlist when playlist is open
    useEffect(() => {
        if (playlistOpen) {
            setLoadingFetch(true);
            const started = Date.now();
            let aborted = false;

            getPlaylist(
                userState.username,
                bearerToken,
                playlistState.activePlaylistId,
                {
                    page: playlistState.playlistVideosPage,
                    limit: playlistState.playlistVideosLimit,
                },
            )
                .then(res => {
                    if (aborted) return;
                    dispatchPlaylist({
                        type: 'SET_ACTIVE_PLAYLIST_ID',
                        payload: res.playlist.Playlist_Id,
                    });
                    dispatchPlaylist({
                        type: 'SET_PLAYLIST_DETAIL',
                        payload: res,
                    });
                    dispatchCollection({
                        type: 'SET_COLLECTION',
                        payload: res.releases,
                    });
                })
                .catch(console.error)
                .finally(() => {
                    if (aborted) return;
                    const elapsed = Date.now() - started;
                    const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
                    clearTimer(fetchTimerRef);
                    fetchTimerRef.current = setTimeout(() => {
                        setLoadingFetch(false);
                        fetchTimerRef.current = null;
                    }, remain);
                });

            return () => {
                aborted = true;
                clearTimer(fetchTimerRef);
            };
        }
    }, [
        playlistOpen,
        bearerToken,
        playlistState.activePlaylistId,
        playlistState.playlistVideosPage,
        playlistState.playlistVideosLimit,
        userState.username,
        dispatchPlaylist,
        dispatchCollection,
    ]);

    // ---- Always center the currently-selected release (avoid churn)
    useEffect(() => {
        const rid = selectedRelease?.Release_Id;
        if (!rid || !items?.length) return;

        const idx = items.findIndex(r => r.Release_Id === rid);
        if (idx === -1) return;

        const n = items.length;
        const mid = Math.floor((n - 1) / 2);
        if (items[mid]?.Release_Id === rid) return;

        setLoadingCenter(true);
        const centered = reorderReleases(items, idx);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { ...collectionState, items: centered },
        });

        clearTimer(centerTimerRef);
        centerTimerRef.current = setTimeout(() => {
            setLoadingCenter(false);
            centerTimerRef.current = null;
        }, MIN_SPINNER_MS);
    }, [
        items,
        selectedRelease?.Release_Id,
        dispatchCollection,
        collectionState,
    ]);

    const endCenteringSoon = () => {
        clearTimer(centerTimerRef);
        centerTimerRef.current = setTimeout(() => {
            setLoadingCenter(false);
            centerTimerRef.current = null;
        }, MIN_SPINNER_MS);
    };

    const handleRecordClick = (release: Release, index: number) => {
        dispatchNav({ type: 'SET_NAV_KEY', payload: null });

        const isFirstSelection = !selectedRelease;

        if (isFirstSelection) {
            // center the clicked record and select it (show blur)
            setLoadingCenter(true);
            const reordered = reorderReleases(items, index);
            dispatchCollection({
                type: 'SET_COLLECTION',
                payload: { items: reordered },
            });

            if (shelfRef.current) {
                shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }

            dispatchDiscogsRelease({
                type: 'SET_SELECTED_RELEASE',
                payload: release,
            });
            endCenteringSoon();
        } else {
            // preview only — no blur, no reorder
            dispatchDiscogsRelease({
                type: 'SET_PREVIEW_RELEASE',
                payload: release,
            });
        }
    };

    const handleShelfPrev = () => {
        if (items.length < 2) return;
        const n = items.length,
            mid = Math.floor((n - 1) / 2);
        const newIndex = (mid - 1 + n) % n;
        setLoadingCenter(true);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { items: reorderReleases(items, newIndex) },
        });
        if (shelfRef.current)
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        endCenteringSoon();
    };

    const handleShelfNext = () => {
        if (items.length < 2) return;
        const n = items.length,
            mid = Math.floor((n - 1) / 2);
        const newIndex = (mid + 1) % n;
        setLoadingCenter(true);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { items: reorderReleases(items, newIndex) },
        });
        if (shelfRef.current)
            shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        endCenteringSoon();
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
        <div className="vinyl-shelf-container" style={{ position: 'relative' }}>
            {/* Overlay loader */}
            {isLoading && (
                <Box
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'rgba(0,0,0,0.25)',
                        zIndex: 2,
                        backdropFilter: 'blur(2px)',
                    }}
                ></Box>
            )}

            <TrackDetail selectedDiscogsRelease={selectedDiscogsRelease} />

            <div className="vinyl-shelf" ref={shelfRef} aria-busy={isLoading}>
                {items?.map((release, i) => {
                    const n = items?.length;
                    let angle = 0;
                    if (n > 1) angle = -90 + 180 * (i / (n - 1));

                    const isSelected =
                        selectedRelease?.Release_Id === release.Release_Id;
                    const isPreview =
                        previewRelease &&
                        previewRelease.Release_Id === release.Release_Id &&
                        previewRelease.Release_Id !==
                            selectedRelease?.Release_Id;

                    return (
                        <Box
                            key={release.Release_Id}
                            className="vinyl-record"
                            onClick={() =>
                                !isLoading && handleRecordClick(release, i)
                            }
                            style={{
                                pointerEvents: isLoading ? 'none' : 'auto',
                            }}
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

            {/* Hide shelf controls when playlist is open; also disable during loading */}
            {!playlistOpen && (
                <>
                    <div className="shelf-controls">
                        <ActionIcon
                            onClick={handleShelfPrev}
                            disabled={isLoading || items?.length < 2}
                        >
                            <ChevronLeft />
                        </ActionIcon>
                        <ActionIcon
                            onClick={handleShelfNext}
                            disabled={isLoading || items?.length < 2}
                        >
                            <ChevronRight />
                        </ActionIcon>
                    </div>

                    {items?.length > 1 && (
                        <Group className="shelf-pagination">
                            <ActionIcon
                                onClick={handleFirstPage}
                                disabled={isLoading || currentPage <= 1}
                            >
                                <SkipBack />
                            </ActionIcon>
                            <ActionIcon
                                onClick={handlePrevPage}
                                disabled={isLoading || currentPage <= 1}
                            >
                                <ChevronLeft />
                            </ActionIcon>
                            <Text c="white">{currentPage}</Text>
                            <ActionIcon
                                onClick={handleNextPage}
                                disabled={
                                    isLoading || currentPage >= totalPages
                                }
                            >
                                <ChevronRight />
                            </ActionIcon>
                            <ActionIcon
                                onClick={handleLastPage}
                                disabled={
                                    isLoading || currentPage >= totalPages
                                }
                            >
                                <SkipForward />
                            </ActionIcon>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
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
                    )}
                </>
            )}
        </div>
    );
};

export default VinylShelf;
