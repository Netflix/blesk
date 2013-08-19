%define _topdir         @target.dir@
%define name            @name@
%define version         @version@
%define release         @release@
%define summary     blesk
%define buildarch   noarch
%define license     NFLX
%define packager    CloudSolutions
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
Requires: nflx-cloudsol-python-libs >= 1.199, nflx-rd, nflx-python27, nflx-python27-setuptools, nflx-python27-pip, nflx-python27-thrift, nflx-python27-pycassa, nflx-rex >= 1.5

%description
@build.metadata@

%clean
rm -rf $RPM_BUILD_ROOT/*

# %files -f %{filelist}
%files
%defattr(-,root,root)
/

%post
# /usr/bin/pip-2.7 -v install -M -r /apps/blesk/additional/pip.txt

# Add the version
sed -i "s/__APP_VERSION__/%{release}/g" /service/blesk/run

/bin/cp /apps/blesk/additional/iptables /etc/sysconfig
/sbin/chkconfig iptables on

# Turn off tomcat
/sbin/chkconfig --del nflx-tomcat

%postun