const { Router } = require('express');
const {
    sendMessage,
    getSessions,
    getSession,
    confirmPlaylist,
    discardPlaylist,
    updateStagedPlaylist,
    embedCollection,
    semanticSearch,
} = require('../../controllers/curatorController');

const router = Router();

router.post('/:username/chat', sendMessage);
router.get('/:username/sessions', getSessions);
router.get('/:username/session/:id', getSession);
router.post('/:username/confirm', confirmPlaylist);
router.post('/:username/discard', discardPlaylist);
router.post('/:username/stage/update', updateStagedPlaylist);
router.post('/:username/embed', embedCollection);
router.post('/:username/semantic-search', semanticSearch);

module.exports = router;
