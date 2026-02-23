const { Router } = require('express');
const {
    sendMessage,
    getSessions,
    getSession,
    confirmPlaylist,
    discardPlaylist,
    updateStagedPlaylist,
} = require('../../controllers/curatorController');

const router = Router();

router.post('/:username/chat', sendMessage);
router.get('/:username/sessions', getSessions);
router.get('/:username/session/:id', getSession);
router.post('/:username/confirm', confirmPlaylist);
router.post('/:username/discard', discardPlaylist);
router.post('/:username/stage/update', updateStagedPlaylist);

module.exports = router;
