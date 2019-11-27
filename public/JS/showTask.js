$(document).ready(function(){
    // Load existing tasks from this project
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: "+userID);
    var projects = [];
    var $taskUIGrid = $('#taskUIGrid');

    function loadTasks(){
        $taskUIGrid.empty();
        $.getJSON('/retrieveTasks/'+userID, function (data) {
        tasks = data;
        console.log("He2h >>" +tasks.length);
        for(var i in tasks){
            console.log("Retrieving task details...");
            $.getJSON('/retrieveTaskDetails/'+tasks[i].TaskID, function (data2) {
                // Details of a project
                var taskName = data2[0].taskname;
                var taskID = data2[0].taskID;
                var projectID = data2[0].projectID;
                var taskDesc = data2[0].description.toString();
                var taskStartDate = new Date(data2[0].startdate.toString());
                var taskEndDate = new Date(data2[0].enddate.toString());
                console.log("Coming in taskname... "+taskName);
                console.log("Coming in taskID... "+taskID);
                console.log("Coming in description... "+taskDesc);
                console.log("Coming in startdate... "+taskStartDate.toDateString());
                console.log("Coming in enddate... "+taskEndDate);
                // Now display...
                var html = '<div class="four wide stretched column">'+
                                    '<div class="ui card">'+
							             '<div class="content">'+
								            '<a class="header" href="#">'+taskName+'</a>'+
								                '<p>'+taskDesc+'</p>'+
                            '<div class="meta"><a>Start Date: '+
                            taskStartDate.toDateString()+
                            '</a><br><a>End Date: '+
                            taskEndDate.toDateString()+
                            '</a></div></div><div class="extra content"><div class="ui two buttons"><div class="ui buttons"><a class="ui positive button" style="width:130px"  href="TaskDetails?ID='+taskID+'&userID='+userID+'&projectID='+projectID+'"> View Details </a><div class="or"></div><a class="ui negative button"style="width:130px" id="'+taskID+'"> Leave </a></div>			</div></div></div></div></div>'
                ;

                $taskUIGrid.append(html);
            });
    }

    });

    }
  loadTasks();

  //remove user from project
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
    window.location.reload();
  });

});
