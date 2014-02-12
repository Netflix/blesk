import os
import time
import json
import cgi
import re
import dateutil.parser
import datetime
import uuid

from bottle import abort, request, response
from Service.Bottle import BottleService, get, post, put, delete
from Service import BotoService, Route53Service
from bottle import static_file, route


real_root = os.path.dirname(os.path.realpath(__file__))
print real_root

class Blesk(BottleService, Route53Service):
    """
    lightweight notification Service
    """
    __version__ = '1.1.1'
    def __init__(self, *args, **kwargs):
        self.notifications = [];
        super(Blesk, self).__init__(**kwargs)


    # clean up expired notifications
    def cleanUpNotifications(self):
        now = datetime.datetime.now()
        for i in self.notifications:
            try:
                exp = i[1]['expire']
                d = dateutil.parser.parse(exp)
                if d < now:
                    self.notifications.remove(i)    
            except:
                pass

    # return the homepage
    @get('/')
    def index(self):
        return static_file('index.html', root=real_root+'/templates/')

    @get('/getnotification/<appId>')
    def getnotification(self, appId=''):
        try:
            response.set_header('Access-Control-Allow-Origin','*');
            return json.dumps(self.notifications)
        except Exception as e:
            return "";
        else:
            return "";

    @post('/storeNewNotification')
    def storeNewNotification(self):
        formData = request.forms
        r = re.compile(r"(http://[^ ]+)")
        myNotification = {}
        myNotification['message'] = r.sub(r'<a href="\1">\1</a>', cgi.escape((formData['message'])))
        myNotification['alertType'] = cgi.escape(formData['alertType'])
        myNotification['expire'] = formData['expire']
        myNotification['appId'] = cgi.escape(formData['appId'])
        myNotification['key'] = str(uuid.uuid1())
        self.notifications.append([myNotification['key'],myNotification])
        return json.dumps(self.notifications)
    
    @get('/getAllNotifications/<time>')
    def getAllNotifications(self,time=''):
        self.cleanUpNotifications()
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)


    @get('/getAllNotifications')
    def getAllNotificationsNoTime(self):
        self.cleanUpNotifications()
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)



    @get('/getAllNotificationsCached')
    def getAllNotificationsCached(self,time=''):
        self.cleanUpNotifications()
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)

    @get('/getAllNotificationsCached/<time>')
    def getAllNotificationsCachedTime(self,time=''):
        self.cleanUpNotifications()
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)

    @post('/removeNotification/<key>')
    def removeNotification(self,key=''):
        for i in self.notifications:
            if (str(i[0]) == key):
                self.notifications.remove(i)
        return "ok"

    @get('/healthcheck')
    def healthcheck(self):
        return "ok"


    @get('/api/v1/notifications')
    def api_get_all_notifications(self):
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)


    @put('/api/v1/notifications')
    def api_create_notification(self):
        data = request.body.readline()
        if not data:
            abort(400, 'No data received')
        try:
            not_js = json.loads(data)
            myNotification = {}
            myNotification['message'] = not_js['message']
            myNotification['alertType'] = not_js['alertType']
            myNotification['expire'] = not_js['expire']
            myNotification['appId'] = not_js['appId']
            myNotification['key'] = str(uuid.uuid1())
            self.notifications.append([myNotification['key'],myNotification])
            return json.dumps(self.notifications)        
        except:
            abort(400, 'Wrong notification format')


    @delete('/api/v1/notifications/<id>')
    def api_notification_delete(self,id=""):
        for i in self.notifications:
            if (str(i[0]) == id):
                self.notifications.remove(i)
        return "DELETE Notification " + id        

 
if __name__ == "__main__":
    Blesk.main()
