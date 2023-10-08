const router = require('express').Router()
const request = require('request-promise');
const passport = require('passport');
const { isNotLogged } = require('../../lib/auth');
router.get('/login', isNotLogged, async(req, res) => {
    res.render('signin.hbs');
});

router.post('/login', isNotLogged, async(req, res, next) => {
    console.log(req.body);
    var options = {
      method: 'POST',
      uri: 'https://www.google.com/recaptcha/api/siteverify',
      form: {
        secret: '6Lf8M2MoAAAAAE761HyP13KCrQdVbXQ0TCdysmY8',
        response: req.body["g-recaptcha-response"],
      },
      json: true // Automatically stringifies the body to JSON
    };
  
    request(options)
      .then((response) => {
        console.log(response);
        if(response.success === true){
        passport.authenticate('local.signin', {
          successRedirect: '/home',
          failureRedirect: '/login',
          failureFlash: true
        })(req, res, next);
      } else {
        req.flash('message', 'Completa el captcha.');
        res.redirect('/login')
      }
      })
      .catch((err) => {
        console.log('error');
      })
})

router.get('/logout', (req, res) => {
  req.logOut(function(err) {
    if (err) {
      // Manejo de errores, si es necesario
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router