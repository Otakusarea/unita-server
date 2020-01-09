/*
 * Copyright (c) 2019. Florian Taurer.
 *
 * This file is part of Unita SDK.
 *
 * Unita is free a SDK: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Unita is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Unita.  If not, see <http://www.gnu.org/licenses/>.
 */

const socket = io.connect('SERVER_ADDRESS');

socket.emit('connectClient');

socket.on('connectClientResult', function (data) {
    socket.emit('requestMarkers');
});

socket.on('sendMarkerData', function (data) {
    activeBeacons = data;
    loadMarkers(activeBeacons);
});

socket.on('reloadMarker', function (data) {
    activeBeacons = data;
    vectorSource.clear();
    markerVectorLayer = null;
    loadMarkers(activeBeacons);
});

var detections = [];

var technologies = [];

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

function centerMarker(featureID){
    var coordinates = markerVectorLayer.getSource().getFeatureById(featureID).getGeometry().getCoordinates();
    var lonlat = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    centerMap(lonlat[0], lonlat[1]);
}

function centerMap(long, lat) {
    map.getView().setCenter(ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(15);
}

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
});

var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    overlays: [overlay],
    view: new ol.View({
      center: ol.proj.fromLonLat([9.25, 50.1]),
      zoom: 5
    })
});

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

let markerVectorLayer;
let vectorSource;

function loadMarkers(activeBeacons) {
    vectorSource = new ol.source.Vector();

    for(let a in activeBeacons){
        console.log("activeBeacons", activeBeacons[a])
        var marker = createMarker(activeBeacons[a]);
        vectorSource.addFeature(marker);
    }

    markerVectorLayer = new ol.layer.Vector({
        source: vectorSource,
    });

    map.addLayer(markerVectorLayer);

    map.on('click', function(event) {
        map.forEachFeatureAtPixel(event.pixel, function(feature,layer) {
            if ( feature.getProperties().id == "detection" ) {
                for(i=0;i<1;i++){
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    
                    var popupText = '<p>'+feature.getProperties().lon+ ', '+feature.getProperties().lat+ ', '+feature.getProperties().beaconid+'</p>' + 
                        '<p>Last seen '+feature.getProperties().timestamp+'</p>';
                    
                    var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coord));

                    content.innerHTML = popupText;
                    overlay.setPosition(coord);
                    console.log("clickLoadMarkers", feature.getProperties().name);
                }
            } else {
                popup.hide();
            }
        });
    });
}

function createMarker(beacon){
    lat = beacon.location.coordinates[1];
    lon = beacon.location.coordinates[0];
    beaconid = beacon.beaconId;
    timestamp = beacon.timestamp;
    var marker = new ol.Feature({
        id: "beacon",
        type: "click",
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat([lon,lat])
        ),
        name: beacon.beaconId + "-" + beacon.timestamp,
        lat: lat,
        lon: lon,
        beaconid: beaconid,
        timestamp: timestamp,
    });

    marker.setId(beacon.beaconId + "-" + beacon.timestamp);
    marker.setProperties({'BeaconID': beacon.beaconId, 'Timestamp': beacon.timestamp});

    var src = "../assets/icons/marker_green.png";

    iconStyle = new ol.style.Style({
        icon: new ol.style.Icon({
            src: src,
            scale: 0.25
        }),
        
    });

    marker.setStyle(iconStyle);

    return marker;
}