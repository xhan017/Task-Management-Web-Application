var usernameSubmitBtn = document.getElementById('createTask');
usernameSubmitBtn.addEventListener("click", function(){
    $('#createTaskModal').modal('show');
});


// For modal
var submitTaskBtn = document.getElementById('submitTaskBtn');
var submitTaskForm = document.getElementById('createTaskForm');

$(document).ready(function() {
    // Load existing projects from this user
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: " + userID);
    var url = new URL(window.location.href);
    var projectID = url.searchParams.get("ID");
    console.log("Project ID is: " + projectID);
    var status = "In Progress";

    var $projectName = $('#projectName');
    var $projectSummary = $('#projectSummary');
    var $projectScope = $('#projectScope');
    var $projectProgress = $('#progress1').data('value'); //getter for progress bar
    console.log($projectProgress);
    var $projectMembers = $('#projectMembers');

    var tasks = [];
    var $taskUIGrid = $('#taskUIGrid');
    loadProgress();

    function loadProjectDetails() {
        console.log("Retrieving project details...");
        $.getJSON('/retrieveProjectDetails/' + projectID, function(data2) {
            // Details of a project
            var projName = data2[0].projectname.toString();
            var projSum = data2[0].summary.toString();
            var projScope = data2[0].scopeText.toString();
            var projProg = data2[0].progress;
            console.log("Coming in projectname... " + projName);
            console.log("Coming in summary... " + projSum);
            console.log("Coming in scope... " + projScope);
            console.log("Coming in progress update..." + projProg);

            // Now display...
            $projectName.append(projName);
            $projectSummary.append(projSum);
            $projectScope.append(projScope);
            $('#progress1').data('value', projProg); //setter for progress bar
        });
    }

    loadProjectDetails();

    function loadTasks(){
        $taskUIGrid.empty();
        $.getJSON('/retrieveTasksForProject/'+projectID, function (data) {
        tasks = data;
        console.log("Task length: >>" +tasks.length);
        for(var i in tasks){
            console.log("Retrieving task details...");
            $.getJSON('/retrieveTaskDetails/'+tasks[i].TaskID, function (data2) {
                // Details of a project
                var taskName = data2[0].taskname;
                var taskID = data2[0].taskID;
                var taskDesc = data2[0].description.toString();
                var taskStartDate = new Date(data2[0].startdate.toString());
                var taskEndDate = new Date(data2[0].enddate.toString());
                console.log("Coming in taskname... "+taskName);
                console.log("Coming in ProjectID... "+taskID);
                console.log("Coming in description... "+taskDesc);
                console.log("Coming in startdate... "+taskStartDate.toDateString());
                console.log("Coming in enddate... "+taskEndDate);
                // Now display...
                var html = '<div class="four wide stretched column">'+
					           '<div class="ui segment">'+
                                    '<div class="ui basic card">'+
							             '<div class="content">'+
								            '<a class="header" href="#">'+taskName+'</a>'+
								                '<p>'+taskDesc+'</p>'+
                                                    '<div class="meta"><a>Start Date: '+taskStartDate.toDateString()+'</a><br><a>End Date: '+taskEndDate.toDateString() +'</a></div></div><div class="extra content"><div class="ui two buttons"><div class="ui buttons"><a class="ui positive button" style="width:100px" href="TaskDetails?ID='+taskID+'&userID='+userID+'&projectID='+projectID+'"> View Details </a><div class="or"></div><a class="ui negative button" style="width:100px" id="'+taskID+'"> Leave </a></div>			</div></div></div></div></div>'
                ;

                $taskUIGrid.append(html);
            });
    }

    });

    }

    loadTasks();

    //used to update the progress bar when increment button is pressed
    function loadProgress() {
        console.log("Retrieving progress update...");
        $.getJSON('/retrieveProjectDetails/' + projectID, function(data2) {
            var projProg = data2[0].progress;
            console.log("Coming in progress update..." + projProg);
            $('#progress1').progress('update progress', projProg);
            console.log("Done.");
        });
    }

    //load the members of this project
    function loadMembers() {
        console.log("Retrieving member...");
        $.getJSON('/retrieveMembersFromProject/'+projectID, function (data) {
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
                $projectMembers.append(memberName+" "+memberName2+"<br>");
            });
        }
     });
    }

    loadMembers();

    $('#progressInc').click(function() {
        console.log("Increasing progress... "+$('#progress1').progress('get value'));
        var payload = {
            progress: $('#progress1').progress('get value'),
            projectid: projectID
        };
        console.log("DEBUG: "+$('#progress1').progress('get value')+" - "+projectID);
        $.ajax({
            url: "/updateProject",
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
            projectid: projectID
        };
        console.log("DEBUG: "+$('#progress1').progress('get value')+" - "+projectID);
        $.ajax({
            url: "/updateProject",
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

    $('#submitTaskBtn').click(function(){
         console.log(">>>>>>>>>>>LDRPERSONID: "+userID);
        var payload={
            projectID:       projectID,
            taskname:        $('#taskText').val(),
            description:     $('#taskDesText').val(),
            startdate:       $('#taskStartDate').val(),
            enddate:         $('#taskEndDate').val(),
            status:          status,
            assignpersonid:  userID
        };
        console.log(">>>>>>>>>>>LDRPERSONID: "+$('#userID').val());
         $.ajax({
         url: "/createTask",
         type: "POST",
         contentType: "application/json",
         processData: false,
         data: JSON.stringify(payload),
         complete: function (data)
             {
                 $('#createTaskModal').modal('hide');
                 setTimeout(function(){
                     $('#createdTaskModal').modal('show');
                 },700);
                 console.log("Done!");
                 loadTasks();
             }
         });
    });


    //remove user from task
    $('#taskUIGrid').on('click', '.ui.negative.button', function() {
      console.log("Working");
      var task = this.id;
      console.log("Removing member... "+ userID );
      var payload = {
          UserID:       userID,
          TaskID:       task
      };
      console.log("DEBUG: "+userID+" - "+task);
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
      //window.location.reload();
    });

    $('#manageBtn').click(function() {
      window.location.href="ManageTeamForProject?ID="+projectID+"&userID="+userID;
    });
});
