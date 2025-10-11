import { createContext, useReducer } from 'react';
import userReducer from '../reducers/userReducer';

const initialState = {
    username: '',
    email: '',
    userId: null,
    notAuthed: false, // explicitly check if not authed is true
    bearerToken: null,
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
