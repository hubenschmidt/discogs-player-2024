// Helper function to extract a YouTube video ID from a URL
export const extractYouTubeVideoId = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('youtube.com')) {
            return parsedUrl.searchParams.get('v');
        }
        if (parsedUrl.hostname === 'youtu.be') {
            return parsedUrl.pathname.slice(1);
        }
        return null;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
};
