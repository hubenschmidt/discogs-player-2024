const { Router } = require('express');
const discogsRoutes = require('./discogs');
const appRoutes = require('./app');
const curatorRoutes = require('./curator');
const router = Router();

router.use('/discogs', discogsRoutes);
router.use('/app', appRoutes);
router.use('/curator', curatorRoutes);

module.exports = router;
