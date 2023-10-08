const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const pool = require('./database');
const bcrypt = require('bcrypt');
passport.use('local.signin', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'codigo',
  passReqToCallback: true
}, async (req, username, codigo, done) => {
  console.log(username);
  const rows = await pool.query('SELECT * FROM wcf1_user WHERE username = ?', [username]); // username, userID
  console.log(rows);
  if (rows.length > 0) {
    const userlogin = rows[0];
    console.log("INPUTTEXT: "+codigo)
    console.log("CODIGO ESPERADO: "+userlogin.codigos)

    if(codigo === userlogin.codigos) {
      return done(null, userlogin, req.flash('success', 'Bienvenido. ' + userlogin.username));
    } else {
      return done(null, false, req.flash('message', 'El código introducido es incorrecto.'));
    }
  } else {
    return done(null, false, req.flash('message', 'No pudimos encontrar tu cuenta.'));
  }
}));

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {



  let newUser = {
    email,
    password,
    username: req.body.fullname
  };
  const nombreandemail = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if(nombreandemail.length > 0) return done(null, false, req.flash('message', 'El nombre de usuario o el correo ya están en uso.'));
 const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(newUser.password, salt);
  console.log(hash);
 //const result = await pool.query('INSERT INTO users (email, password, fullname, address, city, country, zip,  phone, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [newUser.email, hash, newUser.fullname, newUser.address, newUser.city, newUser.country, newUser.zip, newUser.phone, new Date(), new Date()]);
 newUser.id = result.insertId;
  console.log(result);
  console.log(newUser);
return done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.userID);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM wcf1_user WHERE userID = ?', [id]);
  done(null, rows[0]);
});
