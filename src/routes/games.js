const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");
const { connect } = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
const session = require("express-session");
const db = require("../db");
const { brotliDecompressSync } = require("zlib");

router.use(express.urlencoded());
router.use(methodOverride("_method"));
router.use(express.static("./src/public"));
router.use(
  session({
    secret: "mysecretapp",
    resave: true,
    saveUninitialized: true,
  })
);

// router.get("/game/rejoindrePartie", (req, res) => res.render("game/modelGame"));
router.get("/game/defaite", (req, res) => res.send("t'es un caca"));

module.exports = router;
