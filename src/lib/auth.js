module.exports = {
    isLoggedIn (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }else {
            req.flash('message', 'Debes iniciar sesión.');
            res.redirect('/login');
        }
        
        
    },
    isNotLogged(req, res, next) {
        if(req.isAuthenticated()) {
            res.redirect('/home');
        } else {
            return next();
        }
    }
};