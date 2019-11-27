console.log("test2");

//var remoteUrl = 'http://159.65.134.157:3000/searchUser/{query}';
var remoteUrl = 'http://localhost:3000/searchUser/{query}';

var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var url = new URL(window.location.href);
var userID = $('#userID').text();
console.log("Your user ID is: "+userID);

var id = url.searchParams.get("id");	
console.log("Friend id selected is: "+id);


var $image = $('#imageSRC');
var name = "";
var joinedDate = "";
var username = "";

// friend request button
var friendReqBtn = $('#newFriendRequestButton');

window.setInterval(function(){
    // check for friends request every 5 seconds 
    $.getJSON('/retrieveFriendRequests/'+userID, function (data) {
        console.log(data);
        if(data.length > 0){
            console.log("Friend request received!");
            friendReqBtn.removeClass("grey");
            friendReqBtn.addClass("green");
            friendReqBtn.removeClass("disabled");
            friendReqBtn.empty();
            var html = '<i class="icon user"></i>New friend request!';
            friendReqBtn.append(html);
        }
    });
}, 5000);


friendReqBtn.click(function(){
    $('#viewFriendInvitesModal').modal('show');
    //console.log("Fetching friend info...");
   $.getJSON('/retrieveFriendRequests/'+userID, function (data) {
        console.log(data);
        if(data.length > 0){            
            $('#friendsInviteListDiv').empty();
            
            // for each friend request, retrieve details. 
            for(var i in data){
                $.getJSON('/retrieveMemberDetails/'+data[i].PersonID, function(data2){
                    var iName = data2[0].firstname +" "+ data2[0].lastname;
                    var iId = data2[0].id;
                    var iUsername = data2[0].username;
                    console.log(">> "+iName+" "+iId);
                    // Just append to modal. 
                    var html2 = '<div class="item">    <div class="right floated content">      <div class="ui basic green button" onclick="acceptFriend('+iId+')">Accept</div>    </div>    <img class="ui avatar image" src="../images/avatar/'+iUsername+'.jpg">    <div class="content">      '+iName+'    </div>  </div>';
                    $('#friendsInviteListDiv').append(html2);
                });
            }
        }
    }); 
});


function acceptFriend(e){
    console.log("Trying to accept friend ID: "+e);
    $('#viewFriendInvitesModal').modal('hide');
    var payload = { PersonID: userID, FriendPersonID: e};
    $.ajax({
        url: "/acceptFriendRequest",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data) 
            {
                $('#viewFriendInvitesModal').modal('hide');
                setTimeout(function(){
                    $('#successMessageModal').modal('show');
                    $('#modalText').text("Friend request accepted!");
                    loadFriends();
                },700);  
            }
        
    });
}

$('#successMessageModalClose').click(function(){
    location.reload();
})

var idsOfFriends=[];

loadFriends();

// Load friends
function loadFriends(){
    var $friendsUIGrid = $('#friendsGrid');
    $friendsUIGrid.empty();
    var payload={
        PersonID:           userID,
    };
    // Get ids of friends 
     $.ajax({
        url: "/retrieveFriendsList",
        type: "POST",
        processData: false,
        data: JSON.stringify(payload),
        contentType: "application/json",
        complete: function (data2) 
            {
                idsOfFriends = JSON.parse(data2.responseText);
                console.log(idsOfFriends);
                console.log(idsOfFriends.length);
                // get details of each friend 
                var a=0;
                for(var i in idsOfFriends){
                 $.getJSON('/retrievePersonDetails/'+idsOfFriends[i].id, function(data){
                        console.log(data.length);
                        for(var j in data){
                            idsOfFriends[a] = data[j];
                            // need username for the picture
                            var username = data[j].username;
                            // need full name 
                            var fullname = data[j].firstname+" "+data[j].lastname;
                            // need user id 
                            var friendID = data[j].id;
                            // need join date
                            var joinDate = new Date(data[j].createdAt.toString());
                            joinDate = joinDate.getFullYear();
                            
                            // create html
                            var html='<div class="four wide stretched column"><div class="ui segment"> <img class="ui  tiny avatar image" src="/images/avatar/'+username+'.jpg" data-title="" data-content="Joined the company since '+joinDate+'" id="'+friendID+'"> '+fullname+' <div class="ui avatar image" onmouseover="$(\'#'+friendID+'\').popup();"></div><p></p><button class="fluid negative ui basic button" onclick="clicked('+a+');">Remove</button></div></div>';
                            
                            
                            // now to append them to HTML
                            $friendsUIGrid.append(html);
                            a++;
                        }
                    });
                }
            }
    });
}

function clicked(e){
    // Details can be retrieved using idsOfFriends[e].something 
    console.log(">>"+e);
    console.log("OK "+idsOfFriends[e].id);
    
    $('#rFriendID').text(idsOfFriends[e].id);
    $('#rImageSRC').attr("src", "/images/avatar/"+idsOfFriends[e].username+".jpg");
    $('#rHeaderSRC').text(idsOfFriends[e].firstname+" "+idsOfFriends[e].lastname);
    $('#rDescSRC').text("Are you sure you want to remove "+idsOfFriends[e].firstname+" "+idsOfFriends[e].lastname+" from your friends list?");
    $('#removeFriend').modal('show');
}

$('#rApproveSRC').click(function(){
    var friendID = $('#rFriendID').text();
    var payload={
        PersonID:           userID,
        FriendPersonID:     friendID
    };
    $.ajax({
        url: "/removeFriend",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data) 
            {
                $('#removeFriend').modal('hide');
                if(data.responseText == 'false'){
                    $('#modalText').text("You have already removed that person from your friend's list!");
                    console.log("FRIEND ALREADY REMOVED");
                }else{
                    $('#modalText').text("Friend removed!");
                    console.log("FRIEND REMOVED");
                }
                
                setTimeout(function(){
                    $('#friendInviteSentModal').modal('show');
                    loadFriends();
                },700);  
            }
        
    });
    
})


$('.ui.search').search({
    apiSettings: {
        url: remoteUrl
    },
    fields: {
      results : 'results',
      title   : 'username',
      description: 'firstname',
      url     : 'id'
    },
    minCharacters : 3
});

if(id!=null){
    $('#confirmFriendModal').modal('show');
    
    // Get user details for that ID
    $.getJSON('/retrievePersonDetails/'+id, function (data) {
        username = data[0].username;
        name = data[0].firstname+" "+data[0].lastname;
        console.log("username: " +username);
        console.log("Name: " +name);
        joinedDate = new Date(data[0].createdAt.toString());
        joinedDate = monthNames[joinedDate.getMonth()]+" "+joinedDate.getFullYear();
        console.log("joinedDate: " +joinedDate);
        
        // Append modal stuffs
        $('#imageSRC').attr("src", "/images/avatar/"+username+".jpg");
        $('#nameSRC').text(name);
        $('#dateSRC').text(joinedDate);
    });
}

$('#closeSentModal').click(function(){
    $('#friendInviteSentModal').modal('hide');
});
    
$('#closeModal').click(function(){
    $('#confirmFriendModal').modal('hide');
});

$('#addFriend').click(function(){
    console.log("You are: "+userID+" trying to add "+id);
    var payload={
        PersonID:           userID,
        FriendPersonID:     id,
        Accepted:           0
    };
    
    $.ajax({
        url: "/sendFriendRequest",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data) 
            {
                $('#confirmFriendModal').modal('hide');
                if(data.responseText == 'false'){
                    $('#modalText').text("You have already sent a friends invite!");
                    console.log("FRIEND REQUEST ALREADY SENT");
                }else{
                    $('#modalText').text("Friend request sent!");
                    console.log("FRIEND REQUEST SENT");
                }
                
                setTimeout(function(){
                    $('#friendInviteSentModal').modal('show');
                },700);  
            }
        
    });
    
});





