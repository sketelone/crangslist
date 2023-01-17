const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//define category schema (e.g. furniture)
const CategorySchema = new Schema({
    name: {type: String, require: true, minLength: 3, maxLength: 100},
    section: [{type: Schema.Types.ObjectId, ref: "Section"}],
})

//virtual for category URL
CategorySchema.virtual("url").get(function() {
    return `/${this.name.replace(/\s/g, '-')}`;
});

//export category model
module.exports = mongoose.model("Category", CategorySchema);