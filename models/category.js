const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//define category schema (e.g. furniture)
const CategorySchema = new Schema({
    name: {type: String, required: true, minLength: 3, maxLength: 100},
    postings: [{type: Schema.Types.ObjectId, ref: "Posting"}],
});

//virtual for category URL
CategorySchema.virtual("url").get(function() {
    return `/${this.name.replace(/\s/g, '-').replace(/\//g, '_')}`;
});

//export category model
module.exports = mongoose.model("Category", CategorySchema);