// wrapping everything into one function - so that nothing is polluting the rest of js code
document.addEventListener('DOMContentLoaded', function () {
    // two functions
    // wrap() main functions that wraps
    // setValue - getValue - functions to store and retrieve notifications text (using localStorage instead of cookies)
    // showNotifications() process the notifcations and place it on the page
    // loadData() load the current notifications
    // addLoadEvent() - programming onload function

    function setValue(key, value) {
        if (window.localStorage) {
            localStorage.setItem(key, value)
        }
    }

    function getValue(key) {
        if (window.localStorage) {
            return localStorage.getItem(key)
        }
        else {
            return null;
        }
    }

    var server = "http://notifications.test.netflix.net";
    var appId = "default";
    var targetElement = document.body;
    if (document.getElementById("nf-notifier-div") != null) {
        targetElement = document.getElementById("nf-notifier-div");
        appId = targetElement.getAttribute("data-appid") || "appId";
        server = targetElement.getAttribute("data-server") || server;
    }

    // adding a wrapper for notification element
    if (targetElement == document.body) {
        //console.log("here");
        var firstAfterBody = document.createElement("div");
        document.body.insertBefore(firstAfterBody, document.body.firstChild);
        targetElement = firstAfterBody;
    }

    var targetElementInnerHtml = targetElement.innerHTML;

    // Create show notification data handler
    var showNotification = function (data) {

        var obj;
        var notText = "";
        var notType = "";

        // storing notification overrider
        // keyword = appId = all
        var globalNotText = "";
        var globalNotType = "";

        //console.log(data);
        for (var i = 0; i < data.length; i++) {
            //console.log(data[i][1].appId);
            if (data[i][1].appId == appId) {
                notText = data[i][1].message + " ";
                notType = data[i][1].alertType;
            }

            if (data[i][1].appId == "all") {
                globalNotText = data[i][1].message + " ";
                globalNotType = data[i][1].alertType;
            }
        }

        if (globalNotText) {
            if (notText) {
                notText = globalNotText + " | <strong>" + notType + ":</strong> " + notText;
                notType = globalNotType;
            }
            else {
                notText = globalNotText;
                notType = globalNotType;
            }
        }

        if (notText.length > 0) {
            var notificationText = document.createElement("div");
            notificationText.id = "notification-div";
            var styleForNotificationType = "";
            notificationText.innerHTML = "<div style=\"float: left; " + styleForNotificationType + "\"><strong>" + notType + ": </strong>" + notText + "</div>";
            notificationText.className = "nf-notifier";
            var close = document.createElement("div");
            close.className = "nf-notifier-close";
            close.innerHTML = "&times;";
            close.id = "nf-notifier-close-element";
            notificationText.appendChild(close);
            if (notText.length > 0) {
                //alert(getValue("blesknotifications"));
                if ((getValue("blesknotifications" + appId) == null) || (notText != getValue("blesknotifications" + appId))) {

                    targetElement.innerHTML = "<div id=\"nf-notifier-element\" class=\"nf-notifier\">" + notificationText.innerHTML + "</div><div style=\"clear:both\"></div>" + targetElementInnerHtml;
                    document.getElementById("nf-notifier-close-element").addEventListener("click", function () {
                        document.getElementById("nf-notifier-element").style.display = "none";
                        setValue("blesknotifications" + appId, notText);
                    });

                }
                else {
                    // closing float
                    targetElement.innerHTML = "<div style=\"clear:both\"></div>" + targetElementInnerHtml;
                }
            }
            else {
                // closing float
                targetElement.innerHTML = "<div style=\"clear:both\"></div>" + targetElementInnerHtml;
            }

        }
        else {
            //console.log("removing");
            obj = document.getElementById("nf-notifier-element");
            if (obj != null) {
                targetElement.removeChild(obj);
            }

        }
        setTimeout(loadData, 10000);
    };

    // Regularly pulling for data
    var loadData = function () {
        var req = new XMLHttpRequest();
        req.open("GET", server + "/getAllNotificationsCached?time=" + Math.random(), true);
        req.onload = function () {
            showNotification(JSON.parse(req.responseText));
        };
        req.send();
    };
    loadData();
});
