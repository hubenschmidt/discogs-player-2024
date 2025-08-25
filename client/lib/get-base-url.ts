/**
 * quick and dirty substitute for Next.js lack of support for client-side runtime env vars
 * insert 'api' after the first segment of the hostname using guard clauses
 * todo, maybe put this in a context file so it only runs once
 * */
export const getBaseUrl = () => {
    try {
        const { host } = window.location;
        const parts = host.split('.');
        // for 'prod .api urls'
        if (parts.length === 2) {
            parts.unshift('api');
            return `https://${parts.join('.')}`;
        }
        // for dev
        if (host === 'localhost:3001') return 'http://localhost:5000';
    } catch (err) {
        throw err;
    }
};
