"use strict";
// wrapping everything into one function - so that nothing is polluting the rest of js code
document.addEventListener('DOMContentLoaded', function () {
    // setValue - getValue - functions to store and retrieve notifications text (using localStorage instead of cookies)
    // showNotifications() process the notifcations and place it on the page
    // loadData() load the current notifications
    // addLoadEvent() - programming onload function

    function setValue(key, value) {
        if (window.localStorage) {
            localStorage.setItem(key, value);
        }
    }

    function getValue(key) {
        if (window.localStorage) {
            return localStorage.getItem(key);
        }
        return null;
    }

    var server = "http://blesk",
        appId = "default",
        targetElement,
        firstAfterBody,
        targetElementInnerHtml,
        stylesheet,
        showNotification,
        loadData;

    if (document.getElementById("blesk")) {
        targetElement = document.getElementById("blesk");
        appId = targetElement.getAttribute("data-appid") || "appId";
        server = targetElement.getAttribute("data-server") || server;
    } else {
        firstAfterBody = document.createElement("div");
        document.body.insertBefore(firstAfterBody, document.body.firstChild);
        targetElement = firstAfterBody;
    }

    targetElementInnerHtml = targetElement.innerHTML;

    function addCSSRule(sheet, selector, rules, index) {
        if (sheet.insertRule) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        } else {
            sheet.addRule(selector, rules, index);
        }
    }

    stylesheet = (function() {
        var style = document.createElement("style");

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.body.appendChild(style);

        return style.sheet;
    })();

    addCSSRule(stylesheet, ".bleskOuter", "background-color: #DFF0D8; border-radius: 4px; border: 1px solid #D6E9C6; color: #468847; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 8px 0 8px 14px; text-shadow: rgba(255, 255, 255, 0.498039) 0 1px 0; margin-bottom: 10px;");
    addCSSRule(stylesheet, ".bleskInner", "max-width: 94%; display: inline-block; min-width: 94%; padding-right: 2%;");
    addCSSRule(stylesheet, ".bleskClose", "display: inline-block; right: 20px; vertical-align: top; cursor: pointer; text-align: right; font-size: 26px; font-weight: bold; line-height: 0.6em;");

    // Create show notification data handler
    showNotification = function(data) {

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
            if (data[i][1].appId === appId) {
                notificationText = data[i][1].message + " ";
                notificationType = data[i][1].alertType;
            }

            if (data[i][1].appId === "all") {
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
                if ((!getValue("blesknotifications" + appId)) || (notificationText !== getValue("blesknotifications" + appId))) {

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
            targetElement.innerHTML = "";
        }
        setTimeout(loadData, 10000);
    };

    // Regularly pulling for data
    loadData = function () {
        var req = new XMLHttpRequest();
        req.open("GET", server + "/getAllNotificationsCached?time=" + Math.random(), true);
        req.onload = function () {
            showNotification(JSON.parse(req.responseText));
        };
        req.send();
    };
    loadData();
});
