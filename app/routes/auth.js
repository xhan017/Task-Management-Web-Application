var authController = require('../controllers/authcontroller.js');
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, './public/images/avatar');
    },
        filename: function(req, file, callback){
        callback(null, req.body.username+".jpg");
    }
});
var upload = multer({storage: storage});

var passport = require('../config/passport/passport.js');
 
module.exports = function(app, passport) {
    app.get('/registration', authController.signup);
    app.get('/signin', authController.signin);
    
    app.post('/signup', upload.single('avatar'), passport.authenticate('local-signup', {
            successRedirect: '/projects',
            failureRedirect: '/failureredirect'
    })
            );

    app.get('/dashboard', isLoggedIn, authController.dashboard);
    
    app.get('/projects', isLoggedIn, authController.projects);
    
    app.get('/ProjectDB', isLoggedIn, authController.projectDB);
    
    app.get('/Tasks', isLoggedIn, authController.tasks);
    
    app.get('/Friends', isLoggedIn, authController.friends);
    
    app.get('/Notifications', isLoggedIn, authController.notifications);
    
    app.get('/Createtask', isLoggedIn, authController.createtask);
    
    app.get('/TaskDetails', isLoggedIn, authController.taskDetails);
    
    app.get('/ManageTeamForTask', isLoggedIn, authController.manageteamfortask);

    app.get('/ManageTeamForProject', isLoggedIn, authController.manageteamforproject);
    
    app.get('/ManageTeam', isLoggedIn, authController.manageteam);
    
    app.get('/Chat', isLoggedIn, authController.chat);
    
    app.get('/logout',authController.logout);
    
    app.post('/signin', passport.authenticate('local-signin', {
            successRedirect: '/projects',
            failureRedirect: '/signin'
        }
    ));
    
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }

}