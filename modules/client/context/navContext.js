import { createContext, useReducer } from 'react';
import navReducer from '../reducers/navReducer';

const initialState = {
    navKey: 'explorer',
    playlistOpen: false,
};

export const NavContext = createContext(initialState);

export const NavProvider = props => {
    const reducer = navReducer(initialState);
    const [navState, dispatchNav] = useReducer(reducer, initialState);

    return (
        <NavContext.Provider value={{ navState, dispatchNav }}>
            {props.children}
        </NavContext.Provider>
    );
};
