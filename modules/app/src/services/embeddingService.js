const repos = require('../repositories');
const { embed } = require('../lib/openaiClient');

const buildEmbeddingText = release => {
    const artists = (release.Artists ?? []).map(a => a.Name).join(', ');
    const labels = (release.Labels ?? []).map(l => l.Name).join(', ');
    const genres = (release.Genres ?? []).map(g => g.Name).join(', ');
    const styles = (release.Styles ?? []).map(s => s.Name).join(', ');
    const tracks = (release.Videos ?? []).map(v => v.Title).join(', ');

    const parts = [`"${release.Title}" by ${artists || 'Unknown'}`];
    if (release.Year) parts[0] += ` (${release.Year})`;
    if (labels) parts[0] += ` on ${labels}`;
    parts[0] += '.';
    if (genres) parts.push(`Genres: ${genres}.`);
    if (styles) parts.push(`Styles: ${styles}.`);
    if (tracks) parts.push(`Tracks: ${tracks}.`);

    return parts.join(' ');
};

const embedReleases = async releases => {
    if (!releases.length) return 0;

    const texts = releases.map(buildEmbeddingText);
    const embeddings = await embed(texts);

    const upserts = releases.map((r, i) =>
        repos.upsertReleaseEmbedding(r.Release_Id, texts[i], embeddings[i]),
    );
    await Promise.all(upserts);

    return releases.length;
};

const backfillUser = async username => {
    const start = Date.now();
    const releases = await repos.getReleasesForEmbedding(username);
    console.log(
        `[embedding] fetched ${releases.length} releases for ${username}`,
    );

    const embedded = await embedReleases(releases);

    const durationMs = Date.now() - start;
    console.log(`[embedding] done: ${embedded} releases in ${durationMs}ms`);
    return { embedded, durationMs };
};

const vectorSearch = async (queryText, username, limit = 15) => {
    const [queryEmbedding] = await embed([queryText]);
    return repos.searchByVector(queryEmbedding, username, limit);
};

module.exports = { buildEmbeddingText, backfillUser, vectorSearch };
