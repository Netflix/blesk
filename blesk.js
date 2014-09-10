(function () {

    "use strict";

    var server = "https://YOUR-BLESK-API-SERVER-HERE",
        getNotificationsEndpoint = server + "/api/v1/apps/",
        fetchInterval = 10 * 1000, //how often fetch for notifications
        appId = "default",
        notifications = [],
        processedGUIDsHash = {},
        targetElement;

    // stores key/value in local storage
    function setValue(key, value) {
        if (window.localStorage) {
            localStorage.setItem(key, value);
        }
    }

    // retrieves value given a key from local storage
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
        fetchNotifications(appId);
        fetchNotifications('all');
    }

    function fetchNotifications(applicationId) {

        var req = new XMLHttpRequest(),
            endpoint = getNotificationsEndpoint + encodeURIComponent(applicationId) + "?time=" + new Date().getTime();

        req.open("GET", endpoint, true);
        req.onload = function () {

            showNotification(JSON.parse(req.responseText));

            // 'hidden' feature that stops background pooling of the API (useful when debugging networking issues, etc)
            if (!window.killBlesk && document.URL.indexOf('killBlesk') === -1) {

                // Regularly pulling for data
                setTimeout(function () {
                    fetchNotifications(applicationId);
                }, fetchInterval);

            }

        };

        req.send();
    }

    function createNotification(data) {

        var notification,
            notificationContainer,
            notificationHeader,
            notificationTextNode,
            close;

        notification = {
            message: data.message,
            type: data.notificationType,
            localStorageKey: "blesk:" + data.key
        };

        //creating notification container
        notificationContainer = document.createElement('div');
        notificationContainer.classList.add('blesk-ui-' + notification.type);
        notificationContainer.classList.add('bleskOuter');
        notificationContainer.localStorageKey = notification.localStorageKey;

        //notification type/header
        notificationHeader = document.createElement('strong');
        notificationHeader.textContent = notification.type;
        notificationContainer.appendChild(notificationHeader);

        //adding actual message
        notificationTextNode = document.createElement('span');
        notificationTextNode.textContent = notification.message;
        notificationContainer.appendChild(notificationTextNode);

        //close button
        close = document.createElement('div');
        close.className = 'bleskClose';
        close.innerHTML = '&times;';
        notificationContainer.appendChild(close);

        //exposing required variables
        notification.close = close;
        notification.node = notificationContainer;

        notifications.push(notification);

    }

    function processNotifications(data) {

        var key,
            currentNotification;

        for (key in data) {

            if (data.hasOwnProperty(key)) {

                if (!processedGUIDsHash[key]) {

                    currentNotification = data[key];
                    currentNotification.key = key;
                    createNotification(currentNotification);

                }

                processedGUIDsHash[key] = true;

            }

        }

    }

    function displayRelevantNotifications() {

        var notification;

        while (notifications.length) {

            notification = notifications.shift();

            if (!getValue(notification.localStorageKey)) {

                targetElement.appendChild(notification.node);

                notification.close.addEventListener("click", function () {

                    var container = this.parentNode;

                    setValue(container.localStorageKey, true);

                    container.parentNode.removeChild(container);

                });

            }

        }

    }

    function showNotification(data) {

        processNotifications(data);
        displayRelevantNotifications();

    }

    function setStyle() {

        var style = document.createElement("style"),
            stylesheet;

        // WebKit hack
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.body.appendChild(style);

        stylesheet = style.sheet;

        addCSSRule(stylesheet, ".blesk-ui-alert", "background-color: #f2dede; border-color: #ebccd1; color: #a94442;");
        addCSSRule(stylesheet, ".blesk-ui-info", "background-color: #d9edf7; border-color: #bce8f1; color: #31708f;");
        addCSSRule(stylesheet, ".blesk-ui-tip", "background-color: #dff0d8; border-color: #d6e9c6; color: #3c763d;");

        addCSSRule(stylesheet, ".bleskOuter", "position: relative; border-radius: 4px; border: 1px solid; font-size: 14px; text-shadow: rgba(255, 255, 255, 0.5) 0 1px 0; padding: 10px 0 10px 14px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 10px 0;line-height: normal;");
        addCSSRule(stylesheet, ".bleskOuter strong", "float: left; margin-right: 15px; line-height: 15px");
        addCSSRule(stylesheet, ".bleskOuter span", "display:table-cell; padding-right: 35px;");
        addCSSRule(stylesheet, ".bleskClose", "position: absolute; right: 10px; top: 0; cursor: pointer; font-size: 26px; font-weight: bold;");

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
        server = targetElement.getAttribute("data-endpoint") || server;
    }

    function init() {
        setStyle();
        createTargetElementIfRequired();
        populateVariables();
        loadData();
    }

    init();

}());