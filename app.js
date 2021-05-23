const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/static"));

app.use(
  session({
    secret: 'hghtyNN23hasdDWQdqwdqQWDFgQWKGQHGm',
    store: new FileStore(),
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    },
    resave: false,
    saveUninitialized: false,
  })
);

require('./config-passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let data = `*${hour}:${minutes}:${seconds}* *${req.method}* *${req.url}*`;
  console.log(data);
  fs.appendFile("server.log", data + "\n", err => {
    if (err) throw err;
  });
  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/', (req, res, next) => {
  passport.authenticate('local', function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/loginfail');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/loginon');
    });
  })(req, res, next);
});


const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect('/loginfail');
  }
};

app.get('/loginon', auth, (req, res) => {
  console.log(req.session);
  res.sendFile(__dirname + "/static/pages/loginon.html");
});

app.get('/loginfail', (req, res) => {
  console.log(req.session);
  res.sendFile(__dirname + "/static/pages/loginfail.html");
});

app.get('/adminpanel', auth, (req, res) => {
  res.sendFile(__dirname + "/static/adminpanel.html");
});

app.get('/adminpanel/bd', auth, (req, res) => {
  res.sendFile(__dirname + "/static/pages/bd.html");
});

app.get('/logout', (req, res) => {
  fs.readdirSync(__dirname + "/sessions/").forEach((sessionFile) => {
    fs.unlinkSync(__dirname + `/sessions/${sessionFile}`, () => { });
  });
  res.redirect('/');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
