const dotEnv = require('dotenv');
const { Router } = require('express');

//Validation

const NewDashboardController = require('../controllers/DashboardController');

const router = Router();
dotEnv.config();

router.get('/peta', NewDashboardController.getAllKotama);
router.get('/diagram/rekapitulasi', NewDashboardController.getSummaryDateMappingPegawaiByKotama);
router.get('/tabel/rekapitulasi', NewDashboardController.getRekapitulasiData);
router.get('/tabel/rekapitulasi/download', NewDashboardController.getRekapitulasiDataAll);
module.exports = router;
