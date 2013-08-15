import cherrypy

# $Id: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/ajax.py#2 $
# $Header: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/ajax.py#2 $
# $Date: 2012/02/02 $
# $DateTime: 2012/02/02 00:06:31 $
# $Change: 1257194 $
# $File: //depot/cloud/rpms/nflx-iris/root/apps/iris/lib/ajax.py $
# $Revision: #2 $
# $Author: rrapoport $


def is_xhr():
    requested_with = cherrypy.request.headers.get('X-Requested-With')
    return requested_with and requested_with.lower() == 'xmlhttprequest'
