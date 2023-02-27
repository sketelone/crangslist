const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//define section schema (e.g. for sale, housing)
const SectionSchema = new Schema({
    name: {type: String, required: true, minLength:3, maxLength:100},
    categories: [{type: Schema.Types.ObjectId, ref: "Category"}],
});

//virtual for section URL
SectionSchema.virtual("url").get(function() {
    return `/${this.name.replace(/\s/g, '-').replace(/\//g, '_')}`;
})

//export section model
module.exports = mongoose.model("Section", SectionSchema);