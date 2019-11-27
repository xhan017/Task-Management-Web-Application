

$(document).ready(function(){
    // Load existing tasks from this project
    // Get user ID
    var url = new URL(window.location.href);
    var userID = url.searchParams.get("userID");
    console.log("User id is: " + userID);
    var $memberUIGrid = $('#memberUIGrid');
    var $friendUIGrid = $('#friendUIGrid');
    var url1 = new URL(window.location.href);
    var projectID = url1.searchParams.get("ID");
    console.log("Project ID is: " + projectID);
    var invitestatus = "invite";

    function loadMembers(){
        $memberUIGrid.empty();
        $.getJSON('/retrieveMembersFromProject/'+projectID, function (data) {
        members = data;
        console.log("Member's length: >>" +members.length);
        for(var i in members){
            console.log("Retrieving members details...");
            if(members[i].PersonID!=userID){
            $.getJSON('/retrieveMemberDetails/'+members[i].PersonID, function (data2) {
                // Details of a project
                var memberName = data2[0].firstname;
                var memberID = data2[0].id;
                console.log("Coming in membername... "+memberName);
                // Now display...
                var html = '<div class="ui middle aligned divided list">'+
                           '<div class="item">'+
							             '<div class="right floated content">'+
                           '<div class="ui button 2" id="'+memberID+'">Remove</div></div>'+
                           '<img class="ui avatar image" src="../ASE/pics/usericon.jpg">'+
                           '<div class="content">' +memberName+'</div></div></div>';
                $memberUIGrid.append(html);
            });
          }
          else{
            $.getJSON('/retrieveMemberDetails/'+members[i].PersonID, function (data2) {
                // Details of a project
                var memberName = data2[0].firstname;
                var memberID = data2[0].id;
                console.log("Coming in membername... "+memberName);
                // Now display...
                var html = '<div class="ui middle aligned divided list">'+
                           '<div class="item">'+
                           '<img class="ui avatar image" src="../ASE/pics/usericon.jpg">'+
                           '<div class="content">' +memberName+'</div></div></div>';
                $memberUIGrid.append(html);
          });
        }
      }
     });
    }

  loadMembers();

  function loadFriends(){
    $friendUIGrid.empty();
    $.getJSON('/retrieveFriendsForProject/'+userID+'/'+projectID, function (data) {
    friends = data;
    console.log("Friends's length: >>" +friends.length);
    for(var i in friends){
            console.log("Retrieving friends details...");
            $.getJSON('/retrieveFriendDetails/'+friends[i].FriendPersonID, function (data2) {
                // Details of a project
                var friendName = data2[0].firstname;
                var friendID = data2[0].id;
                console.log("Coming in friendname... "+friendName);
                console.log("Coming in friendid... "+friendID);
                // Now display...
                var html = '<div class="ui middle aligned divided list">'+
                           '<div class="item" id="addFriend">'+
                           '<div class="right floated content">'+
                           '<div class="ui button" id="'+friendID+'">Add</div></div>'+
                           '<img class="ui avatar image" src="../ASE/pics/usericon.jpg">'+
                           '<div class="content" >' +friendName+'</div></div></div>';
                $friendUIGrid.append(html);
            });
            }
        });
      }

  loadFriends();


  //add friend to invitelist
  $('#friendUIGrid').on('click', '.ui.button', function() {
    console.log("Working");
    var friend = this.id;
    // alert(this.id);
    //return;
    console.log("Adding friend... "+ friend );
    var payload = {
        UserID:       friend,
        ProjectID:    projectID,
        InviteStatus: invitestatus
    };
    console.log("DEBUG: "+friend+" - "+projectID);
    $.ajax({
        url: "/createInviteForProject",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function(data) {
            console.log("Done!");
        }
    });
        $('#inviteModal').modal('show');
  });

  //remove member from project
  $('#memberUIGrid').on('click', '.ui.button.2', function() {
    console.log("Working");
    var member = this.id;
    console.log("Removing member... "+ member );
    var payload = {
        UserID:       member,
        ProjectID:    projectID
    };
    console.log("DEBUG: "+member+" - "+projectID);
    $.ajax({
        url: "/removeMemberFromProject",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function(data) {
            console.log("Done!");
        }
    });
    window.location.reload();
  });

});
