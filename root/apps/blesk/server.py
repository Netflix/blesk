import os
import time
import json

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

    @post('/storeNewNotification/<message>/<alertType>/<expire>/<appId>')
    def storeNewNotification(self,message,alertType,expire,appId):
        myNotification = {}
        myNotification['message'] = message
        myNotification['alertType'] = alertType
        myNotification['expire'] = expire
        myNotification['appId'] = appId
        myNotification['key'] = str(time.time()+len(myNotification['message']))
        self.notifications.append([myNotification['key'],myNotification])
        return json.dumps(self.notifications)
    
    @get('/getAllNotifications/<time>')
    def getAllNotifications(self,time=''):
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)


    @get('/getAllNotifications')
    def getAllNotificationsNoTime(self):
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)



    @get('/getAllNotificationsCached')
    def getAllNotificationsCached(self,time=''):
        response.set_header('Access-Control-Allow-Origin','*');
        return json.dumps(self.notifications)

    @get('/getAllNotificationsCached/<time>')
    def getAllNotificationsCachedTime(self,time=''):
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

    ## Static Routes for static assets (JS, CSS, images)
    @route('<filename:re:.*\.js>')
    def javascripts(filename):
        filename = os.path.basename(filename)
        return static_file(filename, root=os.path.join(real_root,'static/js'))


    @route('<filename:re:.*\.css>')
    def sheets(filename):
        filename = os.path.basename(filename)
        return static_file(filename, root=os.path.join(real_root,'static/css'))


    @route('<filename:re:.*\.(jpg|png|gif|ico)>')
    def images(filename):
        filename = os.path.basename(filename)
        return static_file(filename, root=os.path.join(real_root,'static/img'))        
  
 
if __name__ == "__main__":
    Blesk.main()
