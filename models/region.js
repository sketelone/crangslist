const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//define region schema
const RegionSchema = new Schema({
    name: {type: String, required: true, minLength:3, maxLength:100},
    alias: {type: String, required: true, minLength:1, maxLength:3},
    sections: [{type: Schema.Types.ObjectId, ref: "Section"}],
})

//virtual for region URL
RegionSchema.virtual("url").get(function() {
    return `/${this.alias}`;
})

//export region model
module.exports = mongoose.model("Region", RegionSchema);