const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const fs = require('fs');
const bd = require('./models/js/connbd.js');

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

require('./models/js/config-passport.js');
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
  res.render('loginfail.hbs', {
    noLogin: true,
  });
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

app.get('/adminpanel/bd/users', auth, (req, res) => {
  bd.findAll({ raw: true })
    .then((data) => {
      res.render('users.hbs', {
        isLogin: true,
        users: data,
      });
    })
    .catch((err) => console.log(err));
});

app.get('/adminpanel/bd/addusers', auth, (req, res) => {
  res.render('addusers.hbs', {
    isLogin: true,
  });
});

app.post('/adminpanel/bd/addusers', auth, (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  const username = req.body.useradd;
  const userpass = req.body.passwordadd;
  bd.findAll({ raw: true })
    .then((data) => {
      data.forEach((item) => {
        if (username === item.name) {
          hbs.create('userYES');
          res.render('addusers.hbs', {
            userYES: true,
            isLogin: true,
          });
          next();
        }
      });

      bd.create({
        name: username,
        password: userpass,
        date: today,
      });
    })
    .then(() => {
      hbs.create('userNO');
      res.render('addusers.hbs', {
        userNO: true,
        isLogin: true,
      });
    })
    .catch((err) => console.log(err));
});

app.get('/adminpanel/bd/editusers', auth, (req, res) => {
  bd.findAll({ raw: true })
    .then((data) => {
      res.render('editusers.hbs', {
        isLogin: true,
        users: data,
      });
    })
    .catch((err) => console.log(err));
});

app.post('/adminpanel/bd/users/edit/:id', auth, (req, res) => {
  const userid = req.params.id;
  const username = req.body;
  bd.update(
    { name: username.editLogin, password: username.editPass },
    { where: { id: userid } }
  )
    .then(() => {
      res.redirect('/adminpanel/bd/editusers');
    })
    .catch((err) => console.log(err));
});

app.post('/adminpanel/bd/users/delete/:id', auth, (req, res) => {
  const userid = req.params.id;
  bd.destroy({ where: { id: userid } })
    .then(() => {
      res.redirect('/adminpanel/bd/editusers');
    })
    .catch((err) => console.log(err));
});

app.get('/404', (req, res) => {
  res.render('404.hbs', {
    isLogin: true,
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
