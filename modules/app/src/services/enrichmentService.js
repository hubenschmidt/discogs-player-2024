const discogsClient = require('../lib/discogsClient');
const repos = require('../repositories');
const { reembedUser } = require('./embeddingService');

const getDelay = (remaining) => {
    if (remaining <= 3) return 6000;
    if (remaining <= 10) return 3000;
    return 1000;
};

const enrichRelease = async (releaseId, auth) => {
    const { data, headers } = await discogsClient(`releases/${releaseId}`, 'GET', null, auth);

    const tracklist = (data.tracklist ?? []).map(t => ({
        position: t.position,
        title: t.title,
        duration: t.duration,
    }));

    const extraartists = (data.extraartists ?? []).map(a => ({
        name: a.name,
        role: a.role,
    }));

    await repos.updateReleaseEnrichment(releaseId, {
        notes: data.notes ?? null,
        country: data.country ?? null,
        tracklist,
        extraartists,
    });

    const remaining = parseInt(headers['x-discogs-ratelimit-remaining'], 10);
    return isNaN(remaining) ? 1000 : getDelay(remaining);
};

const enrichCollection = async (username) => {
    const user = await repos.getUser({ username });
    const auth = {
        accessToken: user.OAuth_Access_Token,
        accessTokenSecret: user.OAuth_Access_Token_Secret,
    };

    const releaseIds = await repos.getUnenrichedReleaseIds(username);
    if (!releaseIds.length) return { queued: 0 };

    console.log(`[enrich] starting: ${releaseIds.length} releases for ${username}`);

    let enriched = 0;
    let errors = 0;

    const processNext = (index) => {
        if (index >= releaseIds.length) {
            console.log(`[enrich] done: ${enriched} ok, ${errors} errors`);
            reembedUser(username).catch(err =>
                console.error('[enrich] re-embed failed:', err.message),
            );
            return;
        }

        enrichRelease(releaseIds[index], auth)
            .then(delay => {
                enriched++;
                if (enriched === 1 || enriched % 50 === 0) {
                    console.log(`[enrich] progress: ${enriched}/${releaseIds.length} (delay: ${delay}ms)`);
                }
                setTimeout(() => processNext(index + 1), delay);
            })
            .catch(err => {
                errors++;
                console.error(`[enrich] release ${releaseIds[index]} failed:`, err.message);
                setTimeout(() => processNext(index + 1), 2000);
            });
    };

    processNext(0);
    return { queued: releaseIds.length };
};

module.exports = { enrichCollection };
