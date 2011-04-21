var map;
var geocoder;
var directionsDisplay;
var infoWindow;
var lastWindow;
var trip = {};
var tagList = ["traditional", "architecture", "history", "museum", "neighborhood", "parks", "shopping", "views"];
var tags =[];
var categories = ['Shopping Mall','UNESCO World Heritage Site', 'Tourist Attraction', 'Scenic View', 'Ruins', 'Plaza', 'Palace', 'Monument', 'Historic', 'Fountain', 'Fort', 'City Walls', 'Castle', 'Battlefield', 'Archeological Site', 'Lake', 'Canyon', 'Beach', 'Vineyard', 'Distillery', 'Brewery', 'Theme Park', 'Go Karts', 'Circus', 'Miniature Golf', 'Museum', 'Bull Ring'];

(function(){
  var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
  var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
  
  this.titleCaps = function(title){
    var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;
    
    while (true) {
      var m = split.exec(title);

      parts.push( title.substring(index, m ? m.index : title.length)
        .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
          return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
        })
        .replace(RegExp("\\b" + small + "\\b", "ig"), lower)
        .replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
          return punct + upper(word);
        })
        .replace(RegExp("\\b" + small + punct + "$", "ig"), upper));
      
      index = split.lastIndex;
      
      if ( m ) parts.push( m[0] );
      else break;
    }
    
    return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
      .replace(/(['Õ])S\b/ig, "$1s")
      .replace(/\b(AT&T|Q&A)\b/ig, function(all){
        return all.toUpperCase();
      });
  };
    
  function lower(word){
    return word.toLowerCase();
  }
    
  function upper(word){
    return word.substr(0,1).toUpperCase() + word.substr(1);
  }
})();

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
    $.mobile.pageLoading();
    trip.start = position.latLng;
    displayRoute();
  });
  
  var styledMapOptions = {
    name: "walking"
  }
  
  var walkingMapType = new google.maps.StyledMapType(styles, styledMapOptions);
  
  map.mapTypes.set('walking', walkingMapType);
  map.setMapTypeId('walking');
}


function submitForm() {
  // Redraws map based on info in the form
  $('#inputs input').blur();
  $.mobile.pageLoading();	
  
  var start = $('#startbox').val();
  tags = []; 
  $('#tags :checked').each(function(){
    tags.push($(this).attr('id'));
  });
  
  //Validate inputs
  if(start==''){
    $('#startbox').addClass('error');
    $('#startbox').focus();
    $.mobile.pageLoading(true);	
    return false;
  } else {$('#startbox').removeClass('error');}
  
  //Make sure at least one tag is checked
  /*if(tags.length < 1){
    $('#tags label').addClass('error');
    $('#tags .ui-controlgroup-controls').prepend('<div class="error">Check at least one category</div>');
    $.mobile.pageLoading(true);
    return false;
  }*/

  geocoder.geocode({address:start}, function(results, status){
    if(status == google.maps.GeocoderStatus.OK) {
      
      $.mobile.changePage($('#map'),"slide");
      
      //Show loading
      $.mobile.pageLoading();
      
      map.setCenter(results[0].geometry.location);
      
      //Assign position to start marker
      trip.startMarker.setPosition(results[0].geometry.location);
      
      trip.start = results[0].geometry.location;
      displayRoute();

    } else {
      alert(trip.start + " not found");
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
  $("#home").css('height',$(window).height());
  $("#credits").css('height',$(window).height());
  if(map){
    google.maps.event.trigger(map,'resize');
  }
}

function displayRoute(){
  clearMap();
  
  generateLinks();
  
  //Check if in SF
  if(trip.start.lat() < 37.81 && trip.start.lat() > 37.71 && trip.start.lng() < -122.364 && trip.start.lng() > -122.517){
    sfPoints();
  } else {
    otherPoints();
  }
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
  $('#permalink a').attr('href','http://walksy.com/?start='+encodeURIComponent($('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")));

  $("#twitter a").attr("href","http://www.addtoany.com/add_to/twitter?linkurl=" + encodeURIComponent("http://walksy.com/"+$('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")) + "&linkname=" + encodeURIComponent("Walking Tour of San Francisco starting at " + $('#startbox').val().replace(/\+/g, " ").replace(/&/g, "and")));
}

function sfPoints(){
  //Generate random number for query offset to randomize trips
  var random = Math.floor(Math.random()*4);
  
  //Google Fusion Table ID
  var tableid = 611081;
  
  new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + encodeURIComponent("SELECT name, address, tags FROM "+tableid+" ORDER BY ST_DISTANCE(address, LATLNG("+trip.start.lat()+","+trip.start.lng()+")) OFFSET " + random + " LIMIT 8")).send(function(response){
    
    numRows = response.getDataTable().getNumberOfRows();
    numCols = response.getDataTable().getNumberOfColumns();

    //create an array of row values and an array of addresses
    for (var i = 0; i < numRows; i++) {
      var row = {
        name: response.getDataTable().getValue(i, 0),
        address: response.getDataTable().getValue(i, 1),
        tags: response.getDataTable().getValue(i, 2).split(',')
      };
      trip.waypoints.push(row);
    }
    getDirections();
  });
}

function otherPoints(){
  var client = new simplegeo.PlacesClient('FCxs4Y5Au5YpndD2p5WFvtv5DvZhSv4G');
    
  var count = 0;  
  
  categories = shuffle(categories);
    
  processPoints(categories);

  function processPoints(categories){
    client.search(trip.start.lat(), trip.start.lng(), {category: categories[count], radius: 4, num: 100}, function(err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log(categories[count]);
        for(var i=0; trip.waypoints.length<8 && i<data.features.length; i++){
          var row = {
            name: data.features[i].properties.name,
            address: data.features[i].properties.address + ", " + data.features[i].properties.city,
            tags: [],
            coords: data.features[i].geometry.coordinates
          }
      
          //Add state if present
          if(data.features[i].properties.province){
            row.address += ", " + data.features[i].properties.province;
          } else if (data.features[i].properties.state){
            row.address += ", " + data.features[i].properties.state;
          }
      
          //Get tags from categories and subcategories
          if(data.features[i].properties.tags){
            $.each(data.features[i].properties.tags, function(index, tag){
              row.tags.push(titleCaps(tag));
            });
          }
          for(var j in data.features[i].properties.classifiers){
            $.each(data.features[i].properties.classifiers[j], function(index, tag){
              if(tag != ''){
                row.tags.push(titleCaps(tag));
              }
            });
          }
          //Filter out stuff we don't want
          if(filterCrap(row.tags)){
            //Check to see if duplicate location
            if(isUnique(row.coords)){
              trip.waypoints.push(row);
            }
          }
        }
        if(trip.waypoints.length<8 && count < (categories.length-1)){
          count++;
          //Do another request
          processPoints(categories);
        } else {
          getDirections();
        }
      }
    }); 
  }
  
  function filterCrap(tags){
    var notCrap = true;
    var exclude = ['Tourist Information', 'Parking', 'Promoter', 'Tours-Operators', 'Real Estate'];
    for(var i in exclude){
      if($.inArray(exclude[i], tags)!=-1){
        notCrap = false;
      }
    }
    return notCrap;
  }
  
  function isUnique(coords){
    var unique = true;
    for(var i in trip.waypoints){
      if(trip.waypoints[i].coords == coords){
        unique = false;
      }
    }
    return unique;
  }
}

function getDirections(){
  if(trip.waypoints.length == 0){
    //Remove loading screen
    $.mobile.pageLoading( true );
    alert('No points of interest found');
    return false;
  }
  
  var addresses = [];
  for(var i in trip.waypoints){
    addresses.push({location: trip.waypoints[i].address});
  }

  var request = {
   origin: trip.start,
   destination: trip.start,
   waypoints: addresses,
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
     $.each(response.routes[0].legs, function(index, leg){
       if(index<response.routes[0].legs.length-1){
         var waypointID = response.routes[0].optimized_waypoint_order[index];
         
         totalDistance += leg.distance.value;
         totalDuration += leg.duration.value;
          
         //Assign coordinate from directions to waypoint
         trip.waypoints[waypointID].coordinate = leg.end_location;
         
         if(index==0){
           $('#directions .content').append('<h2>Walking Tour starting from '+response.routes[0].legs[0].start_address.replace(/, USA/g, "")+'</h2><div class="summary"></div>');
         } else {
           $('#directions .content').append('<h2>' + index + '. ' + trip.waypoints[waypointID].name + '</h2>');
           $('#directions .content').append('<a href="#streetview" onClick="streetView(new google.maps.LatLng('+leg.end_location.lat()+','+leg.end_location.lng()+'))" class="streetview">StreetView</a>');
         }
         
        $('#directions .content').append('<div class="distance">Walk ' + leg.distance.text + '</div>');
         $('#directions .content').append('<ul class="directions' + index + '"></ul>');
         $.each(leg.steps, function(i, step){
           $('#directions .content .directions'+index).append('<li>'+step.instructions+'</li>');
         })
       }
     });
     
     //Add summary info
     trip.distance = Math.round(totalDistance/1609.344*10)/10 + " miles";
     trip.duration = Math.floor(totalDuration/60) + " minutes";
     $('#directions .summary').html(trip.distance + ", " + trip.duration + ", " + (response.routes[0].legs.length-2) + " stops");
     $('#map h1').html('Walking Tour (' + trip.distance + ')');
     
     //Create Points
     for (var i in trip.waypoints){
       createPoint(trip.waypoints[i], i);
     }
     
     getElevation(response);
   } else {
     console.log(response);
   }
  });
}

function createPoint(waypoint, i){
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
    
      infoWindowContent = '<div id="marker' + i + '" class="marker"><a href="' + yelp.url + '" title="View reviews on Yelp"><img src="' + yelp.photo_url +'" class="thumb"></a><strong>' + waypoint.name + '</strong><br>' + waypoint.address + '<br>Tags: ' + waypoint.tags.join(', ') + '<br><a href="' + yelp.url + '" title="View on Yelp"><img src="' + yelp.rating_img_url_small + '" alt="View reviews on Yelp"></a><br><a href="#streetview" onClick="streetView(new google.maps.LatLng(' + waypoint.coordinate.lat() + ',' + waypoint.coordinate.lng() + '))">StreetView</a><br><a href="' + yelp.url + '" title="View reviews on Yelp"><img src="images/yelp_logo.png" alt="View reviews on Yelp"></a></div>';
    } else {
      //Couldn't find on yelp
      infoWindowContent = '<div id="marker' + i + '" class="marker"><strong>' + waypoint.name + '</strong><br>' + waypoint.address + '<br>Tags: ' + waypoint.tags.join(', ') + '<br><a href="#streetview" onClick="streetView(new google.maps.LatLng(' + waypoint.coordinate.lat() + ',' + waypoint.coordinate.lng() + '))">StreetView</a></div>';
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
    //map.fitBounds(routes[0].routeline.getBounds());
  });

  detectRouteFromURL();
  
  $('#inputs').submit(submitForm)
  
  $('body').show();

});
