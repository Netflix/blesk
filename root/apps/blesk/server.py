import os
import time
import json
import cgi
import re
import dateutil.parser
import datetime

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
        myNotification['key'] = str(time.time()+len(myNotification['message']))
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

 
if __name__ == "__main__":
    Blesk.main()
