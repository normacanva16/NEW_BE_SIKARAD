const dotEnv = require('dotenv');
const { Router } = require('express');

const RoleController = require('../controllers/MSTRoleController');

const router = Router();
dotEnv.config();

router.get('', RoleController.list);
router.post('',RoleController.create);

module.exports = router;
