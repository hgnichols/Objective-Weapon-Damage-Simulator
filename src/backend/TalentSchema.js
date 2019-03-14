const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let TalentSchema = new Schema({
    id: Number,
    name: String,
    damageModifier: Number,
    modifierType: String,
    class: String,
    Weapons: String
}, {collection: 'TalentData'});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("talentschema", TalentSchema);