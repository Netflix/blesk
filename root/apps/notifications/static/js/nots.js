$(document).ready(function() {
        $('.datepicker').datepicker();
        //$(".alert").alert();

        function loadAllNotifications()
        {
          // cleaning table
          $("#allNotsTable").html("<thead><tr><th>ApplicationId</th><th>Type</th><th>Message</th><th>Expire</th><th>Delete</th></tr></thead>");
          $.ajax({
            type: "GET",
            url: "/getAllNotifications",
            dataType: "JSON"
          }).done(function(data){
            console.log(data);
            var rows ="";
            jQuery.each(data, function() {
              rows  += "<tr><td>"+this[1].appId+"</td><td>"+this[1].alertType+"</td><td>"+this[1].message+"</td><td>"+this[1].expire+"</td><td><a href=\"#\" class=\"deleteme\"  id=\""+this[0]+"\">X</span>"+"</td></tr>";              
            });
            $("#allNotsTable").append("<tbody>"+rows+"</tbody>");           
            
            // re-binding
            $(".deleteme").click(function() {
              {
                $.ajax({
                  type: "GET",
                  url: "/removeNotification",
                  data: { key: this.id},
                }).done(function(data){
                  loadAllNotifications();
                });
              }
            });


          });
        }
        
        // initial loading of all notifications
        loadAllNotifications();

        $("#btnStore").click(function() {
          $.ajax({
            type: "GET",
            url: "storeNewNotification",
            data: { alertType: $("#selType").val(), appId: $("#appId").val(), message: $("#txtMessage").val(), expire: $("#txtExpire").val() }
          }).done(function( msg ) {
            loadAllNotifications();
          });
        });

  });