#! /usr/bin/env python2.7

# $Id: //depot/cloud/rpms/nflx-iris/root/apps/iris/route53.py#2 $
# $Header: //depot/cloud/rpms/nflx-iris/root/apps/iris/route53.py#2 $
# $Date: 2012/02/02 $
# $DateTime: 2012/02/02 00:06:31 $
# $Change: 1257194 $
# $File: //depot/cloud/rpms/nflx-iris/root/apps/iris/route53.py $
# $Revision: #2 $
# $Author: rrapoport $

import logging
import optparse
import socket
import sys

import AKMS
import boto
import boto.utils
import boto.route53.record
import config
import NflxServer

class route53(NflxServer.NflxServer):

    def __init__(self, name, target = None, exclusive = False):
        self.logger = logging.getLogger("route53.py")
        self.exclusive = exclusive
        self.name = name
        ak = AKMS.AKMS("route53.py")
        self.akey, self.skey = ak.keys(attempts = 10, delay = 1.5)
        self.r53 = boto.connect_route53(self.akey, self.skey)
        
        self.target = target
        if not target:
            # Who am i?
            if config.dc == 'amazon':
                self.mddict = boto.utils.get_instance_metadata()
                hostname = self.mddict.get("public-hostname")
            else:
                hostname = socket.getfqdn()
            
            if not hostname:
                raise RuntimeError("Could not figure out my own hostname")
            self.target = hostname 

        

    def getZoneId(self, zoneName):
        if zoneName[-1] != ".":
            zoneName += "."

        zoneById = {}
        zoneByName = {}
        zoneResponse = self.r53.get_all_hosted_zones()
        zones = zoneResponse['ListHostedZonesResponse']['HostedZones']
        for zone in zones:
            id = zone['Id'].replace("/hostedzone/", "")
            name = zone['Name']
            zoneById[id] = name
            zoneByName[name] = id
        zid  = zoneByName.get(zoneName)
        if not zid:
            raise RuntimeError("Could not find a zone ID for %s.  Are you sure Route53 knows about it?" % zoneName)
        return zid
        
    def deregister(self, recordType = "CNAME", zone = None):

        if not zone:
            zone = "%s.netflix.net." % config.env

        if zone[-1] != ".":
            zone += "."

        zoneId = self.getZoneId(zone)
        my_fqdn = "%s.%s" % (self.name, zone)
        changes = boto.route53.record.ResourceRecordSets(self.r53, zoneId)
        change = changes.add_change("DELETE", my_fqdn, recordType, 60)
        change.add_value(self.target)
        changes.commit()


    def register(self, recordType = "CNAME", target = None, zone = None):
        """
        Registers self's name in ENV.netflix.net
        """
    
        if not zone:
            zone = "%s.netflix.net." % config.env

        if zone[-1] != ".":
            zone += "."

        zoneId = self.getZoneId(zone)

        my_fqdn = "%s.%s" % (self.name, zone)
        self.debug("my_fqdn: %s" % my_fqdn)

        if self.exclusive:
            rrsets = self.r53.get_all_rrsets(zoneId, recordType, name = my_fqdn)
            self.debug("rrsets: %s" % rrsets)
            for rrset in rrsets:
                self.debug("rrset: %s" % rrset)
                self.debug("name: %s" % rrset.name)
                if rrset.name != my_fqdn:
                    continue
                for rr in rrset.resource_records:
                    self.debug("rr: %s" % rr)
                    changes = boto.route53.record.ResourceRecordSets(self.r53, zoneId)
                    change = changes.add_change("DELETE", my_fqdn, recordType, 60)
                    change.add_value(rr)
                    x = changes.commit()
                    self.debug(x)

        changes = boto.route53.record.ResourceRecordSets(self.r53, zoneId)
        change = changes.add_change("CREATE", my_fqdn, recordType, 60)
        change.add_value(self.target)
        x = changes.commit()
        self.debug(x)

 
if __name__ == "__main__":
    p = optparse.OptionParser()
    p.add_option("-r", "--register", action="store_true")
    p.add_option("-d", "--deregister", action="store_true")
    p.add_option("-e", "--exclusive", action="store_true")
    p.add_option("--debug", action="store_true")
    p.add_option("-n", "--name")
    p.add_option("-t", "--target")
 
    (options, args) = p.parse_args()

    if not options.name:
        sys.exit(0) # nothing to do here

    logger = logging.getLogger("route53.py")
    handler = logging.StreamHandler(sys.stdout)
    logger.addHandler(handler)
    if options.debug:
        handler.setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)

    r = route53(options.name, options.target, options.exclusive)

    if options.register:
        r.register()
    elif options.deregister:
        r.deregister()
