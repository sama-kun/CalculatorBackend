require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const flash = require("connect-flash");
var session = require("express-session");
const mongoDbsession = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");

mongoose
  .connect(process.env.DATABASE, {
    dbName: "calculator", // Specify the name of your database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("db connected !!!!!");
  })
  .catch((error) => {
    console.log(error);
  });

//******setup for flash message */
// const store = new mongoDbsession({
//   uri: 'mongodb atlas session db url',
//   collection: 'mySessions',
// });

app.use(
  session({
    secret: "12315151523",
    resave: false,
    cookie: { maxAge: 1000 * 60 },
    saveUninitialized: true,
    // store: store,
  })
);

app.use(
  cors({
    origin: "https://bright-flies-wink.loca.lt",
  })
);

app.use(flash());

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ========== required router =========== //

// const index_router = require("./routers/calculator");
const calculator = require("./routers/calculator");
// const items_router = require("./routers/items");

// ========== define router =========== //

app.use("/calculator", calculator);

// ADMIN BRO
const AdminJS = require("adminjs");
const AdminJSExpress = require("@adminjs/express");
const country = require("./models/countryModel");
// We have to tell AdminJS that we will manage mongoose resources with it
AdminJS.registerAdapter(require("@adminjs/mongoose"));
// Import all the project's models

const adminJS = new AdminJS({
  resources: [country],
  rootPath: "/admin",
});
// Build and use a router which will handle all AdminJS routes
const router = AdminJSExpress.buildRouter(adminJS);
app.use(adminJS.options.rootPath, router);
// END ADMIN BRO

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
