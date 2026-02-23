const discogsClient = require('../lib/discogsClient');
const {
    getDiscogsAccessToken,
    getDiscogsRequestToken,
} = require('../lib/discogsAuthClient');
const {
    createRequestToken,
    getRequestToken,
    createUser,
    getUser,
    createCollection,
    syncData,
} = require('../repositories');

const parseTokenResponse = (response) => {
    const parsed = response.split('&');
    return parsed.map(pair => pair.split('=')[1]);
};

const fetchRequestToken = async () => {
    const response = await getDiscogsRequestToken();

    const parsed = parseTokenResponse(response);

    const requestTokenEntry = await createRequestToken(parsed[0], parsed[1]);
    const { OAuth_Request_Token } = requestTokenEntry;
    return `oauth_token=${OAuth_Request_Token}`;
};

const fetchAccessToken = async (req) => {
    const requestTokenEntry = await getRequestToken(req);
    const { OAuth_Request_Token_Secret } = requestTokenEntry;
    const response = await getDiscogsAccessToken(
        req,
        OAuth_Request_Token_Secret,
    );
    const parsed = parseTokenResponse(response);
    parsed[0]; // oauth access token
    parsed[1]; // oauth access token secret

    // fetch and persist User Identity
    const endpoint = `oauth/identity`;
    const userIdentity = await discogsClient(endpoint, 'GET', null, {
        accessToken: parsed[0],
        accessTokenSecret: parsed[1],
    });

    const { id, username } = userIdentity;
    const user = await createUser({
        id: id,
        username: username,
        email: req.body.email,
        accessToken: parsed[0],
        accessTokenSecret: parsed[1],
    });
    const { Username, Email } = user;
    return { Username, Email };
};

const syncCollection = async (req) => {
    const user = await getUser(req);
    const discogsCol = await fetchCollection(req, user);

    const [collection, collectionCreated] = await createCollection(
        user.User_Id,
    );

    const releasesPromise = await syncData(
        'Release',
        discogsCol.map((el) => ({
            Release_Id: el.id,
            Title: el.basic_information.title,
            Year: el.basic_information.year,
            Thumb: el.basic_information.thumb,
            Cover_Image: el.basic_information.cover_image,
            Date_Added: el.date_added,
        })),
        'Release_Id',
    );

    const artistsPromise = await syncData(
        'Artist',
        discogsCol.flatMap((el) =>
            el.basic_information.artists.map((artist) => ({
                Artist_Id: artist.id,
                Name: artist.name,
            })),
        ),
        'Artist_Id',
    );

    const labelsPromise = await syncData(
        'Label',
        discogsCol.flatMap((el) =>
            el.basic_information.labels.map((label) => ({
                Label_Id: label.id,
                Name: label.name,
                Cat_No: label.catno,
            })),
        ),
        'Label_Id',
    );

    const genresPromise = await syncData(
        'Genre',
        discogsCol.flatMap((el) =>
            el.basic_information.genres.map((genre) => ({
                Name: genre,
            })),
        ),
        'Name',
    );

    const stylesPromise = await syncData(
        'Style',
        discogsCol.flatMap((el) =>
            el.basic_information.styles.map((style) => ({
                Name: style,
            })),
        ),
        'Name',
    );

    const [
        releasesSynced,
        artistsSynced,
        labelsSynced,
        genresSynced,
        stylesSynced,
    ] = await Promise.all([
        releasesPromise,
        artistsPromise,
        labelsPromise,
        genresPromise,
        stylesPromise,
    ]);

    const releaseCollectionPromise = await syncData(
        'ReleaseCollection',
        discogsCol.map((el) => ({
            Release_Id: el.id,
            Collection_Id: collection.Collection_Id,
        })),
    );

    const releaseArtistsPromise = await syncData(
        'ReleaseArtist',
        discogsCol.flatMap((el) =>
            el.basic_information.artists.map((artist) => ({
                Release_Id: el.id,
                Artist_Id: artist.id,
            })),
        ),
    );

    const releaselabelsPromise = await syncData(
        'ReleaseLabel',
        discogsCol.flatMap((el) =>
            el.basic_information.labels.map((label) => ({
                Release_Id: el.id,
                Label_Id: label.id,
            })),
        ),
    );

    const releaseGenresPromise = await syncData(
        'ReleaseGenre',
        discogsCol.flatMap((el) =>
            el.basic_information.genres.map((genre) => ({
                Release_Id: el.id,
                Genre_Name: genre,
            })),
        ),
    );

    const releaseStylesPromise = await syncData(
        'ReleaseStyle',
        discogsCol.flatMap((el) =>
            el.basic_information.styles.map((style) => ({
                Release_Id: el.id,
                Style_Name: style,
            })),
        ),
    );

    const [
        releaseCollectionSynced,
        releaseArtistsSynced,
        releaseLabelsSynced,
        releaseGenresSynced,
        releaseStylesSynced,
    ] = await Promise.all([
        releaseCollectionPromise,
        releaseArtistsPromise,
        releaselabelsPromise,
        releaseGenresPromise,
        releaseStylesPromise,
    ]);

    return {
        user: {
            username: req.params.username,
        },
        collection: {
            created: collectionCreated,
        },
        synced: {
            releaseCollection: releaseCollectionSynced.length,
            releases: releasesSynced.length,
            artists: artistsSynced.length,
            releaseArtists: releaseArtistsSynced.length,
            labels: labelsSynced.length,
            releaseLabels: releaseLabelsSynced.length,
            genres: genresSynced.length,
            releaseGenresSynced: releaseGenresSynced.length,
            styles: stylesSynced.length,
            releaseStylesSynced: releaseStylesSynced.length,
        },
    };
};

const fetchCollection = async (req, user) => {
    if (!user) user = await getUser(req);

    const folderId = 0;
    const perPage = 150;
    const endpoint = `users/${req.params.username}/collection/folders/${folderId}/releases`;

    const firstResponse = await discogsClient(
        `${endpoint}?page=1&per_page=${perPage}`,
        'GET',
        null,
        {
            accessToken: user.OAuth_Access_Token,
            accessTokenSecret: user.OAuth_Access_Token_Secret,
        },
    );
    const { pages: totalPages } = firstResponse.pagination;

    let collection = firstResponse.releases;

    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
            discogsClient(
                `${endpoint}?page=${page}&per_page=${perPage}`,
                'GET',
                null,
                {
                    accessToken: user.OAuth_Access_Token,
                    accessTokenSecret: user.OAuth_Access_Token_Secret,
                },
            ),
        );
    }

    const responses = await Promise.all(pagePromises);

    responses.forEach(({ releases }) => {
        collection = collection.concat(releases);
    });

    return collection;
};

const scrubTitle = (input) => {
    if (!input) return input;
    const noTags = input.replace(/<[^>]*>/g, '');
    const normalized = noTags.normalize('NFKD');
    const noZW = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
    return noZW.replace(/\s+/g, ' ').trim();
};

const fetchRelease = async (req) => {
    const user = await getUser(req);
    const endpoint = `releases/${req.params.release_id}`;
    const response = await discogsClient(endpoint, 'GET', null, {
        accessToken: user.OAuth_Access_Token,
        accessTokenSecret: user.OAuth_Access_Token_Secret,
    });
    const release = response;

    if (Array.isArray(release?.videos)) {
        release.videos = release.videos.map((video) => ({
            ...video,
            title: scrubTitle(video.title),
        }));
    }

    const seen = new Set();
    release.videos = release.videos.filter((video) => {
        if (!video.uri || seen.has(video.uri)) return false;
        seen.add(video.uri);
        return true;
    });

    return response;
};

module.exports = {
    fetchRequestToken,
    fetchAccessToken,
    syncCollection,
    fetchCollection,
    scrubTitle,
    fetchRelease,
};
