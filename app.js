const express = require('express');
const expressHbs = require('express-handlebars');
const hbs = require('hbs');
const routing = require('./models/js/routing');
const sessions = require('./models/js/session');

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
app.use(sessions);
app.use(routing);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
