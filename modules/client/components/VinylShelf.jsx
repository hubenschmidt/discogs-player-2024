import React, { useState, useEffect, useContext } from 'react';
import { getCollection, getPlaylist } from '../api';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Box, Group, Badge } from '@mantine/core';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { SearchContext } from '../context/searchContext';
import { reorderReleases } from '../lib/reorder-releases';
import { PlaylistContext } from '../context/playlistContext';
import { ExplorerContext } from '../context/explorerContext';
import RecordItem from './RecordItem';
import ShelfControls from './ShelfControls';
import ShelfPagination from './ShelfPagination';

const VinylShelf = () => {
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
    const { playlistOpen } = playlistState;
    const { searchSelection, shelfCollectionOverride } = searchState;
    const { explorerState } = useContext(ExplorerContext);
    const { genresFilter, stylesFilter, yearsFilter } = explorerState;

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
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

    // Key to force scroll reset when fetch completes
    const [scrollResetKey, setScrollResetKey] = useState(0);

    const shelfShowsPlaylist =
        playlistOpen && !showSearchShelf && !shelfCollectionOverride;

    // Increment key when fetch completes to reset scroll position via CSS
    useEffect(() => {
        if (!loadingFetch) {
            setScrollResetKey(k => k + 1);
        }
    }, [loadingFetch]);

    // auto-stop the center blur when it's turned on
    useEffect(() => {
        if (!loadingCenter) return;
        const t = setTimeout(() => setLoadingCenter(false), MIN_SPINNER_MS);
        return () => clearTimeout(t);
    }, [loadingCenter]);

    // ---------- fetch collection when not viewing a playlist ----------
    useEffect(() => {
        if (shelfShowsPlaylist) return; // guard: skip when playlist panel mirrors onto shelf

        const params = {
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
            ...(genresFilter && { genre: genresFilter }),
            ...(stylesFilter && { style: stylesFilter }),
            ...(yearsFilter && { year: yearsFilter }),
            ...(collectionState.shouldRandomize && { randomize: true }), // typically on first call
        };

        let aborted = false;
        let timer = null;
        const started = Date.now();

        setLoadingFetch(true);

        const injectSelectedIfMissing = (payload) => {
            if (!shelfCollectionOverride) return payload;
            const rid = selectedRelease?.Release_Id;
            if (!rid) return payload;

            const present = payload.items?.some(r => r.Release_Id === rid);
            if (present) return payload;

            const plReleases =
                playlistState?.playlistDetail?.releases?.items ?? [];
            const fromPlaylist =
                plReleases.find((r) => r?.Release_Id === rid) ||
                selectedRelease;

            const mergedItems = [
                fromPlaylist,
                ...(payload.items ?? []).filter(r => r.Release_Id !== rid),
            ];

            return { ...payload, items: mergedItems };
        };

        getCollection(params, bearerToken)
            .then((collection) => {
                if (aborted) return;
                const next = injectSelectedIfMissing(collection);
                dispatchCollection({ type: 'SET_COLLECTION', payload: next });

                if (collectionState.randomized) {
                    dispatchCollection({
                        type: 'SET_RANDOMIZED',
                        payload: false,
                    });
                }
            })
            .catch(err =>
                console.error('fetch collection failed', err?.response || err),
            )
            .finally(() => {
                if (aborted) return;
                const elapsed = Date.now() - started;
                const remain = Math.max(0, MIN_SPINNER_MS - elapsed);
                timer = setTimeout(() => setLoadingFetch(false), remain);
            });

        return () => {
            aborted = true;
            if (timer) clearTimeout(timer);
        };
    }, [
        shelfShowsPlaylist,
        currentPage,
        itemsPerPage,
        searchSelection,
        bearerToken,
        userState.username,
        dispatchCollection,
        genresFilter,
        stylesFilter,
        yearsFilter,
        shelfCollectionOverride,
        selectedRelease?.Release_Id,
        playlistState?.playlistDetail?.releases?.items,
        collectionState.shouldRandomize,
    ]);

    // ---------- fetch playlist whenever the playlist panel is open ----------
    // (still a single source of truth for getPlaylist)
    useEffect(() => {
        if (!playlistOpen) return; // fetch whenever panel is open

        let aborted = false;
        let t = null;
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

                // Always update the playlist detail so Playlist.tsx re-renders
                dispatchPlaylist({
                    type: 'SET_ACTIVE_PLAYLIST_ID',
                    payload: res.playlist.Playlist_Id,
                });
                dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: res });
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
        // show/hide & params that affect the fetch
        playlistOpen,
        bearerToken,
        userState.username,
        playlistState.activePlaylistId,
        playlistState.playlistVideosPage,
        playlistState.playlistVideosLimit,
        playlistState.version, // bump this after add/remove to trigger refresh
        // we read these to decide whether to reflect playlist onto shelf
        showSearchShelf,
        shelfCollectionOverride,
        dispatchPlaylist,
        dispatchCollection,
    ]);

    // B) Mirror playlist releases onto the shelf only when allowed
    useEffect(() => {
        const shouldShowOnShelf =
            playlistOpen && !showSearchShelf && !shelfCollectionOverride;

        const releases = playlistState?.playlistDetail?.releases;
        if (!shouldShowOnShelf || !releases?.items?.length) return;

        dispatchCollection({ type: 'SET_COLLECTION', payload: releases });
    }, [
        // conditions that decide mirroring
        playlistOpen,
        showSearchShelf,
        shelfCollectionOverride,
        // new data to mirror
        playlistState?.playlistDetail?.releases,
        dispatchCollection,
    ]);

    // If we're searching and the playing release isn't in current shelf items,
    // inject it (from playlistDetail.releases) and center it.
    useEffect(() => {
        if (showSearchShelf) return; // skip centering on targeted search results

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
    }, [
        items,
        selectedRelease?.Release_Id,
        showSearchShelf,
        dispatchCollection,
        collectionState,
    ]);

    // ---------- click handlers ----------
    const handleRecordClick = (release, index) => {
        // dispatchNav({ type: 'SET_NAV_KEY', payload: null });

        const isFirstSelection = !selectedRelease;

        // If you click the already-selected one, do nothing
        if (selectedRelease?.Release_Id === release.Release_Id) return;

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

    const handleItemsPerPageChange = (e) => {
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

            <Group mb="xs">
                <Badge variant="light" size="sm">
                    {count} release{count === 1 ? '' : 's'}
                </Badge>
            </Group>

            <div
                key={scrollResetKey}
                className="vinyl-shelf"
                aria-busy={isLoading}
            >
                {items?.map((release, i) => (
                    <RecordItem
                        key={release.Release_Id}
                        release={release}
                        index={i}
                        isSelected={
                            selectedRelease?.Release_Id === release.Release_Id
                        }
                        isPreview={
                            previewRelease &&
                            previewRelease.Release_Id === release.Release_Id &&
                            previewRelease.Release_Id !==
                                selectedRelease?.Release_Id
                        }
                        isLoading={isLoading}
                        onClick={handleRecordClick}
                    />
                ))}
            </div>

            {/* Hide shelf controls when playlist is open; also disable during loading */}
            {!shelfShowsPlaylist && (
                <>
                    <ShelfControls
                        onPrev={handleShelfPrev}
                        onNext={handleShelfNext}
                        isLoading={isLoading}
                        itemCount={items?.length ?? 0}
                    />

                    {items?.length > 1 && (
                        <ShelfPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            isLoading={isLoading}
                            onFirstPage={handleFirstPage}
                            onPrevPage={handlePrevPage}
                            onNextPage={handleNextPage}
                            onLastPage={handleLastPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default VinylShelf;
