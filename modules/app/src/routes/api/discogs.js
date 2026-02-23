const { Router } = require('express');
const {
    fetchRelease,
    fetchCollection,
    syncCollection,
    fetchRequestToken,
    fetchAccessToken,
} = require('../../controllers/discogsController');

const router = Router();

router.get('/:username/release/:release_id', fetchRelease);
router.get('/collection/:username', fetchCollection);
router.get('/sync-collection/:username', syncCollection);
router.get('/fetch-request-token', fetchRequestToken);
router.post('/fetch-access-token', fetchAccessToken);

module.exports = router;
