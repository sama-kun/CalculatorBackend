const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");
const countryModel = require("../models/countryModel");
const axios = require("axios");

const serviceByType = {
  new: {
    patent: 50000,
    company: 400000,
    manager: 150000,
    sum: 600000,
  },
  distribution: {
    company: 250000,
    manager: 100000,
    sum: 350000,
  },
  renewal: {
    company: 200000,
    manager: 100000,
    sum: 300000,
  },
};

router.get("/", async (req, res) => {
  try {
    res.send("Hello world");
  } catch (error) {
    console.log(error);
  }
});

const getByCode = async (code) => {
  try {
    const coun = await countryModel.findOne({ code });
    return coun;
  } catch (error) {
    // Handle any errors, e.g., logging or throwing an exception
    console.error("Error in getByCode:", error);
    throw error; // Rethrow the error to propagate it
  }
};

const getRate = async () => {
  const exchange = await axios
    .get("https://api.exchangerate-api.com/v4/latest/CHF")
    .then((respo) => respo.data);
  return exchange.rates.KZT;
};

const getBank = (summa) => {
  const res = (summa * 0.35) / 100;
  console.log("res ", res);

  if (res <= 20000) return 20000;
  else if (res >= 134000) return 134000;
  else return res;
};

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const countries = data.countries;
    const mark = parseInt(data.classMark);
    const rate = await getRate();
    const result = {};

    // console.log(countries);
    let summa = 0;
    let fee = 0;
    result.basic = 903 * rate;
    result.fees = [];

    for (let country of countries) {
      let resi = {};
      let sum = 0;
      const el = await getByCode(country.code);
      resi.code = el.code;
      if (el.type === "normal") {
        if (mark > 3) {
          resi.extraMark = mark - 3;
          resi.extraFee = (mark - 3) * el.upper * rate;
          resi.extraOneFee = el.upper * rate;
          sum += (mark - 3) * el.upper * rate;
        }
      } else if (el.type === "anomaly") {
        if (el.first) {
          resi.firstFee = el.first * rate;
          sum += el.first * rate;
        }
        if (mark >= 3 && el.third) {
          resi.thirdFee = el.third * rate;
          sum += el.third * rate;
        }
        if (mark > 3 && el.upper) {
          resi.extraFee = (mark - 3) * el.upper * rate;
          resi.extraOneFee = el.upper * rate;
          resi.extraMark = mark - 3;
          sum += (mark - 3) * el.upper * rate;
        }
      } else if (el.type === "superordinary") {
        resi.ordinaryFee = el.first * rate;
        sum += el.first * rate;
      }
      //   console.log(el);
      resi.sum = sum;
      fee += sum;
      resi.country = el;
      result.fees.push(resi);
    }

    result.mark = mark;
    result.fee = fee;
    result.company = serviceByType[data.typeOfMark];
    result.bank = getBank(fee);
    result.summa = result.company.sum + result.bank + result.fee;

    console.log("Result: ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
// if (mark === 1) {
//   if (el.first) {
//     result.normMark.push({
//       mark: mark,
//       fee: el.first,
//     });
//   }
// } else if (mark === 2) {
//   result.normMark.push({
//     mark: mark,
//     fee: el.first * mark,
//   });
// }
