// Library

// UTILS

const response = require('../helpers/apiResponse');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// MODEL

const db = require('../models/index');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;

const Kotama = db.mst_kotama_model;

exports.create = async (req, res) => {
  const { nama, alamat, latitude, longitude, url_gmaps } = req.body;
  try {
    await Kotama.create(
      {
        nama,
        alamat,
        latitude,
        longitude,
        url_gmaps
      },
      {
        user: req.user,
        individualHooks: true,
      },
    )
      .then(async (result) => {
       const findKotama = await Kotama.findOne({
         where: {
           id: result.id,
         }
       })
       return response.successResponseWithData(res, 'success', findKotama);
      })

      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.list = (req, res) => {
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  let search = req.query.search.toLowerCase();
  let searchWords = [];

  // if (search == null) {
  //   search = '';
  // } else {
  //   const words = search.toLowerCase().split(' ');
  //   words.forEach((word) => {
  //     searchWords.push({
  //       [Op.or]: [
  //         {
  //           nama: {
  //             [Op.like]: `%${word}%`,
  //           },
  //         },
  //       ],
  //     });
  //   });
  // }

  try {
    Kotama.findAndCountAll({
      limit,
      offset,
      search,
      searchFields: ['nama'],
      // where: {
      //   [Op.and]: searchWords,
      // },
      order: [['code', 'ASC']],
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
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  const { nama, alamat, latitude, longitude, url_gmaps } = req.body;
  const { id } = req.params;

  try {

    Kotama.update(
      {
        nama, alamat, latitude, longitude, url_gmaps
      },
      {
        where: { id: id },
      },
    )
      .then((result) => {
        if (result == 0) {
          return response.notFoundResponse(res, `Kotama Balkpus with id ${id} not found`);
        } else {
          return response.successResponse(res, `success updated master kotama with id ${id}`);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.view = async (req, res) => {
  const { id } = req.params;

  try {
    Kotama.findByPk(id)
      .then(async(result) => {
        if (result != null) {
          const findKotama = await Kotama.findOne({
            where: {
              id: result.id,
            },
            attributes: ['id', 'code', 'nama', 'alamat', 'latitude', 'longitude', 'url_gmaps'],
          })
          return response.successResponseWithData(res, 'success', findKotama);
        } else {
          return response.notFoundResponse(res, `Master kotama with id ${id} not found`);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.AutoCreate = async (req, res) => {

  const findkotama = await Kotama.findAll()

  if (findkotama.length > 0){
    const organisaisQuery = `
    DELETE FROM mst_kotama`;

    await sequelize.query(organisaisQuery, {
      type: QueryTypes.DELETE,
    });
  }
  const datakotama = [
    {
      code: 1,
      nama: 'KODAM I BB',
      alamat: "Jl. Gatot Subroto No.Km. 7, RW.5, Cinta Damai, Kec. Medan Helvetia, Kota Medan, Sumatera Utara 20122",
      latitude: 3.5935496,
      longitude: 98.6199057,
      url_gmaps: "https://www.google.com/maps/place/I+Bukit+Barisan+Military+Command/@3.5935496,98.6199057,17z/data=!3m1!4b1!4m6!3m5!1s0x30312e5bccdbe7f9:0xfc808f15e83b529e!8m2!3d3.5935496!4d98.6224806!16s%2Fg%2F12hl3mmdd?entry=ttu",
    },
    {
      code: 2,
      nama: 'KODAM II SWJ',
      alamat: "Jalan Jendral Sudirman Km 3.5, 20 Ilir D. III, Ilir Timur I, AH25, 20 Ilir D. III, Kec. Ilir Tim. I, Kota Palembang, Sumatera Selatan 30121",
      latitude: -2.9701791,
      longitude: 104.7473381,
      url_gmaps: "https://www.google.com/maps/place/Kodam+II%2FSwj/@-2.9701791,104.7473381,17z/data=!3m1!4b1!4m6!3m5!1s0x2e3b75d11d0c4821:0x96c36fdad2ff8c69!8m2!3d-2.9701791!4d104.749913!16s%2Fg%2F1tcyp7my?hl=en&entry=ttu",
    },
    {
      code: 3,
      nama: 'KODAM III SLW',
      alamat: "Jl. Aceh No.69, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113",
      latitude: -6.909183,
      longitude: 107.6131565,
      url_gmaps: "https://www.google.com/maps/place/Kodam+3+Siliwangi+-+Kodam+III/@-6.909183,107.6131565,15z/data=!4m6!3m5!1s0x2e68e63653d3f91f:0xf8a22a91a89340e4!8m2!3d-6.909183!4d107.6131565!16s%2Fg%2F1v2034jc?entry=ttu",
    },
    {
      code: 4,
      nama: 'KODAM IV DIP' ,
      alamat: "WC74+PW5, Jl. Perintis Kemerdekaan, Pudakpayung, Kec. Banyumanik, Kota Semarang, Jawa Tengah 50265",
      latitude: -7.0857303,
      longitude: 110.4047891,
      url_gmaps: "https://www.google.com/maps/place/Kodam+IV+%2F+Diponegoro/@-7.0857303,110.4047891,17z/data=!3m1!4b1!4m6!3m5!1s0x2e70896315a8be6d:0x20f9c020404462c3!8m2!3d-7.0857303!4d110.407364!16s%2Fg%2F11g2wfqcct?entry=ttu"
    },
    {
      code: 5,
      nama: 'KODAM V BRW',
      alamat: "Jl. Raden Wijaya No.1, Sawunggaling, Kec. Wonokromo, Surabaya, Jawa Timur 60242",
      latitude: -7.2991656,
      longitude: 112.7202009,
      url_gmaps: "https://www.google.com/maps/place/Kodam+5+Brawijaya/@-7.2991656,112.7202009,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd7f963d2d4fb4d:0x683e19e13d782208!8m2!3d-7.2991656!4d112.7227758!16s%2Fg%2F12hknzkn5?entry=ttu"
    },
    {
      code: 6,
      nama: 'KODAM VI MLW',
      alamat: "Jl. Jend. Sudirman, No. 17, Telaga Sari, Kec. Balikpapan Kota, Kota Balikpapan, Kalimantan Timur",
      latitude: -1.2785302,
      longitude: 116.8194642,
      url_gmaps: "https://www.google.com/maps/place/Kodam+VI%2FMulawarman/@-1.2785302,116.8194642,17z/data=!4m6!3m5!1s0x2df147271efb6df5:0xa05dce4c8c32a18e!8m2!3d-1.2785356!4d116.8220391!16s%2Fg%2F11b6dfc6w4?entry=ttu"
    },
    {
      code: 7,
      nama: 'KODAM IX UDY' ,
      alamat: "Jl. Udayana No.1, Dauh Puri Kangin, Kec. Denpasar Bar., Kota Denpasar, Bali 80232" ,
      latitude: -8.657803,
      longitude: 115.216767,
      url_gmaps: "https://www.google.com/maps/place/Udayana/@-8.657803,115.216767,17z/data=!3m1!4b1!4m6!3m5!1s0x2dd23bb28ecb97a9:0xdcbc5c1d9c580562!8m2!3d-8.657803!4d115.216767!16s%2Fg%2F1hm5hhj4c?entry=ttu"
    },
    {
      code: 8,
      nama: 'KODAM XII TPR' ,
      alamat: "Jl. Alianyang No.1, Sungai Raya, Kec. Sungai Raya, Kabupaten Kubu Raya, Kalimantan Barat 78122",
      latitude: -0.0761728,
      longitude: 109.3714453,
      url_gmaps: "https://www.google.com/maps/place/Kodam+XII+%2F+Tanjungpura/@-0.0761728,109.3714453,17z/data=!3m1!4b1!4m6!3m5!1s0x2e1d5a040e38d0b9:0x6201deeb6d7405e6!8m2!3d-0.0761728!4d109.3714453!16s%2Fg%2F11b76ksppw?entry=ttu"
    },
    {
      code: 9,
      nama: 'KODAM XIII MDK' ,
      alamat: "FR8X+W62, Jl. 14 Februari, Teling Atas, Kec. Wanea, Kota Manado, Sulawesi Utara 95119" ,
      latitude: 1.4672642,
      longitude: 124.848005,
      url_gmaps: "https://www.google.com/maps/place/Kodam+XIII%2FMdk/@1.4672642,124.848005,17z/data=!3m1!4b1!4m6!3m5!1s0x328774dbcedbb911:0xceb44c9d031261a8!8m2!3d1.4672642!4d124.848005!16s%2Fg%2F11ddxrq6p_?entry=ttu"
    },
    {
      code: 10,
      nama: 'KODAM XIV HSN' ,
      alamat: "VF47+QCG, Jl. Urip Sumoharjo, Panaikang, Kec. Panakkukang, Kota Makassar, Sulawesi Selatan 90233",
      latitude: -5.1430742,
      longitude: 119.4635752,
      url_gmaps: "https://www.google.com/maps/place/Kodam+XIV+Hasanuddin/@-5.1430742,119.4635752,17z/data=!3m1!4b1!4m6!3m5!1s0x2dbee2d58eaa19af:0xef3322780a1ea6d6!8m2!3d-5.1430742!4d119.4635752!16s%2Fg%2F1hm4gjv17?entry=ttu"
    },
    {
      code: 11,
      nama: 'KODAM XVI PTM' ,
      alamat: "Jl. Makodam No.1, Kel Rijali, Sirimau, Kota Ambon, Maluku",
      latitude: -3.6907546,
      longitude: 128.1836952,
      url_gmaps: "https://www.google.com/maps/place/KODAM+XVI%2FPattimura/@-3.6907546,128.1836952,17z/data=!3m1!4b1!4m6!3m5!1s0x2d6ce856b285904d:0xc17d9b2f84fcf6a9!8m2!3d-3.6907546!4d128.1836952!16s%2Fg%2F12hnrr83q?entry=ttu"
    },
    {
      code: 12,
      nama: 'KODAM XVII CEN',
      alamat: "CMXP+CP9, polimak IV atas, Ardipura, Jayapura Selatan, Jayapura City, Papua 99221",
      latitude: -2.5514715,
      longitude: 140.6868675,
      url_gmaps: "https://www.google.com/maps/place/Kodam+XVII%2FCenderawasih/@-2.5514715,140.6868675,17z/data=!3m1!4b1!4m6!3m5!1s0x686c587dabf419bf:0xc6cfa89bafdd6395!8m2!3d-2.5514715!4d140.6868675!16s%2Fg%2F12hr3cnbl?entry=ttu"
    },
    {
      code: 13,
      nama: 'KODAM XVIII KSR' ,
      alamat: "32CP+PGQ, Anday, Manokwari Selatan, Manokwari Regency, West Papua 98315",
      latitude: -0.9281034,
      longitude: 134.0338258,
      url_gmaps: "https://www.google.com/maps/place/KODAM+XVIII+%2F+KASUARI/@-0.9281034,134.0338258,17z/data=!4m10!1m2!2m1!1skodam+xviii+kasuari!3m6!1s0x2d53f3f7d5a2d121:0xdd44702fa5f974bf!8m2!3d-0.9281529!4d134.0363734!15sChNrb2RhbSB4dmlpaSBrYXN1YXJpkgENbWlsaXRhcnlfYmFzZeABAA!16s%2Fg%2F11gdz1tzpz?entry=ttu"
    },
    {
      code: 14,
      nama: 'KODAM JAYA',
      alamat: "Jl. Mayor Jendral Sutoyo No.5, Cawang, Kec. Kramat jati, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13630",
      latitude: -6.2535775,
      longitude: 106.8716617,
      url_gmaps: "https://www.google.com/maps/place/Kodam+Jaya+Jayakarta/@-6.2535775,106.8716617,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f30163e5e301:0xfffe617627f56fbe!8m2!3d-6.2535775!4d106.8716617!16s%2Fg%2F1ptwb7xdg?entry=ttu"
    },
    {
      code: 15,
      nama:'KODAM IM',
      alamat: "H84C+96H, Peunayong, Kuta Alam, Banda Aceh City, Aceh 23127",
      latitude: 5.5559307,
      longitude: 95.3206048,
      url_gmaps: "https://www.google.com/maps/place/Kodam+Iskandar+Muda/@5.5559307,95.3206048,17z/data=!3m1!4b1!4m6!3m5!1s0x30403748819201e1:0x3355b24638fc47d8!8m2!3d5.5559307!4d95.3206048!16s%2Fg%2F11c2y42n_r?entry=ttu"
    },
    {
      code: 16,
      nama: 'PUSSENIF',
      alamat: "Jl. Supratman No.60, Cihapit, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40114",
      latitude: -6.9047874,
      longitude: 107.6316179,
      url_gmaps: "https://www.google.com/maps/place/Pussenif+Kodiklat+TNI+AD/@-6.9047874,107.6316179,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e7c82795f90f:0x40d558307d5258b5!8m2!3d-6.9047874!4d107.6316179!16s%2Fg%2F11dx8_hjzx?entry=ttu"
    },
    {
      code: 17,
      nama: 'PUSSENKAV',
      alamat: "kavaleri, Jl. Salak No.2, Turangga, Lengkong, Bandung City, West Java 40263",
      latitude: -6.9295175,
      longitude: 107.6337041,
      url_gmaps: "https://www.google.com/maps/place/Pussenkav+-+Pusat+Senjata+Kavaleri/@-6.9295175,107.6337041,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e9029ee73c69:0x9556cddb6a910f42!8m2!3d-6.9295175!4d107.6337041!16s%2Fg%2F11pzt4x5zr?entry=ttu"
    },
    {
      code: 18,
      nama:'PUSSENARMED',
      alamat: "Jl. Baros No.C6, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521" ,
      latitude: -6.888247,
      longitude: 107.537196,
      url_gmaps: "https://www.google.com/maps/place/Kodiklat+TNI+AD+Pusat+Kesenjataan+Artileri+Medan/@-6.888247,107.537196,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e452c037778f:0x80a1bf376b7872db!8m2!3d-6.888247!4d107.537196!16s%2Fg%2F1hm62kl2j?entry=ttu"
    },
    {
      code: 19,
      nama:'PUSSENARHANUD',
      alamat: "Jl. Sriwijaya Raya No.1, Setiamanah, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40524",
      latitude: -6.8814775,
      longitude: 107.5374007,
      url_gmaps: "https://www.google.com/maps/place/Pussen+Arhanud/@-6.8814775,107.5374007,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e45026ba56a1:0x6b5c7d7a6ac8c6ff!8m2!3d-6.8814775!4d107.5374007!16s%2Fg%2F1hm3ptjd0?entry=ttu"
    },
    {
      code: 20,
      nama: 'PUSZIAD',
      alamat: "Jl. Kesatrian II No.5, RT.5/RW.3, Kb. Manggis, Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13150" ,
      latitude: -6.20946,
      longitude: 106.858607,
      url_gmaps: "https://www.google.com/maps/place/PUSAT+ZENI+TNI+ANGKATAN+DARAT+(PUSZIAD)/@-6.20946,106.858607,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5fe6c395ce1:0xad2bcba98248ea44!8m2!3d-6.20946!4d106.858607!16s%2Fg%2F11l56y26b2?entry=ttu"
    },
    {
      code: 21,
      nama: 'KOPASSUS',
      alamat: "Jl. Raya Batujajar No.18, Galanggang, Kec. Batujajar, Kabupaten Bandung Barat, Jawa Barat 40561",
      latitude: -6.9164109,
      longitude: 107.492473,
      url_gmaps: "https://www.google.com/maps/place/PUSDIKLATPASSUS+KOPASSUS/@-6.9164109,107.492473,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e568a66e6f73:0x262299fd26d84011!8m2!3d-6.9164109!4d107.492473!16s%2Fg%2F11ncnhqx4f?entry=ttu"
    },
    {
      code: 22,
      nama:'KOSTRAD',
      alamat: 'Jl. Merdeka Timur No.3, RT.2/RW.1, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10110',
      latitude: -6.1738459,
      longitude: 106.8304254,
      url_gmaps: "https://www.google.com/maps/place/Kostrad+Jakarta/@-6.1738459,106.8304254,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f432b10f2eb5:0x27f00e806294c1aa!8m2!3d-6.1738459!4d106.8304254!16s%2Fg%2F1pzsyrwnz?entry=ttu"
    },
    {
      code: 23,
      nama: 'KODIKLATAD',
      alamat: "Jl. Aceh No.50, Babakan Ciamis, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40117",
      latitude: -6.9102778,
      longitude: 107.6166667,
      url_gmaps: "https://www.google.com/maps/place/Kodiklat+TNI+AD/@-6.9102778,107.6166667,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e635d3728687:0xb058df472189b1fe!8m2!3d-6.9102778!4d107.6166667!16s%2Fg%2F11fy98nj3g?entry=ttu"
    },
    {
      code: 24,
      nama: 'DISADAAD',
      alamat: "Jl. Jend. Urip Sumoharjo II No.89, RT.2/RW.6, Bali Mester, Kecamatan Jatinegara, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta",
      latitude: -6.2131923,
      longitude: 106.8621721,
      url_gmaps: "https://www.google.com/maps/place/MESS+DISADAAD/@-6.2131923,106.8621721,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5210b738dc7:0x611eab5a693aba8b!8m2!3d-6.2131923!4d106.8621721!16s%2Fg%2F11kpg1cvw5?entry=ttu"
    },
    {
      code: 25,
      nama: 'DISLAIKAD',
      alamat: "6 No.12, RT.6/RW.12, Cibubur, Kec. Ciracas, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13720" ,
      latitude: -6.343553,
      longitude: 106.8775167,
      url_gmaps: "https://www.google.com/maps/place/RUSUN+DISLAIKAD/@-6.343553,106.8775167,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69edb38cd381f7:0xc488fe7348542cd3!8m2!3d-6.343553!4d106.8775167!16s%2Fg%2F11np36sw1g?entry=ttu"
    },
    {
      code: 26,
      nama: 'DISJARAHAD',
      alamat: "Jl. Belitung No.6, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113",
      latitude: -6.912537,
      longitude: 107.6142925,
      url_gmaps: "https://www.google.com/maps/place/Dinas+Sejarah+TNI+AD+Disjarah/@-6.912537,107.6142925,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e636b523f083:0x3193c54bedc92f2c!8m2!3d-6.912537!4d107.6142925!16s%2Fg%2F11fy4vh647?entry=ttu"
    },
    {
      code: 27,
      nama: 'DISJASAD',
      alamat: "4G4V+69W, Baros, Cimahi Tengah, Cimahi City, West Java 40521",
      latitude: -6.8943991,
      longitude: 107.5434498,
      url_gmaps: "https://www.google.com/maps/place/Dir+JAS+AD/@-6.8943991,107.5434498,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e5b3e15ac1e3:0xe3be9a5c13a885d4!8m2!3d-6.8943991!4d107.5434498!16s%2Fg%2F11c48p5tf9?entry=ttu"
    },
    {
      code: 28,
      nama:'DISINFOLAHTAD',
      alamat: "MVP6+JRR, Jl. Pedati Utara 1, RT.1/RW.4, Cijantung, Kec. Ps. Rebo, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13770",
      latitude: -6.313376,
      longitude: 106.8620221,
      url_gmaps: "https://www.google.com/maps/place/MESS+DISINFOLAHTA/@-6.313376,106.8620221,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69ed9e63444693:0x6a3ed03411a7305b!8m2!3d-6.313376!4d106.8620221!16s%2Fg%2F11dy_jwf0w?entry=ttu"
    },
    {
      code: 29,
      nama: 'DISLITBANGAD',
      alamat: "Jl. Matraman Raya No.143, RW.9, Palmeriam, Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13140",
      latitude: -6.2092939,
      longitude: 106.8600785,
      url_gmaps: "https://www.google.com/maps/place/Dislitbang+TNI-AD/@-6.2092939,106.8600785,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f47c6efbc813:0x5e62c3adcd967281!8m2!3d-6.2092939!4d106.8600785!16s%2Fg%2F11b86n5lqc?entry=ttu"
    },
    {
      code: 30,
      nama: 'DISPSIAD',
      alamat: "Jl. Sangkuriang No.17, Dago, Kecamatan Coblong, Kota Bandung, Jawa Barat 40135",
      latitude: -6.8830421,
      longitude: 107.6087593,
      url_gmaps: "https://www.google.com/maps/place/Dispsiad+Bandung/@-6.8830421,107.6087593,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e6f7486f85b9:0xb73512c42a4c68c3!8m2!3d-6.8830421!4d107.6087593!16s%2Fg%2F11bw2jkn73?entry=ttu"
    },
    {
      code: 31,
      nama: 'DISBINTALAD',
      alamat: "Jl. Kesatrian VI No.6C, RT.5/RW.3, Kb. Manggis, Kec. Matraman, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13150",
      latitude: -6.2067516,
      longitude: 106.8564237,
      url_gmaps: "https://www.google.com/maps/place/Kantor+Disbintalad/@-6.2067516,106.8564237,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f47b29b6bc95:0xcf626afd06ce1d4f!8m2!3d-6.2067516!4d106.8564237!16s%2Fg%2F11c2r00yf0?entry=ttu"
    },
    {
      code: 32,
      nama: 'DISPENAD',
      alamat: "Jl. Ir. H. Juanda No.5 7, RT.3/RW.2, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10110",
      latitude: -6.1676273,
      longitude: 106.8294484,
      url_gmaps: "https://www.google.com/maps/place/DISPENAD/@-6.1676273,106.8294484,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5d033ce7d85:0x30b5f33a64db8c3!8m2!3d-6.1676273!4d106.8294484!16s%2Fg%2F11dxlc0rsb?entry=ttu"
    },
    {
      code: 33,
      nama: 'DITKUMAD',
      alamat: "MV4G+CV, RT.6/RW.12, Cibubur, Ciracas, East Jakarta City, Jakarta 13720",
      latitude: -6.3438739,
      longitude: 106.8769492,
      url_gmaps: "https://www.google.com/maps/place/DitkumAD+baru/@-6.3438739,106.8769492,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69edfdd2ab3d05:0x624c591887f527cd!8m2!3d-6.3438739!4d106.8769492!16s%2Fg%2F11sh3t0zds?entry=ttu"
    },
    {
      code: 34,
      nama: 'DITKUAD',
      alamat: "Jl. Dr. Wahidin I No.6, Ps. Baru, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10710",
      latitude: -6.168042,
      longitude: 106.8390562,
      url_gmaps: "https://www.google.com/maps/place/Ditkuad/@-6.168042,106.8390562,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5c854345cb3:0x1b102d0f93984096!8m2!3d-6.168042!4d106.8390562!16s%2Fg%2F11bw4vzgtf?entry=ttu"
    },
    {
      code: 35,
      nama:'DITTOPAD',
      alamat: "RRGX+JQC, RT.11/RW.10, Bungur, Senen, Central Jakarta City, Jakarta 10460",
      latitude: -6.173444,
      longitude: 106.8493822,
      url_gmaps: "https://www.google.com/maps/place/Gedung+A.+Yani+Dittopad/@-6.173444,106.8493822,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5b30f26cb37:0x36a9672e293641c!8m2!3d-6.173444!4d106.8493822!16s%2Fg%2F11bx4lblt4?entry=ttu"
    },
    {
      code: 36,
      nama:'DITAJENAD',
      alamat: "Masjid AR-Rahmah Ditajenad, Jl. Bangka No.6, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113",
      latitude: -6.9134666,
      longitude: 107.619195,
      url_gmaps: "https://www.google.com/maps/place/Ditajenad/@-6.9134666,107.619195,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e633a0b78e35:0xc39c7d21e2ff9686!8m2!3d-6.9134666!4d107.619195!16s%2Fg%2F11bc7qglqk?entry=ttu"
    },
    {
      code: 37,
      nama: 'RSPAD GS',
      alamat: "Jl. Abdul Rahman Saleh Raya No.24, RT.10/RW.5, Senen, Kec. Senen, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10410",
      latitude: -6.1761897,
      longitude: 106.837618,
      url_gmaps: "https://www.google.com/maps/place/Gatot+Soebroto+Army+Hospital/@-6.1761897,106.837618,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f434c79030ff:0x3bac12ae3c734b2a!8m2!3d-6.1761897!4d106.837618!16s%2Fg%2F11bvztsb6r?entry=ttu"
    },
    {
      code: 38,
      nama:'PUSKESAD',
      alamat: "Jl. Abdul Rahman Saleh Raya No.18, RT.9/RW.5, Senen, Kecamatan Sawah Besar, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10410",
      latitude: -6.1751268,
      longitude: 106.835894,
      url_gmaps: "https://www.google.com/maps/place/Puskesad+Lakesgilut/@-6.1751268,106.835894,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5cb5956ffdb:0x8c5a93ccbb0c702d!8m2!3d-6.1751268!4d106.835894!16s%2Fg%2F11ssk364bw?entry=ttu"
    },
    {
      code: 39,
      nama: 'PUSBEKANGAD',
      alamat: "Jl. Raya Bogor No.2, Kramat Jati, Kec. Kramat jati, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13510",
      latitude: -6.2741959,
      longitude: 106.8681728,
      url_gmaps: "https://www.google.com/maps/place/Pusbekangad/@-6.2741959,106.8681728,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f3a19fdaa465:0xd8ee4db63dee40a3!8m2!3d-6.2741959!4d106.8681728!16s%2Fg%2F11s9g4j6hh?entry=ttu"
    },
    {
      code: 40,
      nama: 'PUSPALAD',
      alamat: "Jl. Gatot Subroto No.372, Sukapura, Kec. Kiaracondong, Kota Bandung, Jawa Barat 40285",
      latitude: -6.9331985,
      longitude: 107.6458595,
      url_gmaps: "https://www.google.com/maps/place/Bengpuspal+Ditpalad/@-6.9331985,107.6458595,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e80cb77bde59:0xf7ced328f9fb4962!8m2!3d-6.9331985!4d107.6458595!16s%2Fg%2F11c3ttvfgk?entry=ttu"
    },
    {
      code: 41,
      nama: 'PUSHUBAD',
      alamat: "Jl. Letjen. S. Parman No.103 2, RT.2/RW.1, Tomang, Kec. Grogol petamburan, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11440",
      latitude: -6.177871,
      longitude: 106.5155867,
      url_gmaps: "https://www.google.com/maps/place/Pushubad/@-6.177871,106.5155867,10z/data=!4m10!1m2!2m1!1spushubad!3m6!1s0x2e69f7b9d4d9d979:0xb3303f37a412946c!8m2!3d-6.177871!4d106.7957381!15sCghwdXNodWJhZOABAA!16s%2Fg%2F11qrsfcr44?entry=ttu"
    },
    {
      code: 42,
      nama: 'PUSPENERBAD',
      alamat: "Jl. Pd. Cabe Raya No.15, RT.5/RW.2, Pd. Cabe Udik, Kec. Pamulang, Kota Tangerang Selatan, Banten 15418",
      latitude: -6.342358,
      longitude: 106.7622547,
      url_gmaps: "https://www.google.com/maps/place/Puspenerbad/@-6.342358,106.7622547,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69ef9b67e7c8cf:0xbbf5eb1445d931a0!8m2!3d-6.342358!4d106.7622547!16s%2Fg%2F11v5s16fr4?entry=ttu"
    },
    {
      code: 43,
      nama: 'PUSINTELAD',
      alamat: "Jl. Veteran, RT.3/RW.2, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 1011.",
      latitude: -6.1686,
      longitude: 106.8283927,
      url_gmaps: "https://www.google.com/maps/place/Mabes+Ad,+RT.3%2FRW.2,+Gambir,+Kecamatan+Gambir,+Kota+Jakarta+Pusat,+Daerah+Khusus+Ibukota+Jakarta+10110/@-6.1686,106.8283927,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5d034d17f21:0xec29252e5b268e97!8m2!3d-6.1686!4d106.8283927!16s%2Fg%2F11rxpg6wdx?entry=ttu"
    },
    {
      code: 44,
      nama: 'PUSTERAD',
      alamat: "Jl. Setu Cipayung No.27, RT.9/RW.7, Cipayung, Kec. Cipayung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13840",
      latitude: -6.324628,
      longitude: 106.905952,
      url_gmaps: "https://www.google.com/maps/place/Pusat+Teritorial+Angkatan+Darat/@-6.324628,106.905952,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69ed317493ad1f:0xafabc49cb474cc53!8m2!3d-6.324628!4d106.905952!16s%2Fg%2F1pt_ylw6s?entry=ttu"
    },
    {
      code: 45,
      nama:'PUSPOMAD',
      alamat: "Jl. M.I. Ridwan Rais No.5, RT.7/RW.1, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10110",
      latitude: -6.1806042,
      longitude: 106.8333247,
      url_gmaps: "https://www.google.com/maps/place/Puspomad/@-6.1806042,106.8333247,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5535c4d4689:0xcfaaebd1653b4d15!8m2!3d-6.1806042!4d106.8333247!16s%2Fg%2F11vdwwbvl2?entry=ttu"
    },
    {
      code: 46,
      nama: 'PUSSANSIAD',
      alamat: "Jl. Veteran Raya No 5 Jakarta Pusat, Mabes TNI AD Gedung E Lantai 7",
      latitude: -6.1693077,
      longitude: 106.8288171,
      url_gmaps: "https://www.google.com/maps/place/Army+Central+Headquarters/@-6.1693077,106.8288171,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5d1c542db8f:0xec23f7e386b13c0f!8m2!3d-6.1693077!4d106.8288171!16s%2Fg%2F11hcw63clq?entry=ttu"
    },
    {
      code: 47,
      nama: 'SECAPA AD',
      alamat: "Jl. Hegarmanah No.152, Hegarmanah, Kec. Cidadap, Kota Bandung, Jawa Barat 40141",
      latitude: -6.8669407,
      longitude: 107.5998025,
      url_gmaps: "https://www.google.com/maps/place/Sekolah+Calon+Perwira+AD+(SECAPA+AD)/@-6.8669407,107.5998025,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e6ed03725f23:0x6a115455d30c201f!8m2!3d-6.8669407!4d107.5998025!16s%2Fg%2F121v8hgk?entry=ttu"
    },
    {
      code: 48,
      nama: 'SESKOAD',
      alamat: "Jl. Gatot Subroto No.96, Lkr. Sel., Kec. Lengkong, Kota Bandung, Jawa Barat 40162",
      latitude: -6.9252292,
      longitude: 107.6288071,
      url_gmaps: "https://www.google.com/maps/place/SESKOAD/@-6.9252292,107.6288071,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e7d798646619:0x4a43ac7e2ef86c4c!8m2!3d-6.9252292!4d107.6288071!16s%2Fg%2F11b6d4d_ln?entry=ttu"
    },
    {
      code: 49,
      nama:'AKMIL',
      alamat: "Jl. Jend. Gatot Soebroto No.1, Banyurojo, Kec. Mertoyudan, Kabupaten Magelang, Jawa Tengah 56172" ,
      latitude: -7.4992427,
      longitude: 110.2099098,
      url_gmaps: "https://www.google.com/maps/place/The+National+Military+Academy+of+Indonesia+-+Akademi+Militer/@-7.4992427,110.2099098,17z/data=!3m1!4b1!4m6!3m5!1s0x2e7a8f15c0166ce7:0xdf9b2c6b9d02cd3f!8m2!3d-7.4992427!4d110.2099098!16s%2Fg%2F122rd5nw?entry=ttu"
    },
    {
      code: 50,
      nama: 'ITJENAD',
      alamat: "Jl. Menado No.8, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113",
      latitude: -6.911656,
      longitude: 107.6206146,
      url_gmaps: "https://www.google.com/maps/place/Verku%2FVermat+Itjenad/@-6.911656,107.6206146,17z/data=!3m1!4b1!4m6!3m5!1s0x2e68e63316f6e7cd:0x583575f7f83a4618!8m2!3d-6.911656!4d107.6206146!16s%2Fg%2F1pztyx3mn?entry=ttu"
    },
    {
      code: 51,
      nama: 'MABESAD',
      alamat: "3, RT.3/RW.2, Gambir, Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10110",
      latitude: -6.1693077,
      longitude: 106.8288171,
      url_gmaps: "https://www.google.com/maps/place/Army+Central+Headquarters/@-6.1693077,106.8288171,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f5d1c542db8f:0xec23f7e386b13c0f!8m2!3d-6.1693077!4d106.8288171!16s%2Fg%2F11hcw63clq?entry=ttu"
    }
  ]
  try {
    await Kotama.bulkCreate(datakotama, {
      user: req.user,
      individualHooks: true,
    })
      .then(async (result) => {
       const findKotama = await Kotama.findAndCountAll()
       return response.successResponseWithData(res, 'success', findKotama);
      })

      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.listkotamabalakpus = async (req, res) => {
  const rawQuery = `
      select c.nama as nama, c.code as code from
      mst_kotama c
      where c.deleted_date IS NULL
  `;
  try {
    const result = await sequelize.query(rawQuery, {
      type: QueryTypes.SELECT,
    });
    let payload = [];

    for (const a of result) {
      payload.push({
        text: a.nama,
        value: a.code,
      });
    }
    res.status(200).send(payload);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


// exports.updateImageKotama = async (req, res) => {
//     const codekotama = req.params.code;
//     const imageFolderPath = path.join('/tmp');
//     const file = req.file;

//     // Pastikan file ter-upload
//     if (!file) {
//         return res.status(400).send('Please upload an image!');
//     }

//     // Cek apakah ada file dengan nama yang sama dengan codekotama
//     const existingImageExtensions = ['.jpg', '.jpeg', '.png'];
//     let existingImagePath = '';
//     for (const ext of existingImageExtensions) {
//         const imagePath = path.join(imageFolderPath, `${codekotama}${ext}`);
//         if (fs.existsSync(imagePath)) {
//             existingImagePath = imagePath;
//             break;
//         }
//     }

//     // Jika ada file dengan nama yang sama, hapus file tersebut
//     if (existingImagePath) {
//         fs.unlinkSync(existingImagePath);
//     }

//     // Simpan file baru dengan nama sesuai codekotama
//     const newImageExtension = path.extname(file.originalname).toLowerCase(); // Dapatkan ekstensi file yang di-upload
//     const newImagePath = path.join(imageFolderPath, `${codekotama}${newImageExtension}`);
//     fs.writeFileSync(newImagePath, file.buffer); // Menulis file baru dari buffer yang di-upload

//     // Respon sukses
//     res.status(200).send('Image uploaded successfully!');
// }

exports.updateImageKotama = async (req, res) => {
  const codekotama = req.params.code;
  const imageFolderPath = path.join('/tmp');
  const file = req.file;

  // Pastikan file ter-upload
  if (!file) {
      return res.status(400).send('Please upload an image!');
  }

  // Cek apakah ada file dengan nama yang sama dengan codekotama
  const existingImageExtensions = ['.jpg', '.jpeg', '.png'];
  let existingImagePath = '';
  // for (const ext of existingImageExtensions) {
      const imagePath = path.join(imageFolderPath, `${codekotama}.png`);
      console.log(imagePath)
      if (fs.existsSync(imagePath)) {
          existingImagePath = imagePath;
          // break;
      }
  // }

  // Jika ada file dengan nama yang sama, hapus file tersebut
  if (existingImagePath) {
      fs.unlinkSync(existingImagePath);
  }

  // Simpan file baru dengan nama sesuai codekotama
  const newImageExtension = path.extname(file.originalname).toLowerCase(); // Dapatkan ekstensi file yang di-upload
  const newImagePath = path.join(imageFolderPath, `${codekotama}${newImageExtension}`);
  fs.writeFileSync(newImagePath, file.buffer); // Menulis file baru dari buffer yang di-upload

  // Respon sukses
  res.status(200).send('Image uploaded successfully!');
}
