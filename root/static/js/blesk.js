"use strict";

// wrapping everything into one function - so that nothing is polluting the rest of js code
(function () {

    var server = "http://blesk",
        appId = "default",
        notifications = [],
        processedGUIDsHash = {},
        targetElement,
        targetElementInnerHtml;

    // stores key/value in local storage
    function setValue(key, value) {
        if (window.localStorage) {
            localStorage.setItem(key, value);
        }
    }

    // retrives value given a key from local storage
    function getValue(key) {
        if (window.localStorage) {
            return localStorage.getItem(key);
        }
        return null;
    }

    function addCSSRule(sheet, selector, rules, index) {
        if (sheet.insertRule) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        } else {
            sheet.addRule(selector, rules, index);
        }
    }

    // fetches current notifications
    function loadData() {
        var req = new XMLHttpRequest();
        req.open("GET", server + "/getAllNotificationsCached?time=" + Math.random(), true);
        req.onload = function () {
            showNotification(JSON.parse(req.responseText));
        };
        req.send();
    }

    function createNotification(data) {

        var notification,
            notificationTextContainer,
            close;

        notification = {
            message: data.message,
            type: data.alertType,
            localStorageKey: "blesk:" + data.key
        };

        //creating DOM/Node
        notificationTextContainer = document.createElement("div");
        notificationTextContainer.id = "notification-div";
        notificationTextContainer.innerHTML = "<div class=\"bleskInner\"><strong>" + notification.type + ": </strong>" + notification.message + "</div>";
        notificationTextContainer.className = "bleskInner";
        close = document.createElement("div");
        close.className = "bleskClose";
        close.innerHTML = "&times;";
        notificationTextContainer.appendChild(close);

        notification.close = close;
        notification.node = notificationTextContainer;

        notifications.push(notification);

    }

    function processNotifications(data) {

        var currentNotice;

        data.forEach(function (noticeJSON) {

            currentNotice = noticeJSON[1];

            if (!processedGUIDsHash[currentNotice.key] && //if GUID has not been already processed
                (currentNotice.appId === appId || currentNotice.appId === "all")) { //if notification is relevant for current app
                createNotification(currentNotice);
            }

            processedGUIDsHash[currentNotice.key] = true;
        });

    }

    function displayRelevantNotifications() {

        var localStorageKey,
            notificationContainer,
            notification;

        while (notifications.length) {

            notification = notifications.shift();

            localStorageKey = notification.localStorageKey;

            if (!getValue(localStorageKey)) {

                notificationContainer = document.createElement('div');
                notificationContainer.localStorageKey = localStorageKey;
                notificationContainer.classList.add('bleskOuter');
                notificationContainer.appendChild(notification.node);
                targetElement.appendChild(notificationContainer);

                notification.close.addEventListener("click", function () {

                    var container = this.parentNode.parentNode;

                    setValue(container.localStorageKey, true);

                    container.parentNode.removeChild(container);

                });

            }

        }

        // closing float
        targetElement.insertAdjacentHTML('beforeend', "<div style=\"clear:both\"></div>" + targetElementInnerHtml);

    }

    function showNotification(data) {

        processNotifications(data);
        displayRelevantNotifications();

        // Regularly pulling for data
        setTimeout(loadData, 10000);

    }

    function setStyle() {

        var style = document.createElement("style"),
            stylesheet;

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.body.appendChild(style);

        stylesheet = style.sheet;

        addCSSRule(stylesheet, ".bleskOuter", "background-color: #DFF0D8; border-radius: 4px; border: 1px solid #D6E9C6; color: #468847; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; padding: 8px 0 8px 14px; text-shadow: rgba(255, 255, 255, 0.498039) 0 1px 0; margin-bottom: 10px;");
        addCSSRule(stylesheet, ".bleskInner", "max-width: 94%; display: inline-block; min-width: 94%; padding-right: 2%;");
        addCSSRule(stylesheet, ".bleskClose", "display: inline-block; right: 20px; vertical-align: top; cursor: pointer; text-align: right; font-size: 26px; font-weight: bold; line-height: 0.6em;");

    }

    function createTargetElementIfRequired() {

        var firstAfterBody;

        targetElement = document.getElementById("blesk");

        if (!targetElement) {
            firstAfterBody = document.createElement("div");
            document.body.insertBefore(firstAfterBody, document.body.firstChild);
            targetElement = firstAfterBody;
        }

    }

    function populateVariables() {
        appId = targetElement.getAttribute("data-appid") || "appId";
        server = targetElement.getAttribute("data-server") || server;
        targetElementInnerHtml = targetElement.innerHTML;
    }

    function init() {
        setStyle();
        createTargetElementIfRequired();
        populateVariables();
        loadData();
    }

    init();

}());