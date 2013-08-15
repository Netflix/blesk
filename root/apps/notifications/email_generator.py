#!/usr/bin/env python2.7

# $Id: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py#36 $
# $Header: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py#36 $
# $Date: 2012/02/07 $
# $DateTime: 2012/02/07 06:43:31 $
# $Change: 1262526 $
# $File: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py $
# $Revision: #36 $
# $Author: rrapoport $

import os

import boto
import AKMS

import Availability.AvailabilityHistory
import Availability.EpicAvailabilityGetter
import Availability.SSQuery
import lib.template


class AvailabilityEmailer(object):
    def __init__(self, environment=None, region=None):

        env = environment or os.getenv("NETFLIX_ENVIRONMENT")
        self.env = env
        region = region or os.getenv("EC2_REGION")

    def get_ah(self):
        if "ah" not in dir(self):
            self.ah = Availability.AvailabilityHistory.AvailabilityHistory(environment=self.env)
        return self.ah

    def get_applications(self):
        ah = self.get_ah()
        if not "cache_applications" in dir(self):
            self.cache_applications = ah.get_applications()
        return self.cache_applications

    def send_email(self):
        akms = AKMS.AKMS("availablility-email-rrapoport")
        self.akey, self.skey = akms.keys()
        report = self.availability()
        print report
        ses = boto.connect_ses(self.akey, self.skey)
        return ses.send_email(source="core@netflix.com", \
                        subject="Availability Report", \
                        body=None, \
                        to_addresses="rrapoport@netflix.com", \
                        cc_addresses=None, \
                        format="html", \
                        html_body=report)

    @lib.template.output("availability.html")
    def availability(self):
        content = {'messages': [], 'warnings': []}
        period_type = "daily"
        applications = self.get_applications()
        applications = [x for x in applications if x.find("monkey") == -1]
        content['report'] = {}
        content['applications'] = []
        content['clusters'] = []
        content['email'] = True
        content['title'] = "Last Week's Service-Level Availability Report"
        content['server'] = "http://availability.%s.netflix.net" % self.env
        content['application_label'] = ""
        content['cluster_label'] = ""
        content['period'] = period_type
        content['cssclass'] = "white"
        content['report'] = self.get_ah().availability_report( \
            periods=7, \
            application=applications, \
            period_type=period_type, \
            verbose=False, \
            order_by_availability=True)
        return lib.template.render(content=content)

if __name__ == "__main__":
    ae = AvailabilityEmailer(environment="prod")
    print ae.send_email()
