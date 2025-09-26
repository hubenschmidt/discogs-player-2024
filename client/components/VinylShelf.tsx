import React, { useState, useEffect, useContext, useRef, FC } from 'react';
import { getCollection, getPlaylist } from '../api';
import { Release, CollectionResponse } from '../interfaces';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Box, Group, ActionIcon, Text, Badge } from '@mantine/core';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { SearchContext } from '../context/searchContext';
import { NavContext } from '../context/navContext';
import { reorderReleases } from '../lib/reorder-releases';
import { PlaylistContext } from '../context/playlistContext';
import { ExplorerContext } from '../context/explorerContext';

const VinylShelf: FC = () => {
    const { userState } = useContext(UserContext);
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { items, totalPages, count } = collectionState;
    const { dispatchDiscogsRelease, discogsReleaseState } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedRelease, previewRelease } = discogsReleaseState;
    const { searchState } = useContext(SearchContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { navState, dispatchNav } = useContext(NavContext);
    const { playlistOpen } = navState;
    const { searchSelection, shelfCollectionOverride } = searchState;
    const { explorerState } = useContext(ExplorerContext);
    const { genresFilter, stylesFilter, yearsFilter } = explorerState;

    const [currentPage, setCurrentPage] = useState<number>(1);
    const offset = 1; // keeps odd # so center is a single record
    const [itemsPerPage, setItemsPerPage] = useState<number>(25);
    const bearerToken = useBearerToken();

    // loading flags
    const [loadingFetch, setLoadingFetch] = useState(false);
    const [loadingCenter, setLoadingCenter] = useState(false);
    const isLoading = loadingFetch || loadingCenter;
    const MIN_SPINNER_MS = 300;

    const showSearchShelf = !!(
        searchSelection?.Artist_Id ||
        searchSelection?.Label_Id ||
        searchSelection?.Release_Id
    );

    const shelfRef = useRef<HTMLDivElement | null>(null);

    const shelfShowsPlaylist =
        playlistOpen && !showSearchShelf && !shelfCollectionOverride;

    // after either collection or playlist fetch finishes, reset scroll
    useEffect(() => {
        if (!loadingFetch && shelfRef.current) {
            // make sure DOM has the new items before resetting
            requestAnimationFrame(() => {
                if (shelfRef.current)
                    shelfRef.current.scrollTo({
                        left: 0,
                        top: 0,
                        behavior: 'auto',
                    });
            });
        }
    }, [loadingFetch]);

    // auto-stop the center blur when it’s turned on
    useEffect(() => {
        if (!loadingCenter) return;
        const t = setTimeout(() => setLoadingCenter(false), MIN_SPINNER_MS);
        return () => clearTimeout(t);
    }, [loadingCenter]);

    // ---------- fetch collection when not viewing a playlist ----------
    useEffect(() => {
        if (shelfShowsPlaylist) return; // <- playlist is showing on shelf, skip

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
            ...(genresFilter && {
                genre: genresFilter,
            }),
            ...(stylesFilter && {
                style: stylesFilter,
            }),
            ...(yearsFilter && {
                year: yearsFilter,
            }),
        };

        let aborted = false;
        let t: ReturnType<typeof setTimeout> | null = null;
        const started = Date.now();

        setLoadingFetch(true);

        getCollection(params, bearerToken)
            .then((collection: CollectionResponse) => {
                if (aborted) return;
                dispatchCollection({
                    type: 'SET_COLLECTION',
                    payload: collection,
                });
            })
            .catch(err =>
                console.error('fetch collection failed', err?.response || err),
            )
            .finally(() => {
                if (aborted) return;
                const elapsed = Date.now() - started;
                const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
                t = setTimeout(() => setLoadingFetch(false), remain);
            });

        return () => {
            aborted = true;
            if (t) clearTimeout(t);
        };
    }, [
        shelfShowsPlaylist, // <- key change,
        currentPage,
        itemsPerPage,
        searchSelection,
        bearerToken,
        userState.username,
        dispatchCollection,
        genresFilter,
        stylesFilter,
        yearsFilter,
    ]);

    // ---------- fetch playlist when playlist is open ----------
    useEffect(() => {
        if (!shelfShowsPlaylist) return; // <- only when we actually want the playlist showing on shelf

        let aborted = false;
        let t: ReturnType<typeof setTimeout> | null = null;
        const started = Date.now();

        setLoadingFetch(true);

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
                dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: res });

                if (res.releases.items.length > 0) {
                    // prevent an empty vinyl shelf from loading
                    dispatchCollection({
                        type: 'SET_COLLECTION',
                        payload: res.releases,
                    });
                }
            })
            .catch(console.error)
            .finally(() => {
                if (aborted) return;
                const elapsed = Date.now() - started;
                const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
                t = setTimeout(() => setLoadingFetch(false), remain);
            });

        return () => {
            aborted = true;
            if (t) clearTimeout(t);
        };
    }, [
        shelfShowsPlaylist, // <- key change
        bearerToken,
        playlistState.activePlaylistId,
        playlistState.playlistVideosPage,
        playlistState.playlistVideosLimit,
        userState.username,
        dispatchPlaylist,
        dispatchCollection,
    ]);

    // ---------- always center selected (skip when previewing; avoid churn) ----------
    useEffect(() => {
        const rid = selectedRelease?.Release_Id;
        if (!rid || !items?.length) return;

        const idx = items.findIndex(r => r.Release_Id === rid);
        if (idx === -1) return;

        const n = items.length;
        const mid = Math.floor((n - 1) / 2);
        if (items[mid]?.Release_Id === rid) return; // already centered

        setLoadingCenter(true);
        const centered = reorderReleases(items, idx);
        dispatchCollection({
            type: 'SET_COLLECTION',
            payload: { ...collectionState, items: centered },
        });
    }, [
        items,
        selectedRelease?.Release_Id,
        previewRelease,
        dispatchCollection,
        collectionState,
    ]);

    // ---------- click handlers ----------
    const handleRecordClick = (release: Release, index: number) => {
        // dispatchNav({ type: 'SET_NAV_KEY', payload: null });

        const isFirstSelection = !selectedRelease;

        if (isFirstSelection) {
            setLoadingCenter(true); // blur ON
            dispatchCollection({
                type: 'SET_COLLECTION',
                payload: { items: reorderReleases(items, index) },
            });
            // (optional) keep your scrollTo if you want; see note below

            dispatchDiscogsRelease({
                type: 'SET_SELECTED_RELEASE',
                payload: release,
            });
            // blur will auto-stop via the loadingCenter effect
            return;
        }
        // preview only — no blur & no reorder
        dispatchDiscogsRelease({
            type: 'SET_PREVIEW_RELEASE',
            payload: release,
        });
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
        // blur auto-stops
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
        // blur auto-stops
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
        <div style={{ position: 'relative' }}>
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

            <Badge variant="light" size="sm">
                {count} result{count === 1 ? '' : 's'}
            </Badge>

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
            {!shelfShowsPlaylist && (
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
                            <Text c="white" mt="10">
                                {currentPage}
                            </Text>
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
