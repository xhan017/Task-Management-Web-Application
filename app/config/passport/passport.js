//load bcrypt
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {
    var User = user;
    var LocalStrategy = require('passport-local').Strategy;
    
    
    //serialize
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    // deserialize user 
    passport.deserializeUser(function(id, done) {
        User.findById(id).then(function(user) {
            if(user){
                done(null, user.get());
            }
            else{
                done(user.errors,null);
            }
        });
    });
    
        
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },function(req, email, password, done) {
        console.log("username?: "+req.body.username);
        console.log("GOT IMAGE? "+JSON.stringify(req.body));
        var generateHash = function(password) {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
        };
        User.findOne({
            where: {
                email: email
            }
        }).then(function(user) {
            if (user){
                return done(null, false, {
                    message: 'That email is already taken'
                }); 
            } else {
                console.log("Pass!");
                var userPassword = generateHash(password);
                var data ={
                    email: email,
                    password: userPassword,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username
                };
                console.log("Trying to find shit 1!: "+req.body.username);
                console.log("IMAGE?: "+req.body.avatar);
                
                User.create(data).then(function(newUser, created) {
                    console.log("Trying to find shit 2!");
                    if (!newUser) {
                        return done(null, false);
                    }   if (newUser) {
                        console.log("User registered!");
                        req.session.user = newUser;
                        return done(null, newUser);
                    }
                }).catch(function(err) {
                    // print the error details
                    console.log(err, request.body.email);
                });
            }
        });
    }
 ));
    
    console.log("[Authenticating] part 4");
    
    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },function(req, email, password, done) {
        var User = user;
        var isValidPassword = function(userpass, password) {
            return bCrypt.compareSync(password, userpass);
        }
        User.findOne({
            where: {
                email: email
            }
        }).then(function(user) {
            if (!user) {
                return done(null, false, {
                    message: 'Email does not exist'
                });
            }
            if (!isValidPassword(user.password, password)) {
                console.log("Incorrect password: "+password);
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            var userinfo = user.get();
            req.session.user = user;
            return done(null, userinfo);
        }).catch(function(err) {
            console.log("Error:", err);
            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });
        });
    }));
    
}