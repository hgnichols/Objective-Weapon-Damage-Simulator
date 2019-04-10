const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ClassSchema = new Schema({
    id: Number,
    name: String,
    availableRunes: Array
}, {collection: 'ClassData'});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("classschema", ClassSchema);