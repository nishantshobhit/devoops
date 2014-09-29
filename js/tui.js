// gets query parameters
function qp() {
  var result = {};
  var url = document.URL;
  query = url.split('?')[2];
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

// reverse geocode
function reverseGeocode(lat, lng, callback) {
  var latlng = new google.maps.LatLng(lat, lng);
  var geocoder = new google.maps.Geocoder()
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
          callback(results);
        } else {
          alert('No results found');
        }
    } else {
      console.log('geocoder api failed');
    }
  });
}


// renders a map iframe
function createGMapsView(locations, center, zoom) { 
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: zoom,
    center: new google.maps.LatLng(center['lat'], center['long']),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  for (i = 0; i < locations.length; i++) { 
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i]['lat'], locations[i]['long']),
      map: map
    });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(locations[i]['label']);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }
}

// renders reports and spotfixes pages
function startRSView(type, action, state) {
  $(document).ready(function(){
    $.ajax({
      'url' : 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/tui/'  + type + '/'
    }).done(function(data){
      var locations = []
      for (var i=0; i<data.length; i++) {
        if (state == 'ALL' || data[i]['state'] == state) {
          var latlong = data[i]['location'].split(',');
          var url = 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/?#ajax/' + action + '_' + type + '.html?id=' + data[i]['id'];
          locations.push({'label' : '<a target="_blank" href="' + url  + '">View</a>', 'lat' : latlong[0], 'long' : latlong[1]});
        }
      }
      createGMapsView(locations, {'lat' : 12.93, 'long' : 77.59}, 12);
    });
  });
}

// renders feed items
function startFeedView() {
  $(document).ready(function(){
    $.ajax({
      'url' : 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/tui/feed/?q=all'
    }).done(function(data){
      $('#feed-container').empty();
      for (i=0; i<data['items'].length; i++) {
        var ct = data['items'][i]['content'];
        var tsepoch = data['items'][i]['createdOn'];
        var ts = new Date(0); 
        ts.setUTCSeconds(tsepoch/1000);
        html = 
          '<div class="row">' + 
            '<div class="col-xs-12 page-feed">' + 
              '<div class="box">' + 
                '<div class="avatar">' + 
                  '<img src="img/avatar.jpg" alt="Jane" />' + 
                '</div>' + 
                '<div class="page-feed-content">' + 
                  '<small class="time">TUI Admin, ' + ts + '</small>' + 
                  '<p>' + ct + '</p>' + 
                '</div>' + 
              '</div>' + 
            '</div>' + 
          '</div>';
        $('#feed-container').append(html);
      }
    });
  });
}

function startRSEditView(type, approve, reject) {
  $(document).ready(function(){
    var id = qp()['id'];
    $.ajax({ 'url' : 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/tui/' + type + '/' + id})
      .done(function(data){
        var ts = new Date(0);
        ts.setUTCSeconds(data['createdOn']/1000);
        $('#report-description').html('What?: ' + data['desc']);
        $('#report-current-state').html('Currently: ' + data['state']);
        $('#report-reported-on').html('Reported on: ' + ts.toDateString());
        var latlong = data['location'].split(',');
        reverseGeocode(parseFloat(latlong[0]), parseFloat(latlong[1]), function(address) {
          for (var i in address) {
            var addr = address[i];
            for (var j in addr['types']) {
              if ('sublocality_level_1' == addr['types'][j]) {
                $('#report-location').html(addr.formatted_address);
              }
            }
          } 
        });        
        createGMapsView([{'label' : 'Foo', 'lat' : latlong[0], 'long' : latlong[1]}], {'lat' : latlong[0], 'long' : latlong[1]}, 17);
        $('#approve').click(function(){
          changeRSStatus(type, id, approve); // CONFIRM
        });
        $('#reject').click(function(){
          changeRSStatus(type, id, reject);
        });
      });
  });
}

function changeRSStatus(type, id, status) {
  var data = {'state' : status, 'scheduled_on' : '2014-02-02 08:00:00'};
  $.ajax({
    'beforeSend' : function(xhrObj){
      xhrObj.setRequestHeader("Content-Type","application/json");
    },
    'type' : 'POST',
    'url' : 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/tui/' + type + '/' + id,
    'data' : JSON.stringify(data)
  }).done(function(){
    window.location.href = 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/';
  });
}
