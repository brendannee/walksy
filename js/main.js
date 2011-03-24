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
    alert("To determine your current location you must click \"Share Location\" in the top bar in your browser.");
  } else if (error.code==2 || error.code==3 || error.code==0){
    alert("Your current location couldn't be determined.  Please enter the start and end locations manually.");
  } 
}

function submitForm() {
  // Redraws map based on info in the form
  if(mobile){
    $('#inputs input').blur();
    $.mobile.pageLoading();	
  }
  var start = $('#startbox').val();
  var end = $('#finishbox').val();
  var hill = $('#hills').val();

  //Validate inputs
  if(start==''){
    $('#startbox').addClass('error');
    if(mobile){
      $('#startbox').focus();
      $.mobile.pageLoading(true);	
    }
    return false;
  } else {$('#startbox').removeClass('error');}
  if(end==''){
    $('#finishbox').addClass('error');
    if(mobile){
      $('#finishbox').focus();
      $.mobile.pageLoading(true);	
    }
    return false;
  } else {$('#finishbox').removeClass('error');}

  //Search for Richmond, if found add usa to end to avoid confusion with Canada
  if (start.search(/richmond/i) != -1) {
    start = start + ", usa";
  }
  if (end.search(/richmond/i) != -1) {
    end = end + ", usa";
  }

  geocoder = new google.maps.Geocoder();
  geocoder.geocode({address:start}, function(results, status){
    if (status == google.maps.GeocoderStatus.OK) {
      var lat1 = results[0].geometry.location.lat();
      var lng1 = results[0].geometry.location.lng();
      //Now geocode end address
      geocoder.geocode({address:end}, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
          var lat2 = results[0].geometry.location.lat();
          var lng2 = results[0].geometry.location.lng();
          //Now move along
          if(checkBounds(lat1,lng1,lat2,lng2)){
            // Draw 3 paths, one for each safety level
            drawpath(lat1, lng1, lat2, lng2, hill, "low", true);
            drawpath(lat1, lng1, lat2, lng2, hill, "medium", true);
            drawpath(lat1, lng1, lat2, lng2, hill, "high", true);
            
            map.panTo(new google.maps.LatLng((lat1+lat2)/2,(lng1+lng2)/2));
            
            if(mobile){
              $.mobile.pageLoading( true );
              $.mobile.changePage($('#map'),"slide");
            }
            
          } else {
            alert("Bikemapper currently only works in the Bay Area.  Try making your addresses more specific by adding city and state names.");
          }
        } else {
          alert(end + " not found");
          return false;
        }
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
  ]
  
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 12,
    center: new google.maps.LatLng(37.777, -122.419),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  var  styledMapOptions = {
    name: "walking"
  }
  
  var walkingMapType = new google.maps.StyledMapType(styles, styledMapOptions);
  
  map.mapTypes.set('walking', walkingMapType);
  map.setMapTypeId('walking');
  
  var tableid = 610588;
  var layer = new google.maps.FusionTablesLayer(tableid,{
    }
  );
  
  var query = "SELECT address FROM "+tableid+" WHERE tags contains ignoring case 'museum'";
  
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
