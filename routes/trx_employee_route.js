const dotEnv = require('dotenv');
const { Router } = require('express');

//Validation

const { validate } = require('../helpers/utilities/validate');

const upload = require('../helpers/utilities/upload');

const EmployeeController = require('../controllers/TRXEmployeeController');
const { verifyToken } = require('../helpers/authentication-jwt');
const authorize = require('../helpers/authorize');

const router = Router();
dotEnv.config();

router.post('',verifyToken, authorize.permit(['superadmin', 'admin']),upload.multerUploadFile,EmployeeController.uploadfileexcelByKotama);
router.get('', EmployeeController.listByAksiId);
router.get('/:id', EmployeeController.view);
router.get('/download/excel', EmployeeController.exportListEmployee);
router.get('/detail/list', EmployeeController.viewEmployeeByJabatan);
router.delete('', verifyToken, authorize.permit(['superadmin', 'admin']), EmployeeController.deleteEmployeeByFilter);
router.get('/list/employee/exist', EmployeeController.listIsExistEmployee);

module.exports = router;
