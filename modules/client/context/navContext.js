import { createContext, useReducer } from 'react';
import navReducer from '../reducers/navReducer';
import { isIOS } from '../components/CustomYoutubePlayer';

const initialState = {
    navKey: !isIOS() ? 'explorer' : null, // default to explorer view on desktop only
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
