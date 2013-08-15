#! /usr/bin/env python2.7
#	Class for writting and getting values in Cassandra DB for Notifications
#

import Cassandra
import logging

import pycassa.types
import Cassandra
import json

#import smconfig
#import util

class Notification(object):
	cluster = "cass_share"
	keyspace = "CloudSolutions"
	cf_name = "Notifications"

	def __init__(self, environment="Test", debug=True):
		#self.logger = logging.getLogger(self.__class__.__name__)
		#util.setup_logger(self.logger, debug)
		# No need to create the keyspace at this point, given that it already exists
		# self.cass = Cassandra.BaseCassandra(self.cluster)
		# self.cass.create_keyspace(self.keyspace, strategy={'us-east': 3, 'eu-west': 3})
		self.cass = Cassandra.BaseCassandra(self.cluster, self.keyspace)
		self.cass.create_column_family(self.keyspace, [self.cf_name])
		self.cf = self.cass.get_cf(self.cf_name)
		self.batch = self.cf.batch()


	def storeNotification(self, alertType, appId, message, expire):
		val = {}
		val["alertType"] = alertType
		val["appId"] = appId
		val["message"] = message
		val["expire"] = expire
		self.cf.insert(appId+":"+expire,val)

	def getAllAlertsInJson(self):
		return json.dumps(list(self.cf.get_range()))


	def inserter(self, rowkey, columnkey, value):
		self.cf.insert(rowkey, {columnkey: value})

	def getrow(self, key):
		item = self.cfget(self.cf, key)
		return item

	def deleterow(self, key):
		self.cf.remove(key)
		return ""


	def cfget(self, cf, key, *args, **kwargs):
		columns = 1000
		while True:
			try:
				row = cf.get(key, column_count=columns, *args, **kwargs)
				if len(row.keys()) < columns:
					return row
				columns *= 10
			except pycassa.NotFoundException:
				return None