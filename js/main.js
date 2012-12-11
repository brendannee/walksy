var map;
var geocoder;
var directionsDisplay;
var placesService;
var infoWindow;
var lastWindow;
var trip = {};
var tagList = ["traditional", "architecture", "history", "museum", "neighborhood", "parks", "shopping", "views"];
var tags =[];

function shuffle(array) {
  var tmp, current, top = array.length;

  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }

  return array;
}

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
    var start = decodeURIComponent($.getUrlVar('start').replace(/\+/g,' '))
    $('#startBox').val(start);
    getWalkingTour(start);
  } else {
    //Show Homepage
    $.mobile.changePage($('#home'),"slide");

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
      $('#startBox').val(results[0].formatted_address.replace(/, CA, USA/g, ""));
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
  
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 12,
    center: new google.maps.LatLng(37.777, -122.419),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  geocoder = new google.maps.Geocoder();
  
  infoWindow = new google.maps.InfoWindow();
  
  directionsService = new google.maps.DirectionsService();
  
  placesService = new google.maps.places.PlacesService(map);
  
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: null,
    draggable: false,
    suppressMarkers: true,
    markerOptions: {
    zIndex: 100
    }
  });
  
  //create start marker
  trip.startMarker = new google.maps.Marker({
    map: map,
    draggable:true,
    icon:  new google.maps.MarkerImage("images/green.png")
  });
  
  //Events for start marker
  google.maps.event.addListener(trip.startMarker, 'click', function(position) {
    if(lastWindow) lastWindow.close(); //close the last window if it exists
    infoWindow.setOptions({
      content: '<strong>Walking tour start and end Location</strong>'
    });
    infoWindow.open(map, trip.startMarker);
  });

  google.maps.event.addListener(trip.startMarker, 'dragend', function(position) {
    //Show loading screen
    $.mobile.showPageLoadingMsg();
    trip.start = position.latLng;
    displayRoute();
  });

  //check for maptype parameter
  if(window.location.search.indexOf('8bit') != -1){
    var eightbitOptions = {
      getTileUrl: function(coord, zoom) {
        return "http://mt1.google.com/vt/lyrs=8bit,m@174000000&hl=en&src=app&s=Galil&" +
        "z=" + zoom + "&x=" + coord.x + "&y=" + coord.y;
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: true
    };
      
    var eightbitMapType = new google.maps.ImageMapType(eightbitOptions);
    map.overlayMapTypes.insertAt(0, eightbitMapType);

  } else {
    var styledMapOptions = {
      name: "walking"
    }
    
    var walkingMapType = new google.maps.StyledMapType(styles, styledMapOptions);
    
    map.mapTypes.set('walking', walkingMapType);
    map.setMapTypeId('walking');
  }
  
}


function getWalkingTour(start) {
  geocoder.geocode({address:start}, function(data, status){
    if(status == google.maps.GeocoderStatus.OK) {
      //put start location in headerbox
      $('#headerInput').val(data[0].formatted_address.replace(', USA',''))
      
      $.mobile.changePage($('#map'),"slide");
      
      map.panTo(data[0].geometry.location);
      
      //Assign position to start marker
      trip.startMarker.setPosition(data[0].geometry.location);
      
      trip.start = data[0].geometry.location;
      displayRoute();

    } else {
      alert(trip.start + " not found");
    }
  });
}

function resizeMobile(){
  //Check if window is landscape by looking and height and SVG support to decide if to show Profile
  var mapheight, mapwidth;
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
      mapwidth = $(window).width()-100-parseInt($('#map .ui-header').css('width'));
    } else {
      mapheight = $(window).height()-parseInt($('#map .ui-header').css('height'));
      mapwidth = $(window).width()-parseInt($('#map .ui-header').css('width'));
    }
    panoheight = $(window).height()-parseInt($('#streetview .ui-header').css('height'));
  }
  $("#map_canvas").css('height',mapheight);
  $("#map").css('height',$(window).height());
  $("#map").css('width',$(window).width() * 0.75);
  $("#pano").css('height',panoheight);
  $("#home").css('height',$(window).height());
  $("#credits").css('height',$(window).height());
  
  

  
  if(map){
    google.maps.event.trigger(map,'resize');
  }
}

function displayRoute(){
  clearMap();
  
  //Check if in SF
  if(trip.start.lat() < 37.81 && trip.start.lat() > 37.71 && trip.start.lng() < -122.364 && trip.start.lng() > -122.517){
    sfPoints();
  } else {
    otherPoints(); 
  }
  generateLinks();

}

function clearMap(){
  //Reset Points
  for(i in trip.markerArray){
    trip.markerArray[i].setMap(null);
  }
  
  trip.markerArray = [];
  trip.waypoints = [];
  directionsDisplay.setMap(null);
  
  //close the last infowindow if it exists
  if(lastWindow) lastWindow.close();
}

function generateLinks(){
  $('#permalink a').attr('href','http://walksy.com/?start='+encodeURIComponent($('#startBox').val().replace(/\+/g, " ").replace(/&/g, "and")));

  $("#twitter a").attr("href","http://www.addtoany.com/add_to/twitter?linkurl=" + encodeURIComponent("http://walksy.com/"+$('#startBox').val().replace(/\+/g, " ").replace(/&/g, "and")) + "&linkname=" + encodeURIComponent("Walking Tour of San Francisco starting at " + $('#startBox').val().replace(/\+/g, " ").replace(/&/g, "and")));
}

function sfPoints(){
  //Generate random number for query offset to randomize trips
  var random = Math.floor(Math.random()*4);
  
  //Google Fusion Table ID
  var tableid = 611081;
  
  new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT name, address, tags FROM "+tableid+" ORDER BY ST_DISTANCE(address, LATLNG("+trip.start.lat()+","+trip.start.lng()+")) OFFSET " + random + " LIMIT 8")).send(function(response){
    
    numRows = response.getDataTable().getNumberOfRows();
    numCols = response.getDataTable().getNumberOfColumns();

    if(trip && trip.waypoints) {
      //create an array of row values and an array of addresses
      for (var i = 0; i < numRows; i++) {
        var row = {
          name: response.getDataTable().getValue(i, 0),
          address: response.getDataTable().getValue(i, 1),
          tags: response.getDataTable().getValue(i, 2).split(',')
        };
        trip.waypoints.push(row);
        
        //When complete, proceed
        if(i == (numRows-1)) {
          getDirections();
        }
      }  
    }
    
  });
}

function otherPoints(){
  
  placesService.search({
      radius: 5000
    , location: trip.start
    , types: [
        'amusement_park'
      , 'aquarium'
      , 'bowling_alley'
      , 'casino'
      , 'cemetery'
      , 'city_hall'
      , 'embassy'
      , 'museum'
      , 'natural_feature'
      , 'park'
      , 'stadium'
      , 'zoo'
      , 'point_of_interest'
      ]
  }, function(placesResponse){
    console.log(placesResponse);
      
    $.each(placesResponse, function(i, poi){
      var waypoint = {
          name: poi.name
        , address: poi.vicinity
        , tags: poi.types
        , icon: poi.icon
        , coords: poi.geometry.location.lat() + ',' + poi.geometry.location.lng()
        , distance: calculateDistance(trip.start.lat(), trip.start.lng(), poi.geometry.location.lat(), poi.geometry.location.lng())
      }
        
      if(isUnique(waypoint.address)){
        trip.waypoints.push(waypoint);
      }
    });
    
    //sort waypoints by distance
    trip.waypoints.sort(function(a,b){ return ( a.distance - b.distance ) });
      
    //trim to 8 elements, due to limited waypoints in directions API
    trip.waypoints.splice(8)
      
    getDirections();  
  });
  
  function isUnique(address){
    $.each(trip.waypoints, function(i, waypoint){
      if(waypoint.address==address){
        return false;
      }
    });
    return true;
  }
}

function getDirections(){
  if(trip.waypoints.length == 0){
    //Remove loading screen
    $.mobile.hidePageLoadingMsg();
    alert('No points of interest found');
    return false;
  }
  
  var waypoints = [];
  for(var i in trip.waypoints){
    //if coordinates are available, use these, otherwise use addresses
    waypoints.push({
      location: (trip.waypoints[i].coords) ? trip.waypoints[i].coords : trip.waypoints[i].address
    });
  }

  var request = {
   origin: trip.start,
   destination: trip.start,
   waypoints: waypoints,
   optimizeWaypoints: true,
   travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
   if(status == google.maps.DirectionsStatus.OK) {
     
     directionsDisplay.setDirections(response);
     directionsDisplay.setMap(map);
     
     //Do directions
     $('#directions .content').html('');
     var totalDistance = 0;
     var totalDuration = 0;

     var directionDiv = '<h2>Walking Tour starting from '+response.routes[0].legs[0].start_address.replace(/, USA/g, "")+'</h2><div class="summary"></div>';
     
     $.each(response.routes[0].legs, function(index, leg){
       if(index<response.routes[0].legs.length-1){
         var waypointID = response.routes[0].waypoint_order[index];
         
         //Add index value to waypoint
         trip.waypoints[waypointID].index = index;
         
         //Sum the distace and duration
         totalDistance += leg.distance.value;
         totalDuration += leg.duration.value;
          
         //Assign coordinate from directions to waypoint
         trip.waypoints[waypointID].coordinate = leg.end_location;
         
         directionDiv += '<div id="stop' + index + '" class="waypoint">' +
           '<h2>' + (index+1) + '. ' + trip.waypoints[waypointID].name + '</h2>' +
           '<div class="actions">' +
           '<a href="#streetview" onClick="streetView(new google.maps.LatLng('+leg.end_location.lat()+','+leg.end_location.lng()+'))" class="streetview btn" title="View on Google Streetview">StreetView</a>' +
           '<a class="rating btn" title="View Reviews on Yelp.com"></a>' +
           '</div>' +
           '<div class="image"></div>' +
           '<div class="distance">Walk ' + leg.distance.text + '</div>' +
           '<ul class="directions">';
           
           $.each(leg.steps, function(i, step){
             directionDiv += '<li>'+step.instructions+'</li>';
           });
           
           directionDiv += '</ul></div>';

       }
     });

     $('#directions .content, #directionsSidebar').append(directionDiv);
     
     //Add summary info
     trip.distance = Math.round(totalDistance/1609.344*10)/10 + " miles";
     trip.duration = Math.floor(totalDuration/60) + " minutes";
     $('#directions .summary').html(trip.distance + ", " + trip.duration + ", " + (response.routes[0].legs.length-1) + " stops");
     $('#map h1').html(trip.distance + '<span>, ' + trip.waypoints.length + ' stops</span>');
     
     //Create Points
     for (var i in trip.waypoints){
       createPoint(trip.waypoints[i]);
     }
     
     getElevation(response);
   } else {
     console.log(response);
   }
  });
}

function createPoint(waypoint){
  //Yelp lookup
  var options = {
    term: waypoint.name,
    lat: waypoint.coordinate.lat(),
    long: waypoint.coordinate.lng(),
    radius: 1,
    limit: 1,
    ywsid: '00zW70MC_sCMJIpsokD0hQ'
  }
  $.getJSON('http://api.yelp.com/business_review_search?&callback=?', options, function(result){    
    var infoWindowContent;
    
    //Check if any results then create the marker
    if(result.businesses.length>0){
      //Yelp had results, take the first one
      yelp = result.businesses[0];
      
      infoWindowContent = '<div id="marker' + waypoint.index + '" class="marker"><a href="' + yelp.url + '" title="View reviews on Yelp"><img src="' + yelp.photo_url +'" class="thumb"></a><strong>' + waypoint.name + '</strong><br>' + waypoint.address + '<br>Tags: ' + waypoint.tags.join(', ').replace('_', ' ') + '<br><a href="' + yelp.url + '" title="View on Yelp"><img src="' + yelp.rating_img_url_small + '" alt="View reviews on Yelp"></a> <em>' + yelp.review_count + ' reviews on</em> <a href="' + yelp.url + '" title="View reviews on Yelp"><img src="images/yelp_logo.png" alt="View reviews on Yelp" style="vertical-align:bottom;"></a><br><a href="#streetview" onClick="streetView(new google.maps.LatLng(' + waypoint.coordinate.lat() + ',' + waypoint.coordinate.lng() + '))">StreetView</a></div>';
      
      $('#stop'+waypoint.index+' .image').html('<a href="' + yelp.url + '" title="View reviews on Yelp"><img src="' + yelp.photo_url +'" class="thumb"></a>');
      $('#stop'+waypoint.index+' .rating')
        .html('<img src="' + yelp.rating_img_url_small + '" alt="Yelp Rating""> <em>' + yelp.review_count + ' reviews on</em> <img src="images/yelp_logo.png" alt="Yelp" style="vertical-align:bottom;">')
        .attr('href', yelp.url);
    } else {
      //Couldn't find on yelp
      infoWindowContent = '<div id="marker' + waypoint.index + '" class="marker"><strong>' + waypoint.name + '</strong><br>' + waypoint.address + '<br>Tags: ' + waypoint.tags.join(', ') + '<br><a href="#streetview" onClick="streetView(new google.maps.LatLng(' + waypoint.coordinate.lat() + ',' + waypoint.coordinate.lng() + '))">StreetView</a></div>';
    }
    
    var options = {
      position: waypoint.coordinate,
      content: infoWindowContent,
      pixelOffset: new google.maps.Size(0,16)
    }
    var marker = new google.maps.Marker({
      map: map,
      icon: new google.maps.MarkerImage("images/icon.png",null,null,new google.maps.Point(16,16))
    });
    marker.setOptions(options);
    google.maps.event.addListener(marker, 'click', function(){
      if(lastWindow) lastWindow.close(); //close the last window if it exists
      infoWindow.setOptions(options);
      infoWindow.open(map, marker);
    });
    trip.markerArray.push(marker);
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
      $('#elevation_chart').css('display', 'block');
      chart.draw(data, {
        width: $(window).width(),
        height: 100,
        legend: 'none',
        titleY: 'Elevation (ft)',
        titleX: trip.distance
      });
      
      //Remove loading screen
      $.mobile.hidePageLoadingMsg();
      
    }
  });
}

function streetView(position) {
  //Wait for pageload
  $('#streetview').on('pageshow',function(event, ui){
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


$(document).ready(function(){

  resizeMobile();
  
  launchMap();

  //Resize map when map page is shown
  $("#map_canvas").parent().bind('pageshow',resizeMobile);
  
  $("#pano").parent().bind('pageshow',resizeMobile);
  
  //Resize map when orientation is changed
  $(window).bind('resize',function(e){
    resizeMobile();
    //map.fitBounds(routes[0].routeline.getBounds());
  });

  detectRouteFromURL();
  
  $('#inputs').submit(function(){
    //Show loading
    $.mobile.showPageLoadingMsg();
    $('#inputs input').blur();
  
    var start = $('#startBox').val();
    tags = []; 
    $('#tags :checked').each(function(){
      tags.push($(this).attr('id'));
    });
  
    //Validate inputs
    if(start==''){
      $('#startBox').addClass('error');
      $('#startBox').focus();
      $.mobile.hidePageLoadingMsg();	
      return false;
    } else {
      $('#startBox').removeClass('error');
    }
    
    getWalkingTour(start);
    return false;
  });
  $('#headerUpdate').submit(function() {
    //Show loading
    $.mobile.showPageLoadingMsg();
    
    var start = $('#headerInput').val();
    $('#startBox').val(start);
    getWalkingTour(start);
    return false;
  });
  
  $('body').css('display', 'block');

});

calculateDistance = function(lat1, lon1, lat2, lon2) {
  function ToRadians(degree) {
    return (degree * (Math.PI / 180));
  }
  var radius = 3959.0; //Earth Radius in mi
  var radianLat1 = ToRadians(lat1);
  var radianLon1 = ToRadians(lon1);
  var radianLat2 = ToRadians(lat2);
  var radianLon2 = ToRadians(lon2);
  var radianDistanceLat = radianLat1 - radianLat2;
  var radianDistanceLon = radianLon1 - radianLon2;
  var sinLat = Math.sin(radianDistanceLat / 2.0);
  var sinLon = Math.sin(radianDistanceLon / 2.0);
  var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2.0);
  var d = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return d;
}


