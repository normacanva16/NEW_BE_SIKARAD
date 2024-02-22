const dotEnv = require('dotenv');
const { Router } = require('express');

const ActivityUserController = require('../controllers/TRXUserActivityController');

const router = Router();
dotEnv.config();

router.get('', ActivityUserController.listUserActivityLog);
router.get('/excel', ActivityUserController.exportListUserActivityLog);

module.exports = router;
