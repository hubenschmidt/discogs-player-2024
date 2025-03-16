import React, { useState, useEffect, FC } from 'react';
import { getCollection } from '../api';
import { Release, CollectionResponse } from '../types'; // or wherever you keep them

const VinylShelf: FC = () => {
    const [records, setRecords] = useState<Release[]>([]);

    useEffect(() => {
        getCollection({ username: 'hubenschmidt' })
            .then((data: CollectionResponse) => {
                // Here, 'data' IS your actual CollectionResponse
                setRecords(data.releases || []);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div className="vinyl-shelf">
            {records.map(record => (
                <div key={record.Release_Id} className="vinyl-record">
                    <img
                        src={record.Cover_Image || '/default-vinyl.png'}
                        alt={record.Title}
                        className="record-cover"
                    />
                    <p className="record-title">{record.Title}</p>
                </div>
            ))}
        </div>
    );
};

export default VinylShelf;
