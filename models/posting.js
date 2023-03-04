const mongoose = require("mongoose");
const {DateTime} = require("luxon");
const fs = require('fs')
const path = require('path')

const Schema = mongoose.Schema;

//define region schema
const PostingSchema = new Schema({
    title: {type: String, required: true, minLength:3, maxLength:100},
    neighborhood: {type: String, minLength:3, maxLength:100},
    description: {type:String},
    price: {type: Number, required: true},
    date_posted: {type: Date, default: Date.now},
    date_updated: {type: Date, default: Date.now},
    image: [{data: Buffer, contentType: String}],
});

//virtual for posting URL
PostingSchema.virtual("url").get(function() {
    return `/${this.id}`;
})

//virtual for posting date_posted for text
PostingSchema.virtual("date_posted_text").get(function() {
    return DateTime.fromJSDate(this.date_posted).toLocaleString(DateTime.DATE_MED);
})

//virtual for posting date_posted number of days ago
PostingSchema.virtual("date_posted_ago").get(function() {
    var start = DateTime.fromJSDate(this.date_posted);
    var end = DateTime.now();
    return Math.floor(end.diff(start, 'days').toObject().days);
})

//virtual for posting descriptions's unescaped summary
PostingSchema.virtual("description_text").get(function() {
    var temp = this.description.replace(/&#x27;/g, "'");
    temp = temp.replace(/&quot;/g, "\"");
    temp = temp.replace(/&amp;/g, "&");
    temp = temp.replace(/&lt;/g, "<");
    temp = temp.replace(/&gt;/g, ">");
    return temp;
});


//export posting model
module.exports = mongoose.model("Posting", PostingSchema);