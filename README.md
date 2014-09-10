Netflix blesk
=====

Netflix blesk is a lightweight client for pushing notifications to web based applications/sites.

Here is a sample request for a sample app called 'myApp'
Sample request endpoint:
```text
https://bleskServer/api/v1/app/myApp
```

Sample response Payload (where 123456789 is a unique/random/GUID string)
```JSON
{
   "myApp_123456789":{
      "appId":"myApp",
      "notificationType":"info",
      "message":"This is a test notification for myApp",
      "expire":1412103600000,
      "start":1407265200000
   }
}
```

