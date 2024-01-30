const dotEnv = require('dotenv');
const { Router } = require('express');

//Validation

const NewDashboardController = require('../controllers/DashboardController');

const router = Router();
dotEnv.config();

router.get('/peta', NewDashboardController.getAllKotama);
router.get('/diagram/rekapitulasi', NewDashboardController.getSummaryDateMappingPegawaiByKotama);
router.get('/tabel/rekapitulasi', NewDashboardController.getRekapitulasiData);
module.exports = router;
