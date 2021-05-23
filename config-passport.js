const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require("sequelize");
let userName = ' ';

const sequelize = new Sequelize("mysql", "arkom", "141190ark", {
  dialect: "mariadb",
  host: "localhost",
  define: {
    timestamps: true
  }
});

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

User.findAll({ raw: true }).then(usersDB => {
  console.log(usersDB);
}).catch(err => console.log(err));

passport.serializeUser(function (user, done) {
  console.log('Сериализация: ', user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log('Десериализация: ', id);
  User.findOne({ where: { id: id } })
    .then(useridDB => {
      if (!useridDB) return;
      userName = useridDB.dataValues.name;
    }).catch(err => console.log(err));
  done(null, userName);
});

passport.use(
  new LocalStrategy({}, function (
    username,
    password,
    done
  ) {
    User.findOne({ where: { name: username, password: password } })
      .then(usersDB => {
        if (!usersDB) {
          return done(null, false);
        }
        else {
          let result = username === usersDB.dataValues.name && password === usersDB.dataValues.password;
          console.log(result);
          if (!result) {
            return done(null, false);
          };
          return done(null, usersDB.dataValues);
        }
      }).catch(err => console.log(err));
  })
);