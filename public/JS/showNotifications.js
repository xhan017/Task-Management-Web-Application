$(document).ready(function(){
    // Load invited project & tasks from this project
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: "+userID);
    var url1 = new URL(window.location.href);
    var projectID = url1.searchParams.get("ID");
    var projects = [];
    var $projectInvite = $('#projectInvite');
	var tasks =[];
	var $taskInvite = $('#taskInvite');

    function loadProjectinvite(){
        $projectInvite.empty();
        $.getJSON('/retrieveProjectInvites/'+userID , function (data) {
        projects = data;
        console.log("He2h >>" +projects.length);
        for(var i in projects){
            console.log("Retrieving project details...");
            $.getJSON('/retrieveProjectDetails/'+projects[i].ProjectID, function (data2) {
                // Details of a project
                var projName = data2[0].projectname;
                var ProjectID = data2[0].ProjectID;
                var projSum = data2[0].summary.toString();
                var projStartDate = new Date(data2[0].startdate.toString());
                var projEndDate = new Date(data2[0].enddate.toString());
                console.log("Coming in projectname... "+projName);
                console.log("Coming in summary... "+projSum);
                console.log("Coming in startdate... "+projStartDate.toDateString());
                console.log("Coming in enddate... "+projEndDate);
                console.log("Coming in ProjectID... "+ProjectID);
                // Now display...
                var html ='<div class="card">'+
							'<div class="content">'+
								 '<div class="header">'+projName+
									'<div class="content">'+projSum+
										'<div class="ui small feed">'+
											'<div class="event">'+
												'<div class="content">'+
													'<div class="summary">'+
														'<p>'+projSum+'</p>'+
															'<div class="meta"><a> Start Date: '+
																projStartDate.toDateString()+'</a><br><a>End Date: '+projEndDate.toDateString() +
																'</a></div></div><div class="extra content"><div class="ui two buttons"><div class="ui basic green button" id="'+ProjectID+'">Join</div><div class="ui basic red button" id="'+ProjectID+'">Reject</div></div></div></div></div></div></div>'
                ;

                $projectInvite.append(html);
            });
    }
    });
    }
loadProjectinvite();

//join project_invite
  $('#projectInvite').on('click', '.ui.basic.green.button', function() {
    console.log("Working");
    var pid = this.id;
    console.log("Join project... "+ pid );
    var payload = {
        UserID:       userID,
        ProjectID:    pid
    };
    console.log("DEBUG: "+userID+" - "+pid);
    $.ajax({
        url: "/joinFromProjectInvite",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function(result) {
            console.log("Done! joining");
			$.ajax({
				url: "/removeFromProjectInvite",
				type: "POST",
				contentType: "application/json",
				processData: false,
				data: JSON.stringify(payload),
				complete: function(data) {
					console.log("Done remove!");
				}
			});

    window.location.reload();
        }
    });
  });

  //remove project_invite
  $('#projectInvite').on('click', '.ui.basic.red.button', function() {
    console.log("Working");
    var pid = this.id;
    console.log("Removing project invite... "+ pid );
    var payload = {
        UserID:       userID,
        ProjectID:    pid
    };
    console.log("DEBUG: "+userID+" - "+pid);
    $.ajax({
        url: "/removeFromProjectInvite",
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


	function loadTaskinvite(){
        $taskInvite.empty();
        $.getJSON('/retrieveTaskInvites/'+userID, function (data3) {
        tasks = data3;
        console.log("He2h >>" +tasks.length);
        for(var i in tasks){
            console.log("Retrieving task details...");
            $.getJSON('/retrieveTaskDetails/'+tasks[i].TaskID, function (data4) {
                // Details of a task
                var taskN = data4[0].taskname;
				var taskID = data4[0].taskID;
                var taskDesc = data4[0].description.toString();
                var taskStartDate = new Date(data4[0].startdate.toString());
                var taskEndDate = new Date(data4[0].enddate.toString());
                console.log("Coming in taskN... "+taskN);
                console.log("Coming in taskID... "+taskID);
                console.log("Coming in taskDesc... "+taskDesc);
                console.log("Coming in startdate... "+taskStartDate.toDateString());
                console.log("Coming in enddate... "+taskEndDate);
                // Now display...
                var html = '<div class="card">'+
                                    '<div class="content">'+
							             '<div class="header">'+taskN+
								                '<div class="ui small feed">'+
													'<div class="event">'+
														'<div class="content">'+
															'<div class="summary">'+
																'<p>'+taskDesc+'</p>'+
																	'<div class="meta"><a> Start Date: '+
																		taskStartDate.toDateString()+'</a><br><a>End Date: '+taskEndDate.toDateString() +
																		'</a></div></div><div class="extra content"><div class="ui two buttons"><div id="'+taskID+'" class="ui basic green button">Join</div><div id="'+taskID+'" class="ui basic red button">Reject</div></div></div></div></div></div></div>'
                ;

                $taskInvite.append(html);
            });
    }
    });
    }

loadTaskinvite();

//join task_invite
  $('#taskInvite').on('click', '.ui.basic.green.button', function() {
    console.log("Working");
    var tid = this.id;
    console.log("Join task invite... "+ tid );
    var payload = {
        UserID:       userID,
		TaskID : 		tid
    };
    console.log("DEBUG: "+userID+" - "+tid);
    $.ajax({
        url: "/joinTaskInvite",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function(result) {
            console.log("Done! joining");
			$.ajax({
				url: "/removeTaskInvite",
				type: "POST",
				contentType: "application/json",
				processData: false,
				data: JSON.stringify(payload),
				complete: function(data) {
					console.log("Done remove!");
				}
			});

    window.location.reload();
        }
    });
  });

  //remove task_invite
  $('#taskInvite').on('click', '.ui.basic.red.button', function() {
    console.log("Working");
    var tid = this.id;
    console.log("Removing task invite... "+ tid );
    var payload = {
        UserID:       userID,
		TaskID : tid
    };
    console.log("DEBUG: "+userID+" - "+tid);
    $.ajax({
        url: "/removeTaskInvite",
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
