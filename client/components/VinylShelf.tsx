import React, { useState, useEffect, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../types'; // Or wherever you keep them

const VinylShelf: FC = () => {
    const [records, setRecords] = useState<Release[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    console.log(records);

    // This map will hold: { [Release_Id]: boolean }
    // If true, that record is "flipped" to 0°.
    const [flippedStates, setFlippedStates] = useState<{
        [id: number]: boolean;
    }>({});

    useEffect(() => {
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

    // Toggle the flipped state for a specific record
    const handleRecordClick = (releaseId: number) => {
        setFlippedStates(prev => ({
            ...prev,
            [releaseId]: !prev[releaseId], // flip or unflip
        }));
    };

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

                    // If the record is flipped in our state, we override angle = 0
                    if (flippedStates[record.Release_Id]) {
                        angle = 0;
                    }

                    return (
                        <div
                            key={record.Release_Id}
                            className="vinyl-record"
                            style={{
                                transform: `rotateY(${angle.toFixed(2)}deg)`,
                            }}
                            onClick={() => handleRecordClick(record.Release_Id)}
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
