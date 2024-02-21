const dotEnv = require('dotenv');
const { Router } = require('express');

//Validation
const { validateCreateMasterKotama, validateUpdateMasterKotama } = require('../helpers/validator');

const { validate } = require('../helpers/utilities/validate');

const upload = require('../helpers/utilities/upload');

const KotamaController = require('../controllers/MSTKotamaController');
const { verifyToken } = require('../helpers/authentication-jwt');
const authorize = require('../helpers/authorize');

const router = Router();
dotEnv.config();

router.post('', validate(validateCreateMasterKotama), KotamaController.create);
router.get('', KotamaController.list);
router.get('/:id', KotamaController.view);
router.put('/:id', validate(validateUpdateMasterKotama), KotamaController.update);
router.post('/auto-create', KotamaController.AutoCreate);
router.get('/list/option', KotamaController.listkotamabalakpus);
router.put('/image/:code', upload.multerUploadImage , KotamaController.updateImageKotama);

module.exports = router;
