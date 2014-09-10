Netflix blesk
=====

Netflix blesk is a lightweight client for pushing notifications to web based applications/sites.

Here is a sample request/response for a sample app called 'myApp'

request endpoint:
```text
GET https://bleskServer/api/v1/app/myApp
```

Sample response Payload (where 123456789 & 987654321 are a unique/random/GUID string)
```JSON
{
   "myApp_123456789":{
      "appId":"myApp",
      "notificationType":"info",
      "message":"This is a info notification for myApp",
      "expire":1412103600000,
      "start":1407265200000
   },
   "myApp_987654321":{
      "appId":"myApp",
      "notificationType":"alert",
      "message":"This is an alert notification for myApp",
      "expire":1412103600000,
      "start":1407265200000
   }
}
```

