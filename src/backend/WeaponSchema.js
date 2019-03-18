// /backend/data.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// this will be our data base's data structure 
let WeaponSchema = new Schema({
    id: Number,
    rarity: String,
    weapon: String,
    damage: Number,
    fireRate: Number,
    extraDamage: Number,
    canHeadshot: Boolean
}, {collection: 'WeaponData'});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("weaponschema", WeaponSchema);