import React, { useState, useEffect, useContext } from 'react';
import { TextInput, useRandomClassName } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon } from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection } from '../api';
import { CollectionResponse } from '../interfaces';

const Search = () => {
    const { userState } = useContext(UserContext);
    const { dispatchCollection } = useContext(CollectionContext);
    const bearerToken = useBearerToken();

    // Local input state
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(query, 500);

    // Effect to trigger search + dispatch
    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            console.log('Searching with:', debouncedQuery);

            // TODO: Replace with real API call
            searchCollection(debouncedQuery, userState?.username, bearerToken)
                .then((collection: CollectionResponse) => {
                    dispatchCollection({
                        type: 'SET_COLLECTION',
                        payload: collection,
                    });
                })
                .catch(err => {
                    console.error('Search failed:', err);
                    dispatchCollection({
                        type: 'SET_SEARCH_RESULTS',
                        payload: [],
                    });
                });
            return;
        }
        // else clear results if input is empty
        dispatchCollection({ type: 'SET_SEARCH_RESULTS', payload: [] });
    }, [debouncedQuery]);

    return (
        <TextInput
            placeholder="search..."
            size="lg"
            radius="lg"
            leftSection={<SearchIcon size="1rem" />}
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            styles={{
                input: {
                    backgroundColor: 'transparent',
                    color: 'white',
                    borderColor: 'white',
                },
            }}
        />
    );
};

export default Search;
