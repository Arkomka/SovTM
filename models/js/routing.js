const express = require('express');
const router = express.Router();
const passport = require('passport');
const hbs = require('hbs');
const fs = require('fs');
const bd = require('./conn-bd');
require('./config-passport');

const reqTime = function (req, res, next) {
  RealDate = new Date();
  RealTime = new Date();
  const dd = String(RealDate.getDate()).padStart(2, '0');
  const mm = String(RealDate.getMonth() + 1).padStart(2, '0');
  const yyyy = RealDate.getFullYear();
  const hour = String(RealTime.getHours()).padStart(2, '0');
  const minutes = String(RealTime.getMinutes()).padStart(2, '0');
  const seconds = String(RealTime.getSeconds()).padStart(2, '0');
  RealDate = `${yyyy}-${mm}-${dd}`;
  RealTime = `${hour}:${minutes}:${seconds}`;
  reqTMU = `${RealTime} ${req.method} *${req.url}*`;
  next();
};

const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect('/loginfail');
  }
};

router.use(passport.initialize());
router.use(passport.session());
router.use(reqTime);

router.use((req, res, next) => {
  console.log(reqTMU);
  fs.appendFile('server.log', `${RealDate} ${reqTMU}\n`, (err) => {
    if (err) throw err;
  });
  next();
});

router.get('/', (req, res) => {
  res.render('index.hbs', {
    isMain: true,
  });
});

router.post('/', (req, res, next) => {
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

router.get('/loginfail', (req, res) => {
  res.render('login-fail.hbs', {
    noLogin: true,
  });
});

router.get('/adminpanel', auth, (req, res) => {
  res.render('adminpanel.hbs', {
    isLogin: true,
  });
});

router.get('/adminpanel/bd', auth, (req, res) => {
  res.render('bd.hbs', {
    isLogin: true,
  });
});

router.get('/adminpanel/bd/users', auth, (req, res) => {
  bd.findAll({ raw: true })
    .then((data) => {
      res.render('users.hbs', {
        isLogin: true,
        users: data,
      });
    })
    .catch((err) => console.log(err));
});

router.get('/adminpanel/bd/addusers', auth, (req, res) => {
  res.render('add-users.hbs', {
    isLogin: true,
  });
});

router.post('/adminpanel/bd/addusers', auth, (req, res) => {
  const username = req.body.useradd;
  const userpass = req.body.passwordadd;
  bd.findAll({ raw: true })
    .then((data) => {
      data.forEach((item) => {
        if (username === item.name) {
          hbs.create('userYES');
          res.render('add-users.hbs', {
            userYES: true,
            isLogin: true,
          });
          next();
        }
      });
      bd.create({
        name: username,
        password: userpass,
        date: RealDate,
      });
    })
    .then(() => {
      hbs.create('userNO');
      res.render('add-users.hbs', {
        userNO: true,
        isLogin: true,
      });
    })
    .catch((err) => console.log(err));
});

router.get('/adminpanel/bd/editusers', auth, (req, res) => {
  bd.findAll({ raw: true })
    .then((data) => {
      res.render('edit-users.hbs', {
        isLogin: true,
        users: data,
      });
    })
    .catch((err) => console.log(err));
});

router.post('/adminpanel/bd/users/edit/:id', auth, (req, res) => {
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

router.post('/adminpanel/bd/users/delete/:id', auth, (req, res) => {
  const userid = req.params.id;
  bd.destroy({ where: { id: userid } })
    .then(() => {
      res.redirect('/adminpanel/bd/editusers');
    })
    .catch((err) => console.log(err));
});

router.get('/404', (req, res) => {
  res.render('404.hbs', {
    isLogin: true,
  });
});

router.get('/logout', async (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
