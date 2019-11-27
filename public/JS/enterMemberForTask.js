$(document).ready(function(){
    // Load existing tasks from this project
    // Get user ID
    var url = new URL(window.location.href);
    var userID = url.searchParams.get("userID");
    console.log("User id is: " + userID);
    var $memberUIGrid = $('#memberUIGrid');
    var $friendUIGrid = $('#friendUIGrid');
    var url1 = new URL(window.location.href);
    var taskID = url1.searchParams.get("ID");
    console.log("Task ID is: " + taskID);
    var url2 = new URL(window.location.href);
    var projectID = url2.searchParams.get("projectID");
    console.log("Project id is: " + projectID);
    var invitestatus = "invite";

    function loadMembers(){
        $memberUIGrid.empty();
        $.getJSON('/retrieveMembersFromTask/'+taskID, function (data) {
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
    $.getJSON('/retrieveFriendsForTask/'+userID+'/'+taskID, function (data) {
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
                           '<div class="ui button 1" id="'+friendID+'">Add</div></div>'+
                           '<img class="ui avatar image" src="../ASE/pics/usericon.jpg">'+
                           '<div class="content" >' +friendName+'</div></div></div>';
                $friendUIGrid.append(html);
            });
            }
        });
      }

  loadFriends();

  //add friend to invitelist
  $('#friendUIGrid').on('click', '.ui.button.1', function() {
    console.log("Working");
    var friend = this.id;
    console.log("Adding friend... "+ friend );
    var payload = {
        UserID:       friend,
        TaskID:       taskID,
        ProjectID:    projectID,
        InviteStatus: invitestatus
    };
    console.log("DEBUG: "+friend+" - "+taskID);
    $.ajax({
        url: "/createInviteForTask",
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

  //remove member from task
  $('#memberUIGrid').on('click', '.ui.button.2', function() {
    console.log("Working");
    var member = this.id;
    console.log("Removing member... "+ member );
    var payload = {
        UserID:       member,
        ProjectID:    projectID,
        TaskID:       taskID
    };
    console.log("DEBUG: "+member+" - "+taskID);
    $.ajax({
        url: "/removeMemberFromTask",
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
