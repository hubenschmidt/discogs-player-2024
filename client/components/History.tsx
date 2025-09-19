import React, { useState, useContext, useEffect } from 'react';
import { getHistory } from '../api';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';

const History = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();
    const [history, setHistory] = useState(null);

    useEffect(() => {
        getHistory(userState?.username, bearerToken)
            .then(res => setHistory(res))
            .catch(err => console.log(err));
    }, [bearerToken]);

    return <>This is a history table showing {history?.length} entries.</>;
};

export default History;
