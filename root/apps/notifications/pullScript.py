#!/usr/bin/env python2.7

# $Id: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py#36 $
# $Header: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py#36 $
# $Date: 2012/02/07 $
# $DateTime: 2012/02/07 06:43:31 $
# $Change: 1262526 $
# $File: //depot/cloud/rpms/nflx-iris/root/apps/iris/server.py $
# $Revision: #36 $
# $Author: rrapoport $


import nots


def main():
    c = nots.Notification();
    print c.getAllAlertsInJson()

#################
## Start Program
#################

if __name__ == '__main__':
    main()
