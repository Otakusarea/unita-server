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

import * as IO from "socket.io";
import * as IOClient from "socket.io-client";
import {PeerController} from "../controller/peerController";
import {PeerTypeController} from "../controller/peerTypeController";
import * as Geocoder from "node-open-geocoder";
import * as RestInterfaceConfig from "../config/restInterfaceConfig";
import {MessageController} from "../controller/messageController";
import {LocationController} from "../controller/locationController";

export class Socket {
    private socket: any;
    private webClientsocket: any;
    private peerController: PeerController;
    private peerTypeController: PeerTypeController;
    private messageController: MessageController;
    private locationController: LocationController;
    private geocoderOptions: any;
    private geocoder: Geocoder;

    constructor(server: any) {
        this.socket = new IO(server);
        this.peerController = new PeerController();
        this.peerTypeController = new PeerTypeController();
        this.messageController = new MessageController();
        this.locationController = new LocationController();
        this.attachListeners();
        this.checkLocationOfBeacons();
        this.geocoder = new Geocoder(this.geocoderOptions);
    }

    private attachListeners(): void {
        this.socket.on("connection", (socket) => {

            socket.on("connectClient", () => {
                this.webClientsocket = socket.id;
                console.log("CLIENT: ", this.webClientsocket);
                socket.emit("connectClientResult", "SUCCESS");
            });

            socket.on("requestMarkers", () => {
                this.locationController.getSocketConnections().then((activeBeacons) => {
                    this.locationController.getLatestLocationOfActiveBeacon(activeBeacons).
                        then((activeBeaconLocations) => {
                            this.locationController.groupBeaconLocations(activeBeaconLocations)
                                .then((activeBeaconLocationsLatest) => {
                                    socket.emit("sendMarkerData", activeBeaconLocationsLatest);
                            });
                    });
                });
            });

            socket.on("android", () => {
                socket.emit("androidResult", "SUCCESS");
            });

            socket.on("loginBeacon", (beacon) => {
                this.peerController.loginBeacon(beacon).then((loginBeacon) => {
                    socket.emit("loginBeaconResult", loginBeacon);
                    socket.emit("requestLocation", {socketId: socket.id});
                    socket.once("sendLocation", (locationData) => {
                        this.locationController.createSocketConnectionEntry({
                            socketId: locationData.socketId, beaconId: locationData.beaconId
                        });
                        this.locationController.saveLocationForBeacon({
                            location: locationData.location,
                            beaconId: locationData.beaconId
                        });
                    });
                });

            });

            socket.on("sendLocationCheck", (locationData) => {
                this.locationController.saveLocationForBeacon({
                    location: locationData.location,
                    beaconId: locationData.beaconId
                });
            });

            socket.on("getUrlForCommandGetAllMessages", (senderData) => {
                this.peerController.getSinglePeerData(senderData).then((sender) => {
                    socket.emit("getUrlForCommandGetAllMessagesResult",
                    {url: RestInterfaceConfig.getAllMessages, sender});
                });
            });

            socket.on("getUrlForCommandgetAllBroadcastMessages", (senderData) => {
                this.peerController.getSinglePeerData(senderData).then((sender) => {
                    socket.emit("getUrlForCommandgetAllBroadcastMessagesResult",
                    {url: RestInterfaceConfig.getAllBroadcastMessages, sender});
                });
            });

            socket.on("getUrlForCommandgetAllMessagesFromContact", (senderData) => {
                this.peerController.getSinglePeerData(senderData).then((sender) => {
                    socket.emit("getUrlForCommandgetAllMessagesFromContactResult",
                    {url: RestInterfaceConfig.getAllMessagesFromContact, sender});
                });
            });

            socket.on("sendMessage", (message) => {
                this.messageController.saveMessageToDB(message).then((savedMessage) => {
                    socket.emit("sendMessageResult", savedMessage);
                });

            });

            socket.on("getPeerData", (peerIds) => {
                this.peerController.getPeerData(peerIds).then((peerData) => {
                    socket.emit("getPeerDataResult", peerData);
                });
            });
        });
    }

    private checkLocationOfBeacons(): void {
        setInterval(() => {
            this.locationController.getSocketConnections().then((socketConnections) => {
                for (let socketConnection in socketConnections) {
                    if (this.socket.sockets.sockets[socketConnections[socketConnection].socketId] !== undefined) {
                        this.socket.to(socketConnections[socketConnection].socketId).emit("requestLocationCheck",
                            {socketId: socketConnections[socketConnection].socketId});
                    } else {
                        this.locationController.deleteSocketConnection({
                            socketId: socketConnections[socketConnection].socketId});
                    }
                 }
            });
        }, 1000 * 60 * 5);
    }
}
