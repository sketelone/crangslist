#! /usr/bin/env node

console.log('This script clears the database of all regions, sections, categories and postings to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Region = require('./models/region')
var Section = require('./models/section')
var Category = require('./models/category')
var Posting = require('./models/posting')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function deletePostings (cb) {
    Posting.deleteMany({}, function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("Postings deleted")
        cb(null)
    })
}

function deleteCategories (cb) {
    Category.deleteMany({}, function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("Categories deleted")
        cb(null)
    })
}

function deleteSections (cb) {
    Section.deleteMany({}, function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("Sections deleted")
        cb(null)
    })
}

function deleteRegions (cb) {
    Region.deleteMany({}, function(err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log("Regions deleted")
        cb(null)
    })
}

async.series([
    deletePostings,
    deleteCategories,
    deleteSections,
    deleteRegions,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



