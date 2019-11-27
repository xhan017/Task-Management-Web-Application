var editStatusBtn = document.getElementById('editStatusBtn');
editStatusBtn.addEventListener("click", function(){
    $('#editStatusModal').modal('show');
});

$('.ui.selection.dropdown')
  .dropdown();

$(document).ready(function() {
    // Load existing projects from this user
    // Get user ID
    var url = new URL(window.location.href);
    var userID = url.searchParams.get("userID");
    console.log("User id is: " + userID);
    var taskID = url.searchParams.get("ID");
    console.log("Task ID is: " + taskID);
    var url1 = new URL(window.location.href);
    var projectID = url1.searchParams.get("projectID");
    console.log("Project id is: " + projectID);

    var $taskName = $('#taskName');
    var $taskDescription = $('#taskDescription');
    var $taskStatus = $('#taskStatus');
    var $taskProgress = $('#progress1').data('value'); //getter for progress bar
    console.log($taskProgress);
    var $taskMember = $('#taskMembers');

    var tasks = [];
    var $taskUIGrid = $('#taskUIGrid');
    loadProgress();

    function loadTaskDetails() {
        console.log("Retrieving task details...");
        $.getJSON('/retrieveTaskDetails/' + taskID, function(data2) {
            // Details of a project
            var taskName = data2[0].taskname.toString();
            var taskDes = data2[0].description.toString();
            var taskStat = data2[0].status.toString();
            var taskProg = data2[0].progress;
            console.log("Coming in projectname... " + taskName);
            console.log("Coming in summary... " + taskDes);
            console.log("Coming in scope... " + taskStat);
            console.log("Coming in progress update..." + taskProg);

            // Now display...
            $taskName.append(taskName);
            $taskDescription.append(taskDes);
            $taskStatus.append(taskStat);
            $('#progress1').data('value', taskProg); //setter for progress bar
        });
    }

    loadTaskDetails();


    //used to update the progress bar when increment button is pressed
    function loadProgress() {
        console.log("Retrieving progress update...");
        $.getJSON('/retrieveTaskDetails/' + taskID, function(data2) {
            var taskProg = data2[0].progress;
            console.log("Coming in progress update..." + taskProg);
            $('#progress1').progress('update progress', taskProg);
            console.log("Done.");
        });
    }

    //used to update the Status
    function loadStatus() {
        console.log("Retrieving status update...");
        $.getJSON('/retrieveTaskDetails/' + taskID, function(data2) {
            var taskStat = data2[0].status;
            console.log("Coming in status update..." + taskStat);
            $taskStatus.append(taskStat);
            console.log("Done.");
        });
    }

    //load the members of this task
    function loadMembers() {
        console.log("Retrieving member...");
        $.getJSON('/retrieveMembers/'+taskID, function (data) {
        members = data;
        console.log("Member's length: >>" +members.length);
        for(var i in members){
            console.log("Retrieving members details...");
            $.getJSON('/retrieveMemberDetails/'+members[i].PersonID, function (data2) {
                // Details of a project
                var memberName = data2[0].firstname;
                var memberName2 = data2[0].lastname;
                console.log("Coming in membername... "+memberName+memberName2);
                // Now display...
                $taskMember.append(memberName+" "+memberName2+"<br>");
            });
        }
     });
    }

    loadMembers();

    $('#progressInc').click(function() {
        console.log("Increasing progress... "+$('#progress1').progress('get value'));
        var payload = {
            progress: $('#progress1').progress('get value'),
            taskID:   taskID
        };
        console.log("DEBUG: "+$('#progress1').progress('get value')+" - "+taskID);
        $.ajax({
            url: "/updateTask",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(payload),
            complete: function(data) {
                console.log("Done!");
                loadProgress();
            }
        });
    });

    $('#progressDec').click(function() {
        console.log("Decreasing progress... "+$('#progress1').progress('get value'));
        var payload = {
            progress: $('#progress1').progress('get value'),
            taskID: taskID
        };
        console.log("DEBUG: "+$('#progress1').progress('get value')+" - "+taskID);
        $.ajax({
            url: "/updateTask",
            type: "POST",
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(payload),
            complete: function(data) {
                console.log("Done!");
                loadProgress();
            }
        });
    });

    $('#saveStatusBtn').click(function() {
      var status = document.getElementById("getStatus");
      console.log("Saving status... "+ status.options[status.selectedIndex].value);
      var payload = {
          status: status.options[status.selectedIndex].value,
          taskID: taskID
      };
      console.log("DEBUG: "+status.options[status.selectedIndex].value+" - "+taskID);
      $.ajax({
          url: "/updateStatus",
          type: "POST",
          contentType: "application/json",
          processData: false,
          data: JSON.stringify(payload),
          complete: function(data) {
              console.log("Done!");
              loadStatus();
          }
      });
       $('#editStatusModal').modal('hide');
     window.location.reload();

    });

    $('#cancelStatusBtn').click(function() {
      $('#editStatusModal').modal('hide');
    });

    $('#manageBtn').click(function() {
      window.location.href="ManageTeamForTask?ID="+taskID+"&userID="+userID+"&projectID="+projectID;
    });

});
