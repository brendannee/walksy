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
  if($.getUrlVar('start')!=undefined && $.getUrlVar('end')!=undefined){
    $('#startbox').val($.getUrlVar('start').replace(/\+/g,' '));
    $('#finishbox').val($.getUrlVar('end').replace(/\+/g,' '));
    // Strip off trailing #
    if($.getUrlVar('hill')!=undefined) {
     $('#hills').val($.getUrlVar('hill').replace(/#/g,''));
    }
    submitForm();
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
      
      $.mobile.pageLoading( true );
      $.mobile.changePage($('#map'),"slide");
      
      //Wait for pageload
      $('#map').live('pageshow',function(event, ui){
        //create start/end marker
         var start_marker = new google.maps.Marker({
             map: map, 
             position: results[0].geometry.location,
             draggable:true,
             icon:  new google.maps.MarkerImage("images/green.png")
         });

         google.maps.event.addListener(start_marker, 'click', function(event) {
           if(lastWindow) lastWindow.close(); //close the last window if it exists
           lastWindow = new google.maps.InfoWindow( {
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
  } else {
    //Not iphone
    if($(window).height()>500 && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")==true){
      //Show profile if enough room ans SVG supported
      mapheight = $(window).height()-100-parseInt($('#map .ui-header').css('height'));
    } else {
      mapheight = $(window).height()-parseInt($('#map .ui-header').css('height'));
    }
  }
  $("#map_canvas").css('height',mapheight);
  $("#map").css('height',$(window).height());
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
  
  
  /*var tags = ["shopping", "museum", "parks"];
  
  var query = "SELECT address FROM "+tableid+" ORDER BY ST_DISTANCE(address, LATLNG(37.777,-122.419)) LIMIT 1";
  
  console.log(query);
  
  layer.setQuery(query);
  console.log(layer);
  layer.setMap(map);
  
  
  //add a click listener to the layer
  google.maps.event.addListener(layer, 'click', function(e) {
    console.log(e)
    //update the content of the InfoWindow
    e.infoWindowHtml = '<strong>'+e.row['name'].value + "</strong><br>";
    e.infoWindowHtml += e.row['address'].value+'<br>';
    e.infoWindowHtml += 'Tags: '+e.row['tags'].value;
  });*/
  
  /*$.getJSON('http://walksy.com/php/getPoints.php?tags=parks,museum&latlng=37.777,-122.419&callback=?',function(result){
    console.log(result);
    $.each(result, function())
  });*/
}

function makeMarker(options){
  console.log(options.content);
   var pushPin = new google.maps.Marker({map:map,icon:new google.maps.MarkerImage("images/icon.png",null,null,new google.maps.Point(16,16))});
   pushPin.setOptions(options);
   google.maps.event.addListener(pushPin, 'click', function(){
     if(lastWindow) lastWindow.close();
     infoWindow.setOptions(options);
     lastWindow = infoWindow.open(map, pushPin);
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
  
  var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT name, address, tags FROM "+tableid+" ORDER BY ST_DISTANCE(address, LATLNG("+start.lat()+","+start.lng()+")) LIMIT 8"));
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
      (function(row){
        geocoder.geocode( { 'address': row[1] }, function(results, status) {
          console.log(row);
          if (status == google.maps.GeocoderStatus.OK) {
            var coordinate = results[0].geometry.location;

            //create the marker
            makeMarker({
              position:coordinate,
              content: '<strong>' + row[0] + '</strong><br>' + row[1] + '<br>Tags: ' + row[2]
            });

            points.push({coordinate:coordinate,data:row});
          }
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
      })(row);
    }
  });
}

function getDirections(trip){
  console.log(trip)
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
   }
  });
}


google.setOnLoadCallback(function(){
  
  //Hide top address bar
  window.top.scrollTo(0, 1);

  launchMap();

  //Resize map when map page is shown
  $("#map_canvas").parent().bind('pageshow',resizeMobile);
  
  //Resize map when orientation is changed
  $(window).bind('resize',function(e){
    resizeMobile();
    map.fitBounds(routes[0].routeline.getBounds());
  });

  detectRouteFromURL();
  if(navigator.geolocation) {  
    navigator.geolocation.getCurrentPosition(getGeoLocator,showGeoLocatorError);
  }
  
  $('#inputs').submit(submitForm)
  
  $('body').show();

  resizeMobile();
});
