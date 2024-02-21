const FeeType = ["normal", "anomaly", "superordinary"];

const fees = [
  {
    basic: 903, // For normal country
    first: 0,
    third: 0,
    upper: 100,
    type: FeeType[0],
  },
  {
    basic: 903,
    first: 232,
    type: FeeType[1],
    // country: 'Австралия',
  },
  {
    basic: 903,
    first: 220,
    type: FeeType[2],
    script: "basic+first",
    // country: 'Антигуа и Барбуда'
  },
  {
    basic: 903, // For normal country
    first: 187,
    upper: 19,
    type: FeeType[1],
    // country: 'Армения'
  },
  {
    basic: 903, // For normal country
    first: 572,
    upper: 119,
    type: FeeType[1],
    // country.code: 'OAPI'
  },
  {
    basic: 903, // For normal country
    first: 1710,
    type: FeeType[1],
    // country.code: 'Бахрейн'
  },
  {
    basic: 903, // For normal country
    third: 600,
    upper: 100,
    type: FeeType[1],
    // country.code: 'Беларусь '
  },
];

module.exports = fees;
