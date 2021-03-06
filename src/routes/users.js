const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");
const { connect } = require("mongoose");
const path = require("path");
const exphbs = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const db = require("../db");

const oneDay = 1000 * 60 * 60 * 24;

router.use(express.json());
router.use(express.urlencoded());
router.use(methodOverride("_method"));
router.use(express.static("./src/public"));
router.use(
  session({
    secret: "mysecretapp",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    test: "ddd",
  })
);

router.use(cookieParser());

router.get("/inscription", (req, res) => res.render("users/inscription"));

router.get("/newGame", (req, res) => {
  const ssn = req.session;
  if (ssn.username) {
    res.render("game/createGame");
  } else if (!ssn.username) {
    res.send("tu nest pas co");
  }
  console.log(req.session.useraz);
});

router.get("/connexion", (req, res) => res.render("users/connexion"));

router.get("/user/connexion", (req, res) => res.render("users/connexion"));

router.post("/inscription", async (req, res) => {
  console.log(req.body);
  const reponse = req.body;
  // db.createUser(req.body.user_name, req.body.user_mail, req.body.user_password);
  const pass = req.body.password;
  const text = req.body.user_password;
  console.log("ddddd", req.body.password);
  const hash = await bcrypt.hash(text, await bcrypt.genSalt(10));
  db.createUser(req.body.user_name, req.body.user_mail, hash);

  const newUser = db.getCoursesParNomOne(reponse.user_name);
  const userId = db.getAsId(newUser._id);

  res.redirect("/");
});

router.post("/connexion", async (req, res) => {
  try {
    const user = await db.verifCredentials(req.body.name, req.body.password);
    if (user != {}) {
      console.log(user.name + " vien de ce conenter");
      const ssn = req.session;
      ssn.activsUsers = [];
      const activsUsers = ssn.activsUsers;
      activsUsers.push(await db.getCoursesParNomOne(req.body.name));
      console.log(activsUsers);

      ssn.username = req.body.name;
      ssn.password = req.body.password;
      const useri = ssn.username;
      ssn.useri = ssn.username;

      const allGames = await db.getAllGames();

      const allIdGames = allGames.map((e) => e.id);
      const allGamesNames = allGames.map((e) => {
        const ret = "Nom Partie:" + e.name + " " + "Adversaire:" + e.adversaire;
        return ret;
      });

      const { _id } = allIdGames;
      console.log(allGames);

      res.render("users/compteUtilisateur", {
        us: useri,
        allGames,
        allGamesNames,
        allIdGames,
      });
    }
  } catch (error) {
    console.log("identifiant ou mdp faux");
    res.render("users/connexion");
  }
});

router.post("/parier/:id", async (req, res) => {
  const ssn = req.session;
  let jetons = 100;
  const someParie = req.body.montant;
  const partie = await db.getAllGamesOneId(req.params.id);
  const partieCreateur = partie.createur;
  const partieAdversaire = partie.adversaire;
  const usr = ssn.username;

  if (ssn.username == partieCreateur) {
    ssn.someParieJ1 = ssn.someParieJ1 - req.body.montant;
    jetons = ssn.someParieJ1;
    //maj misse j1 bdd
    db.updateJ1(ssn.username, jetons);
    ssn.nomJ1 = partieCreateur;
  }
  if (ssn.username == partieAdversaire) {
    ssn.someParieJ2 = req.body.montant;
    jetons = ssn.someParieJ2;
    //maj misse j2 bdd
    ssn.nomJ2 = partieAdversaire;
  }

  console.log("sommeParieJ1", ssn.someParieJ1);
  console.log("sommeParieJ2", ssn.someParieJ2);
  console.log("partieCreateur", partieCreateur);
  console.log("partieAdversaire", partieAdversaire);

  if (jetons <= 0) {
    res.redirect("game/defaite");
    soldeTot = 100;
  } else if (jetons > 0 && ssn.username == partieCreateur) {
    res.render("game/modelGame", {
      jetons,
      id: req.params.id,
      usr: partieCreateur,
    });
  }
  if (ssn.username == partieAdversaire) {
    res.render("game/modelGame", {
      jetons,
      id: req.params.id,
      usr: partieAdversaire,
    });
    console.log("ok");
  }
});

router.get("/logout", async (req, res) => {
  const ssn = req.session;
  delete ssn.username;
  res.redirect("/");
});

router.get("/games", async (req, res) => {
  const ssn = req.session;
  if (ssn.username) {
    const allGames = await db.getAllGames();
    // const allGames = await db.getAllGamesName(ssn.username);

    const allIdGames = allGames.map((e) => e.id);
    const allGamesNames = allGames.map((e) => {
      const ret = "Nom Partie:" + e.name + " " + "Adversaire:" + e.adversaire;
      return ret;
    });

    const { _id } = allIdGames;
    console.log(allGames);

    res.render("game/allGames", { allGames, allGamesNames, allIdGames });
  } else if (!ssn.username) {
    res.send("tu est pas co");
  }
});

router.get("/game/newGame/:id", async (req, res) => {
  const ssn = req.session;
  const usr = ssn.username;
  const tempCreator = await db.getCoursesParNom(usr);
  const tempCreatorIdd = tempCreator.map((e) => e.id);
  const tempCreatorId = tempCreatorIdd[0];

  const thisGame = await db.getAllGamesOneId(req.params.id);
  const nameOfTrueCreator = thisGame.createur;
  const trueCreator = await db.getCoursesParNom(nameOfTrueCreator);
  const idOfTrueCreatorr = trueCreator.map((e) => e.id);
  const idOfTrueCreator = idOfTrueCreatorr[0];
  console.log("tempCreatorId", tempCreatorId);
  console.log("idOfTrueCreator", idOfTrueCreator);

  if (tempCreatorId === idOfTrueCreator) {
    console.log(req.params.id);
    db.deleteAsId(req.params.id);
    const allGames = await db.getAllGames();
    const allIdGames = allGames.map((e) => e.id);
    const allGamesNames = allGames.map((e) => {
      const ret = "Nom Partie:" + e.name + " " + "Adversaire:" + e.adversaire;
      return ret;
    });
    const { _id } = allIdGames;
    console.log(allGames);

    res.render("game/allGames", { allGames, allGamesNames, allIdGames });
  } else if (tempCreatorId != idOfTrueCreator) {
    res.send("vous n'etes pas le createur de cette partie");
  }
});

router.post("/newGame", (req, res) => {
  const { game_name, game_adversaire } = req.body;
  const errors = [];
  const ssn = req.session;
  const activsUsers = ssn.activsUsers;
  const usr = ssn.username;

  if (!game_name) {
    errors.push({ text: "veuillez ecrire le nom de la partie" });
  }
  if (!game_adversaire) {
    errors.push({ text: "veuillez ecrire le nom de l'advesire" });
  }
  if (errors.length > 0) {
    res.render("game/createGame", {
      errors,
      game_name,
      game_adversaire,
    });
  } else {
    db.createGame(game_name, game_adversaire, usr, "en cour", 100, 100);
    res.redirect("/games");
  }
});

router.get("/game/rejoindrePartie/:id", async (req, res) => {
  const ssn = req.session;
  const usr = ssn.username;
  const game = await db.getAllGamesOneId(req.params.id);
  const jetonsJ1 = game.jetonsJ1;
  const jetonsJ2 = game.jetonsJ2;
  ssn.someParieJ1 = jetonsJ1;
  ssn.someParieJ2 = jetonsJ2;
  const createur = game.createur;
  const adversaire = game.adversaire;

  if (ssn.username == createur) {
    res.render("game/modelGame", {
      jetons: jetonsJ1,
      id: req.params.id,
      usr: usr,
    });
  } else if (ssn.username == adversaire) {
    res.render("game/modelGame", {
      jetons: jetonsJ2,
      id: req.params.id,
      usr: usr,
    });
  }
});

module.exports = router;
