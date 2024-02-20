// Library
const Sequelize = require('sequelize');

// UTILS

const response = require('../helpers/apiResponse');

// MODEL

const db = require('../models/index');
const sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;
const MasterKotamaBalakpus = db.mst_kotama_model;
const DataEmployee = db.trx_employee_model;
const Op = db.Sequelize.Op;

//dashboard peta

exports.getAllKotama = async (req, res) => {
  try {
    const { search, filter_tipe } = req.query;

    // Validate inputs
    const myFilter = filter_tipe && filter_tipe !== "" ? filter_tipe.split(",") : [];

    // Fetch Kotama data
    const findKotama = await getKotamaData();

    // Fetch employee data
    const findDataEmployee = await getEmployeeData();

    // Calculate results
    const countResult = calculateResults(findKotama, findDataEmployee);

    // Apply filters
    let result;
    if (search) {
      result = applySearchFilter(countResult, search);
    } else if (myFilter.length > 0) {
      result = applyTypeFilter(countResult, myFilter);
    } else {
      result = countResult;
    }

    const payload = {
      content: result,
      totalData: result.length,
    };

    return response.successResponseWithData(res, 'success', payload);
  } catch (error) {
    console.error(error);
    return response.errorResponse(res, 'Internal Server Error');
  }
};

// Helper function to fetch Kotama data
const getKotamaData = async () => {
  try {
    return await MasterKotamaBalakpus.findAll({
      attributes: ['id','code', 'nama', 'alamat', 'latitude', 'longitude', 'url_gmaps'],
      where: {
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null },
      },
    });
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be caught by the outer catch block
  }
};

// Helper function to fetch employee data
const getEmployeeData = async () => {
  try {
    return await DataEmployee.findAll({
      // where: {
      //   jabatan: { [Op.not]: null },
      //   [Op.or]: [
      //     { nrp: { [Op.eq]: null } }, // Nrp boleh null
      //     { nrp: { [Op.eq]: '' } },  // Nrp boleh string kosong
      //     {
      //       tmt_jabatan: {
      //         [Op.lte]: Sequelize.literal('NOW() - INTERVAL \'2 years\''),
      //       },
      //     },
      //   ]
      // },
      attributes: [
        'id',
        'code_kotama_balakpus',
        'nama',
        'nrp',
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
    });
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be caught by the outer catch block
  }
};

// Helper function to calculate results
// const calculateResults = (kotamaData, employeeData) => {
//   const countResult = [];

//   kotamaData.forEach(itemData1 => {
//     const matchingElements = employeeData.filter(itemData2 => itemData2.kotama === itemData1.nama);

//     countResult.push({
//       id: itemData1.id,
//       type: itemData1.type,
//       nama: itemData1.nama,
//       alamat: itemData1.alamat,
//       latitude: itemData1.latitude,
//       longitude: itemData1.longitude,
//       url_gmaps: itemData1.url_gmaps,
//       count: matchingElements.length
//     });
//   });

//   return countResult;
// };

// Helper function to calculate results
const calculateResults = (kotamaData, employeeData) => {
  const countResult = [];

  kotamaData.forEach(itemData1 => {
    const matchingElements = employeeData.filter(itemData2 => itemData2.code_kotama_balakpus == itemData1.code);
    
    const totalJabKosong = matchingElements.filter(itemData2 => (itemData2.nrp === null || itemData2.nrp === ""));
    let jabdibawah1 = []
    let jabdiatas1 = []
    let jabdiatas2 = []
    const totalJabatanIsi = matchingElements.map(itemData2 => {
      let indexTahun = itemData2.masa_jabatan.indexOf(" tahun");
      if (itemData2.nrp !== null && itemData2.nrp !== "" && indexTahun !== -1) {
        let stringSebelumTahun = itemData2.masa_jabatan.substring(0, indexTahun);
        let years = parseInt(stringSebelumTahun);

        // Assuming the format is "tahun bulan hari"
        // Extracting months and days
        let indexBulan = itemData2.masa_jabatan.indexOf(" bulan");
        let indexHari = itemData2.masa_jabatan.indexOf(" hari");

        let months = 0;
        let days = 0;

        if (indexBulan !== -1) {
            let stringBetweenTahunBulan = itemData2.masa_jabatan.substring(indexTahun + 6, indexBulan);
            months = parseInt(stringBetweenTahunBulan);
        }

        if (indexHari !== -1) {
            let stringBetweenBulanHari = itemData2.masa_jabatan.substring(indexBulan + 7, indexHari);
            days = parseInt(stringBetweenBulanHari);
        }
        if (years === 0 || (years === 1  && months === 0 && days === 0)) {
          jabdibawah1.push(itemData2.nrp)
      } else if ((years === 1 && months >= 0 && days >= 1) ||  (years === 2  && months === 0 && days === 0)) {
        jabdiatas1.push(itemData2.nrp)
      } else if ((years === 2  && months >= 0 && days >= 1) || (years > 2)) {
        jabdiatas2.push(itemData2.nrp)
      }
      }
    });


    countResult.push({
      id: itemData1.id,
      type: itemData1.type,
      nama: itemData1.nama,
      code: itemData1.code,
      url_image: "../../../../public/img/kotama/"+itemData1.code+".png",
      alamat: itemData1.alamat,
      latitude: itemData1.latitude,
      longitude: itemData1.longitude,
      url_gmaps: itemData1.url_gmaps,
      // count: matchingElements.length,
      jab_kosong: totalJabKosong.length,
      jabdiatas1: jabdiatas1.length,
      jabdiatas2: jabdiatas2.length,
      jabdibawah1: jabdibawah1.length
    });
  });

  return countResult;
};


// Helper function to apply search filter
const applySearchFilter = (data, searchTerm) => {
  return data.filter(union => union.nama === searchTerm);
};

// Helper function to apply type filter
const applyTypeFilter = (data, typeFilter) => {
  return data.filter(union => typeFilter.includes(union.nama));
};


exports.getSummaryDateMappingPegawaiByKotama = async (req, res) => {
  const pangkat = req.query.pangkat;

  const replacements = {};
  try {
    let baseQuery = `   
    SELECT
  mst_kotama.nama as kotama_balakpus,
  mst_kotama.code as code_kotama_balakpus,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN trx_employee.tmt_jabatan IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '1 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_A,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '1 tahun' and trx_employee.tmt_jabatan IS NOT NULL AND COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_B,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_C,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_D
FROM mst_kotama
LEFT JOIN trx_employee ON mst_kotama.code = trx_employee.code_kotama_balakpus
`;

if (pangkat != null && pangkat != '') {

  baseQuery += ` where trx_employee.pangkat ilike '%${pangkat}%'`
  replacements['pangkat'] = pangkat;
}

baseQuery +=`
GROUP BY mst_kotama.nama, mst_kotama.code
ORDER BY mst_kotama.code ASC;
 `;

    const query = `${baseQuery}`;

    const result = await sequelize.query(query, {
      replacements: {
        ...replacements,
      },
      type: QueryTypes.SELECT,
    });

    let jabkosong = [];
    let jabdiatas0 = [];
    let jabdibawah2 = [];
    let jabdiatas2 = [];

    for (const a of result) {
      jabkosong.push([a.kotama_balakpus, parseInt(a.jabatan_d)]);
    }

    for (const a of result) {
      jabdiatas0.push([a.kotama_balakpus, parseInt(a.jabatan_a)]);
    }

    for (const a of result) {
      jabdibawah2.push([a.kotama_balakpus, parseInt(a.jabatan_b)]);
    }

    for (const a of result) {
      jabdiatas2.push([a.kotama_balakpus, parseInt(a.jabatan_c)]);
    }

    let payload = {
      series: [
        {
          name: 'Jabatan Kosong',
          data: jabkosong,
        },
        {
          name: 'Jabatan 0 - 1 Tahun',
          data: jabdiatas0,
        },
        {
          name: 'Jabatan 1 - 2 Tahun',
          data: jabdibawah2,
        },
        {
          name: 'Jabatan > 2 Tahun',
          data: jabdiatas2,
        },
      ],
    };

    return res.status(200).json(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getRekapitulasiData = async (req, res) => {
  const pangkat = req.query.pangkat;
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? parseInt(req.query.page) : 1;
  const search = req.query.search;

  const replacements = {};
  try {
    let baseQuery = `   
    SELECT
  mst_kotama.nama as kotama_balakpus,
  mst_kotama.code as code_kotama_balakpus,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN trx_employee.tmt_jabatan IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '1 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_A,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '1 tahun' and trx_employee.tmt_jabatan IS NOT NULL AND COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_B,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_C,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_D
FROM mst_kotama
LEFT JOIN trx_employee ON mst_kotama.code = trx_employee.code_kotama_balakpus
`;

if (pangkat != null && pangkat != '') {

  baseQuery += ` where trx_employee.pangkat ilike '%${pangkat}%'`
  replacements['pangkat'] = pangkat;
}

if (search != null && search != '') {

  baseQuery += ` where mst_kotama.nama ilike '%${search}%'`
  replacements['search'] = search;
}

baseQuery +=`
GROUP BY mst_kotama.nama, mst_kotama.code
ORDER BY mst_kotama.code ASC;
 `;

    const query = `${baseQuery}`;

    const result = await sequelize.query(query, {
      replacements: {
        ...replacements,
      },
      type: QueryTypes.SELECT,
    });

    let arraydata = []

    for (let i = 0; i < result.length; i++) {

      arraydata.push({
        "kotama_balakpus": result[i].kotama_balakpus,
        "pangkat": (pangkat != null && pangkat != '') ? pangkat : 'Semua',
        "datadetail": [
          "Jabatan Kosong : " + result[i].jabatan_d,
          "Jabatan 0-1 Tahun : " + result[i].jabatan_a,
          "Jabatan 1-2 Tahun : " + result[i].jabatan_b,
          "Jabatan > 2 Tahun : " + result[i].jabatan_c
        ]
      })
    }

    const resultpaginate = paginate(arraydata, limit, offset);

    let payload = {
      data: resultpaginate,
      total_data: result.length,
    };

    return res.status(200).json(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

exports.getRekapitulasiDataAll = async (req, res) => {
  const pangkat = req.query.pangkat;

  const replacements = {};
  try {
    let baseQuery = `   
    SELECT
  mst_kotama.nama as kotama_balakpus,
  mst_kotama.code as code_kotama_balakpus,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN trx_employee.tmt_jabatan IS null and trx_employee.jabatan is not NULL THEN 1
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '1 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_A,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '1 tahun' and trx_employee.tmt_jabatan IS NOT NULL AND COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) <= '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_B,
  COALESCE(SUM(CASE
      WHEN COALESCE(
            (
              SELECT
                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
          ) > '2 tahun' and trx_employee.tmt_jabatan IS NOT null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_C,
  COALESCE(SUM(CASE
      WHEN trx_employee.tmt_jabatan IS NULL AND trx_employee.nrp IS null and trx_employee.jabatan is not NULL THEN 1
      ELSE 0
  END), 0) as jabatan_D
FROM mst_kotama
LEFT JOIN trx_employee ON mst_kotama.code = trx_employee.code_kotama_balakpus
`;

if (pangkat != null && pangkat != '') {

  baseQuery += ` where trx_employee.pangkat ilike '%${pangkat}%'`
  replacements['pangkat'] = pangkat;
}

baseQuery +=`
GROUP BY mst_kotama.nama, mst_kotama.code
ORDER BY mst_kotama.code ASC;
 `;

    const query = `${baseQuery}`;

    const result = await sequelize.query(query, {
      replacements: {
        ...replacements,
      },
      type: QueryTypes.SELECT,
    });

    let arraydata = []

    for (let i = 0; i < result.length; i++) {

      arraydata.push({
        "kotama_balakpus": result[i].kotama_balakpus,
        "pangkat": (pangkat != null && pangkat != '') ? pangkat : 'Semua',
        "datadetail": [
          "Jabatan Kosong : " + result[i].jabatan_d,
          "Jabatan 0-1 Tahun : " + result[i].jabatan_a,
          "Jabatan 1-2 Tahun : " + result[i].jabatan_b,
          "Jabatan > 2 Tahun : " + result[i].jabatan_c
        ]
      })
    }

    const resultpaginate = arraydata

    let payload = {
      data: resultpaginate,
      total_data: result.length,
    };

    return res.status(200).json(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


exports.getNotificationPeta = async (req, res) => {

  try {
    let baseQuery = `   
    SELECT 
    mst_kotama.id, 
    mst_kotama.nama, 
    mst_kotama.code, 
    mst_kotama.latitude, 
    mst_kotama.longitude,
    COUNT(trx_employee.id) AS jumlah_employee,
    CASE
        WHEN COALESCE(
                (
                    SELECT
                        EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                        EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                        EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
                ), '0 tahun 0 bulan 0 hari'
            ) > '1 tahun 5 bulan' THEN 'Jab_Kadaluarsa'
        WHEN trx_employee.tmt_jabatan IS NULL AND (trx_employee.nrp IS NULL OR trx_employee.nrp = '') AND (trx_employee.nama IS NULL OR trx_employee.nama = '') and trx_employee.jabatan is not NULL THEN 'Jab_Kosong'
        ELSE NULL
    END AS group_name
FROM 
    mst_kotama
LEFT JOIN 
    trx_employee ON mst_kotama.code = trx_employee.code_kotama_balakpus
WHERE 
    COALESCE(
        (
          SELECT
            EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
            EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
            EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
        ), '0 tahun 0 bulan 0 hari'
    ) > '1 tahun 5 bulan'
    OR (trx_employee.tmt_jabatan IS NULL AND (trx_employee.nrp IS NULL OR trx_employee.nrp = '') AND trx_employee.jabatan IS NOT NULL)
GROUP BY 
    mst_kotama.id, 
    mst_kotama.nama, 
    mst_kotama.code, 
    mst_kotama.latitude, 
    mst_kotama.longitude,
    group_name;

`;

    const query = `${baseQuery}`;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    let jabkosong = [];
    let jablebih15 = [];

    for (const a of result) {
      if (a.group_name === "Jab_Kosong") {
      jabkosong.push(a);
      }
    }

    for (const a of result) {
      if (a.group_name === "Jab_Kadaluarsa") {
      jablebih15.push(a);
      }
    }

    let payload = {
      data: [
        {
          name: 'Jabatan Kosong',
          data: jabkosong,
        },
        {
          name: 'Jabatan lebih dari 1,5 tahun',
          data: jablebih15,
        },
      ],
    };

    return res.status(200).json(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getDetailEmployeeByKotamaPeta = async (req, res) => {
  const code = req.params.code;

  try {
    let baseQuery = `   
    SELECT 
    subquery.masa_jabatan,
    subquery.masa_jabatan_group, 
    subquery.mst_kotama_id, 
    subquery.mst_kotama_code, 
    subquery.mst_kotama_nama AS kotama_nama, 
    subquery.pangkat, 
    subquery.employee_nama, 
    subquery.korps, 
    subquery.nrp, 
    subquery.jabatan, 
    subquery.tmt_jabatan
FROM (
    SELECT 
        trx_employee.id as employee_id,
        trx_employee.code_kotama_balakpus as code_kotama_balakpus,
        trx_employee.kode_jabatan as kode_jabatan,
        trx_employee.nama as employee_nama,
        trx_employee.pangkat as pangkat,
        trx_employee.korps as korps,
        trx_employee.nrp as nrp,
        trx_employee.jabatan as jabatan,
        COALESCE(TO_CHAR(trx_employee.tmt_jabatan, 'DD Mon YYYY'), '') as tmt_jabatan,
        mst_kotama.id AS mst_kotama_id, 
        mst_kotama.code AS mst_kotama_code, 
        mst_kotama.nama AS mst_kotama_nama, 
        COALESCE(
            (
                SELECT
                    EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                    EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                    EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
            ), '0 tahun 0 bulan 0 hari'
        ) AS masa_jabatan,
        CASE 
            WHEN trx_employee.tmt_jabatan IS NULL AND (trx_employee.nrp IS NULL OR trx_employee.nrp = '') AND (trx_employee.nama IS NULL OR trx_employee.nama = '') AND trx_employee.jabatan IS NOT NULL THEN 'Jab_Kosong'
            WHEN COALESCE(
                        (
                            SELECT
                                EXTRACT(YEAR FROM age(current_date, trx_employee.tmt_jabatan)) || ' tahun ' ||
                                EXTRACT(MONTH FROM age(current_date, trx_employee.tmt_jabatan)) || ' bulan ' ||
                                EXTRACT(DAY FROM age(current_date, trx_employee.tmt_jabatan)) || ' hari'
                        ), '0 tahun 0 bulan 0 hari'
                    ) > '1 tahun 5 bulan' THEN 'Jab_Kadaluarsa'
        END AS masa_jabatan_group
    FROM 
        trx_employee 
    LEFT JOIN 
        mst_kotama ON trx_employee.code_kotama_balakpus = mst_kotama.code
    WHERE
        mst_kotama.code = '${code}'
) AS subquery
WHERE
    subquery.masa_jabatan_group = 'Jab_Kosong' OR subquery.masa_jabatan_group = 'Jab_Kadaluarsa';

`;

    const query = `${baseQuery}`;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    let jabkosong = [];
    let jablebih15 = [];

    for (const a of result) {
      if (a.masa_jabatan_group === "Jab_Kosong") {
      jabkosong.push(a);
      }
    }

    for (const a of result) {
      if (a.masa_jabatan_group === "Jab_Kadaluarsa") {
      jablebih15.push(a);
      }
    }

    let payload = {
      data: [
        {
          name: 'Jabatan Kosong',
          data: jabkosong,
        },
        {
          name: 'Jabatan lebih dari 1,5 tahun',
          data: jablebih15,
        },
      ],
    };

    return res.status(200).json(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

 