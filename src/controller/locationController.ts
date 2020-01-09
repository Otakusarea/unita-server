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

import models from "../models";
import mongoose = require("mongoose");

export class LocationController {

    public getSocketConnections(): any {
        return models.SocketConnection.find({}).then((socketConnections) => {
            return socketConnections;
        });
    }

    public createSocketConnectionEntry(socketData): any {
        const socketConnection = new models.SocketConnection({
            socketId: socketData.socketId,
            beaconId: socketData.beaconId,
        });
        return socketConnection.save();
    }

    public deleteSocketConnection(socketData): any {
        return models.SocketConnection.deleteOne({socketId: socketData.socketId}, function(err) {
            if (!err) {
                console.log("deleteSocketConnection", "deleted");
            } else {
                console.log("deleteSocketConnection", err);
            }
        });
    }

    public saveLocationForBeacon(locationData): any {
        const location = new models.Location({
            location: {
                type: "Point",
                coordinates: [locationData.location.longitude,
                    locationData.location.latitude]
            },
            beaconId: locationData.beaconId,
        });
        return location.save();
    }

    public async groupBeaconLocations(activeBeaconsLocations): Promise<any> {
        let activeBeaconLocationsLatest = [];
        let isInList = false;
        for (let abl in activeBeaconsLocations) {
            if (activeBeaconLocationsLatest.length <= 0) {
                activeBeaconLocationsLatest.push(activeBeaconsLocations[abl]);
            } else {
                for (let abll in activeBeaconLocationsLatest) {
                    if (activeBeaconLocationsLatest[abll].beaconId === activeBeaconsLocations[abl].beaconId) {
                            isInList = true;
                            if (activeBeaconLocationsLatest[abll].timestamp <
                                activeBeaconsLocations[abl].timestamp) {
                                    activeBeaconLocationsLatest[abll] = activeBeaconsLocations[abl];
                            }
                    }
                }
                if (!isInList) {
                    activeBeaconLocationsLatest.push(activeBeaconsLocations[abl]);
                }
            }
            isInList = false;
        }
        return await activeBeaconLocationsLatest;
    }

    public getLatestLocationOfActiveBeacon(activeBeacons): any {
        let activeBeaconsLocations = [];
        let activeBeaconIds = [];
        for (let b in activeBeacons) {
            activeBeaconIds.push(activeBeacons[b].beaconId);
        }

        return models.Location.find({beaconId: {$in: activeBeaconIds}})
                .then((activeBeaconLocations) => {
                    return activeBeaconLocations;
        });
    }
}
