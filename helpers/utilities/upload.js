const multer = require('multer');
const path = require('path');

const excelFilter = (req, file, cb) => {
  if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
    cb(null, true);
  } else {
    cb('Please upload only excel file.', false);
  }
};

const imageFilter = (req, file, cb) => {
  const extension = file.originalname.split('.').pop();
  if (
    extension == 'png' ||
    extension == 'jpeg' ||
    extension == 'jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else {
    cb('Please upload only png / jpg / jpeg file.', false);
  }
};

const docFilter = (req, file, cb) => {
  if (file.mimetype.includes('pdf') || file.mimetype.includes('msword') || file.mimetype.includes('docx') || file.mimetype.includes('doc')) {
    cb(null, true);
  } else {
    cb('Please upload only pdf / doc file.', false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,path.join('/tmp'));
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,path.join('/tmp'));
  },
  filename: (req, file, cb) => {
    const code = req.params.code; // Mengambil code dari req.params
    const extension = file.originalname.split('.').pop();
    cb(null, `${code}${extension}`); // Menggunakan code dalam penamaan file
  },
});

var maxSize = 10000000;
var maxSizesurattugas = 1 * 1000 * 1000;

// var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
exports.multerUploadFile = multer({ storage, fileFilter: excelFilter }).single('file');
exports.multerUploadImage = multer({ storageImage, fileFilter: imageFilter }).single('image');
exports.multerUploadFilePDF = multer({ storage, fileFilter: docFilter, limits: { fileSize: maxSizesurattugas } }).single('file');

exports.multerUploadFileDataAksi = multer({ storage, limits: { fileSize: maxSize } }).single('file');
// module.exports = uploadFile;
