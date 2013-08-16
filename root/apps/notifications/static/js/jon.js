// wrapping everything into one function - so that nothing is polluting the rest of js code
document.addEventListener('DOMContentLoaded', function () {
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
        } else {
            return null;
        }
    }

    var server = "http://notifications.test.netflix.net";
    var appId = "default";
    var targetElement = document.body;
    if (document.getElementById("blesk") != null) {
        targetElement = document.getElementById("blesk");
        appId = targetElement.getAttribute("data-appid") || "appId";
        server = targetElement.getAttribute("data-server") || server;
    }

    // adding a wrapper for notification element
    if (targetElement == document.body) {
        var firstAfterBody = document.createElement("div");
        document.body.insertBefore(firstAfterBody, document.body.firstChild);
        targetElement = firstAfterBody;
    }

    var targetElementInnerHtml = targetElement.innerHTML;

    // Create show notification data handler
    var showNotification = function(data) {

        var obj,
            notificationText = "",
            notificationType = "",
            globalNotificationText = "",
            globalNotificationType = "",
            i,
            notificationTextContainer,
            close;

        //console.log(data);
        for (i = 0; i < data.length; i++) {
            //console.log(data[i][1].appId);
            if (data[i][1].appId == appId) {
                notificationText = data[i][1].message + " ";
                notificationType = data[i][1].alertType;
            }

            if (data[i][1].appId == "all") {
                globalNotificationText = data[i][1].message + " ";
                globalNotificationType = data[i][1].alertType;
            }
        }

        if (globalNotificationText) {
            if (notificationText) {
                notificationText = globalNotificationText + " | <strong>" + notificationType + ":</strong> " + notificationText;
            } else {
                notificationText = globalNotificationText;
            }
            notificationType = globalNotificationType;
        }

        if (notificationText.length > 0) {
            notificationTextContainer = document.createElement("div");
            notificationTextContainer.id = "notification-div";
            notificationTextContainer.innerHTML = "<div class=\"bleskInner\"><strong>" + notificationType + ": </strong>" + notificationText + "</div>";
            notificationTextContainer.className = "bleskInner";
            close = document.createElement("div");
            close.className = "bleskClose";
            close.innerHTML = "&times;";
            close.id = "bleskClose";
            notificationTextContainer.appendChild(close);
            if (notificationText.length > 0) {
                //alert(getValue("blesknotifications"));
                if ((getValue("blesknotifications" + appId) == null) || (notificationText != getValue("blesknotifications" + appId))) {

                    targetElement.innerHTML = "<div id=\"bleskOuter\" class=\"bleskOuter\">" + notificationTextContainer.innerHTML + "</div><div style=\"clear:both\"></div>" + targetElementInnerHtml;
                    document.getElementById("bleskClose").addEventListener("click", function () {
                        document.getElementById("blesk").style.display = "none";
                        setValue("blesknotifications" + appId, notificationText);
                    });

                } else {
                    // closing float
                    targetElement.innerHTML = "<div style=\"clear:both\"></div>" + targetElementInnerHtml;
                }
            } else {
                // closing float
                targetElement.innerHTML = "<div style=\"clear:both\"></div>" + targetElementInnerHtml;
            }

        } else {
            //console.log("removing");
            obj = document.getElementById("blesk");
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
