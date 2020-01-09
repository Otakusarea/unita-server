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

export class DataFactory {
    public static getInstance(): DataFactory {
        if (DataFactory.instance === null || DataFactory.instance === undefined) {
            DataFactory.instance = new DataFactory();
        }

        return DataFactory.instance;
    }

    private static instance: DataFactory;
    private colTechnologies: any;

    private constructor() {
    }

    public async createData() {
        const db = mongoose.connection;
        this.initPeerTypes(db);
        this.initMessageTypes(db);
        this.initFixedPeers(db);
    }

    public async initPeerTypes(db) {
        const beacon = new models.PeerType({
            id: 1,
            name: "Beacon",
        });

        models.PeerType.countDocuments({
            id: 1, name: "Beacon"}).then((count) => {
                if (count === 0) {
                    beacon.save();
                }
            });

        const user = new models.PeerType({
            id: 2,
            name: "User",
        });

        models.PeerType.countDocuments({
            id: 2, name: "User"}).then((count) => {
                if (count === 0) {
                    user.save();
                }
            });

        const broadcast = new models.PeerType({
            id: 0,
            name: "Broadcast",
        });

        models.PeerType.countDocuments({
            id: 0, name: "Broadcast"}).then((count) => {
                if (count === 0) {
                    broadcast.save();
                }
            });
    }

    public async initMessageTypes(db) {
        const unitaMessage = new models.MessageType({
            id: "0",
            name: "Unitamessage",
        });

        models.MessageType.countDocuments({
            id: "0", name: "Unitamessage"}).then((count) => {
                if (count === 0) {
                    unitaMessage.save();
                }
            });

        const textMessage = new models.MessageType({
            id: "1",
            name: "Textmessage",
        });

        models.MessageType.countDocuments({
            id: "1", name: "Textmessage"}).then((count) => {
                if (count === 0) {
                    textMessage.save();
                }
            });

        const commandMessage = new models.MessageType({
            id: "2",
            name: "Commandmessage",
        });

        models.MessageType.countDocuments({
            id: "2", name: "Commandmessage"}).then((count) => {
                if (count === 0) {
                    commandMessage.save();
                }
            });

        const urlMessage = new models.MessageType({
            id: "3",
            name: "Urlmessage",
        });

        models.MessageType.countDocuments({
            id: "3", name: "Urlmessage"}).then((count) => {
                if (count === 0) {
                    urlMessage.save();
                }
            });

        const tokenMessage = new models.MessageType({
            id: "4",
            name: "Tokenmessage",
        });

        models.MessageType.countDocuments({
            id: "4", name: "Tokenmessage"}).then((count) => {
                if (count === 0) {
                    tokenMessage.save();
                }
            });
    }

    public async initFixedPeers(db) {
        const broadcast = new models.Peer({
            name: "Broadcast",
            type: 0
        });

        models.Peer.countDocuments({
            name: "Broadcast", type: 0}).then((count) => {
                if (count === 0) {
                    broadcast.save();
                }
            });
    }
}
