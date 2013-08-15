#!/usr/bin/env python2.7
# This module checks for any active Major incidents and creates a notification
# Checks for any existing major incident notification and rewrites it with current list of major incidents
# If there is zero major incidents, it removes major incident notification

import nots
import requests
from xml.dom import minidom
import json
from datetime import date, timedelta
import time



# JIRA Query
# All active Major Alerts
url = "http://jira.netflix.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project+%3D+INC+and+status+%3D+Active+and+Severity+%3D+Major&tempMax=1000"

# Notifications persistency object
cass = nots.Notification()

def getText(nodelist):
    rc = []
    for node in nodelist:
        if node.nodeType == node.TEXT_NODE:
            rc.append(node.data)
    return ''.join(rc)


while 1:
	try:
		message = ""
		r = requests.get(url, auth=('core_user', 'core_pass'))
		xmldoc = minidom.parseString(r.content)
		itemlist = xmldoc.getElementsByTagName('item') 
		for item in itemlist:
			message = message + "Major Prod Alert: <a href=\"http://jira.netflix.com/browse/"+getText(item.getElementsByTagName('key')[0].childNodes)+"\">"+getText(item.getElementsByTagName('title')[0].childNodes)+"</a> "
		if (message):
			notifications = json.loads(cass.getAllAlertsInJson())
			for nt in notifications:
				if ("Major Prod Alert:" in nt[1]['message']) and (nt[1]['appId'] == "all"):
					cass.deleterow(nt[0])
			d=date.today()+timedelta(days=1)
			cass.storeNotification("Alert", "all", message, str(d))
		else:
			# there is no active alert, delete existing ones
			notifications = json.loads(cass.getAllAlertsInJson())
			for nt in notifications:
				if ("Major Prod Alert:" in nt[1]['message']) and (nt[1]['appId'] == "all"):
					cass.deleterow(nt[0])

	except:
		# try it next time
		pass
	time.sleep(60)


