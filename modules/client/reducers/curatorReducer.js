export const SET_CURATOR_SESSIONS = 'SET_CURATOR_SESSIONS';
export const SET_ACTIVE_SESSION = 'SET_ACTIVE_SESSION';
export const SET_CURATOR_MESSAGES = 'SET_CURATOR_MESSAGES';
export const APPEND_CURATOR_MESSAGE = 'APPEND_CURATOR_MESSAGE';
export const SET_STAGED_PLAYLIST = 'SET_STAGED_PLAYLIST';
export const CLEAR_STAGED_PLAYLIST = 'CLEAR_STAGED_PLAYLIST';
export const SET_CURATOR_LOADING = 'SET_CURATOR_LOADING';
export const SET_CURATOR_OPEN = 'SET_CURATOR_OPEN';
export const UPDATE_LAST_MESSAGE = 'UPDATE_LAST_MESSAGE';

const setSessions = (state, payload) => ({
    ...state,
    sessions: payload,
});

const setActiveSession = (state, payload) => ({
    ...state,
    activeSessionId: payload,
});

const setMessages = (state, payload) => ({
    ...state,
    messages: payload,
});

const appendMessage = (state, payload) => ({
    ...state,
    messages: [...state.messages, payload],
});

const setStagedPlaylist = (state, payload) => ({
    ...state,
    stagedPlaylist: payload,
});

const clearStagedPlaylist = (state) => ({
    ...state,
    stagedPlaylist: null,
});

const setLoading = (state, payload) => ({
    ...state,
    isLoading: payload,
});

const setCuratorOpen = (state, payload) => ({
    ...state,
    curatorOpen: payload,
});

const updateLastMessage = (state, payload) => {
    const msgs = state.messages;
    const last = msgs[msgs.length - 1];
    if (!last) return state;
    const updated = [...msgs];
    updated[updated.length - 1] = { ...last, Content: (last.Content || '') + payload };
    return { ...state, messages: updated };
};

const actionHandlers = {
    [SET_CURATOR_SESSIONS]: setSessions,
    [SET_ACTIVE_SESSION]: setActiveSession,
    [SET_CURATOR_MESSAGES]: setMessages,
    [APPEND_CURATOR_MESSAGE]: appendMessage,
    [SET_STAGED_PLAYLIST]: setStagedPlaylist,
    [CLEAR_STAGED_PLAYLIST]: clearStagedPlaylist,
    [SET_CURATOR_LOADING]: setLoading,
    [SET_CURATOR_OPEN]: setCuratorOpen,
    [UPDATE_LAST_MESSAGE]: updateLastMessage,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
