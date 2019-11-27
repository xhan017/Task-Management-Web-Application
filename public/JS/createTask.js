var usernameSubmitBtn = document.getElementById('createTask');
usernameSubmitBtn.addEventListener("click", function(){
    $('#createTaskModal').modal('show');
});

// For modal
var submitTaskBtn = document.getElementById('submitTaskBtn');
var submitTaskForm = document.getElementById('createTaskForm');


$(document).ready(function(){
    // Load existing projects from this user
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: "+userID);
    var tasks = [];
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
                                                    '<div class="meta"><a>Start Date: '+taskStartDate.toDateString()+'</a><br><a>End Date: '+taskEndDate.toDateString() +'</a></div></div><div class="extra content"><div class="ui two buttons"><div class="ui buttons"><a class="ui positive button" style="width:100px" > Manage Task </a>					<div class="or"></div><a class="ui negative button"style="width:100px"  > Manage Team </a></div>			</div></div></div></div></div>'
                ;

                $taskUIGrid.append(html);
            });
    }

    });

    }

    loadTasks();

   $('#submitTaskBtn').click(function(){
        console.log(">>>>>>>>>>>LDRPERSONID: "+userID);
       var payload={
           taskname:        $('#taskText').val(),
           description:     $('#taskDesText').val(),
           startdate:       $('#taskStartDate').val(),
           enddate:         $('#taskEndDate').val(),
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
});
