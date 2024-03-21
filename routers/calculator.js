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

router.post("/test", async (req, res) => {
  try {
    const data = req.body;
    const countries = data.countries;
    const mark = parseInt(data.classMark);
    const rate = await getRate();
    const result = {};

    let fee = 0;
    result.basic = 903 * rate;
    result.fees = [];
    // result.fees.ordinary = {};

    // if (el.type === "ordinary") {
    //   resi.firstFee = 100 * rate;
    //   sum += el.first * rate;

    //   if (mark > 3) {
    //     resi.extraFee = (mark - 3) * 100 * rate;
    //     resi.extraMark = mark - 3;
    //     resi.extraOneFee = 100;
    //     sum += (mark - 3) * 100 * rate;
    //   }
    // }

    let hasOrdinary = countries.some(async (country) => {
      const el = await getByCode(country.code);
      el.type === "ordinary";
    });

    let ordinary = {};
    ordinary.extraFee = 0;
    if (hasOrdinary && mark > 3) {
      ordinary.extraFee = (mark - 3) * rate * 100;
      ordinary.extraMark = mark - 3;
      ordinary.extraOneFee = 100 * rate;
    }

    ordinary.countries = [];
    ordinary.fee = 0;

    for (let country of countries) {
      let counter = mark;
      let resi = {};
      let sum = 0;
      const el = await getByCode(country.code);
      // hasOrdinary = el.type == "ordinary";
      if (el.type === "ordinary") {
        ordinary.countries.push(el);
        ordinary.fee += 100 * rate;
        continue;
      }
      resi.code = el.code;
      console.log(el.code);
      if (el.type === "normal") {
        if (mark > 3) {
          resi.extraMark = mark - 3;
          resi.extraFee = (mark - 3) * el.upper * rate;
          resi.extraOneFee = el.upper * rate;
          sum += (mark - 3) * el.upper * rate;
        }
      } else if (el.type === "second") {
        if (el.first) {
          resi.firstFee = el.first * rate;
          sum += el.first * rate;
          counter -= 1;
          console.log(counter);
        }
        if (el.second && counter != 0 && mark >= 2) {
          resi.secondFee = el.second * rate;
          sum += el.second * rate;
          counter -= 1;
          console.log(counter);
        }

        if (el.third && el.third != 0 && counter != 0 && mark >= 3) {
          console.log("third", el.code, el.third);
          resi.thirdFee = el.third * rate;
          sum += el.third * rate;
          counter -= 1;
          console.log(counter);
        }

        if (el.upper && counter != 0 && mark > 2) {
          resi.extraFee = counter * el.upper * rate;
          resi.extraOneFee = el.upper * rate;
          resi.extraMark = counter;
          sum += counter * el.upper * rate;
        }
      } else if (el.type === "superordinary") {
        console.log(counter);
        resi.mark = counter;
        resi.ordinaryOneFee = el.first * rate;
        resi.ordinaryFee = counter * el.first * rate;
        sum += counter * el.first * rate;
      } else if (el.type === "anomaly") {
        if (el.first) {
          resi.firstFee = el.first * rate;
          sum += el.first * rate;
          counter -= 1;
          console.log(counter);
        }
        if (el.third && mark >= 3) {
          console.log("third", el.code, el.third);
          resi.thirdFee = el.third * rate;
          sum += el.third * rate;
          counter -= 3;
          console.log(counter);
        }
        if (el.upper && counter > 0 && mark >= 2 && counter != mark) {
          resi.extraFee = counter * el.upper * rate;
          resi.extraOneFee = el.upper * rate;
          resi.extraMark = counter;
          sum += counter * el.upper * rate;
        }
      } else if (el.type === "free") {
        resi.freeFee = el.first * rate;
        sum += resi.freeFee;
      }
      resi.sum = sum;
      fee += sum;
      resi.country = el;
      result.fees.push(resi);
    }
    console.log(hasOrdinary);
    result.ordinary = ordinary;
    result.mark = mark;
    result.fee = fee;
    result.company = serviceByType[data.typeOfMark];
    result.bank = getBank(fee + ordinary.fee + ordinary.extraFee);
    result.summa =
      result.company.sum +
      result.bank +
      result.fee +
      result.basic +
      ordinary.fee +
      ordinary.extraFee;

    console.log("Result: ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

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

router.post("/renewal", async (req, res) => {
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
      if (el.renewalType === "normal") {
        if (mark > 3) {
          resi.extraMark = mark - 3;
          resi.extraFee = (mark - 3) * el.renewalUpper * rate;
          resi.extraOneFee = el.renewalUpper * rate;
          sum += (mark - 3) * el.renewalUpper * rate;
        }
      } else if (el.renewalType === "anomaly" || el.renewalType === "second") {
        if (el.renewalFirst) {
          resi.firstFee = el.renewalFirst * rate;
          sum += el.renewalFirst * rate;
        }
        if (el.renewalSecond && mark >= 2) {
          resi.secondFee = el.renewalSecond * rate;
          sum += el.renewalSecond * rate;
        }
        if (mark >= 3 && el.renewalThird) {
          resi.thirdFee = el.renewalThird * rate;
          sum += el.renewalThird * rate;
        }
        if (mark > 3 && el.renewalUpper) {
          resi.extraFee = (mark - 3) * el.renewalUpper * rate;
          resi.extraOneFee = el.renewalUpper * rate;
          resi.extraMark = mark - 3;
          sum += (mark - 3) * el.renewalUpper * rate;
        }
      } else if (el.renewalType === "superordinary") {
        resi.ordinaryFee = el.renewalFirst * rate;
        sum += el.renewalFirst * rate;
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
    result.summa = result.company.sum + result.bank + result.fee + result.basic;

    console.log("Result: ", result);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
// if (mark === 1) {
//   if (el.renewalFirst) {
//     result.normMark.push({
//       mark: mark,
//       fee: el.renewalFirst,
//     });
//   }
// } else if (mark === 2) {
//   result.normMark.push({
//     mark: mark,
//     fee: el.renewalFirst * mark,
//   });
// }
