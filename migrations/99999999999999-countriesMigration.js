// const { fee } = require("../models/feeModel");
const seed = require("../seeds/countries.json");
const countries = seed.countries;

module.exports = {
  async up(db, client) {
    // Пример добавления пошлин
    const fees = await db.collection("fees").find().toArray();

    const insertCountries = [];

    for (let country of countries) {
      if (country.fee) {
        if (country.code === "AG") {
          insertCountries.push({
            name: country.name,
            code: country.code,
            basic: 903,
            first: country.first,
            third: country.third,
            upper: country.upper,
            type: "superordinary",
          });
        } else {
          insertCountries.push({
            name: country.name,
            code: country.code,
            basic: 903,
            first: country.first,
            third: country.third,
            upper: country.upper,
            type: "anomaly",
          });
        }
      } else {
        insertCountries.push({
          ...country,
          basic: 903,
          third: 0,
          upper: 100,
          type: "normal",
        });
      }
    }
    console.log("skjfhskjfdh");

    await db.collection("countries").insertMany(insertCountries);
  },

  async down(db, client) {
    // Удаление стран и пошлин при откате миграции
    await db.collection("countries").deleteMany({});
    await db.collection("fees").deleteMany({});
  },
};
