function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
function render(locations) { 
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: new google.maps.LatLng(12.93, 77.59),
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
function renderItems(type, state) {
  $(document).ready(function(){
    $.ajax({
      'url' : 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/tui/'  + type + '/'
    }).done(function(data){
      var locations = []
      for (var i=0; i<data.length; i++) {
        if (state == 'ALL' || data[i]['state'] == state) {
          var latlong = data[i]['location'].split(',');
          var url = 'http://ec2-54-169-91-68.ap-southeast-1.compute.amazonaws.com/?#ajax/edit_' + type + '.html?id=' + data[i]['id'];
          locations.push({'label' : '<a target="_blank" href="' + url  + '">View</a>', 'lat' : latlong[0], 'long' : latlong[1]});
        }
      }
      render(locations);
    });
  });
}
function renderFeed() {
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
function editReport(id) {
}
