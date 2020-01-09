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

export class MessageController {

    public getAllMessagesAddressedToUserAndBroadcastedMessages(userId): any {
        return models.Message.find({$or: [{$or: [{sender: userId}, {communicationPartner: userId}]},
             {receiver: 0}]}).then((messages) => {
            return messages;
        });
    }

    public getAllMessagesFromContact(userId, contactId): any {
        return models.Message.find({$and: [{$or: [{sender: userId}, {communicationPartner: contactId}]},
             {$or: [{sender: contactId}, {communicationPartner: userId}]}]}).then((messages) => {
            return messages;
        });
    }

    public getAllBroadcastedMessages(): any {
        return models.Message.find({receiver: 0}).then((messages) => {
            return messages;
        });
    }

    public saveMessageToDB(messageData): any {
        let additionalData = {};
        let communicationPartner = {};
        for (let key in messageData) {
            if (key !== "headerMessageCode" && key !== "header" &&
             key !== "communicationPartnerUser" && key !== "communicationPartnerBroadcast" &&
             key !== "messageBody" && key !== "messageBodyRaw") {
                additionalData[key] = messageData[key];
            }
            if (key === "communicationPartnerUser") {
                additionalData["communicationPartner"] = messageData[key].id;
            }
            if (key === "communicationPartnerBroadcast") {
                additionalData["communicationPartner"] = messageData[key].id;
            }
        }
        const message = new models.Message({
            headerMessageCode: messageData.header.headerMessageCode,
            sender: messageData.header.sender.id,
            receiver: messageData.header.receiver.id,
            message: messageData.messageBody.messageBody,
            messageRaw: messageData.messageBody.messageBodyRaw,
            additionalData
        });
        return message.save().then((savedMessage) => {
            return [savedMessage];
        });
    }
}
