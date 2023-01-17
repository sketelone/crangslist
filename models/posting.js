const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//define region schema
const PostingSchema = new Schema({
    title: {type: String, required: true, minLength:3, maxLength:100},
    description: {type:String, required: true},
    price: {type: Number},
    date_posted: {type: Date, default: Date.now},
    category: [{type: Schema.Types.ObjectId, ref: "Category"}],
});

//virtual for posting URL
PostingSchema.virtual("url").get(function() {
    return `/${this.id}`;
})

//export posting model
module.exports = mongoose.model("Posting", PostingSchema);