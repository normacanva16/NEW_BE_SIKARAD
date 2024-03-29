// Library

// UTILS

const response = require('../helpers/apiResponse');
const Sequelize = require('sequelize');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const XLSX = require('xlsx')
const xl = require('excel4node');
const readXlsxFile = require('read-excel-file/node');

// MODEL

const db = require('../models/index');
const sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;


const DataEmployee = db.trx_employee_model;
const KotamaBalakpus = db.mst_kotama_model;
const UserActivityLog = db.trx_user_activity_log_model;

const { formatDate } = require('../helpers/file-helper');

exports.listByAksiId = (req, res) => {
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  const code_kotama_balakpus = req.query.code_kotama_balakpus;
  const masa_jabatan = req.query.masa_jabatan;
  const pangkat = req.query.pangkat;
  const korps = req.query.korps;

  let search = req.query.search.toLowerCase();
  // let searchWords = [];

  // if (search == null) {
  //   search = '';
  // } else {
  //   const words = search.toLowerCase().split(' ');
  //   words.forEach((word) => {
  //     searchWords.push({
  //       [Op.or]: [
  //         {
  //           kotama_balakpus: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           kode_jabatan: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           nama: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           pangkat: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           korps: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           nrp: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           jabatan: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           abit: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           tingkat_jabatan: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //         {
  //           dafukaj: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //       ],
  //     });
  //   });
  // }

  let where = {};

  if (code_kotama_balakpus != null && code_kotama_balakpus != '') {
    where['code_kotama_balakpus'] = code_kotama_balakpus;
  }

  
  // if (masa_jabatan != null && masa_jabatan != '') {
  //   if (masa_jabatan === "kosong") {
  //     where['tmt_jabatan'] = null;
  //   } else if (masa_jabatan === "diatas0") {
  //     // Set the condition for tenure between 0 and 1 year
  //     where['tmt_jabatan'] = Sequelize.literal(`
  //       CASE
  //         WHEN current_date - tmt_jabatan <= interval '1 years' THEN true
  //         ELSE false
  //       END
  //     `);
  //   } else if (masa_jabatan === "dibawah2") {
  //     // Set the condition for tenure between 1 and 2 years
  //     where['tmt_jabatan'] = Sequelize.literal(`
  //       CASE
  //         WHEN current_date - tmt_jabatan > interval '1 years' AND current_date - tmt_jabatan <= interval '2 years' THEN true
  //         ELSE false
  //       END
  //     `);
  //   } else if (masa_jabatan === "diatas2") {
  //     // Set the condition for tenure exceeding 2 years
  //     where['tmt_jabatan'] = Sequelize.literal(`
  //       CASE
  //         WHEN current_date - tmt_jabatan > interval '2 years' THEN true
  //         ELSE false
  //       END
  //     `);
  //   }
  // }

  if (masa_jabatan != null && masa_jabatan != '') {
    if (masa_jabatan === "kosong") {
      where['tmt_jabatan'] = null;
    } else if (masa_jabatan === "diatas0") {
      // Set the condition for tenure between 0 and 1 year
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '1 tahun' and tmt_jabatan IS NOT NULL THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "dibawah2") {
      // Set the condition for tenure between 1 and 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '1 tahun' and tmt_jabatan IS NOT NULL AND COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '2 tahun' and tmt_jabatan IS NOT NULL THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "diatas2") {
      // Set the condition for tenure exceeding 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '2 tahun' and tmt_jabatan IS NOT NULL THEN true
          ELSE false
        END
      `);
    }
  }
  
  

  if (pangkat != null && pangkat != '') {
    where['pangkat'] = {
      [Op.iLike]: `%${pangkat}%`,
    };
  }

  if (korps != null && korps != '') {
    where['korps'] = {
      [Op.iLike]: `%${korps}%`,
    };
  }

  DataEmployee.findAndCountAll({
    attributes: [
    'id',
    'code_kotama_balakpus',
    'kotama_balakpus',
    'kode_jabatan',
    'nama',
    'pangkat',
    'korps',
    'nrp',
    'jabatan',
    [
      Sequelize.literal('COALESCE(TO_CHAR(tmt_jabatan, \'DD Mon YYYY\'), \'\')'),
      'tmt_jabatan'
    ],
    'abit',
    'tingkat_jabatan',
    'dafukaj',
    'satuan',
    // [
    //   Sequelize.literal('COALESCE(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM tmt_jabatan), 0)'),
    //   'masa_jabatan'
    // ],
    // [
    //   Sequelize.literal(`
    //     FLOOR(
    //       COALESCE(
    //         (
    //           EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM tmt_jabatan)
    //         ) * 365 + 
    //         (
    //           EXTRACT(DAY FROM CURRENT_DATE) - EXTRACT(DAY FROM tmt_jabatan)
    //         ) +
    //         (
    //           EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM tmt_jabatan)
    //         ) * 30
    //       , 0) / 365
    //     )
    //   `),
    //   'masa_jabatan'
    // ],
    [
      Sequelize.literal(`
        COALESCE(
          (
            SELECT
              EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
              EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
              EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
          ), '0 tahun 0 bulan 0 hari'
        )
      `),
      'masa_jabatan'
    ],
    ],
    limit,
    offset,
    search,
    searchFields: ['kotama_balakpus', 'pangkat', 'korps', 'nrp', 'jabatan', 'tmt_jabatan', 'nama', 'abit', 'dafukaj', 'tingkat_jabatan', 'satuan'],
    where: where,
    order: [['code_kotama_balakpus', 'ASC']],
  })
    .then((data) => {
      const payload = {
        content: data.rows,
        totalData: data.count,
      };
      return response.successResponseWithData(res, 'success', payload);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// exports.uploadfileexcel = async (req, res) => {
//   try {
//     const file = req.file;

//     if (req.file == undefined) {
//       return res.status(400).send('Please upload an excel file!');
//     }

//     const findAllEmployee = await DataEmployee.findAll();

//     if (findAllEmployee.length > 0) {
//       const organisaisQuery = `
//       DELETE FROM trx_employee`;
  
//       await sequelize.query(organisaisQuery, {
//         type: QueryTypes.DELETE,
//       });
//     }

//     const sheetsToRead = [
//       'KODAM I BB', 'KODAM II SWJ', 'KODAM III SLW', 'KODAM IV DIP', 'KODAM V BRW', 'KODAM VI MLW', 
//       'KODAM IX UDY','KODAM XII TPR','KODAM XIII MDK', 'KODAM XIV HSN', 'KODAM XVI PTM',
//       'KODAM XVII CEN','KODAM XVIII KSR','KODAM JAYA','KODAM IM', 'PUSSENIF', 'PUSSENKAV', 'PUSSENARMED', 'PUSSENARHANUD',
//       'PUSZIAD', 'KOPASSUS','KOSTRAD','KODIKLATAD',
//       'DISADAAD','DISLAIKAD','DISJARAHAD','DISJASAD','DISINFOLAHTAD','DISLITBANGAD',
//       'DISPSIAD','DISBINTALAD','DISPENAD','DITKUMAD','DITKUAD','DITTOPAD',
//       'DITAJENAD','RSPAD GS','PUSKESAD','PUSBEKANGAD','PUSPALAD','PUSHUBAD',
//       'PUSPENERBAD','PUSINTELAD','PUSTERAD','PUSPOMAD','PUSSANSIAD','SECAPA AD',
//       'SESKOAD','AKMIL','ITJENAD','MABESAD'
//       ];
//     let allSheetData = [];

//     await Promise.all(
//       sheetsToRead.map(async (sheetName) => {
//         try {
//           const workbook = XLSX.readFile(file.path); // Provide the correct path
//           const sheet = workbook.Sheets[sheetName];
//           const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
//           const colheaders = ['KODE JAB', 'NAMA', 'PANGKAT', 'KORPS', 'NRP', 'JABATAN', 'TMT JAB', 'ABIT', 'TINGKAT JAB', 'DAFUKAJ'];
//           const indexheader = colheaders.map((header) => (rows[0] || []).indexOf(header));
    
//           // Skip header
//           rows.shift();
    
//           rows.forEach((row) => {
//             let formattedDate;
//             if (row[indexheader[6]] != null && row[indexheader[6]] != '') {
//               const timestamp = (parseInt(row[indexheader[6]]) - 25569) * 86400 * 1000;
//               const dateObject = new Date(timestamp);
//               formattedDate = dateObject.toLocaleDateString();
//             }
//             let datakorban = {
//               kotama_balakpus: sheetName,
//               code_kotama_balakpus: sheetsToRead.indexOf(sheetName)+1,
//               kode_jabatan: row[indexheader[0]],
//               nama: row[indexheader[1]],
//               pangkat: row[indexheader[2]],
//               korps: row[indexheader[3]],
//               nrp: row[indexheader[4]],
//               jabatan: row[indexheader[5]],
//               tmt_jabatan: formattedDate,
//               abit: row[indexheader[7]],
//               tingkat_jabatan: row[indexheader[8]],
//               dafukaj: row[indexheader[9]],
//             };
    
//             allSheetData.push(datakorban);
//           });
//         } catch (error) {
//           console.error(`Error reading sheet ${sheetName}: ${error.message}`);
//         }
//       })
//     )

//       DataEmployee.bulkCreate(allSheetData, {
//         user: req.user,
//         individualHooks: true,
//       })
//         .then(() => {
//           res.status(200).send({
//             message: 'Uploaded the file successfully: ' + req.file.originalname,
//             fileKey: file.filename,
//           });
//         })
//         .catch((error) => {
//           res.status(500).send({
//             message: 'Fail to import data into database!',
//             error: error.message,
//           });
//         });
    

   
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: 'Could not upload the file: ' + req.file.originalname,
//     });
//   }

//   await unlinkFile(req.file.path);
// };


const timeoutDuration = 10800000; // 3 hours in milliseconds

exports.uploadfileexcel = async (req, res) => {
  try {
    const file = req.file;

    console.log("pathfile", req.file.path)

    if (req.file == undefined) {
      return res.status(400).send('Please upload an excel file!');
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout: File upload process exceeded 1 hour.'));
      }, timeoutDuration);
    });

    const fileUploadPromise = new Promise(async (resolve, reject) => {
      try {
        const findAllEmployee = await DataEmployee.findAll();

        if (findAllEmployee.length > 0) {
          const organisaisQuery = `
            DELETE FROM trx_employee`;
      
          await sequelize.query(organisaisQuery, {
            type: QueryTypes.DELETE,
          });
        }

        const sheetsToRead = [
          'KODAM I BB', 'KODAM II SWJ', 'KODAM III SLW', 'KODAM IV DIP', 'KODAM V BRW', 'KODAM VI MLW', 
          'KODAM IX UDY','KODAM XII TPR','KODAM XIII MDK', 'KODAM XIV HSN', 'KODAM XVI PTM',
          'KODAM XVII CEN','KODAM XVIII KSR','KODAM JAYA','KODAM IM', 'PUSSENIF', 'PUSSENKAV', 'PUSSENARMED', 'PUSSENARHANUD',
          'PUSZIAD', 'KOPASSUS','KOSTRAD','KODIKLATAD',
          'DISADAAD','DISLAIKAD','DISJARAHAD','DISJASAD','DISINFOLAHTAD','DISLITBANGAD',
          'DISPSIAD','DISBINTALAD','DISPENAD','DITKUMAD','DITKUAD','DITTOPAD',
          'DITAJENAD','RSPAD GS','PUSKESAD','PUSBEKANGAD','PUSPALAD','PUSHUBAD',
          'PUSPENERBAD','PUSINTELAD','PUSTERAD','PUSPOMAD','PUSSANSIAD','SECAPA AD',
          'SESKOAD','AKMIL','ITJENAD','MABESAD'
        ];
        let allSheetData = [];

        await Promise.all(
          sheetsToRead.map(async (sheetName) => {
            try {
              const workbook = XLSX.readFile(file.path);
              const sheet = workbook.Sheets[sheetName];
              const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
              const colheaders = ['KODE JAB', 'NAMA', 'PANGKAT', 'KORPS', 'NRP', 'JABATAN', 'TMT JAB', 'ABIT', 'TINGKAT JAB', 'DAFUKAJ'];
              const indexheader = colheaders.map((header) => (rows[0] || []).indexOf(header));
        
              // Skip header
              rows.shift();
        
              rows.forEach((row) => {
                let formattedDate;
                if (row[indexheader[6]] != null && row[indexheader[6]] != '') {
                  const timestamp = (parseInt(row[indexheader[6]]) - 25569) * 86400 * 1000;
                  const dateObject = new Date(timestamp);
                  formattedDate = dateObject.toLocaleDateString();
                }
                let datakorban = {
                  kotama_balakpus: sheetName,
                  code_kotama_balakpus: sheetsToRead.indexOf(sheetName)+1,
                  kode_jabatan: row[indexheader[0]],
                  nama: row[indexheader[1]],
                  pangkat: row[indexheader[2]],
                  korps: row[indexheader[3]],
                  nrp: row[indexheader[4]],
                  jabatan: row[indexheader[5]],
                  tmt_jabatan: formattedDate,
                  abit: row[indexheader[7]],
                  tingkat_jabatan: row[indexheader[8]],
                  dafukaj: row[indexheader[9]],
                };
        
                allSheetData.push(datakorban);
              });
            } catch (error) {
              console.error(`Error reading sheet ${sheetName}: ${error.message}`);
            }
          })
        )

        await DataEmployee.bulkCreate(allSheetData, {
          user: req.user,
          individualHooks: true,
        });

        resolve({
          message: 'Uploaded the file successfully: ' + req.file.originalname,
          fileKey: file.filename,
        });
      } catch (error) {
        reject(error);
      }
    });

    // Use Promise.race to wait for either the file upload or timeout
    const result = await Promise.race([timeoutPromise, fileUploadPromise]);

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Could not upload the file: ' + req.file.originalname,
    });
  }

  await unlinkFile(req.file.path);
};

// exports.uploadfileexcelByKotama = async (req, res) => {

//   try {
//     const file = req.file;
//     console.log("path",req.file.path)

//     if (file === undefined) {
//       return res.status(400).send('Please upload an excel file!');
//     }

//         const allSheetData = [];

//         const workbook = XLSX.readFile(file.path);
//         const sheetName = workbook.SheetNames[0]; // Assuming there is only one sheet
//         const findKotama = await KotamaBalakpus.findOne({
//           where: { nama: sheetName },
//           attributes: ['code', 'nama'],
//         });

//         if (!findKotama) {
//           await unlinkFile(req.file.path);
//           return res.status(400).send({
//             message: 'Kotama Balakpus not found, check your sheetname and try again',
//           });
//         }

//         // Delete existing records before bulk create
//         const organisaisQuery = `
//           DELETE FROM trx_employee WHERE code_kotama_balakpus = '${findKotama.dataValues.code}'`;
          
//         await sequelize.query(organisaisQuery, {
//           type: QueryTypes.DELETE,
//         });

//         const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

//         const colheaders = ['KODE JAB', 'NAMA', 'PANGKAT', 'KORPS', 'NRP', 'JABATAN', 'TMT JAB', 'ABIT', 'TINGKAT JAB', 'DAFUKAJ'];
//         const indexheader = colheaders.map((header) => (rows[0] || []).indexOf(header));

//         // Skip header
//         rows.shift();

//         rows.forEach((row) => {
//           let formattedDate;
//           if (row[indexheader[6]] != null && row[indexheader[6]] !== '') {
//             const timestamp = (parseInt(row[indexheader[6]]) - 25569) * 86400 * 1000;
//             const dateObject = new Date(timestamp);
//             formattedDate = dateObject.toLocaleDateString();
//           }
//           let datakorban = {
//             kotama_balakpus: findKotama.dataValues.nama,
//             code_kotama_balakpus: findKotama.dataValues.code,
//             kode_jabatan: row[indexheader[0]],
//             nama: row[indexheader[1]],
//             pangkat: row[indexheader[2]],
//             korps: row[indexheader[3]],
//             nrp: row[indexheader[4]],
//             jabatan: row[indexheader[5]],
//             tmt_jabatan: formattedDate,
//             abit: row[indexheader[7]],
//             tingkat_jabatan: row[indexheader[8]],
//             dafukaj: row[indexheader[9]],
//           };

//           allSheetData.push(datakorban);
//         });

        
//       DataEmployee.bulkCreate(allSheetData, {
//         user: req.user,
//         individualHooks: true,
//       })
//         .then(() => {
//           res.status(200).send({
//             message: 'Uploaded the file successfully: ' + req.file.originalname,
//             fileKey: file.filename,
//           });
//         })
//         .catch((error) => {
//           res.status(500).send({
//             message: 'Fail to import data into database!',
//             error: error.message,
//           });
//         });

//                    // save log to database
//                    await UserActivityLog.create({
//                     email: req.user.email,
//                     activity_date: new Date(),
//                     activity: 'Upload File excel Data Personel Kotama/Balakpus ' + findKotama.dataValues.nama,
//                     ip_address: req.ip
//                   },{
//                     user: req.user,
//                     individualHooks: true,
//                   })

//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: 'Could not upload the file: ' + req.file.originalname,
//     });
//   }

//   // Ensure to import unlinkFile and call it appropriately
//   await unlinkFile(req.file.path);
// };

// exports.uploadfileexcelByKotama = async (req, res) => {
//   try {
//     const file = req.file;
//     console.log("path", req.file.path)

//     if (file === undefined) {
//       return res.status(400).send('Please upload an excel file!');
//     }

//     const workbook = XLSX.readFile(file.path, { cellDates: true, dateNF: 'YYYY-MM-DD' });
//     const sheetName = workbook.SheetNames[0]; // Assuming there is only one sheet
//     const findKotama = await KotamaBalakpus.findOne({
//       where: { nama: sheetName },
//       attributes: ['code', 'nama'],
//     });

//     if (!findKotama) {
//       await unlinkFile(req.file.path);
//       return res.status(400).send({
//         message: 'Kotama Balakpus not found, check your sheetname and try again',
//       });
//     }

//     const rowsGenerator = XLSX.stream.to_json(workbook.Sheets[sheetName]);
    
//     const processBatch = async (batchRows) => {
//       const allSheetData = [];

//       for (const row of batchRows) {
//         let formattedDate;
//         if (row['TMT JAB'] != null && row['TMT JAB'] !== '') {
//           const dateObject = new Date(row['TMT JAB']);
//           formattedDate = dateObject.toLocaleDateString();
//         }
//         const datakorban = {
//           kotama_balakpus: findKotama.dataValues.nama,
//           code_kotama_balakpus: findKotama.dataValues.code,
//           kode_jabatan: row['KODE JAB'],
//           nama: row['NAMA'],
//           pangkat: row['PANGKAT'],
//           korps: row['KORPS'],
//           nrp: row['NRP'],
//           jabatan: row['JABATAN'],
//           tmt_jabatan: formattedDate,
//           abit: row['ABIT'],
//           tingkat_jabatan: row['TINGKAT JAB'],
//           dafukaj: row['DAFUKAJ'],
//         };
//         allSheetData.push(datakorban);
//       }

//       await DataEmployee.bulkCreate(allSheetData, {
//         user: req.user,
//         individualHooks: true,
//         logging: false // tambahkan opsi logging: false di sini
//       });
//     };

//     const batchSize = 100; // Adjust batch size as needed
//     let batchRows = [];
//     let rowCount = 0;

//     for await (const row of rowsGenerator) {
//       batchRows.push(row);
//       rowCount++;

//       if (rowCount === batchSize) {
//         await processBatch(batchRows);
//         batchRows = [];
//         rowCount = 0;
//       }
//     }

//     // Process remaining rows
//     if (batchRows.length > 0) {
//       await processBatch(batchRows);
//     }

//     // Save log to database
//     await UserActivityLog.create({
//       email: req.user.email,
//       activity_date: new Date(),
//       activity: 'Upload File excel Data Personel Kotama/Balakpus ' + findKotama.dataValues.nama,
//       ip_address: req.ip
//     });

//     res.status(200).send({
//       message: 'Uploaded the file successfully: ' + req.file.originalname,
//       fileKey: file.filename,
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: 'Could not upload the file: ' + req.file.originalname,
//     });
//   }

//   // Ensure to import unlinkFile and call it appropriately
//   await unlinkFile(req.file.path);
// };

// exports.uploadfileexcelByKotama = async (req, res) => {
//   try {
//     const file = req.file;

//     if (file == undefined) {
//       return res.status(400).send('Please upload an excel file!');
//     }

//     readXlsxFile(file.path, { sheet: 'Data' }).then(async(rows) => {
//       // skip header

//       console.log(rows[0]);
//       let colheaders = [
//         'KODE JAB',
//         'NAMA',
//         'PANGKAT',
//         'KORPS',
//         'NRP',
//         'JABATAN',
//         'TMT JAB',
//         'ABIT',
//         'TINGKAT JAB',
//         'DAFUKAJ'
//       ];

//       let indexheader = [];

//       for (const a of colheaders) {
//         indexheader.push(rows[0].indexOf(a));
//       }

//       rows.shift();

//       rows.forEach(async (row) => {
//         if (row[indexheader[5]] != null) {
//           let formattedDate;
//             if (row[indexheader[6]] != null && row[indexheader[6]] !== '') {
//               const dateObject = new Date(row[indexheader[6]]);
//               formattedDate = dateObject.toLocaleDateString();
//             }
//             let datakorban = {
//               kotama_balakpus: 'KODAM I BB',
//               code_kotama_balakpus: 1,
//               kode_jabatan: row[indexheader[0]],
//               nama: row[indexheader[1]],
//               pangkat: row[indexheader[2]],
//               korps: row[indexheader[3]],
//               nrp: row[indexheader[4]],
//               jabatan: row[indexheader[5]],
//               tmt_jabatan: formattedDate,
//               abit: row[indexheader[7]],
//               tingkat_jabatan: row[indexheader[8]],
//               dafukaj: row[indexheader[9]],
//             };

//             await DataEmployee.create(datakorban, {
//               user: req.user,
//               individualHooks: true,
//             });
          
//         }
//       });

//       await unlinkFile(file.path);
//       // Save log to database
//       await UserActivityLog.create({
//        email: req.user.email,
//        activity_date: new Date(),
//        activity: 'Upload File excel Data Personel Kotama/Balakpus ' + 'KODAM I BB',
//        ip_address: req.ip
//      });

//       res.status(200).send({
//         message: 'Uploaded the file successfully: ' + req.file.originalname,
//         fileKey: file.filename,
//       });
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: 'Could not upload the file: ' + req.file.originalname,
//     });
//   }
// }

// exports.uploadfileexcelByKotama = async (req, res) => {
//   try {
//     const file = req.file;

//     if (file == undefined) {
//       return res.status(400).send('Please upload an excel file!');
//     }

//     const rows = await readXlsxFile(file.path, { sheet: 'Data' });

//     // Pastikan bahwa ada baris yang terbaca
//     if (rows.length === 0) {
//       return res.status(400).send('No data found in the excel file!');
//     }

//     // Pastikan bahwa nama kolom sesuai dengan yang Anda harapkan
//     const colheaders = [
//       'KODE JAB',
//       'NAMA',
//       'PANGKAT',
//       'KORPS',
//       'NRP',
//       'JABATAN',
//       'TMT JAB',
//       'ABIT',
//       'TINGKAT JAB',
//       'DAFUKAJ'
//     ];

//     // Periksa indeks kolom untuk setiap kolom yang Anda butuhkan
//     const indexheader = colheaders.map(col => rows[0].indexOf(col));

//     const bulkInsertData = rows
//       .filter((row, index) => index !== 0 && row[indexheader[5]] !== null) // Pastikan untuk memfilter header
//       .map(row => {
//         let formattedDate = null;
//         if (row[indexheader[6]] != null && row[indexheader[6]] !== '') {
//           const dateObject = new Date(row[indexheader[6]]);
//           formattedDate = dateObject.toLocaleDateString(); // Perhatikan bahwa format tanggal ini cocok dengan database Anda
//         }
//         return {
//           kotama_balakpus: 'KODAM I BB',
//           code_kotama_balakpus: 1,
//           kode_jabatan: row[indexheader[0]],
//           nama: row[indexheader[1]],
//           pangkat: row[indexheader[2]],
//           korps: row[indexheader[3]],
//           nrp: row[indexheader[4]],
//           jabatan: row[indexheader[5]],
//           tmt_jabatan: formattedDate,
//           abit: row[indexheader[7]],
//           tingkat_jabatan: row[indexheader[8]],
//           dafukaj: row[indexheader[9]],
//           create_date: new Date(),
//           updated_date: new Date()
//         };
//       });

//     await DataEmployee.bulkCreate(bulkInsertData, {
//       individualHooks: true,
//     });

//     // Save log to database
//     await UserActivityLog.create({
//       email: req.user.email,
//       activity_date: new Date(),
//       activity: 'Upload File excel Data Personel Kotama/Balakpus ' + 'KODAM I BB',
//       ip_address: req.ip
//     });

//     res.status(200).send({
//       message: 'Uploaded the file successfully: ' + req.file.originalname,
//       fileKey: file.filename,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: 'Could not upload the file: ' + req.file.originalname,
//     });
//   }
// }

exports.uploadfileexcelByKotama = async (req, res) => {
  try {
    const file = req.file;
    const codekotama = parseInt(req.query.code);

    const kotamad = await KotamaBalakpus.findOne({
      where: {
        code: codekotama
      },
      attributes: ['nama']
    })
    const namakotama = kotamad.nama;

    if (!file) {
      return res.status(400).send('Please upload an excel file!');
    }

    const batchLimit = 1000; // Set the batch limit

    const processBatch = async (rows) => {
      const bulkInsertData = [];
      for (let row of rows) {
        let formattedDate = null;
        let formattedDate1 = null;
        if (row[6] != null && row[6] !== '') {
          const dateObject = new Date(row[6]);
          if (!isNaN(dateObject)) {
            formattedDate = dateObject.toLocaleDateString();
          } else {
            console.error('Invalid date:', row[6]); // Tampilkan tanggal yang tidak valid
            // Lakukan penanganan untuk tanggal tidak valid, misalnya lewati atau atur ke null
            // Di sini saya akan menetapkan tanggal yang tidak valid ke null
          }
        }
        if (row[8] != null && row[8] !== '') {
          const dateObject1 = new Date(row[8]);
          if (!isNaN(dateObject1)) {
            formattedDate1 = dateObject1.toLocaleDateString();
          } else {
            console.error('Invalid date:', row[8]); // Tampilkan tanggal yang tidak valid
            // Lakukan penanganan untuk tanggal tidak valid, misalnya lewati atau atur ke null
            // Di sini saya akan menetapkan tanggal yang tidak valid ke null
          }
        }
        bulkInsertData.push({
          kotama_balakpus: namakotama,
          code_kotama_balakpus: codekotama,
          satuan: row[0],
          jabatan: row[1],
          nama: row[2],
          pangkat: row[3],
          korps: row[4],
          nrp: row[5],
          tmt_jabatan: formattedDate,
          abit: row[7],
          tgl_lahir: formattedDate1,
          dafukaj: row[9]
        });
      }
      console.log("bulkInsertData",bulkInsertData.length);
      await DataEmployee.bulkCreate(bulkInsertData, { individualHooks: true, logging: false  });
    };

    const stream = fs.createReadStream(file.path);
    let batchCount = 0;
    let rowsBuffer = [];
    let headerSkipped = false; // Flag untuk menandai apakah header sudah dilewati

    readXlsxFile(stream, { sheet: 'Data' })
      .then(async (rows) => {
        for (const row of rows) {
          if (!headerSkipped) {
            headerSkipped = true;
            continue; // Lewati baris header
          }

          if (batchCount < batchLimit) {
            rowsBuffer.push(row);
            batchCount++;
          } else {
            await processBatch(rowsBuffer);
            rowsBuffer = [row];
            batchCount = 1;
          }
        }

        if (rowsBuffer.length > 0) {
          await processBatch(rowsBuffer);
        }

        // Save log to database
        await UserActivityLog.create({
          email: req.user.email,
          activity_date: new Date(),
          activity: 'Upload File excel Data Personel Kotama/Balakpus ' + namakotama,
          ip_address: req.ip
        });

        res.status(200).send({
          message: 'Uploaded the file successfully: ' + req.file.originalname,
          fileKey: file.filename,
        });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send({
          message: 'Could not upload the file: ' + req.file.originalname,
        });
      })
      .finally(() => {
        // Remove uploaded file
        fs.unlinkSync(file.path);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: 'Could not upload the file: ' + req.file.originalname,
    });
  }
}



exports.view = async (req, res) => {
  const { id } = req.params;

  try {
    DataEmployee.findByPk(id)
      .then(async(result) => {
        if (result != null) {
          console.log(result.id)
          const findDataEmployee = await DataEmployee.findOne({
            where: {
              id: result.id,
            },
            attributes: [
              'id',
              'code_kotama_balakpus',
              'kotama_balakpus',
              'kode_jabatan',
              'nama',
              'pangkat',
              'korps',
              'nrp',
              'jabatan',
              [
                Sequelize.literal('COALESCE(TO_CHAR(tmt_jabatan, \'DD Mon YYYY\'), \'\')'),
                'tmt_jabatan'
              ],
              'satuan',
              [
                Sequelize.literal('COALESCE(TO_CHAR(tgl_lahir, \'DD Mon YYYY\'), \'\')'),
                'tgl_lahir'
              ],
              'abit',
              'tingkat_jabatan',
              'dafukaj',
              [
                Sequelize.literal(`
                  COALESCE(
                    (
                      SELECT
                        EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
                        EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
                        EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
                    ), '0 tahun 0 bulan 0 hari'
                  )
                `),
                'masa_jabatan'
              ],
              ],
          })
          return response.successResponseWithData(res, 'success', findDataEmployee);
        } else {
          return response.notFoundResponse(res, `Employee with id ${id} not found`);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.exportListEmployee = (req, res) => {

  const code_kotama_balakpus = req.query.code_kotama_balakpus;
  const masa_jabatan = req.query.masa_jabatan;
  const pangkat = req.query.pangkat;
  const korps = req.query.korps;


  let where = {};

  if (code_kotama_balakpus != null && code_kotama_balakpus != '') {
    where['code_kotama_balakpus'] = code_kotama_balakpus;
  }

  
  if (masa_jabatan != null && masa_jabatan != '') {
    if (masa_jabatan === "kosong") {
      where['tmt_jabatan'] = null;
    } else if (masa_jabatan === "diatas0") {
      // Set the condition for tenure between 0 and 1 year
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan <= interval '1 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "dibawah2") {
      // Set the condition for tenure between 1 and 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '1 years' AND current_date - tmt_jabatan <= interval '2 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "diatas2") {
      // Set the condition for tenure exceeding 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '2 years' THEN true
          ELSE false
        END
      `);
    }
  }
  

  if (pangkat != null && pangkat != '') {
    where['pangkat'] = {
      [Op.iLike]: `%${pangkat}%`,
    };
  }

  if (korps != null && korps != '') {
    where['korps'] = {
      [Op.iLike]: `%${korps}%`,
    };
  }

  DataEmployee.findAndCountAll({
    attributes: [
    'id',
    'code_kotama_balakpus',
    'kotama_balakpus',
    'nama',
    'pangkat',
    'korps',
    'nrp',
    'jabatan',
    [
      Sequelize.literal('COALESCE(TO_CHAR(tmt_jabatan, \'DD Mon YYYY\'), \'\')'),
      'tmt_jabatan'
    ],
    [
      Sequelize.literal('COALESCE(TO_CHAR(tgl_lahir, \'DD Mon YYYY\'), \'\')'),
      'tgl_lahir'
    ],
    'satuan',
    [
      Sequelize.literal(`
        COALESCE(
          (
            SELECT
              EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
              EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
              EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
          ), '0 tahun 0 bulan 0 hari'
        )
      `),
      'masa_jabatan'
    ],
    ],
    where: where,
    order: [['code_kotama_balakpus', 'ASC']],
  })
    .then(async (data) => {
      let transaksiArray = [];

      data.rows.forEach((row) => {
        transaksiArray.push({
          kotama_balakpus: row.dataValues.kotama_balakpus,
          satuan: row.dataValues.satuan,
          jabatan: row.dataValues.jabatan,
          masa_jabatan: row.dataValues.masa_jabatan,
          nama : row.dataValues.nama,
          pangkat: row.dataValues.pangkat,
          korps: row.dataValues.korps,
          nrp: row.dataValues.nrp,
          tmt_jabatan: row.dataValues.tmt_jabatan
        });
      });

      const wb = new xl.Workbook();
      const ws = wb.addWorksheet('Data Personel');
      const headingColumnNames = [
        'KOTAMA / BALAKPUS',
        'SATUAN',
        'JABATAN',
        'MASA JABATAN',
        'NAMA',
        'PANGKAT',
        'KORPS',
        'NRP',
        'TMT JAB'
      ];
      let headingColumnIndex = 1;
      headingColumnNames.forEach((heading) => {
        ws.cell(1, headingColumnIndex++).string(heading);
      });
      let rowIndex = 2;
      transaksiArray.forEach((record) => {
        let columnIndex = 1;
        Object.keys(record).forEach((columnName) => {
          ws.cell(rowIndex, columnIndex++).string(record[columnName]);
        });
        rowIndex++;
      });

      const currentDate = new Date();

      var filename = `DataPegawai_${('0' + currentDate.getDate()).slice(-2)}${('0' + (currentDate.getMonth() + 1)).slice(
        -2,
      )}${currentDate.getFullYear().toString().substr(-2)}`;
      returnData = {
        metadata: {
          link: filename,
        },
      };
      wb.write(`${filename}.xlsx`, res);

    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.viewEmployeeByJabatan = (req, res) => {
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  const code_kotama_balakpus = req.query.code_kotama_balakpus;
  const masa_jabatan = req.query.masa_jabatan;

  let where = { };

  if (code_kotama_balakpus != null && code_kotama_balakpus != '') {
    where['code_kotama_balakpus'] = code_kotama_balakpus;
  }

  
  if (masa_jabatan != null && masa_jabatan != '') {
    if (masa_jabatan === "kosong") {
      where['tmt_jabatan'] = null;
    } else if (masa_jabatan === "diatas0") {
      // Set the condition for tenure between 0 and 1 year
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan <= interval '1 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "dibawah2") {
      // Set the condition for tenure between 1 and 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '1 years' AND current_date - tmt_jabatan <= interval '2 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "diatas2") {
      // Set the condition for tenure exceeding 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '2 years' THEN true
          ELSE false
        END
      `);
    }
  }

  DataEmployee.findAndCountAll({
    attributes: [
    'id',
    'code_kotama_balakpus',
    'kotama_balakpus',
    'nama',
    'nrp',
    'jabatan',
    [
      Sequelize.literal('COALESCE(TO_CHAR(tmt_jabatan, \'DD Mon YYYY\'), \'\')'),
      'tmt_jabatan'
    ],
    [
      Sequelize.literal(`
        COALESCE(
          (
            SELECT
              EXTRACT(YEAR FROM age(current_date, tmt_jabatan)) || ' tahun ' ||
              EXTRACT(MONTH FROM age(current_date, tmt_jabatan)) || ' bulan ' ||
              EXTRACT(DAY FROM age(current_date, tmt_jabatan)) || ' hari'
          ), '0 tahun 0 bulan 0 hari'
        )
      `),
      'masa_jabatan'
    ],
    ],
    limit,
    offset,
    where: where,
  })
    .then((data) => {
      const payload = {
        content: data.rows,
        totalData: data.count,
      };
      return response.successResponseWithData(res, 'success', payload);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteEmployeeByFilter = async(req, res) => {

  const code_kotama_balakpus = req.query.code_kotama_balakpus;
  const masa_jabatan = req.query.masa_jabatan;
  const pangkat = req.query.pangkat;
  const korps = req.query.korps;


  let where = {};

  if (code_kotama_balakpus != null && code_kotama_balakpus != '') {
    where['code_kotama_balakpus'] = code_kotama_balakpus;
  }

  
  if (masa_jabatan != null && masa_jabatan != '') {
    if (masa_jabatan === "kosong") {
      where['tmt_jabatan'] = null;
    } else if (masa_jabatan === "diatas0") {
      // Set the condition for tenure between 0 and 1 year
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan <= interval '1 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "dibawah2") {
      // Set the condition for tenure between 1 and 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '1 years' AND current_date - tmt_jabatan <= interval '2 years' THEN true
          ELSE false
        END
      `);
    } else if (masa_jabatan === "diatas2") {
      // Set the condition for tenure exceeding 2 years
      where['tmt_jabatan'] = Sequelize.literal(`
        CASE
          WHEN current_date - tmt_jabatan > interval '2 years' THEN true
          ELSE false
        END
      `);
    }
  }
  

  if (pangkat != null && pangkat != '') {
    where['pangkat'] = {
      [Op.iLike]: `%${pangkat}%`,
    };
  }

  if (korps != null && korps != '') {
    where['korps'] = {
      [Op.iLike]: `%${korps}%`,
    };
  }

  try{

  const findAllEmployee = await DataEmployee.findAll({
    where: where,
    attributes:['id']
  })

  if (findAllEmployee.length < 1) {
    return response.notFoundResponse(res, 'Data Pegawai Tidak Ditemukan');
  }

  const arrayOfIds = findAllEmployee.map(employee => employee.id);

  const relawanQuery = `
  DELETE FROM trx_employee
  WHERE id IN (:arrayOfIds)
`;

await sequelize.query(relawanQuery, {
  type: QueryTypes.DELETE,
  replacements: { arrayOfIds },
});

  // save log to database
  await UserActivityLog.create({
    email: req.user.email,
    activity_date: new Date(),
    activity: 'Delete Data Personel',
    ip_address: req.ip
  },{
    user: req.user,
    individualHooks: true,
  })

    return response.successResponse(res, `success delete data pegawai`);
    
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
  
};

exports.listIsExistEmployee = async (req, res) => {
  const rawQuery = `
  SELECT 
  mst_kotama.code,
  mst_kotama.nama,
  CASE 
      WHEN MAX(CASE WHEN trx_employee.code_kotama_balakpus IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'true'
      ELSE 'false'
  END AS is_exist,
  COALESCE(TO_CHAR((SELECT MAX(updated_date) FROM trx_employee WHERE code_kotama_balakpus = mst_kotama.code), 'DD Mon YYYY HH24:MI:SS'), '') AS last_updated_date
FROM 
  mst_kotama
LEFT JOIN 
  trx_employee ON mst_kotama.code = trx_employee.code_kotama_balakpus
GROUP BY 
  mst_kotama.code, mst_kotama.nama
ORDER BY 
  mst_kotama.code ASC;

  `; 
  try {
    const result = await sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
    });
    let payload = [];

    for (const a of result) {
      payload.push({
        text: a.nama,
        value: a.is_exist,
        last_updated_date: a.last_updated_date,
        code: a.code
      });
    }
    res.status(200).send(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};