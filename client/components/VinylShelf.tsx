import React, { useState, useEffect, useRef, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../interfaces'; // your local types

// Import Lucide icons you plan to use
import {
    ChevronLeft,
    ChevronRight,
    SkipBack,
    SkipForward,
    List,
    Search,
    ArrowRightCircle,
} from 'lucide-react';

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
            .then((data: CollectionResponse) => {
                setRecords(data.releases || []);
                setTotalPages(data.totalPages || 1);
            })
            .catch(error => console.error(error));
    }, [currentPage, itemsPerPage]);

    // Click a record => reorder so that record is center, then reset scroll
    const handleRecordClick = (index: number) => {
        setRecords(prevRecords => {
            const reordered = reorderRecords(prevRecords, index);
            if (shelfRef.current) {
                shelfRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
            return reordered;
        });
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
        <div className="vinyl-shelf-container">
            {/* Local Shelf Paging Buttons */}
            <div className="shelf-pagination">
                <button onClick={handleShelfPrev} disabled={records.length < 2}>
                    <ChevronLeft size={16} />
                </button>
                <button onClick={handleShelfNext} disabled={records.length < 2}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* The shelf itself, with ref */}
            <div className="vinyl-shelf" ref={shelfRef}>
                {records.map((record, i) => {
                    const n = records.length;
                    let angle = 0;

                    if (n > 1) {
                        // Interpolate from +90° (i=0) to -90° (i=n-1)
                        angle = -90 + 180 * (i / (n - 1));
                    }

                    return (
                        <div
                            key={record.Release_Id}
                            className="vinyl-record"
                            style={{
                                transform: `rotateY(${angle.toFixed(2)}deg)`,
                            }}
                            onClick={() => handleRecordClick(i)}
                        >
                            <img
                                src={record.Cover_Image || '/default-vinyl.png'}
                                alt={record.Title}
                                className="record-cover"
                            />
                            <p className="record-title">{record.Title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Items Per Page */}
            <div className="shelf-pagination">
                <label>
                    <List size={16} /> Items Per Page:{' '}
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>

            {/* Go To Page */}
            <div className="shelf-pagination">
                <label>
                    <Search size={16} /> Go To Page:{' '}
                    <input
                        type="text"
                        value={goToPage}
                        onChange={e => setGoToPage(e.target.value)}
                        style={{ width: '60px', textAlign: 'center' }}
                    />
                </label>
                <button onClick={handleGoToPage}>
                    <ArrowRightCircle size={16} />
                </button>
            </div>

            {/* Server Pagination Controls */}
            <div className="shelf-pagination">
                <button onClick={handleFirstPage} disabled={currentPage <= 1}>
                    <SkipBack size={16} />
                </button>
                <button onClick={handlePrevPage} disabled={currentPage <= 1}>
                    <ChevronLeft size={16} />
                </button>

                <span>{` Page ${currentPage} of ${totalPages} `}</span>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={handleLastPage}
                    disabled={currentPage >= totalPages}
                >
                    <SkipForward size={16} />
                </button>
            </div>
        </div>
    );
};

export default VinylShelf;
