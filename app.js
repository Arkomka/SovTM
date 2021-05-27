const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine(
  'hbs',
  expressHbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main',
    extname: 'hbs',
  })
);
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));

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
  fs.appendFile('server.log', data + '\n', (err) => {
    if (err) throw err;
  });
  next();
});

app.get('/', (req, res) => {
  res.render('index.hbs', {
    isMain: true,
  });
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
      return res.redirect('/adminpanel');
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

app.get('/loginfail', (req, res) => {
  res.render('loginfail.hbs');
});

app.get('/adminpanel', auth, (req, res) => {
  res.render('adminpanel.hbs', {
    isLogin: true,
  });
});

app.get('/adminpanel/bd', auth, (req, res) => {
  res.render('bd.hbs', {
    isLogin: true,
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
