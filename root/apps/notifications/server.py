#!/usr/bin/env python2.7
# $Author: dpavlik $

import argparse
import ConfigParser
import json
import logging
import logging.handlers
import os
import sys

import cherrypy
import config
import Discovery
import lib.template
import NflxServer
import nots
from dateutil.parser import parse
import datetime
import time


def buildConfig(defaults={}, file=None, args={}):
    """
    Generates a configuration dictionary by overloading provided sources.
    Order or precedence: builtin defaults < config_file < command_line_args. file should
    be formatted as an INI.
    If env is not specified on the command line, it will be automagically determined.
    """
    env = args.get('env', config.env)
    cf = defaults[env].copy()

    if file:
        parser = ConfigParser.RawConfigParser()
        parser.read(file)
        rUpdate(cf, dict(parser.items(env)))
    if args:
        rUpdate(cf, args)

    # If dc, or region vars still aren't defined, autodetect and set.
    cf['region'] = cf.get("region", config.region)
    return cf

def rUpdate(targetDict, itemDict):
    for key, val in itemDict.items():
        if type(val) == type({}):
            newTarget = targetDict.setdefault(key,{})
            rUpdate(newTarget, val)
        else:
            targetDict[key] = val

class Server(NflxServer.NflxServer):
    # Configure Server default parameters

    defaults = {
            "test"       : {
                "log.format"            : '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s',
                "log.level"             : "DEBUG",
                "log.file"              : "%s/server.log" % sys.path[0],
                "log.backups"           : 3,
                "log.rotate_units"      : "midnight",
                "log.rotate_interval"   : 1,
                "discovery.name"        : 'notifications',
                "discovery.debug_enabled"       : True,
            },
            "prod"       : {
                "log.format"            : '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s',
                "log.level"             : "INFO",
                "log.file"              : "%s/server.log" % sys.path[0],
                "log.backups"           : 3,
                "log.rotate_units"      : "midnight",
                "log.rotate_interval"   : 1,
                "discovery.name"        : 'notifications',
                "discovery.debug_enabled"       : False,
            }
    }

    def __init__(self, config_file, args, debug = False):
        self.cDict = buildConfig(defaults=Server.defaults, file=args.get("config_file"), args=args)
        self.debug("Configuration Built: %s" % json.dumps(self.cDict, indent=2))
        print  "1 in __init__"

         # Initialize logging
        logger = logging.getLogger(__name__)
        logger.setLevel(self.cDict.get("log.level"))
        fh = logging.handlers.TimedRotatingFileHandler(self.cDict.get("log.file"), when=self.cDict.get("log.rotate_units"),
                                                  interval=self.cDict.get("log.rotate_interval"), backupCount=self.cDict.get("log.rotate_interval"))
        formatter = logging.Formatter(self.cDict.get("log.format"))
        fh.setFormatter(formatter)
        logger.addHandler(fh)
        self.logger = logger
        print  "2 in __init__"

        env = args.get('env', config.env)
        self.env = env
        self.debug("Using environment %s" % env)
        region = self.cDict.get('region')
        print  "3 in __init__"

        self.args = args

        self.debugFlag = debug
        if self.debugFlag:
            self.setDebug()
        # Init Discovery
        print  "4 in __init__"
        logger.info("Starting discovery in environment %s, region %s" % (env, region))
        self.dis = Discovery.Discovery(environment=env, region=region, debug=debug)
        self.dis.setRegistrationVariable("vipAddress", ":80")
        self.dis.setRegistrationVariable("healthCheckUrl", "/healthcheck")
        if not self.args.get('noregistration'):
            self.dis.register(self.cDict.get("discovery.name"))

        # Init Cassandra 
        self.cass = nots.Notification()
        self.memoryNotifications = []

        

    def __del__(self):
        self.dis.deregister(self.cDict.get("discovery.name"))

    @cherrypy.expose
    # template to use for this method
    @lib.template.output('index.html')
    # positional arguments are in url path, and then all form variable come in as
    # key word argumens
    def index(self, message=''):
        # example of template being returned. Pass in whatever parameters the template
        # needs to render.  This works in tandum with the @template.output decorator
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        content = {}
        return self.conditional_render(content)

    @cherrypy.expose
    def getnotification(self, appId):
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        return self.memoryNotifications

    @cherrypy.expose
    def getAllNotifications(self,time=''):
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        return json.dumps(self.memoryNotifications)

    @cherrypy.tools.caching(on=True)
    @cherrypy.tools.caching(delay=60)
    @cherrypy.expose
    def getAllNotificationsCached(self,time=''):
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        return json.dumps(self.memoryNotifications)

    @cherrypy.expose
    def storeNewNotification(self,alertType, appId, message, expire):
        myNotification = {}
        myNotification['message'] = message
        myNotification['alertType'] = alertType
        myNotification['expire'] = expire
        myNotification['appId'] = appId
        myNotification['key'] = str(time.time()+len(message))

        self.memoryNotifications.append([myNotification['key'],myNotification])
        print myNotification
        print self.memoryNotifications
        return "OK"

    @cherrypy.expose
    def removeNotification(self,key):
        for i in self.memoryNotifications:
            if (str(i[0]) == key):
                self.memoryNotifications.remove(i)
        return "OK"



    @cherrypy.expose
    def healthcheck(self, **kw):
        return "ok"

    def conditional_render(self, content, kw = {}):
        
        if 'json' in kw:
            # print "Returning content %d as text/plain" % len(content)
            #cherrypy.response.headers['Content-Type'] = 'text/plain'

            return json.dumps(content, indent = 0)
        else:            
            return lib.template.render(content = content)




def main():


    parser = argparse.ArgumentParser(description='Notification system', argument_default=argparse.SUPPRESS)
    parser.add_argument('-c','--config_file', dest='config_file', help = "File with configuration variables")
    parser.add_argument('-d','--debug', action="store_true", help="Lots of debug info")
    parser.add_argument('-e','--env', help="environment")
    parser.add_argument('-n','--noregistration', action="store_true", help="Do not register in Discovery (helpful in testing)")
    args = vars(parser.parse_args())

    env = args.get("env", config.env)

    # Init CAG object
    root = Server(config_file=args.get("config_file"), args=args, debug = args.get("debug"))

    # Config Cherrypy
    cherrypy.config.update({
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 7101,
        'tools.trailing_slash.on': True,
        'tools.staticdir.root': os.path.abspath(os.path.dirname(__file__)),
    })

    # Start
    cherrypy.quickstart(root, '/', {
        '/media': {
            'tools.session_auth.on': False,
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'static'        
        }
    })

#################
## Start Program
#################

if __name__ == '__main__':
    main()
