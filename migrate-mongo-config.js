// In this file you can configure migrate-mongo
require("dotenv").config();

const config = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: process.env.DATABASE,

    // TODO Change this to your database name:
    databaseName: "calculator",

    options: {
      // useNewUrlParser: true, // removes a deprecation warning when connecting
      // useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  moduleSystem: "commonjs",
  logLevel: "verbose",
};

module.exports = config;
