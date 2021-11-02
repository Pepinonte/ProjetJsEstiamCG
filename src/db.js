const { connect } = require("mongoose");
const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/projet_rere", { useNewUrlParser: true })
  .then(() => console.log("Connected to Mongo…"))
  .catch((error) => console.log(error.message));

const userSchema = mongoose.Schema({
  name: String,
  mail: String,
  password: String,
  // gamesId: Array,
});

const gameSchema = mongoose.Schema({
  name: String,
  adversaire: String,
  createur: String,
  score: String,
  etat: String,
  jetonsJ1: String,
  jetonsJ2: String,
});

const User = mongoose.model("User", userSchema);

module.exports.User = User;

module.exports.createUser = async function createUser(
  user_name,
  user_mail,
  user_password
) {
  const user = new User({
    name: user_name,
    mail: user_mail,
    password: user_password,
  });
  const result = await user.save();
  console.log(result);
};

const Game = mongoose.model("Game", gameSchema);

module.exports.createGame = async function createGame(
  game_name,
  game_adversaire,
  createur,
  etat
) {
  const game = new Game({
    name: game_name,
    adversaire: game_adversaire,
    createur: createur,
    etat: etat,
  });
  const result = await game.save();
  console.log(result);
};

module.exports.getCoursesAll = async function getCoursesAll() {
  const users = await User.find({});
  return users;
};

module.exports.getCoursesParNom = async function getCoursesParNom(nom) {
  const users = await User.find({ name: nom });
  return users;
};
module.exports.getCoursesParNomOne =
  async function getCoursesPgetCoursesParNomOnearNom(nom) {
    const users = await User.findOne({ name: nom });
    return users;
  };

module.exports.getPassOne = async function getPassOne(pass) {
  const passs = await User.findOne({ password: pass });
  return passs.password;
};

// module.exports.verifCredentials = async function verifCredentials(nom, pass) {
//   const verif = await User.findOne({
//     $and: [{ name: nom }, { password: pass }],
//   });
//   return verif;
// };

module.exports.verifCredentials = async function verifCredentials(nom, pass) {
  const users = await User.find({ name: nom });
  const text = "az";
  const salt = await bcrypt.genSalt(10);
  const hash = users[0].password;
  const compare = await bcrypt.compare(text, hash);

  console.log(compare);

  for (let i = 0; i < users.length; i++) {
    const element = users[i];
    if (await bcrypt.compare(pass, hash)) {
      console.log("mdp ok");
      return element;
    }
  }
};

module.exports.getAllGames = async function getAllGames() {
  const games = await Game.find({}).sort({ date: "desc" });
  return games;
};

module.exports.getAllGamesName = async function getAllGamesName(name) {
  const games = await Game.find({ createur: name }).sort({ date: "desc" });
  return games;
};

module.exports.getAllGamesNameAdver = async function getAllGamesNameAdver(
  name
) {
  const games = await Game.find({ adversaire: name }).sort({ date: "desc" });
  return games;
};

module.exports.getAllGamesOneId = async function getAllGamesOneId(id) {
  const game = await Game.findOne({ _id: id });
  return game;
};

module.exports.deleteAsId = async function getAllGames(id) {
  await Game.deleteOne({ _id: id });
};

module.exports.getAsId = async function getAsId(id) {
  await Game.findOne({ _id: id });
};
