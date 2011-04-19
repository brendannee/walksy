var tagList = ["traditional", "architecture", "history", "museum", "neighborhood", "parks", "shopping", "views"];
var map;
var geocoder;
var directionsDisplay;
var infoWindow;
var lastWindow;
var markerArray = [];

$.extend({
  //Extends jQuery to get parameters from URL
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

function detectRouteFromURL(){
  //Detect saved route from URL
  if($.getUrlVar('start')!=undefined){
    $('#startbox').val(decodeURIComponent($.getUrlVar('start').replace(/\+/g,' ')));
    submitForm();
  } else {
    //Show Homepage
    if($.mobile.activePage.attr('id')!='home'){
      $.mobile.changePage($('#home'),"slide");
    }
    if(navigator.geolocation) {  
      navigator.geolocation.getCurrentPosition(getGeoLocator,showGeoLocatorError);
    }
  }
}

function isiPhone(){
  return (
    (navigator.platform.indexOf("iPhone") != -1) ||
    (navigator.platform.indexOf("iPod") != -1)
  );
}

function getGeoLocator(position) {
  var coords = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({'latLng': coords}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      $('#startbox').val(results[0].formatted_address.replace(/, CA, USA/g, ""));
    }
  });
}
  
function showGeoLocatorError(error){
  if(error.code==1){
    console.log("To determine your current location you must click \"Share Location\" in the top bar in your browser.");
  } else if (error.code==2 || error.code==3 || error.code==0){
    console.log("Your current location couldn't be determined.  Please enter the start and end locations manually.");
  } 
}

function submitForm() {
  // Redraws map based on info in the form
  $('#inputs input').blur();
  $.mobile.pageLoading();	
  
  var start = $('#startbox').val();
  var tags = $('#tags :checked');

  //Validate inputs
  if(start==''){
    $('#startbox').addClass('error');
    $('#startbox').focus();
    $.mobile.pageLoading(true);	
    return false;
  } else {$('#startbox').removeClass('error');}
  
  /*if(tags.length < 1){
    $('#tags label').addClass('error');
    $('#tags .ui-controlgroup-controls').prepend('<div class="error">Check at least one category</div>');
    $.mobile.pageLoading(true);
    return false;
  }*/

  geocoder = new google.maps.Geocoder();
  geocoder.geocode({address:start}, function(results, status){
    if (status == google.maps.GeocoderStatus.OK) {
      
      $.mobile.changePage($('#map'),"slide");
      
      //Show loading
      $.mobile.pageLoading();
      
      //Wait for pageload
      $('#map').live('pageshow',function(event, ui){
        //create start/end marker
         var start_marker = new google.maps.Marker({
             map: map, 
             position: results[0].geometry.location,
             draggable:true,
             icon:  new google.maps.MarkerImage("images/green.png")
         });

         google.maps.event.addListener(start_marker, 'click', function() {
           if(lastWindow) lastWindow.close(); //close the last window if it exists
           if(infoWindow) infoWindow.close();
           lastWindow = new google.maps.InfoWindow( {
             pixelOffset: new google.maps.Size(0,-32),
             position: results[0].geometry.location,
             content: '<strong>Start and End Location</strong><br>'+results[0].formatted_address.replace(/, USA/g, "")
           });
           lastWindow.open(map);
         });

         google.maps.event.addListener(start_marker, 'dragend', function(position) {
            displayRoute(position.latLng);
         });
         
        displayRoute(results[0].geometry.location);
      });

    } else {
      alert(start + " not found");
      return false;
    }
  });
return false;
}

function resizeMobile(){
  //Check if window is landscape by looking and height and SVG support to decide if to show Profile
  var mapheight;
  if(isiPhone()){
    //Hide top address bar
    window.top.scrollTo(0, 1);
    if(window.orientation==0){
      //Show profile bar if portriat mode
      mapheight = $(window).height()-40-parseInt($('#map .ui-header').css('height'));
    } else {
      mapheight = $(window).height()+60-parseInt($('#map .ui-header').css('height'));
    }
    panoheight = $(window).height()+60-parseInt($('#streetview .ui-header').css('height'));
  } else {
    //Not iphone
    if($(window).height()>300 && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")==true){
      //Show profile if enough room ans SVG supported
      mapheight = $(window).height()-100-parseInt($('#map .ui-header').css('height'));
    } else {
      mapheight = $(window).height()-parseInt($('#map .ui-header').css('height'));
    }
    panoheight = $(window).height()-parseInt($('#streetview .ui-header').css('height'));
  }
  $("#map_canvas").css('height',mapheight);
  $("#map").css('height',$(window).height());
  $("#pano").css('height',panoheight);
  google.maps.event.trigger(map,'resize');
}

function launchMap(){
  
  var styles = [
  {
      featureType: "road.arterial",
      elementType: "all",
      stylers: [
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "all",
      stylers: [
        { visibility: "on" },
        { lightness: 13 }
      ]
    },{
      featureType: "road",
      elementType: "all",
      stylers: [
        { visibility: "on" },
        { saturation: -14 },
        { gamma: 1.14 },
        { lightness: 29 },
        { hue: "#ddff00" }
      ]
    },{
      featureType: "administrative.country",
      elementType: "all",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "administrative.locality",
      elementType: "all",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "administrative.province",
      elementType: "all",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "landscape",
      elementType: "all",
      stylers: [
        { hue: "#ffc300" },
        { lightness: -24 },
        { saturation: 2 }
      ]
    },{
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        { visibility: "on" },
        { lightness: -11 },
        { saturation: 20 },
        { hue: "#a1ff00" }
      ]
    },{
      featureType: "poi.medical",
      elementType: "all",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "poi.school",
      elementType: "all",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "road.highway",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { saturation: -1 },
        { lightness: 64 },
        { gamma: 0.74 }
      ]
    },{
      featureType: "landscape.man_made",
      elementType: "all",
      stylers: [
        { hue: "#ffc300" },
        { lightness: 26 },
        { gamma: 1.29 }
      ]
    },{
      featureType: "road.highway",
      elementType: "all",
      stylers: [
        { saturation: 36 },
        { lightness: -8 },
        { gamma: 0.96 },
        { visibility: "off" }
      ]
    },{
      featureType: "road.highway",
      elementType: "all",
      stylers: [
        { lightness: 88 },
        { gamma: 3.78 },
        { saturation: 1 },
        { visibility: "off" }
      ]
    },{
      featureType: "road.local",
      elementType: "labels",
      stylers: [
        { visibility: "on" },
        { lightness: 27 },
        { saturation: -3 }
      ]
    },{
      featureType: "poi.business",
      elementType: "all",
      stylers: [
        { hue: "#ff0900" }
      ]
    },{
      featureType: "poi.government",
      elementType: "all",
      stylers: [
        { hue: "#ff1a00" }
      ]
    },{
      featureType: "poi.sports_complex",
      elementType: "all",
      stylers: [
        { hue: "#ff1a00" }
      ]
    },{
      featureType: "poi.place_of_worship",
      elementType: "all",
      stylers: [
        { hue: "#ff3300" }
      ]
    },{
      featureType: "all",
      elementType: "all",
      stylers: [

      ]
    }
  ];
  
  directionsOptions = {
    map: null,
    draggable: true,
    suppressMarkers: true,
    markerOptions: {
    zIndex: 100
    }
  };
  
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 12,
    center: new google.maps.LatLng(37.777, -122.419),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  geocoder = new google.maps.Geocoder();
  
  infoWindow = new google.maps.InfoWindow();
  
  
  directionsDisplay = new google.maps.DirectionsRenderer(directionsOptions);
  
  var  styledMapOptions = {
    name: "walking"
  }
  
  var walkingMapType = new google.maps.StyledMapType(styles, styledMapOptions);
  
  map.mapTypes.set('walking', walkingMapType);
  map.setMapTypeId('walking');
  
}

function makeMarker(options){
   var pushPin = new google.maps.Marker({map:map,icon:new google.maps.MarkerImage("images/icon.png",null,null,new google.maps.Point(16,16))});
   pushPin.setOptions(options);
   google.maps.event.addListener(pushPin, 'click', function(){
     if(lastWindow) lastWindow.close(); //close the last window if it exists
     infoWindow.setOptions(options);
     infoWindow.open(map, pushPin);
   });
   markerArray.push(pushPin);
   return pushPin;
 }

function displayRoute(start){  

  var tableid = 611081;
  
  //Reset Points
  for(i in markerArray){
    markerArray[i].setMap(null);
  }
  markerArray = [];
  var points = [];
  directionsDisplay.setMap(null);
  
  if(lastWindow) lastWindow.close(); //close the last window if it exists
  
  $('#permalink a').attr('href','http://walksy.com/?start='+encodeURIComponent($('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")));
  
  $("#twitter a").attr("href","http://www.addtoany.com/add_to/twitter?linkurl=" + encodeURIComponent("http://walksy.com/"+$('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")) + "&linkname=" + encodeURIComponent("Walking Tour of San Francisco starting at " + $('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")));
  
  //Generate random number for query offset to randomize trips
  var random = Math.floor(Math.random()*4);
  
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT name, address, tags FROM "+tableid+" ORDER BY ST_DISTANCE(address, LATLNG("+start.lat()+","+start.lng()+")) OFFSET " + random + " LIMIT 8"));
  query.send(function(response){
    
    numRows = response.getDataTable().getNumberOfRows();
    numCols = response.getDataTable().getNumberOfColumns();
    
    var limit = numRows;

    //create an array of row values
    for (var i = 0; i < numRows; i++) {
      var row = [];
      for (var j = 0; j < numCols; j++) {
        row.push(response.getDataTable().getValue(i, j));
      }
      (function(row, i){
        geocoder.geocode( { 'address': row[1] }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            var coordinate = results[0].geometry.location;
            
            //Yelp lookup
            var options = {
              term: row[0],
              lat: coordinate.lat(),
              long: coordinate.lng(),
              radius: 1,
              limit: 1,
              ywsid: '00zW70MC_sCMJIpsokD0hQ'
            }
            $.getJSON('http://api.yelp.com/business_review_search?&callback=?', options, function(data){
              //Check if any results then create the marker
              if(data.businesses.length>0){
                //Yelp had results, take the first one
                yelp = data.businesses[0];
              
                makeMarker({
                  position:coordinate,
                  pixelOffset: new google.maps.Size(0,16),
                  content: '<div id="marker' + i + '" class="marker"><a href="' + yelp.url + '" title="View reviews on Yelp"><img src="' + yelp.photo_url +'" class="thumb"></a><strong>' + row[0] + '</strong><br>' + row[1] + '<br>Tags: ' + row[2]  + '<br><a href="' + yelp.url + '" title="View on Yelp"><img src="' + yelp.rating_img_url_small + '" alt="View reviews on Yelp"></a><br><a href="#streetview" onClick="streetView(new google.maps.LatLng('+coordinate.lat()+','+coordinate.lng()+'))">StreetView</a><br><a href="' + yelp.url + '" title="View reviews on Yelp"><img src="images/yelp_logo.png" alt="View reviews on Yelp"></a></div>'
                });
              } else {
                //Couldn't find on yelp
                makeMarker({
                  position:coordinate,
                  pixelOffset: new google.maps.Size(0,16),
                  content: '<div id="marker' + i + '" class="marker"><strong>' + row[0] + '</strong><br>' + row[1] + '<br>Tags: ' + row[2]  + '<br><a href="#streetview" onClick="streetView(new google.maps.LatLng('+coordinate.lat()+','+coordinate.lng()+'))">StreetView</a></div>'
                });
              }

              //Add to points array
              points.push({coordinate:coordinate,data:row});
              
              limit -= 1;
              //Check if loop is done, them move on
              if(limit==0) {
                var trip = {
                  points: points,
                  start: start
                };

                getDirections(trip);
              }
            });
          }
        });
      })(row, i);
    }
  });
}

function getDirections(trip){
  var DirectionsService = new google.maps.DirectionsService();

  //Create waypoints
  var waypoints = new Array();
  $.each(trip.points, function(index, value){
    waypoints.push({
      location: value.coordinate
    });
  });

  var request = {
   origin: trip.start,
   destination: trip.start,
   waypoints: waypoints,
   optimizeWaypoints: true,
   travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  DirectionsService.route(request, function(response, status) {
   if (status == google.maps.DirectionsStatus.OK) {
     directionsDisplay.setDirections(response);
     directionsDisplay.setMap(map);
     
     
     //Do directions
     $('#directions .content').html('');
     $.each(response.routes[0].legs, function(index, leg){
       if(index<response.routes[0].legs.length-1){
         var waypointID = response.routes[0].optimized_waypoint_order[index-1];
         if(index==0){
           $('#directions .content').append('<h2>Start at '+response.routes[0].legs[0].start_address.replace(/, USA/g, "")+'</h2>');
         } else {
           $('#directions .content').append('<h2>'+(index)+' '+trip.points[waypointID].data[0]+'</h2>');
         }
         $('#directions .content').append('<a href="#streetview" onClick="streetView(new google.maps.LatLng('+leg.end_location.lat()+','+leg.end_location.lng()+'))">StreetView</a>');
         $('#directions .content').append('<ul>');
         $.each(leg.steps, function(index, step){
           $('#directions .content').append('<li>'+step.instructions+'</li>');
         })
         $('#directions .content').append('</ul>');
       } else {
         
       }
     });
     
     getElevation(response);
     
   }
  });
}

function getElevation(response){
  var elevationService = new google.maps.ElevationService();
  // Create a new chart in the elevation_chart DIV.
  chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));
  
  elevationService.getElevationAlongPath({path: response.routes[0].overview_path, samples:200}, function(results, status){
    if (status == google.maps.ElevationStatus.OK) {
      elevations = results;
      
      // Extract the elevation samples from the returned results
      // and store them in an array of LatLngs.
      var elevationPath = [];
      for (var i = 0; i < results.length; i++) {
        elevationPath.push(elevations[i].location);
      }

      // Display a polyline of the elevation path.
      var pathOptions = {
        path: elevationPath,
        strokeColor: '#0000CC',
        opacity: 0.4,
        map: map
      }
      //polyline = new google.maps.Polyline(pathOptions);

      // Extract the data from which to populate the chart.
      // Because the samples are equidistant, the 'Sample'
      // column here does double duty as distance along the
      // X axis.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Sample');
      data.addColumn('number', 'Elevation');
      for (var i = 0; i < results.length; i++) {
        data.addRow(['', elevations[i].elevation*3.2808399]);
      }

      // Draw the chart using the data within its DIV.
      document.getElementById('elevation_chart').style.display = 'block';
      chart.draw(data, {
        width: $(window).width(),
        height: 100,
        legend: 'none',
        titleY: 'Elevation (ft)'
      });
      
      //Remove loading screen
      $.mobile.pageLoading( true );
      
    }
  });
}

function streetView(position) {
  //Wait for pageload
  $('#streetview').live('pageshow',function(event, ui){
    var panoramaOptions = {
      position:position,
      pov: {
        heading: 165,
        pitch:0,
        zoom:1
      }
    };
    var myPano = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoramaOptions);
    myPano.setVisible(true);
  });
}


google.setOnLoadCallback(function(){

  resizeMobile();
  
  launchMap();

  //Resize map when map page is shown
  $("#map_canvas").parent().bind('pageshow',resizeMobile);
  
  $("#pano").parent().bind('pageshow',resizeMobile);
  
  //Resize map when orientation is changed
  $(window).bind('resize',function(e){
    resizeMobile();
    map.fitBounds(routes[0].routeline.getBounds());
  });

  detectRouteFromURL();
  
  $('#inputs').submit(submitForm)
  
  $('body').show();

});
