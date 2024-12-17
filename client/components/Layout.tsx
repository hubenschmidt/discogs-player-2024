import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ children, title = '2004 iTunes Clone' }: Props) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Toggle dark mode class on the body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

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
                        <Link href="/">Home</Link> |{' '}
                        <Link href="/about">About</Link> |{' '}
                        <Link href="/users">Users List</Link> |{' '}
                        <Link href="/board">Message Board</Link>
                    </div>
                    {/* Dropdown Parent */}
                    <div className="dropdown">
                        <button
                            className={`dark-mode-button ${
                                isDarkMode ? 'dark' : ''
                            }`}
                        >
                            {isDarkMode ? 'Light Mode' : 'Night Mode'}
                        </button>
                        {/* Dropdown Menu */}
                        <div className="dropdown-menu">
                            <div
                                onClick={() => setIsDarkMode(false)}
                                className="dropdown-item"
                            >
                                Light Mode
                            </div>
                            <div
                                onClick={() => setIsDarkMode(true)}
                                className="dropdown-item"
                            >
                                Dark Mode
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
                        <li>Movies</li>
                        <li>Podcasts</li>
                    </ul>
                </aside>
                <main className="content">{children}</main>
            </div>
            <footer>
                <span>iTunes Clone Footer</span>
            </footer>
        </div>
    );
};

export default Layout;
