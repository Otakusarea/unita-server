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
import Peer from "../models/peer";
require("mongoose-sequence")(mongoose);

export class PeerController {

    public getAllPeers(): any {
        return models.Peer.find({}).then((detections) => {
            return detections;
        });
    }

    public async loginUser(userData): Promise<any> {
        let additionalData = {};
        for (let key in userData) {
            if (key !== "name") {
                additionalData[key] = userData[key];
            }
        }
        return models.Peer.countDocuments({
            name: userData.name}).then( async (count) => {
                if (count === 0) {
                    let user = new models.Peer({
                        name: userData.name,
                        type: 2,
                        additionalData
                    });
                    return await user.save().then((savedUser) => {
                        return [savedUser];
                    });
                } else {
                    return await models.Peer.find({$and: [{name: userData.name}, {type: 2}]}).then((user) => {
                        return user;
                    });
                }
            });
    }

    public async loginBeacon(beaconData): Promise<any> {
        let additionalData = {};
        for (let key in beaconData) {
            if (key !== "name") {
                additionalData[key] = beaconData[key];
            }
        }
        return models.Peer.countDocuments({
            name: beaconData.name}).then( async (count) => {
                if (count === 0) {
                    let beacon = new models.Peer({
                        name: beaconData.name,
                        type: 1,
                        additionalData
                    });
                    return await beacon.save().then((savedBeacon) => {
                        return [savedBeacon];
                    });
                } else {
                    return await models.Peer.find({$and: [{name: beaconData.name}, {type: 1}]}).then((beacon) => {
                        return beacon;
                    });
                }
            });
    }

    public getPeerData(peerIds): any {
        return models.Peer.find({id: peerIds.sender}).then((sender) => {
            return models.Peer.find({id: peerIds.receiver}).then((receiver) => {
                const peerData = {sender: sender, receiver: receiver};
                return peerData;
            });
        });

    }

    public getSinglePeerData(peerId): any {
        return models.Peer.find({id: peerId.sender}).then((sender) => {
            const peerData = sender;
            return peerData;
        });
    }

    private calculateDistance(location1, location2) {
        let R = 6371; // Radius of the earth in km
        let dLat = this.deg2rad(location2[1] - location1[1]);  // deg2rad below
        let dLon = this.deg2rad(location2[0] - location1[0]);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.deg2rad(location1[1])) * Math.cos(this.deg2rad(location2[1])) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c; // Distance in km
        return d;
      }

      private deg2rad(deg) {
        return deg * (Math.PI / 180);
      }
}
