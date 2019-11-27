$(document).ready(function(){
    // Load existing tasks from this project
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: " + userID);
    var $memberUIGrid = $('#memberUIGrid');
    var $friendUIGrid = $('#friendUIGrid');
    var url = new URL(window.location.href);
    var taskID = url.searchParams.get("ID");
    console.log("Task ID is: " + taskID);

    function loadMembers(){
        $memberUIGrid.empty();
        $.getJSON('/retrieveMembers/'+taskID, function (data) {
        members = data;
        console.log("Member's length: >>" +members.length);
        for(var i in members){
            console.log("Retrieving members details...");
            $.getJSON('/retrieveMemberDetails/'+members[i].PersonID, function (data2) {
                // Details of a project
                var memberName = data2[0].firstname;
                console.log("Coming in membername... "+memberName);
                // Now display...
                var html = '<div class="ui middle aligned divided list">'+
                           '<div class="item">'+
							             '<div class="right floated content">'+
                           '<div class="ui button">Remove</div></div>'+
                           '<img class="ui avatar image" src="../ASE/pics/usericon.jpg">'+
                           '<div class="content">' +memberName+'</div></div></div>';
                $memberUIGrid.append(html);
            });
        }
     });
    }

  loadMembers();

  function loadFriends(){
    $friendUIGrid.empty();
    $.getJSON('/retrieveFriends/'+userID, function (data) {
    friends = data;
    console.log("Member's length: >>" +friends.length);
    for(var i in friends){
        console.log("Retrieving friends details...");
        $.getJSON('/retrieveFriendDetail/'+friends[i].PersonID, function (data2) {
            // Details of a project
            var friendName = data2[0].firstname;
            var friendID = data2[0].PersonID
            console.log("Coming in friendname... "+friendName);
            // Now display...
            var html = '<div class="ui middle aligned divided list">'+
                       '<div class="item" id="addFriend">'+
                       '<div class="right floated content">'+
                       '<div class="ui button" id="addBtn">Add</div></div>'+
                       '<img class="ui avatar image" src="../images/avatar/'+data2[0].username+'.jpg">'+
                       '<div class="content">' +friendName+'</div>'+
                       '<div class="content" style="display: none;">' +friendID+'</div></div></div>';
            $friendUIGrid.append(html);
        });
      }
    });
  }

  loadFriends();

  //add friend to invitelist
  $('#addBtn').click(function() {
    var friend = document.getElementById("addFriend").friendID;
    console.log("Adding friend... "+ friend );
    var payload = {
        UserID: friend,
        taskID: taskID
    };
    console.log("DEBUG: "+friend+" - "+taskID);
    $.ajax({
        url: "/createInvite",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function(data) {
            console.log("Done!");
            loadStatus();
        }
    });
  });

});
