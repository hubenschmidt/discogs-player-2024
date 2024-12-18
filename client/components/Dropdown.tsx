import React, { useContext } from 'react';
import { ThemeContext } from '../context/themeContext';

const ThemePicker = () => {
    const { themeState, dispatchTheme } = useContext(ThemeContext);
    return (
        <div className="nav-right dropdown">
            <button className="dark-mode-button">
                {themeState.theme.charAt(0).toUpperCase() +
                    themeState.theme.slice(1)}{' '}
            </button>
            <div className="dropdown-menu">
                <div
                    onClick={() =>
                        dispatchTheme({ type: 'SET_THEME', payload: 'light' })
                    }
                    className="dropdown-item"
                >
                    Light
                </div>
                <div
                    onClick={() =>
                        dispatchTheme({ type: 'SET_THEME', payload: 'night' })
                    }
                    className="dropdown-item"
                >
                    Night
                </div>
                <div
                    onClick={() =>
                        dispatchTheme({ type: 'SET_THEME', payload: 'red' })
                    }
                    className="dropdown-item"
                >
                    Red
                </div>
                <div
                    onClick={() =>
                        dispatchTheme({ type: 'SET_THEME', payload: 'blue' })
                    }
                    className="dropdown-item"
                >
                    Blue
                </div>
            </div>
        </div>
    );
};

export default ThemePicker;
