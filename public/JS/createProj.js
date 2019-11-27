var usernameSubmitBtn = document.getElementById('createProj');
usernameSubmitBtn.addEventListener("click", function(){
    $('#createProjModal').modal('show');
});

// For modal
var submitProjectBtn = document.getElementById('submitProjectBtn');
var submitProjectForm = document.getElementById('createProjectForm');


$(document).ready(function(){
    // Load existing projects from this user
    // Get user ID
    var userID = $('#userID').text();
    console.log("User id is: "+userID);
    var projects = [];
    var $projectUIGrid = $('#projectUIGrid');

    function loadProjects(){
        $projectUIGrid.empty();
        $.getJSON('/retrieveProjects/'+userID, function (data) {
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
                var html = '<div class="four wide stretched column">'+
					           '<div class="ui segment">'+
                                    '<div class="ui basic card">'+
							             '<div class="content">'+
								            '<a class="header" href="#">'+projName+'</a>'+
								                '<p>'+projSum+'</p>'+
                                                    '<div class="meta"><a>Start Date: '+projStartDate.toDateString()+'</a><br><a>End Date: '+projEndDate.toDateString() +'</a></div></div><div class="extra content"><div class="ui two buttons"><div class="ui buttons"><a class="ui positive button" style="width:100px" href="ProjectDB?ID='+ProjectID+'"> Enter </a>					<div class="or"></div><a class="ui negative button" style="width:100px"  id="'+ProjectID+'"> Leave </a></div>			</div></div></div></div></div>'
                ;

                $projectUIGrid.append(html);
            });
    }

    });

    }

    loadProjects();

   $('#submitProjectBtn').click(function(){
        console.log(">>>>>>>>>>>LDRPERSONID: "+userID);
       var payload={
            projectname:    $('#projText').val(),
           summary:         $('#projSumText').val(),
           scopetext:       $('#projScopeText').val(),
           startdate:       $('#projStartDate').val(),
           enddate:         $('#projEndDate').val(),
           ldrpersonid:     userID
       };
       console.log(">>>>>>>>>>>LDRPERSONID: "+$('#userID').val());
        $.ajax({
        url: "/createProject",
        type: "POST",
        contentType: "application/json",
        processData: false,
        data: JSON.stringify(payload),
        complete: function (data)
            {
                $('#createProjModal').modal('hide');
                setTimeout(function(){
                    $('#createdProjModal').modal('show');
                },700);
                console.log("Done!");
                loadProjects();
            }
        });
   });

   //remove user from project
   $('#projectUIGrid').on('click', '.ui.negative.button', function() {
     console.log("Working");
     var project = this.id;
     console.log("Removing member... "+ userID );
     var payload = {
         UserID:       userID,
         ProjectID:    project
     };
     console.log("DEBUG: "+userID+" - "+project);
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
