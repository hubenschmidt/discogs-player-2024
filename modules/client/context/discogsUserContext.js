import { createContext, useReducer } from 'react';
import discogsUserReducer from '../reducers/discogsUserReducer';

const initialState = {
    username: null,
};

export const DiscogsUserContext = createContext(initialState);

export const DiscogsUserProvider = props => {
    const reducer = discogsUserReducer(initialState);
    const [discogsUserState, dispatchDiscogsUser] = useReducer(
        reducer,
        initialState,
    );

    return (
        <DiscogsUserContext.Provider
            value={{ discogsUserState, dispatchDiscogsUser }}
        >
            {props.children}
        </DiscogsUserContext.Provider>
    );
};
