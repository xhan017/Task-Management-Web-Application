/*
    Importing modules 
*/
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var env = require('dotenv').load();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var exphbs = require('express-handlebars');
var models = require("./app/models");
var mysql = require('mysql');

// load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

// sync database 
models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine')
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!")
});

// listen on port 3000
server.listen(process.env.PORT || 3000);

// set static file directory
app.use(express.static('public'));

// letting the app use body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


// initialize passport, express session and passport session 
app.use(session({ secret: 'keyboard cat', resave:true, saveUnitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// routes
var authRoute = require('./app/routes/auth.js')(app,passport);

// for handlebars
app.set('views', './app/views');
app.engine('hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// making sure server is running
console.log('server running');

// serve static page 
app.get('/', function(req, res){
    res.sendFile(__dirname+'index.html');
})


/*  ============================
    This is for MySQL functions
    ============================
*/

// create connection
const db = mysql.createConnection({
    host: 'XXX.XXX.XXX.XXX',
    port: '3306',
    user: 'pub',
    password: '---p',
    database: 'cz3002_synergy'
});

// connect 
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySQL connected.');
})

// To create a new project
app.post('/createProject', function (req, res) {
    console.log(req.body);
    db.query('INSERT INTO project SET ?', req.body, 
        function (err, result, fields) {
            var personid = req.body.ldrpersonid;
            console.log("OK: "+personid+"<<< ");
            if (err) {
                throw err;
            }else{
                console.log("OK2");
                console.log(result.insertId);
                console.log("OK3");
                var statement = "INSERT INTO person_projects VALUES ( "+personid+", "+result.insertId+")";
                console.log("Second statement: "+statement);
                db.query(statement, function(err2, res){
                    if(err2){
                        throw err2;
                    }else{
                        console.log("Done2!");
                    }
                })
                res.send('Success!' + result.ProjectID);
            }            
        }
    );
});

// Retrieve all projects the user is in
app.get('/retrieveProjects/:id', function (req, res) {
    var sql = "SELECT * FROM person_projects WHERE PersonID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched projects for ID "+req.params.id);
           // These are the projects the user is under
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve project details
app.get('/retrieveProjectDetails/:id', function (req, res) {
    console.log("Retrieving project details");
    var sql = "SELECT * FROM project WHERE ProjectID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched project details for ID "+req.params.id);
           console.log(result);
           res.send(result);
       }
    });
});


/***************************
* PROJECT DASHBOARD 
***************************/
app.post('/updateProject', function (req, res) {
  console.log("test");
    var sql = "UPDATE project SET progress="+req.body.progress+ " WHERE ProjectID="+req.body.projectid;
    console.log(sql);
    db.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        }else{
            console.log("Success");
        }
    });
});

// Get project members from project ID. 
app.get('/projectMembers/:projectID', function(req, res){
   var sql =  "SELECT PersonID from person_projects WHERE ProjectID = "+req.params.projectID;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log("No such results found. "+err);
       }else{
           res.send(result);
       }
    });
});

/***************************
* TASKS
***************************/
// To create a new task
app.post('/createTask', function (req, res) {
    console.log(req.body);
    db.query('INSERT INTO task SET ?', req.body,
        function (err, result, fields) {
            var personid = req.body.assignpersonid;
            var projectid = req.body.projectID;
            console.log("OK: "+personid+"<<< ");
            if (err) {
                throw err;
            }else{
                console.log("OK2");
                console.log(result.insertId);
                console.log("OK3");
                var statement = "INSERT INTO person_tasks VALUES ( "+personid+", "+result.insertId+")";
                console.log("Second statement: "+statement);
                db.query(statement, function(err2, res){
                    if(err2){
                        throw err2;
                    }else{
                        console.log("Done2!");
                    }
                })
                var statement1 = "INSERT INTO project_tasks VALUES ( "+projectid+", "+result.insertId+")";
                console.log("Third statement: "+statement1);
                db.query(statement1, function(err3, res){
                    if(err3){
                        throw err3;
                    }else{
                        console.log("Done3!");
                    }
                })
                res.send('Success!' + result.taskID);
            }
        }
    );
});

// Retrieve all tasks the user is in
app.get('/retrieveTasks/:id', function (req, res) {
    var sql = "SELECT * FROM person_tasks WHERE PersonID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched tasks for ID "+req.params.id);
           // These are the tasks the user is under
           console.log(result);
           res.send(result);
       }
    });
});


// Retrieve task details
app.get('/retrieveTaskDetails/:id', function (req, res) {
    console.log("Retrieving task details");
    var sql = "SELECT * FROM task WHERE taskID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched task details for ID "+req.params.id);
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve all tasks for this project
app.get('/retrieveTasksForProject/:id', function (req, res) {
    var sql = "SELECT * FROM project_tasks WHERE ProjectID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched tasks for ID "+req.params.id);
           // These are the tasks for the project
           console.log(result);
           res.send(result);
       }
    });
});

// To update progress bar for project page
app.post('/updateProject', function (req, res) {
  console.log("test");
    var sql = "UPDATE project SET progress="+req.body.progress+ " WHERE ProjectID="+req.body.projectid;
    console.log(sql);
    db.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        }else{
            console.log("Success");
        }
    });
});

// To update progress bar for task page
app.post('/updateTask', function (req, res) {
  console.log("test");
    var sql = "UPDATE task SET progress="+req.body.progress+ " WHERE taskID="+req.body.taskID;
    console.log(sql);
    db.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        }else{
            console.log("Success");
        }
    });
});

// To update status bar for task page
app.post('/updateStatus', function (req, res) {
  console.log("test");
    var sql = "UPDATE task SET status=\""+req.body.status+ "\" WHERE taskID="+req.body.taskID;
    console.log(sql);
    db.query(sql, function (err, result, fields) {
        if (err) {
            throw err;
        }else{
            console.log("Success");
        }
    });
});

// Retrieve all the members for the task
app.get('/retrieveMembers/:id', function (req, res) {
    var sql = "SELECT * FROM person_tasks WHERE TaskID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched members for ID "+req.params.id);
           // These are all the member of the task
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve all the members for the project
app.get('/retrieveMembersFromProject/:id', function (req, res) {
    var sql = "SELECT * FROM person_projects WHERE ProjectID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched members for ID "+req.params.id);
           // These are all the member of the project
           console.log(result);
           res.send(result);
       }
    });
});


// Retrieve name of members
app.get('/retrieveMemberDetails/:id', function (req, res) {
    var sql = "SELECT * FROM users WHERE id="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched name for ID "+req.params.id);
           // These are the name of all the members
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve all the friends for this user for this project
app.get('/retrieveFriendsForProject/:userID/:projectID',function (req, res) {
  var sql = "SELECT FriendPersonID FROM friends WHERE PersonID="+req.params.userID+" AND FriendPersonID NOT IN (SELECT PersonID FROM person_projects WHERE ProjectID ="+req.params.projectID+")";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched friend for ID "+req.params.id);
           // These are all the friends of the user
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve all the friends for this user for this task
app.get('/retrieveFriendsForTask/:userID/:taskID',function (req, res) {
  var sql = "SELECT FriendPersonID FROM friends WHERE PersonID="+req.params.userID+" AND FriendPersonID NOT IN (SELECT PersonID FROM person_tasks WHERE TaskID ="+req.params.taskID+")";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched friend for ID "+req.params.id);
           // These are all the friends of the user
           console.log(result);
           res.send(result);
       }
    });
});

// Retrieve name of friends
app.get('/retrieveFriendDetails/:id', function (req, res) {
    var sql = "SELECT * FROM users WHERE id="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched name for ID "+req.params.id);
           // These are the names of all the friends
           console.log(result);
           res.send(result);
       }
    });
});

/* =============================
    MANAGETEAM
  ==============================
*/

// Remove member from project
app.post('/removeMemberFromProject', function (req, res) {
    var sql = "DELETE FROM person_projects WHERE PersonID="+ req.body.UserID + " AND ProjectID=" +req.body.ProjectID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("Member unable to be removed");
           res.send(false);
       } else{
           console.log("Member removed!");
           res.send(true);
       }
    });
});

// Remove member from project
app.post('/removeMemberFromTask', function (req, res) {
    var sql = "DELETE FROM person_tasks WHERE PersonID="+ req.body.UserID + " AND TaskID=" +req.body.TaskID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("Member unable to be removed");
           res.send(false);
       } else{
           console.log("Member removed!");
           res.send(true);
       }
    });
});


// Retrieve all the members for the task
app.get('/retrieveMembersFromTask/:id', function (req, res) {
    var sql = "SELECT * FROM person_tasks WHERE TaskID="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched members for ID "+req.params.id);
           // These are all the member of the task
           console.log(result);
           res.send(result);
       }
    });
});

// To add friend to invitelist
app.post('/createInviteForProject', function (req, res) {
    console.log(req.body);
    db.query('INSERT INTO project_invite SET ?', req.body,
        function (err, result, fields) {
            var friendid = req.body.UserID;
            var projectid = req.body.ProjectID;
            console.log("OK: "+friendid+"<<< ");
            if (err) {
                throw err;
            }else{
                res.send('Success!' + result.ProjectID);
            }
        }
    );
});

// To add friend to invitelist
app.post('/createInviteForTask', function (req, res) {
    console.log(req.body);
    db.query('INSERT INTO task_invite  SET ?', req.body,
        function (err, result, fields) {
            var friendid = req.body.UserID;
            var taskid = req.body.TaskID;
            var projectid = req.body.ProjectID;
            console.log("OK: "+friendid+"<<< ");
            if (err) {
                throw err;
            }else{
                res.send('Success!' + result.TaskID);
            }
        }
    );
});

/*  ============================
    NOTIFICATION
    ============================
*/

// Retrieve all projects that invites the user
app.get('/retrieveProjectInvites/:id', function (req, res) {
    var sql = "SELECT * FROM project_invite WHERE UserID="+req.params.id+" AND InviteStatus='invite'";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched project for ID "+req.params.id);
           // These are the projects the user is invited
           console.log(result);
           res.send(result);
       }
    });
});
// Retrieve all tasks that invites the user
app.get('/retrieveTaskInvites/:id', function (req, res) {
    var sql = "SELECT * FROM task_invite WHERE UserID="+req.params.id+ " AND InviteStatus='invite'";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched task for ID "+req.params.id);
           // These are the tasks the user is invited
           console.log(result);
           res.send(result);
       }
    });
});

// Remove row for rejection/join from project invitation
app.post('/removeFromProjectInvite', function (req, res) {
    var sql = "DELETE FROM project_invite WHERE ProjectID="+ req.body.ProjectID + " AND UserID=" +req.body.UserID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("project invite unable to be removed");
           res.send(false);
       } else{
           console.log("project invite removed removed!");
           res.send(true);
       }
    });
});

// Insert row for joining after project invitation
app.post('/joinFromProjectInvite', function (req, res) {
    var sql = "INSERT INTO person_projects VALUES("+req.body.UserID+", "+req.body.ProjectID+")";
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("project invite unable to be removed");
           res.send(false);
       } else{
           console.log("project invite removed removed!");
           res.send(true);
       }
    });
});

// Remove row for rejection/join from task invitation
app.post('/removeTaskInvite', function (req, res) {
    var sql = "DELETE FROM task_invite WHERE TaskID="+ req.body.TaskID + " AND UserID=" +req.body.UserID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("project invite unable to be removed");
           res.send(false);
       } else{
           console.log("project invite removed removed!");
           res.send(true);
       }
    });
});

// Insert row for joining after task invitation
app.post('/joinTaskInvite', function (req, res) {
	var sql = "INSERT INTO person_tasks VALUES("+req.body.UserID+", "+req.body.TaskID+")";
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("project invite unable to be removed");
           res.send(false);
       } else{
           console.log("project invite removed removed!");
           res.send(true);
       }
    });
});



/***************************
* FRIENDS 
***************************/
// To search for users 
app.get('/searchUser/:name', function (req, res) {
    console.log("Retrieving users");
    var sql = "SELECT * FROM users WHERE firstname='"+req.params.name+"' OR lastname='"+req.params.name+"'";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           // parse to json
           for(var i in result){
               result[i].firstname = result[i].firstname+" "+result[i].lastname;
               console.log(result[i].firstname);
               result[i].id = "/Friends?id="+result[i].id;
           }
           var jsonObj = [];
           var dummy = {};
           dummy["results"] = result;
           jsonObj.push(dummy);

           var finalresponse = JSON.stringify(jsonObj);
           var newStr = finalresponse.substring(1, finalresponse .length-1);
            console.log("Fetched Person: "+newStr);
            res.send(newStr);
       }
    });
});

// Retrieve person details
app.get('/retrievePersonDetails/:id', function (req, res) {
    console.log("Retrieving person details");
    var sql = "SELECT * FROM users WHERE id="+req.params.id;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Fetched user details... ");
           console.log(result);
           res.send(result);
       }
    });
});

// Sending friend request
app.post('/sendFriendRequest', function (req, res) {
    var sql = "INSERT INTO friends VALUES("+req.body.PersonID+", "
    +req.body.FriendPersonID+", "+req.body.Accepted+")";
    db.query(sql, function(err, result){
       if(err){
           console.log("Friend request already sent!");
           res.send(false);
       } else{
           console.log("Sending friend request...");
           console.log(result);
           res.send(true);
       }
    }); 
});

// Accept friend request
app.post('/acceptFriendRequest', function(req, res){
    var sql = "UPDATE friends SET Accepted=1 WHERE PersonID="+req.body.FriendPersonID+" AND FriendPersonID="+req.body.PersonID;
    db.query(sql, function(err, result){
       if(err){
           console.log("uhm.");
           res.send(false);
       } else{
           console.log("Friend request accepted!");
           console.log(result);
           res.send(true);
       }
    });
})


// Remove friend
app.post('/removeFriend', function (req, res) {
    var sql = "DELETE FROM friends WHERE PersonID="+req.body.PersonID+" AND FriendPersonID="+req.body.FriendPersonID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("Friend unable to be removed");
           //res.send(false);
       } else{
           console.log("Friend removed!");
           //res.send(true);
       }
    });
    
    sql = "DELETE FROM friends WHERE PersonID="+req.body.FriendPersonID+" AND FriendPersonID="+req.body.PersonID;
    db.query(sql, function(err, result){
       if(err){
           console.log("Friend unable to be removed");
           res.send(false);
       } else{
           console.log("Friend removed!");
           res.send(true);
       }
    });
});

// Retrieve friends list
app.post('/retrieveFriendsList', function (req, res) {
    //var sql = "SELECT FriendPersonID FROM friends WHERE PersonID="+req.body.PersonID+" AND Accepted=1";
    var sql = "SELECT friends.FriendPersonID AS id FROM friends WHERE PersonID = "+req.body.PersonID+" AND Accepted=1 UNION SELECT friends2.PersonID FROM friends AS friends2 WHERE FriendPersonID = "+req.body.PersonID+" AND Accepted=1";
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log("No friends!");
           res.send(false);
       } else{
           console.log("Have friends! "+result.length);
           res.send(result);
       }
    });
});

// Retrieve incoming friend requests
app.get('/retrieveFriendRequests/:id', function (req, res) {
    console.log("Retrieving friend requests... ");
    var sql = "SELECT PersonID FROM friends WHERE FriendPersonID="+req.params.id+" AND Accepted=0";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           throw err;
       } else{
           console.log("Friend request found! ");
           console.log(result);
           res.send(result);
       }
    });
});


/* TODO: 
*  1 load all friends of the user & display onto the page for friends   DONE
*    - code the remove friends button                                   DONE
*    - maybe find a way to enable notifications? (low)
*  2 chat - user & chat IDs, chat IDs & message & sender, 
*    - load chats
*    - send chats 
*/


/*  ============================
    CHAT
    ============================
*/

// Creating a new chat channel - Takes in ChannelName PersonID and ProjectID
app.post('/createChatChannel', function (req, res) {
    var sql = "INSERT INTO chat_channel (Channel_Name, CreatedBy, ProjectID ) VALUES (\""+req.body.ChannelName+"\", "+req.body.PersonID+", "+req.body.ProjectID+")";
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Chat channel created: "+result.insertId);
           var sql2 = "INSERT INTO chat_channel_users VALUES (\""+result.insertId+"\", "+req.body.PersonID+", 1)";
           db.query(sql2, function(err2, result2){
               if(err2){
                   console.log(err2);
               }else{
                   console.log("Success!");
               }
           })
           res.send(result);
       }
    });
});

// Sending chat channel request - Takes in ChannelID and PersonID 
app.post('/sendChatChannelRequest', function (req, res) {
    // 0 to send request
    var sql = "INSERT INTO chat_channel_users VALUES (\""+req.body.ChannelID+"\", "+req.body.PersonID+", 0)";
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Chat request sent!");
           res.send(result);
       }
    });
});

// Accepting chat channel request - Takes in ChannelID and PersonID 
app.post('/acceptChatChannelRequest', function (req, res) {
    // 0 to send request
    var sql = "UPDATE chat_channel_users SET Invited=1 WHERE ChannelID="+req.body.ChannelID+" AND PersonID = "+req.body.PersonID;
    console.log(sql);
    var jsonObj = [];
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Chat request Accepted!");
           res.send(result);
       }
    });
});

// Get chat channels of a user that he as accepted - Takes in PersonID
app.get('/getChatChannels/:PersonID', function (req, res) {
    var sql = "SELECT ChannelID FROM chat_channel_users WHERE PersonID="+req.params.PersonID+" AND Invited=1";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Channels list retrieved!");
           res.send(result);
       }
    });
});

// Get chat channel details from a chat channel ID - takes in ChannelID
app.get('/getChannelDetails/:ChannelID', function (req, res) {
    var sql = "SELECT ChannelID, Channel_Name FROM chat_channel WHERE ChannelID="+req.params.ChannelID;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Channel detail retrieved!");
           res.send(result);
       }
    });
});

// Load messages from a chat channel - takes in ChannelID
app.get('/getChannelMessage/:ChannelID', function (req, res) {
    var sql = "SELECT * FROM chat_message WHERE ChannelID="+req.params.ChannelID;
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Chat messages retrieved!");
           res.send(result);
       }
    });
});

// Send messages from a chat channel - takes in SenderID, Message, ChannelID, SenderName, SenderUsername
app.post('/sendChannelMessage', function (req, res) {
    // 0 to send request
    var sql = "INSERT INTO chat_message (Message, DateCreated, ChannelID, SenderID, SenderName, SenderUsername) VALUES (\""+req.body.Message+"\", NOW(), "+req.body.ChannelID+", "+req.body.SenderID+", \""+req.body.SenderName+"\")";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else{
           console.log("Chat message saved!");
           res.send(result);
       }
    });
});

// Check for invites
app.get('/getChannelRequests/:userID', function(req, res){
   var sql = "SELECT * FROM chat_channel_users WHERE PersonID="+req.params.userID+" AND Invited = 0";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else {
           console.log("Fetched invites");
           res.send(result);
       }
    });
});


// Load users in the project that are not already in the chat channel 
app.post('/getGroupMembersNotInChannel', function (req, res){
   // needs req.body.channelID
    var sql = "SELECT * FROM person_projects JOIN users ON (PersonID = users.ID) WHERE ProjectID = (SELECT ProjectID FROM chat_channel WHERE ChannelID = "+req.body.channelID+") AND PersonID NOT IN (SELECT i.PersonID FROM chat_channel_users AS i WHERE i.ChannelID = "+req.body.channelID+")";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
           res.send(false);
       } else {
           console.log("Fetched members not in this chat channel: "+req.body.channelID);
           res.setHeader('Content-Type', 'application/json');
           res.send(result);
       }
    });
});



/*  ============================
    This is for CHAT functions using socket.io
    ============================
*/

var userList = [];

var userDetails = {};
userDetails.name = '';
userDetails.username = '';
userDetails.channel = '';

// arrays for users and connections
users=[];
rooms=[];

var userInRoom = [];

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
    console.log("Client connected");
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', function(room) {
        console.log("Client requested to join room: "+room);
        socket.join(room);
        console.log("Client has joined room: "+room);

    });
    
    // Add user to a userlist that we can track
    socket.on('user', function(data){    
        socket.username = data.username;
        socket.name = data.name;
        users.push(data);
        console.log("Added user to userlist: "+socket.username+" "+users.length);
        
        // Emit the news to all users in that room (TODO).
    });
    
    
    // Sending a message to users in that room 
    socket.on('send message', function(senderID, name, username, activeChannelID, m){
        // After receiving message, store in DB and send (emit) to all users in that same channel. 
        console.log("Received messsage. ");
        console.log("Sending message: " +m);
        
        // Storing in DB
        saveMessage(senderID, name, username, activeChannelID, m);
        
        // Now to emit to all users for parsing (workaround)    
        console.log("Sending message ");
        
        
        io.in(activeChannelID).emit('message', {channelID: activeChannelID, message: m, username: username, name: name});
        //io.sockets.emit('new message', {msg: data, user: socket.username}); 
    });
    
    // For loading all users in a channel.
    socket.on('load users', function(room){
        console.log("Received request to load users in room: "+room);
        console.log("Length of user list: "+users.length);
        
        userInRoom = [];
        
        // This shows all the users in a particular chatroom. 
        io.of('/').in(room).clients((error, clients) => {
                if (error) throw error;
                console.log("Users in room no. "+room);
                for(var i in clients){
                    var userX = io.sockets.connected[clients[i]];
                    //io.sockets.emit('new user', userX);
                    userInRoom.push({username: userX.username, name: userX.name});
                    //sendUser(userX);
                    console.log("Before >>> "+userInRoom.length);
                }
            updateUsernames(room);
        });
        
    });
    
    function updateUsernames(room){
        console.log("Updating usernames: "+userInRoom.length);
        io.in(room).emit('new user', userInRoom);
        //io.sockets.emit('new user', userInRoom);
    }
    
    
    // On disconnect
    socket.on('disconnect', function(data){
        console.log(socket.username+" disconnected.");
        var index=0;
        
        // This removes the user from our user list. 
        for(var i in users){
            if(users[i].username == socket.username){
                console.log("Removed user. BEFORE: "+users.length);
                users.splice(index, 1);
                console.log("Removed user. AFTER: "+users.length);
                break;
            }
            index++;
        }
        
        updateUsernames();
        console.log("User list size: "+users.length);
    });
});


function saveMessage(senderID, name, username, activeChannelID, m){
    // takes in SenderID, Message, ChannelID, SenderName, SenderUsername
    
    var sql = "INSERT INTO chat_message (Message, DateCreated, ChannelID, SenderID, SenderName, SenderUsername) VALUES (\""+m+"\", NOW(), "+activeChannelID+", "+senderID+", \""+name+"\", \""+ username +"\")";
    console.log(sql);
    db.query(sql, function(err, result){
       if(err){
           console.log(err);
       } else{
           console.log("Chat message saved!");
       }
    });

}
