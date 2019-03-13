const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RuneSchema = new Schema({
    id: Number,
    name: String,
    damageModifier: Number,
    modifierType: String,
    icon: String
}, {collection: 'RuneData'});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("runeschema", RuneSchema);