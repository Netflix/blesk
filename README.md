Netflix blesk
=====

Netflix blesk is a lightweight client for pushing notifications to web based applications/sites.

Sample request endpoint:
```HTTP
https://bleskServer/api/v1/app/<your-app-id-here>
```

Sample response Payload
```JSON
{
   "blesk_522835015":{
      "appId":"myApp",
      "notificationType":"info",
      "message":"This is a test notification for myApp",
      "expire":1412103600000,
      "start":1407265200000
   }
}
```
