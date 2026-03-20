const mongoose = require("mongoose")

const hospitalSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    lat:Number,
    lng:Number,
    beds:Number,
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Hospital", hospitalSchema)