var socket;
console.log("Good shit.");
// Set variables
var channelsList = [];


// Get user ID
var userID = $('#userID').text();
console.log("User id is: " + userID);

// Get name 
var name = $('#name').text();
console.log("name is: " + name);

// Get username 
var username = $('#username').text();
console.log("username is: "+username);

// Get elements
var chatChannels = $('#chatChannelsDiv');
var chatDiv = $('#chatMainDiv');

var activeChannelID;
var activeProjectID;
var prevUsername;   // used to track sequential messages
var messageSequence; // used to track sequential messages 



// First function will be to load channels this user is in
// Next, bind onclick to the channels
// When channels are clicked, load messsages in that channel

// Get list of channels this user is in
$.getJSON('/getChatChannels/'+userID, function (data) {
    channelsList = [];
    var a = 0;
    console.log(data);
    for(var i in data){
        channelsList[a] = data[i].ChannelID;
        a++;
    }
    console.log("Getting channel names...");
    for(var i in channelsList){
        console.log("Running.");
        getChannelDetails(channelsList[i]);
    }
    console.log(channelsList.length);
    
    // Only after getting channelsList, allow the client to join. 
    $.getScript("/socket.io/socket.io.js", function() {
        console.log("Chat script loaded.");
        socket = io.connect();
        joinServer();
    });
});

function getChannelDetails(e){
    chatChannels.empty();
    // Get channel details solely for appending to sidebar
    $.getJSON('/getChannelDetails/'+e, function (data) {
        //console.log(data.length);
        //console.log("Channel names: "+data[0].Channel_Name);
        $('#channelID').text(data[0].ChannelID);
        $('#channelName').text(data[0].Channel_Name);
        var html = '<a class="item" onclick="channelClicked('+e+', \''+data[0].Channel_Name+'\')" id="c'+e+'">'+data[0].Channel_Name+'</a>';
        chatChannels.append(html);
    });
}


function channelClicked(e, f){
    console.log(e+" _ "+f);
    $('#inviteUserBtn').removeClass("disabled");
    
    $('#inviteFriendsHeader').text(f);
    
    $('#chatChannelsDiv>a.active').removeClass("active");
    $('#'+e).addClass("active");
    //console.log("Channel clicked: "+e);
    activeChannelID = e;
    //console.log("Channel ID: "+activeChannelID);
    chatDiv.empty();
    $('#messageInputDiv').removeClass("disabled");
    $('#channelHeader').text(f);
    
    // Load existing channel messages 
    getChannelMessages(e);
    
    // Load current users in that channel
    $('#usersDiv').empty();
    loadUsers(e);
}

function loadUsers(e){
    //console.log("Loading users for room(1): "+e);
    socket.emit('load users', e, function(data){
        console.log("Loading users for room: "+e);
    });
}

// Binding for enter key 
$(document).keypress(function(e) {
    if(e.which == 13) {
        // If you press enter, just append the message. 
        appendMessage({name: name, username: username, message: $('#messageinput').val()});
        sendMessage(userID, name, username, activeChannelID, $('#messageinput').val());
        $('#messageinput').val("");
        $('#makemescroll').animate({
                scrollTop: $('#makemescroll').get(0).scrollHeight
        }, 0); 
    }
});

function getChannelMessages(e){
    // Message details
    var senderName;
    var message;
    var timestamp;
    var senderUsername;
    var html;
    var messageHolder;

    
    $.getJSON('/getChannelMessage/'+e, function (data) {
        //console.log(data.length);
        messageSequence = 0;
        prevUsername="";
        chatDiv.empty();
        for(var i in data){
            messageHolder = "";
            senderName = data[i].SenderName;
            message = data[i].Message;
            timestamp = data[i].timestamp;
            senderUsername = data[i].SenderUsername;
            console.log("Message sequence: "+messageSequence);

            if(senderUsername == prevUsername){
                // if message is just from previous user, get previous element and append message to it.  
                console.log("This sohai spamming");
                var prevMessage = $('#'+(messageSequence-1)+'');
                prevMessage.append('<div class="text">'+message+'</div>');
            }else{
                // Create new div if message is from a new user & append
                html = '<div class="ui left floated comment"><a class="avatar"><img src="/images/avatar/'+senderUsername+'.jpg"></a>									<div class="content" id="'+messageSequence+'"><a class="author">'+senderName+'</a><div class="metadata"><span class="date">Today</span>										</div><div class="text">'+message+'</div></div></div>';
                chatDiv.append(html);
                messageSequence++;
            }
            $('#makemescroll').animate({
                scrollTop: $('#makemescroll').get(0).scrollHeight
            }, 0);  
            // update tracking variables 
            //console.log(senderName+" said: "+message);
            prevUsername = senderUsername;
        }
    });
}

// TODO:    get current user list. (maybe show existing)        (DONE)
//          bind sending message                                (DONE)
//          invite users (sending invites, receiving invites)   (DOING)

// Check invites every 5 seconds 
window.setInterval(function(){
    // check for friends request every 5 seconds 
    checkInvites();
}, 5000);

$('#viewInvitesBtn').click(function(){
    $('#invitesDiv').empty();
    $.getJSON('/getChannelRequests/'+userID, function (data) {
        console.log("Checking for friends invite...");
        console.log(">> invites "+data.length);
        for(var i in data){
            console.log(data[i].ChannelID);
            $.getJSON('/getChannelDetails/'+data[i].ChannelID, function(data2){
                console.log(data2[0].Channel_Name);
                var html = '<div class="ui segment"><div class="ui fluid left labeled button"><a class="ui fluid basic label">'+data2[0].Channel_Name+'</a><button class="ui positive icon basic button" onclick="acceptInvite('+data2[0].ChannelID+')"><i class="icon check"></i></button></div></div>';
                $('#invitesDiv').append(html);
            })
        }
    });
    $('#invitesModal').modal('show');
});

function checkInvites(){
    $.getJSON('/getChannelRequests/'+userID, function (data) {
        console.log("Checking for friends invite...");
        if(data.length>0){
            $('#viewInvitesBtn').addClass("green");
            $('#viewInvitesBtn').text("View invites ("+data.length+")");
        }
    });
}

function acceptInvite(e){
    console.log("User "+userID+" has accepted invite: "+e);
    // acceptChatChannelRequest, ChannelID, PersonID
    var payload = { ChannelID: e, PersonID: userID};
    
    $.ajax({
        url: "/acceptChatChannelRequest",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data)
            {
                $('#invitesModal').modal('hide');
                
                setTimeout(function(){
                    $('#successMessageModal').modal('show');
                    $('#modalText').text("Invite accepted!");
                },700);  
            }
    });  
}

function joinServer(){
    // 1 socket for each user 
    //console.log("Testing new shit. "+channelsList.length);
    var room;
    
    
    // For each channel, create a room in serverside 
    for(var i in channelsList){
        room = channelsList[i];
        
        console.log("Trying to join room: "+room);
        socket.emit('room', room);
        
        var user={
            PersonID:           userID,
            name:               name,
            username:           username,
            roomID:             room
        };
        socket.emit('user', user);
    }
    
    // Receive message and display 
    socket.on('message', function(data) {
        console.log("GOT MESSAGE");
        // If the user is looking at the channel of the new message, then append. 
        if(activeChannelID==data.channelID){
            console.log("APPENDING: "+data.message);
            console.log("SENDER'S USERNAME: "+data.username);
            console.log("MY USERNAME: "+username);
            // Do not append if sender is itself 
            if(data.username != username){
                console.log("Appending.");
                appendMessage(data);   
            }
            $('#makemescroll').animate({
                scrollTop: $('#makemescroll').get(0).scrollHeight
            }, 0);    
        //console.log('Incoming message:', data);
        }
    });
    
    
    // Receive user info
    socket.on('new user', function(data) {
        console.log("GOT USER: "+data.length);
        $('#usersDiv').empty();
        
        for(var i in data){
            console.log("HERE: "+data[i].username);
            var html = '<div class="item"><div class="content"><a class="ui fluid image label"><img src="/images/avatar/'+data[i].username+'.jpg">'+data[i].name+'</a></div></div>';
            $('#usersDiv').append(html);
        }
    });
}

// Sending a message requires these few details: Message, ChannelID, SenderID, SenderName, SenderUsername 
function sendMessage(senderID, name, username, activeChannelID, message){
    console.log("name: "+name);
    console.log("username: "+username);
    console.log("channel id: "+activeChannelID);
    console.log("Sending message: " +message);
    
    // Send chat message over
    
    socket.emit('send message', senderID, name, username, activeChannelID, message, function(data){
        if(data){
            console.log("Sent chat over..."+data); 
        }
    });
}

function appendMessage(data){
    // If previous message was by same sender, append. 
    console.log("Previous message was by: "+prevUsername);
    console.log("Current message is by: "+data.username);
    if(data.username == prevUsername){
        var prevMessage = $('#'+(messageSequence-1)+'');
        prevMessage.append('<div class="text">'+data.message+'</div>');
    }else{  // else, create new content. 
        html = '<div class="ui left floated comment"><a class="avatar"><img src="/images/avatar/'+data.username+'.jpg"></a>									<div class="content" id="'+messageSequence+'"><a class="author">'+data.name+'</a><div class="metadata"><span class="date">Today</span>										</div><div class="text">'+data.message+'</div></div></div>';
        chatDiv.append(html);
        prevUsername = data.username;
        messageSequence++;
    }
    
}

// Get project groups the user is in
function getProjectGroups(){
    var projectList=[];
    var a = 0;
    $.getJSON('/retrieveProjects/'+userID, function(data){
       console.log("User is involved in: "+data.length+" projects.");
        for(var i in data){
            $.getJSON('/retrieveProjectDetails/'+data[i].ProjectID, function(data){
            console.log("User is involved in: "+data.length+" projects.");
                for(var i in data){
                    var html = '<div class="item" data-value="'+data[i].ProjectID+'">'+data[i].projectname+'</div>';
                    $('#menuOptions').append(html);
                }
            });
        }
    });
    
    console.log("Project list size: "+projectList.length);
}

// Creating a channel
$('#createChannelBtn').click(function(){
    $('#createChannelModal').modal('show');
    console.log("CREATING CHANNEL.");
    var channelName = $('#channelnameText').text();
    var projectIDForChat = $("#elementId :selected").text();
    $('#dropdown').dropdown();
    getProjectGroups();
});


$('#createChannelForm').submit(function(event) {
    event.preventDefault();
    var value = $("#dropdown").dropdown('get value');
    var text = $("#channelnameText").val();
    // Create a channel. createChatChannel ChannelName PersonID and ProjectID
    var payload = { ChannelName: text, PersonID: userID, ProjectID: value};
    
    $.ajax({
        url: "/createChatChannel",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data)
            {
                if(!data){
                    console.log("Error. ");
                }
                console.log("Channel created!");
                $('#createChannelModal').modal('hide');
                
                setTimeout(function(){
                    $('#successMessageModal').modal('show');
                    $('#modalText').text("Channel created!");
                },700);  
            }
    });
    
});

$('#successMessageModalClose').click(function(){
    location.reload();
})

$('#inviteUserBtn').click(function(){
    $('#sendInvitesModal').modal('show');
    $('#usersDropdown').dropdown();
    $('#usersDropdown').dropdown({allowAdditions: true});
    var iName;
    var iId;
    
    $('#dropdown-menu').empty();
    $('#usersDropdown').dropdown('restore defaults')
    //req.body.channelID, req.body.ProjectID
    var payload = { channelID: activeChannelID };
    // Fetch users 
     $.ajax({
        url: "/getGroupMembersNotInChannel",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data)
            {
                console.log("Fetched "+ data +" users...");
                for (var i in data['responseJSON']){
                    //data['responseJSON'][i]
                    iName = data['responseJSON'][i].firstname + " " + data['responseJSON'][i].lastname;
                    iId = data['responseJSON'][i].id;
                    var html = '<div class="item" data-value="'+iId+'">'+iName+'</div>';
                    $('#dropdown-menu').append(html);
                }
            }
    });
})

$('#sendInvitesBtn').click(function(){
    console.log("For channel ID: "+activeChannelID);
    var selectedIDs = $('#usersDropdown').dropdown('get value');
    var selectedIDsArray = selectedIDs.split(",");
    for (var i in selectedIDsArray){
        // Send invites ChannelID and PersonID
        console.log("Selected IDs are: "+selectedIDsArray[i]);
        var payload = {ChannelID : activeChannelID, PersonID: selectedIDsArray[i]};
        $.ajax({
        url: "/sendChatChannelRequest",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data)
            {
                setTimeout(function(){
                    $('#successMessageModal').modal('show');
                    $('#modalText').text("Invite(s) sent!");
                },700);  
            }
        });
    }
    $('#sendInvitesModal').modal('hide');
})