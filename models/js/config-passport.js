const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bd = require('./conn-bd');
let userName = ' ';

passport.serializeUser(function (user, done) {
  console.log('Сериализация: ', user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log('Десериализация: ', id);
  bd.findOne({ where: { id: id } })
    .then((useridDB) => {
      if (!useridDB) return;
      userName = useridDB.dataValues.name;
    })
    .catch((err) => console.log(err));
  done(null, userName);
});

passport.use(
  new LocalStrategy({}, function (username, password, done) {
    bd.findOne({ where: { name: username, password: password } })
      .then((usersDB) => {
        if (!usersDB) {
          return done(null, false);
        } else {
          let result =
            username === usersDB.dataValues.name &&
            password === usersDB.dataValues.password;
          if (!result) {
            return done(null, false);
          }
          return done(null, usersDB.dataValues);
        }
      })
      .catch((err) => console.log(err));
  })
);
