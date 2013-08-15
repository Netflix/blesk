# $Id: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/nf_ldap.py#2 $
# $Header: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/nf_ldap.py#2 $
# $Date: 2012/02/02 $
# $DateTime: 2012/02/02 00:06:31 $
# $Change: 1257194 $
# $File: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/nf_ldap.py $
# $Revision: #2 $
# $Author: rrapoport $

"""
python-ldap didn't wan to cooperate, so created own module to do what is needed based on the 
ldap website that already exists.  hacky, but works

This module just acts as a proxy to https://ldap.netflix.com.  If that site ever changes, this
module will break.
"""

import mechanize
import re

LDAP_BASE = 'https://ldap.netflix.com/cgi-bin/ldap/'

def valid(username, password):
    br = mechanize.Browser()
    redirect_to = 'https://ldap.netflix.com/cgi-bin/ldap/ladmin.pl'
    # nafivate to the login form and tell it to go somewhere when it's done
    br.open('https://ldap.netflix.com/cgi-bin/ldap/llogin.pl?returnUrl=%s' % redirect_to)
    
    # select, fill out, and then submit the form
    br.select_form(name="llogin")
    br['XLOGIN'] = username
    br['XPASWD'] = password
    response = br.submit()

    #if the redirect happens as expected, then all was good, otherwise not    
    return response.geturl() == redirect_to

if __name__ == '__main__':
    print valid('apatt','')    
    
