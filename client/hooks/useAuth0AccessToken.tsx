import { useContext } from 'react';
import { UserContext } from '../context/userContext';

export const useAuth0AccessToken = () => {
    const {
        userState: { accessToken },
    } = useContext(UserContext);
    return accessToken;
};
