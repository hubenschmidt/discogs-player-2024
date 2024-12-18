import React, { ReactNode, useContext, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import MusicPlayer from './MusicPlayer';
import ThemePicker from './Dropdown';
import { ThemeContext } from '../context/themeContext';

type Props = {
    children?: ReactNode;
    title?: string;
};

// Mock TrackDetail Component
const TrackDetail = () => (
    <div className="track-detail">
        <p>Now Playing: "Mock Artist - Mock Track" - 01:23 / 03:45</p>
    </div>
);

const Layout = ({ children, title = 'TuneCrook' }: Props) => {
    const { themeState } = useContext(ThemeContext);

    // Apply theme to body
    useEffect(() => {
        document.body.className = ''; // Clear previous theme classes
        document.body.classList.add(`${themeState.theme}-mode`);
    }, [themeState.theme]);

    return (
        <div>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
                    rel="stylesheet"
                />
            </Head>

            <body>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col"></div>
                        <div className="col">
                            <p className="text-center">TuneCrook</p>
                        </div>

                        <div className="col"></div>
                    </div>
                    <div className="row">
                        <div className="col-1"></div>

                        <div className="col-3">
                            <MusicPlayer />
                        </div>

                        <div className="col-4">
                            <TrackDetail />
                        </div>

                        <div className="col">
                            <p className="text-center">Column 5</p>
                        </div>
                        <div className="col">
                            <ThemePicker />
                        </div>
                    </div>
                </div>
                <div className="main-content">
                    <aside className="sidebar">
                        <p>Library</p>
                        <ul>
                            <li>Music</li>
                        </ul>
                    </aside>
                    <main className="content">{children}</main>
                </div>

                <footer>
                    <span>Ⓒopywr0ng™ WiLliⒶMr0y</span>
                </footer>
            </body>
        </div>
    );
};

export default Layout;
