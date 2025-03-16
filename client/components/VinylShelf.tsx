import React, { useState, useEffect, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../types'; // Or wherever you keep them

// Helper to reorder records around the selected item
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

    // Fetch from server whenever `currentPage` changes
    useEffect(() => {
        setRecords([]);
        getCollection({
            username: 'hubenschmidt',
            page: currentPage,
        })
            .then((data: CollectionResponse) => {
                setRecords(data.releases || []);
                setTotalPages(data.totalPages || 1);
            })
            .catch((error: any) => console.error(error));
    }, [currentPage]);

    // Click a record to make it the center
    const handleRecordClick = (index: number) => {
        setRecords(prev => reorderRecords(prev, index));
    };

    // ========== SERVER PAGING ==========
    const handlePrevPage = () => {
        setCurrentPage(p => Math.max(1, p - 1));
    };
    const handleNextPage = () => {
        setCurrentPage(p => Math.min(totalPages, p + 1));
    };

    // ========== LOCAL “SHELF” PAGING (within the current array) ==========

    const handleShelfPrev = () => {
        setRecords(prevRecords => {
            const n = prevRecords.length;
            if (n < 2) return prevRecords;

            const middleIndex = Math.floor((n - 1) / 2);
            // The item *currently* at middleIndex is the center.
            // The item “before” it is (middleIndex - 1) mod n – that becomes our new center.
            const newIndex = (middleIndex - 1 + n) % n;
            return reorderRecords(prevRecords, newIndex);
        });
    };

    const handleShelfNext = () => {
        setRecords(prevRecords => {
            const n = prevRecords.length;
            if (n < 2) return prevRecords;

            const middleIndex = Math.floor((n - 1) / 2);
            // The item “after” it is (middleIndex + 1) mod n – that becomes the new center.
            const newIndex = (middleIndex + 1) % n;
            return reorderRecords(prevRecords, newIndex);
        });
    };

    return (
        <div className="vinyl-shelf-container">
            {/* Local Shelf Paging Buttons */}
            <div className="shelf-pagination">
                <button onClick={handleShelfPrev} disabled={records.length < 2}>
                    Shelf Prev
                </button>
                <button onClick={handleShelfNext} disabled={records.length < 2}>
                    Shelf Next
                </button>
            </div>
            <div className="vinyl-shelf">
                {records.map((record, i) => {
                    const n = records.length;
                    let angle = 0;

                    // Interpolate from +90° (at i=0) to -90° (at i=n-1)
                    if (n > 1) {
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

            {/* Server Pagination Controls */}
            <div className="shelf-pagination">
                <button onClick={handlePrevPage} disabled={currentPage <= 1}>
                    Prev Page
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                >
                    Next Page
                </button>
            </div>
        </div>
    );
};

export default VinylShelf;
