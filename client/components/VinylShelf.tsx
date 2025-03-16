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

    // Load data on mount and page change
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

    const handleRecordClick = (index: number) => {
        setRecords(prevRecords => reorderRecords(prevRecords, index));
    };

    // Paging controls
    const handlePrev = () => {
        setCurrentPage(p => Math.max(1, p - 1));
    };
    const handleNext = () => {
        setCurrentPage(p => Math.min(totalPages, p + 1));
    };

    return (
        <div className="vinyl-shelf-container">
            <div className="vinyl-shelf">
                {records.map((record, i) => {
                    const n = records.length;
                    let angle = 0;

                    if (n > 1) {
                        // Interpolate from +90° (left edge) to -90° (right edge)
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
                                src={
                                    record?.Cover_Image || '/default-vinyl.png'
                                }
                                alt={record.Title}
                                className="record-cover"
                            />
                            <p className="record-title">{record.Title}</p>
                        </div>
                    );
                })}
            </div>

            <div className="shelf-pagination">
                <button onClick={handlePrev} disabled={currentPage <= 1}>
                    Prev
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default VinylShelf;
