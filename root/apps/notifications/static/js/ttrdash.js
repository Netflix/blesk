var gCategories = [];
    var gTTD = [];
    var gTTR = [];
    var gTTDAvg = [];
    var gTTRAvg = [];
    var TTRmin = 0; 
    var TTRmax = 0;
    var TTDmin = 0;
    var TTDmax = 0;

    $('.datepicker').datepicker();
    $("#results").hide();
    $("#chartContainer").hide();


    $.ajax({
        type: "GET",
        //url: "http://jira.netflix.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project+%3D+INC+AND+created+%3E%3D+2012-10-01+AND+created+%3C%3D+2012-10-31+AND+RegionSelect+in+%28%22United+States%22%2C+Canada%2C+LatAm%29+AND+%22SPS+Impact%3F%22+%3D+Yes&tempMax=1000",
        url: "/media/incidents.xml",
        //username: $("inputEmail"),
        //password: $("#inputPassword"),
        dataType: "XML"
      }).done(function(xml)
      {
        
      });

    function loadIncidents()
    {

      var fromDate = new Date($("#fromDate").val());
      var toDate = new Date($("#toDate").val());
      var spsImpactQ = $("#spsImpact").is(':checked');
      var spsAlltQ = $("#spsAll").is(':checked');

      $("#chaosMonkeyStatus").html("<p class=\"lead\">Loading ...</p>");
      $("#results").hide();
      $("#chartContainer").hide();



      $.ajax({
        type: "GET",
        //url: "http://jira.netflix.com/sr/jira.issueviews:searchrequest-xml/temp/SearchRequest.xml?jqlQuery=project+%3D+INC+AND+created+%3E%3D+2012-10-01+AND+created+%3C%3D+2012-10-31+AND+RegionSelect+in+%28%22United+States%22%2C+Canada%2C+LatAm%29+AND+%22SPS+Impact%3F%22+%3D+Yes&tempMax=1000",
        url: "/media/incidents.xml",
        //username: $("inputEmail"),
        //password: $("#inputPassword"),
        dataType: "XML"
      }).done(function(xml){
          $("#chaosMonkeyStatus").html("");
       
          gCategories = [];
          gTTD = [];
          gTTR = [];



          var table = "";
          table = table + "<table class=\"table table-hover\">"
            +"<thead><tr>"
              +"<th>ID</th>"
              +"<th>TTR</th>"
              +"<th>TTD</th>"
              +"<th>Description</th>"
              +"<th>Status</th>"
              +"<th>SPS Impact</th>"
              
              +"<th>Incident detected</th>"
              +"<th>Incident start</th>"
              +"<th>Incident resolved</th>"            
              +"</tr></thead>";

            var avgTTD = 0;
            var avgTTR = 0;
            var TTDArray = [];
            var TTRArray = [];
            var incidents = 0
            

            $(xml).find("item").each(function()
            {
              
              var spsImpact = "";
              var dateOfFirstResponse = "";
              var incidentDetected = "";
              var incidentStart = "";
              var incidentStabilized = "";
              

              $(this).find("customfield").each(function()
                {
                  // Getting the SPS Impact
                  if ($(this).find("customfieldname").text() == "SPS Impact?")
                  {
                    spsImpact = $(this).find("customfieldvalue").text()
                  }

                  // Getting the First Response
                  if ($(this).find("customfieldname").text() == "Date of First Response")
                  {
                    dateOfFirstResponse = $(this).find("customfieldvalue").text()
                  }

                  // Getting the Detected Date
                  if ($(this).find("customfieldname").text() == "Incident Detected")
                  {
                    incidentDetected = $(this).find("customfieldvalue").text()
                  }

                  // Getting the Detected Date
                  if ($(this).find("customfieldname").text() == "Incident Start")
                  {
                    incidentStart = $(this).find("customfieldvalue").text()
                  }

                  // Getting the Detected Date
                  if ($(this).find("customfieldname").text() == "Stabilization Time")
                  {
                    incidentStabilized = $(this).find("customfieldvalue").text()
                  }

                  



                });
                var spsT = spsImpactQ ? "Yes" : "";
              if (((spsT.toString().toLowerCase() == spsImpact.toLowerCase())||(spsAlltQ.toString() == "true"))&&((new Date(fromDate)) <= (new Date(incidentStart)))&&((new Date(toDate)) > (new Date(incidentStabilized))))
              {
                  gCategories.push($(this).find("key").text());


                  // counter
                  incidents++;
                  // TTR/TTD calculations
                  var TTR = (((new Date(incidentStabilized)).getTime() - (new Date(incidentStart)).getTime())/1000)/60;
                  var TTD = (((new Date(incidentDetected)).getTime() - (new Date(incidentStart)).getTime())/1000)/60;
                  if (!isNaN(TTR))
                  {
                    avgTTR = avgTTR + TTR;
                    TTRArray.push(TTR);
                    gTTR.push(TTR);
                  }
                  else
                  {
                    gTTR.push(0);
                  }

                  if (!isNaN(TTD))
                  {
                    avgTTD = avgTTD + TTD;
                    TTDArray.push(TTD);
                    gTTD.push(TTD);
                  }
                  else
                  {
                    gTTD.push(0);
                  }

                  table = table + "<tr><td><a class=\"btn btn-primary\" href=\"http://jira.netflix.com/browse/"+$(this).find("key").text()+"\" target=\"_blank\">"+$(this).find("key").text()+"</a></td>"
                    +"<td>"+TTR.toFixed(1)+"</td>"
                    +"<td>"+TTD.toFixed(1)+"</td>"
                    +"<td>"+$(this).find("title").text()+"</td>"
                    +"<td>"+$(this).find("status").text()+"</td>"
                    +"<td>"+spsImpact+"</td>"
                    
                    +"<td>"+incidentDetected+"</td>"
                    +"<td>"+incidentStart+"</td>"
                    +"<td>"+incidentStabilized+"</td>"
                    +"</tr>";
                }
            });
            $("#avgTTR").text("Average: "+(avgTTR/incidents).toFixed(2)+" mins Median: "+median(TTRArray).toFixed(2)+" mins");
            $("#avgTTD").text("Average: "+(avgTTD/incidents).toFixed(2)+" mins Median: "+median(TTDArray).toFixed(2)+" mins");
            
            $("#incCount").text(incidents);
            table = table + "</table>";
            $("#chaosMonkeyStatus").append(table);
            $("#results").show();
            

            gTTRAvg = [];
            gTTDAvg = [];
        

            // Chart ranges
            TTDmax = (avgTTD/incidents) + 5;
            TTDmin = (avgTTD/incidents) - 5;
           

            TTRmax = (avgTTR/incidents) + 5;
            TTRmin = (avgTTR/incidents) - 5;


            renderChart();
            $("#chartContainer").show();

          });

  }   

  // calculating the median
  function median(values) {
      
      values.sort( function(a,b) {return a - b;} );

      var half = Math.floor(values.length/2);

      if(values.length % 2)
          return values[half];
      else
          return (values[half-1] + values[half]) / 2.0;
    }



    // rendering chart
    function renderChart() {
          $(function () {
            var chart;
            $(document).ready(function() {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: 'chartContainer',
                        type: 'column',
                        zoomType: 'x',
                        spacingRight: 20
                    },
                    title: {
                        text: 'TTD/TTRs'
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        categories: gCategories
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Minutes'
                        },


                        plotBands : [{
                            from : TTDmin,
                            to : TTDmax,
                            color : 'rgba(224, 27, 106, 0.2)',
                            label : {
                              text : 'avg TTD'
                            }
                          },
                          {
                            from : TTRmin,
                            to : TTRmax,
                            color : 'rgba(68, 170, 213, 0.2)',
                            label : {
                              text : 'avg TTR'
                            }
                          }
                          ]


                    },
                    legend: {
                        layout: 'vertical',
                        backgroundColor: '#FFFFFF',
                        align: 'left',
                        verticalAlign: 'top',
                        x: 100,
                        y: 70,
                        floating: true,
                        shadow: true
                    },
                    tooltip: {
                        formatter: function() {
                            return ''+
                                this.x +': '+ this.y +' mins';
                        }
                    },

                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0,
                            dataLabels: {
                              enabled: true
                            }
                        }
                    },
                        series: [{
                        name: 'TTR',
                        data: gTTR,
            
                    }, {
                        name: 'TTD',
                        data: gTTD
            
                    },

                  ]
                });
            });
            
        });
    }