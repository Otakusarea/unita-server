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

import * as bodyParser from "body-parser";
import * as Express from "express";
import * as http from "http";
import { Connection } from "../database";
import uuidv4 = require("uuid/v4");
import models from "../models";
import { DataFactory } from "../database/dataFactory";
import fs = require("fs");
import multer = require("multer");
import sftpStorage = require("multer-sftp");
import { Socket } from "../websockets";
import { PeerController } from "../controller";
import { PeerTypeController } from "../controller";
import * as mkdirp from "mkdirp";
import * as RestInterfaceConfig from "./restInterfaceConfig";
import {MessageController} from "../controller/messageController";
require("dotenv").config();

export default class Server {
    private server: any;
    private app: any;
    private database: any;
    private socket: Socket;
    private peerController: PeerController;
    private peerTypeController: PeerTypeController;
    private messageController: MessageController;

    constructor() {
        this.app = Express();
        this.server = new http.Server(this.app);
        this.database = Connection.getInstance();
        this.socket = new Socket(this.server);

        this.peerController = new PeerController();
        this.peerTypeController = new PeerTypeController();
        this.messageController = new MessageController();

        const upload = multer();

        const Client = require("ssh2-sftp-client");
        let sftp = new Client();

        this.app.use(require("body-parser").urlencoded({extended : true}));
        this.app.use(require("body-parser").json());

        this.app.use(require("body-parser").json({ limit: "5mb" }));
        this.app.use(require("body-parser").raw({ type: "audio/wav", limit: "5mb" }));

        this.app.use((req, res, next) => {
            req.context = {
              models
            };
            next();
        });

        this.database.connectDb().then(async (connection) => {
            this.server.listen(process.env.PORT, () => {
                const dir = process.env.ROOT + process.env.NODE_PATH + "/public/uploads/";

                mkdirp(dir, function(err) {
                    if (err) {
                        console.error(err);
                    }  else {
                        console.log("Directory created!");
                    }
                });

                console.log("Server runs on Port: " + process.env.PORT + " " + process.env.ROOT);
            });
        });

        this.app.get("/", function(req, res) {
            res.sendFile(process.env.NODE_PATH + "/index.html", { root : process.env.ROOT});
        });

        this.app.get("/js/*", function(req, res) {
            let jspth = req.url;
            let js = process.env.NODE_PATH + jspth;
            res.sendFile(js, { root : process.env.ROOT});
        });

        this.app.get("/assets/icons/*", function(req, res, path) {
            let iconpth = req.url;
            let icon = process.env.NODE_PATH + iconpth;
            res.sendFile(icon, { root : process.env.ROOT});
        });

        this.app.post(RestInterfaceConfig.loginUser, async (req, res) => {
            if (req.body !== undefined || req.body !== null) {
                this.peerController.loginUser(req.body);
                res.json({status: 0, message: "Shared successfully"});
            } else {
                res.json({status: 1, message: "Sharing failed"});
            }
        });

        this.app.get(RestInterfaceConfig.getAllMessages + "/:id", async (req, res) => {
            if (req.params.id !== undefined || req.params.id !== null) {
                this.messageController.getAllMessagesAddressedToUserAndBroadcastedMessages(req.params.id).
                    then((messages) => {
                        res.json(messages);
                });
            } else {
                res.json({status: 1, message: "Get messages failed"});
            }
        });

        this.app.get(RestInterfaceConfig.getAllBroadcastMessages, async (req, res) => {
            if (req.body !== undefined || req.body !== null) {
                this.messageController.getAllBroadcastedMessages();
                res.json({status: 0, message: "Get messages successfully"});
            } else {
                res.json({status: 1, message: "Get messages failed"});
            }
        });

        this.app.get(RestInterfaceConfig.getAllMessagesFromContact, async (req, res) => {
            if (req.body !== undefined || req.body !== null) {
                this.messageController.getAllMessagesFromContact(req.body.userId, req.body.contactId);
                res.json({status: 0, message: "Get messages successfully"});
            } else {
                res.json({status: 1, message: "Get messages failed"});
            }
        });
    }

}
