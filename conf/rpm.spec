# RPM Spec file for @name@ v.@version@

# $Id: //depot/cloud/rpms/nflx-cloudsol-python-libs/conf/rpm.spec#31 $
# $DateTime: 2011/08/05 12:07:47 $
# $Change: 964942 $

%define _topdir         @target.dir@
%define name            @name@
%define version         @version@
%define release         @release@
%define summary     notifications
%define buildarch   noarch
%define license     NFLX
%define packager    Cloud Solutions
%define vendor      David Pavlik
%define group       NFLX/Application
%define buildroot %{_topdir}/BUILD

Name:      %{name}
Summary:   %{summary}
Version:   %{version}
Release:   %{release}
BuildArch: %{buildarch}
License:   %{license}
Packager:  %{packager}
Vendor:    %{vendor}
Group:     %{group}
AutoReqProv: no
Requires:  nflx-cloudsol-python-libs >= 1.154, nflx-python27, nflx-python27-setuptools, nflx-python27-pip, nflx-python27-thrift, nflx-python27-pycassa

%description
@build.metadata@

%clean
rm -rf $RPM_BUILD_ROOT/*

# %files -f %{filelist}
%files
%defattr(-,root,root)
/

%post
/usr/bin/pip-2.7 -v install -M -r /apps/notifications/additional/pip_requirements.txt
/bin/cp /apps/notifications/additional/notifications /etc/init.d/notifications
/sbin/chkconfig notifications on
/sbin/chkconfig iptables on 
/sbin/chkconfig nflx-tomcat off
%postun
