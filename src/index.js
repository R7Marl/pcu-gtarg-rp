const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
let hbs = require('hbs');
let crypto = require('crypto')
let bcrypt = require('bcrypt')
const { database } = require('./settings/settings.json');

// Intializations
const app = express();
require('./lib/passport');
const options = {
  key: fs.readFileSync('/etc/ssl/key.key'),
  cert: fs.readFileSync('/etc/ssl/cert.crt'),
};

// Settings
app.set('port', 443);
app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('gt', function(arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ht', function(arg1, arg2, options) {
  return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});
app.set('view engine', '.hbs');
app.engine('.hbs', hbs.__express);
// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(validator());

// Global variables
app.use((req, res, next) => {
  app.locals.message = req.flash('message');
  app.locals.success = req.flash('success');
  app.locals.user = req.user;
  next();
});

// Routes
app.use(require('./routes/auth/login'));
app.use(require('./routes/index'));
app.use(require('./routes/dashboard/index'));
// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting

const server = https.createServer(options, app);

server.listen(app.get('port'), async() => {
  console.log('Server is in port '+app.get('port'));
});