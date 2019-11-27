var exports = module.exports = {}
 
exports.signup = function(req, res) {
    res.render('registration');
    console.log("registration requested!");
}

exports.signin = function(req, res){
    res.render('login');
    console.log("login requested!");
}

exports.projects = function(req, res){
    console.log("projects requested!");
    res.render('projects', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.projectDB = function(req, res){
    console.log("projectDB requested!");
    res.render('ProjectDB', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.tasks = function(req, res){
    console.log("tasks requested!");
    res.render('Tasks', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.friends = function(req, res){
    console.log("friends requested!");
    res.render('Friends', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.notifications = function(req, res){
    console.log("notifications requested!");
    res.render('Notifications', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.createtask = function(req, res){
    console.log("createtask requested!");
    res.render('Createtask', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.manageteam = function(req, res){
    console.log("manageteam requested!");
    res.render('ManageTeam', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.manageteamfortask= function(req, res) {
    console.log(">>"+req.session.user.username);
    console.log(">>"+req.session.user.email);
    res.render('ManageTeamForTask', {
        username: req.session.user.username,
        email: req.session.user.email
    });
}

exports.manageteamforproject= function(req, res) {
    console.log(">>"+req.session.user.username);
    console.log(">>"+req.session.user.email);
    res.render('ManageTeamForProject', {
        username: req.session.user.username,
        email: req.session.user.email
    });
}

exports.dashboard = function(req, res) {
    console.log("dashboard requested!");
    console.log(">>"+req.session.user.username);
    console.log(">>"+req.session.user.email);
    res.render('dashboard', {
        username: req.session.user.username, 
        email: req.session.user.email
    });
}

exports.taskDetails = function(req, res) {
    console.log("Task details requested!");
    console.log(">>"+req.session.user.username);
    console.log(">>"+req.session.user.email);
    res.render('TaskDetails', {
        username: req.session.user.username, 
        email: req.session.user.email
    });
}

exports.chat = function(req, res) {
    console.log("chat requested!");
    console.log(">>"+req.session.user.username);
    console.log(">>"+req.session.user.email);
    res.render('Chat', {
        username: req.session.user.username, 
        email: req.session.user.email,
        name: req.session.user.firstname+" "+req.session.user.lastname,
        id: req.session.user.id
    });
}

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}