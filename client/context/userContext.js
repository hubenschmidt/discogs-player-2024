import { createContext, useReducer } from 'react';
import userReducer from '../reducers/userReducer';

const initialState = {
    username: null,
};

export const UserContext = createContext(initialState);

export const UserProvider = props => {
    const reducer = userReducer(initialState);
    const [userState, dispatchUser] = useReducer(reducer, initialState);

    return (
        <UserContext.Provider value={{ userState, dispatchUser }}>
            {props.children}
        </UserContext.Provider>
    );
};
