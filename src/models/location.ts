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

import mongoose = require("mongoose");
import { Schema } from "mongoose";

const locationSchema: Schema = new mongoose.Schema({
    id: {
      type: Number,
      unique: false,
    },
    location: {
      type: {type: String},
      coordinates: {type: [Number]}
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
},
{
    strict: false
});

locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;
