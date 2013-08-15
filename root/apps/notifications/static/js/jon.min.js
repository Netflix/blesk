

// wrapping everything into one function - so that nothing is polluting the rest of js code
document.addEventListener('DOMContentLoaded',function(){
    (function ()
    {
    // two functions
    // wrap() main functions that wraps
    // setCookie - getCookier - functions to store and retrieve nots text (using localStorage instead of cookies)
    // showNotifications() process the notifcations and place it on the page
    // loadData() load the current notifications
    // addLoadEvent() - programming onload function



    function setCookie(c_name,value,exdays)
    {
       if(typeof(Storage)!=="undefined")
       {
         Storage.prototype.setObject = function(key, lvalue) {
             this.setItem(key, lvalue);
         }
         localStorage.setObject(c_name,value)
     }
     else
     {
        return null;
    }
}

function getCookie(c_name)
{
  if(typeof(Storage)!=="undefined")
  {
    Storage.prototype.getObject = function(key) {
        var value = this.getItem(key);
        return value;
    }
    return localStorage.getObject(c_name)
}
else
{
    console.log("undefined")
    return null;
}
return null;
}


        // defining global variable
        var nf_notification_app_id = "";
        var nf_notification_element_obj = document.body;
        if (document.getElementById("nf-notifier-div") != null)
        {
            nf_notification_element_obj = document.getElementById("nf-notifier-div");
            nf_notification_app_id = nf_notification_element_obj.getAttribute("data-appid");
            if (nf_notification_app_id == null)
            {
                nf_notification_app_id = "default";
            }        
        }


        // adding a wrapper for notification element
        if (nf_notification_element_obj == document.body)
        {
            //console.log("here");
            var firstAfterBody = document.createElement("div");
            document.body.insertBefore(firstAfterBody, document.body.firstChild);
            nf_notification_element_obj = firstAfterBody;
        }

        var nf_notification_element_obj_html = nf_notification_element_obj.innerHTML;

        // Create show notification data handler
        var showNotification = function(data) {

            var notText = "";
            var notType = "";

            // storing notification overrider
            // keyword = appId = all
            var globalNotText = "";
            var globalNotType = "";


            //console.log(data);
            for (var i = 0; i< data.length; i++)
            {
                //console.log(data[i][1].appId);
                if (data[i][1].appId == nf_notification_app_id)
                {
                    notText = data[i][1].message + " ";
                    notType = data[i][1].alertType;
                }

                if (data[i][1].appId == "all")
                {
                    globalNotText = data[i][1].message + " ";
                    globalNotType = data[i][1].alertType;                    
                }
            }

            if (globalNotText)
            {
                if (notText)
                {
                    notText = globalNotText + " | <strong>" +notType+":</strong> " + notText;
                    notType = globalNotType;
                }
                else
                {
                    notText = globalNotText;
                    notType = globalNotType;
                }
            }


            if (notText.length > 0)
            {
                var notificationText = document.createElement("div");
                notificationText.id = "notification-div";
                var styleForNotificationType = "";
                notificationText.innerHTML = "<div style=\"float: left; "+styleForNotificationType+"\"><strong>"+notType+": </strong>"+notText+"</div>";
                notificationText.className = "nf-notifier";
                var close = document.createElement("div");
                close.className = "nf-notifier-close";
                close.innerHTML = "&times;";
                close.id = "nf-notifier-close-element";
                notificationText.appendChild(close);
                if (notText.length > 0)
                {
                    //alert(getCookie("notificationscookie"));
                    if ((getCookie("notificationscookie"+nf_notification_app_id) == null)||(notText != getCookie("notificationscookie"+nf_notification_app_id)))
                    {

                        nf_notification_element_obj.innerHTML = "<div id=\"nf-notifier-element\" class=\"nf-notifier\">"+notificationText.innerHTML+"</div><div style=\"clear:both\"></div>"+nf_notification_element_obj_html;
                        document.getElementById("nf-notifier-close-element").addEventListener("click", function() {
                            document.getElementById("nf-notifier-element").style.display = "none";
                            setCookie("notificationscookie"+nf_notification_app_id,notText,7);
                        });
                        
                    }
                    else
                    {
                        // closing float
                        nf_notification_element_obj.innerHTML = "<div style=\"clear:both\"></div>"+nf_notification_element_obj_html;
                    }
                }
                else
                {
                   // closing float
                   nf_notification_element_obj.innerHTML = "<div style=\"clear:both\"></div>"+nf_notification_element_obj_html;
               }

           }
           else
           {
                //console.log("removing");
                obj = document.getElementById("nf-notifier-element");
                if (obj != null)
                {
                    nf_notification_element_obj.removeChild(obj);
                }

            }
            setTimeout(function(){loadData()},10000);
        };



        // Regularly pulling for data
        var loadData = function(){
            var req = new XMLHttpRequest();
            req.open("GET", "http://notifications.test.netflix.net/getAllNotificationsCached?time="+Math.random(), true);
            req.onload = function() {
                showNotification(JSON.parse(req.responseText));
            };
            req.send();

        }


    // function to invoke notification js on onload
    // also making sure no current onload functions are overriden 
    function addLoadEvent(func) {
        var oldonload = window.onload;
        if (typeof window.onload != 'function') {
          window.onload = func;
      } else {
          window.onload = function() {
            if (oldonload) {
              oldonload();
          }
          func();
      }
  }
}

addLoadEvent(loadData);

})();
});