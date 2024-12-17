import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ children, title = '2004 iTunes Clone' }: Props) => {
    const [theme, setTheme] = useState<'light' | 'dark' | 'red' | 'blue'>(
        'light',
    );

    // Apply theme to body
    useEffect(() => {
        document.body.className = ''; // Clear previous theme classes
        document.body.classList.add(`${theme}-mode`);
    }, [theme]);

    return (
        <div>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>
            <header>
                <nav style={{ display: 'flex', width: '100%' }}>
                    <div>
                        <Link href="/board">Message Board</Link>
                        <div className="dropdown">
                            <button className="dark-mode-button">
                                {theme.charAt(0).toUpperCase() + theme.slice(1)}{' '}
                            </button>
                            <div className="dropdown-menu">
                                <div
                                    onClick={() => setTheme('light')}
                                    className="dropdown-item"
                                >
                                    Light
                                </div>
                                <div
                                    onClick={() => setTheme('dark')}
                                    className="dropdown-item"
                                >
                                    Night
                                </div>
                                <div
                                    onClick={() => setTheme('red')}
                                    className="dropdown-item"
                                >
                                    Red
                                </div>
                                <div
                                    onClick={() => setTheme('blue')}
                                    className="dropdown-item"
                                >
                                    Blue
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <div className="main-content">
                <aside className="sidebar">
                    <p>Library</p>
                    <ul>
                        <li>Music</li>
                        {/* <li>Movies</li>
                        <li>Podcasts</li> */}
                    </ul>
                </aside>
                <main className="content">{children}</main>
            </div>
            <footer>
                <span>Ⓒopywr0ng™ WiLliⒶMr0y</span>
            </footer>
        </div>
    );
};

export default Layout;
