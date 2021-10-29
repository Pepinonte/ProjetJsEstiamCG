// Initialisations
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const exphbs = require("express-handlebars");
const session = require("express-session");

// Settings
app.set("port", 3000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// Middlewares
app.use(express.urlencoded());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "mysecretapp",
    resave: false,
    saveUninitialized: false,
  })
);

//Static Files
app.use(express.static("./public"));

// Variables Globales

// Routes

app.use(require("./routes/index"));
app.use(require("./routes/users"));
app.use(require("./routes/games"));

// Serveur en ecoute

app.listen(3000, () => {
  console.log("Serveur démaré");
});
