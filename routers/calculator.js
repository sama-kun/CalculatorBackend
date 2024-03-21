const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");
const countryModel = require("../models/countryModel");
const countries = require("../seeds/countries.json");
const axios = require("axios");
const country = require("../models/countryModel");
const ordinaryCountries = countries.ordinary;
const renewalCountries = countries.renewal_ordinary;

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
    console.log(countries.countries.length);
    // res.send(countries.countries.length);s
  } catch (error) {
    console.log(error);
  }
});

router.get("/setordinary", async (req, res) => {
  try {
    let resi = [];
    for (let code of renewalCountries) {
      const country = await countryModel.updateOne(
        { code },
        { $set: { renewalType: "ordinary" } }
      );

      if (!country) {
        resi.push(code);
      }
    }
    // const len = await countryModel.find({ type: "ordinary" });

    // for (let count of len) {
    //   resi.push(count.code);
    // }
    // console.log(countries.ordinary.length);
    res.send(resi);
  } catch (error) {
    console.log(error);
  }
});

router.get("/compareordinary", async (req, res) => {
  try {
    let resi = [];
    // for (let code of renewalCountries) {
    //   const country = await countryModel.updateOne(
    //     { code },
    //     { $set: { renewalType: "ordinary" } }
    //   );

    //   if (!country) {
    //     resi.push(code);
    //   }
    // }
    const len = await countryModel.find({ renewalType: "ordinary" });

    for (let count of len) {
      resi.push(count.code);
    }
    // console.log(countries.ordinary.length);
    res.send(resi);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getcountries", async (req, res) => {
  try {
    let resi = [];
    // for (let code of renewalCountries) {
    //   const country = await countryModel.updateOne(
    //     { code },
    //     { $set: { renewalType: "ordinary" } }
    //   );

    //   if (!country) {
    //     resi.push(code);
    //   }
    // }
    const len = await countryModel.find();

    for (let count of len) {
      resi.push({ code: count.code, name: count.name });
    }
    // console.log(countries.ordinary.length);
    res.send(resi);
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

router.post("/", async (req, res) => {
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
    ordinary.oneFee = 100 * rate;
    ordinary.extraFee = 0;
    if (hasOrdinary && mark > 3) {
      ordinary.extraFee = (mark - 3) * rate * 100;
      ordinary.extraMark = mark - 3;
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
        resi.superOneFee = el.first * rate;
        resi.superFee = counter * el.first * rate;
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
      el.renewalType === "ordinary";
    });

    let ordinary = {};
    ordinary.oneFee = 100 * rate;
    ordinary.extraFee = 0;
    if (hasOrdinary && mark > 3) {
      ordinary.extraFee = (mark - 3) * rate * 100;
      ordinary.extraMark = mark - 3;
    }

    ordinary.countries = [];
    ordinary.fee = 0;

    for (let country of countries) {
      let counter = mark;
      let resi = {};
      let sum = 0;
      const el = await getByCode(country.code);
      // hasOrdinary = el.type == "ordinary";
      if (el.renewalType === "ordinary") {
        ordinary.countries.push(el);
        ordinary.fee += 100 * rate;
        continue;
      }
      resi.code = el.code;
      console.log(el.code);
      if (el.renewalType === "normal") {
        if (mark > 3) {
          resi.extraMark = mark - 3;
          resi.extraFee = (mark - 3) * el.renewalUpper * rate;
          resi.extraOneFee = el.renewalUpper * rate;
          sum += (mark - 3) * el.renewalUpper * rate;
        }
      } else if (el.renewalType === "second") {
        if (el.renewalFirst) {
          resi.firstFee = el.renewalFirst * rate;
          sum += el.renewalFirst * rate;
          counter -= 1;
          console.log(counter);
        }
        if (el.renewalSecond && counter != 0 && mark >= 2) {
          resi.secondFee = el.renewalSecond * rate;
          sum += el.renewalSecond * rate;
          counter -= 1;
          console.log(counter);
        }

        if (
          el.renewalThird &&
          el.renewalThird != 0 &&
          counter != 0 &&
          mark >= 3
        ) {
          console.log("third", el.code, el.renewalThird);
          resi.thirdFee = el.renewalThird * rate;
          sum += el.renewalThird * rate;
          counter -= 1;
          console.log(counter);
        }

        if (el.renewalUpper && counter != 0 && mark > 2) {
          resi.extraFee = counter * el.renewalUpper * rate;
          resi.extraOneFee = el.renewalUpper * rate;
          resi.extraMark = counter;
          sum += counter * el.renewalUpper * rate;
        }
      } else if (el.renewalType === "superordinary") {
        console.log(counter);
        resi.mark = counter;
        resi.superOneFee = el.renewalFirst * rate;
        resi.superFee = counter * el.renewalFirst * rate;
        sum += counter * el.renewalFirst * rate;
      } else if (el.renewalType === "anomaly") {
        if (el.renewalFirst) {
          resi.firstFee = el.renewalFirst * rate;
          sum += el.renewalFirst * rate;
          counter -= 1;
          console.log(counter);
        }
        if (el.renewalThird && mark >= 3) {
          console.log("third", el.code, el.renewalThird);
          resi.thirdFee = el.renewalThird * rate;
          sum += el.renewalThird * rate;
          counter -= 3;
          console.log(counter);
        }
        if (el.renewalUpper && counter > 0 && mark >= 2 && counter != mark) {
          resi.extraFee = counter * el.renewalUpper * rate;
          resi.extraOneFee = el.renewalUpper * rate;
          resi.extraMark = counter;
          sum += counter * el.renewalUpper * rate;
        }
      } else if (el.type === "free") {
        resi.freeFee = el.renewalFirst * rate;
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
