#! /usr/bin/env node

console.log('This script populates some test postings, categories, regions and sections to the database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/?retryWrites=true&w=majority');

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

var regions = []
var sections = []
var categories = []
var postings = []

function regionCreate(name, alias, cb) {

  var region = new Region({ name: name, alias: alias });
       
  region.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Region: ' + region);
    regions.push(region)
    cb(null, region)
  });
}

function sectionCreate(name, region, cb) {

  var section = new Section({ name: name, region: region});
       
  section.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Section: ' + section);
    sections.push(section)
    cb(null, section);
  });
}

function categoryCreate(name, section, cb) {

  var category = new Category({ name: name, section: section});
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  });
}

function postingCreate(title, description, price, category, cb) {
  postingdetail = { 
    title: title,
    description: description,
    category: category,
  }
  if (price != false) postingdetail.price = price
    
  var posting = new Posting(postingdetail);    
  posting.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Posting: ' + posting);
    postings.push(posting)
    cb(null, posting)
  });
}

function createRegions(cb) {
    async.series([
        function(callback) {
          regionCreate('east los angeles', 'ela', callback);
        },
        function(callback) {
          regionCreate('west los angeles', 'wla', callback);
        },
        function(callback) {
          regionCreate('san gabriel valley', 'sgv', callback);
        },
        function(callback) {
          regionCreate('san fernando valley', 'sfv', callback);
        }
        ],
        // optional callback
        cb);
}


function createSections(cb) {
    async.parallel([
        function(callback) {
          sectionCreate('for sale', regions[0], callback);
        },
        function(callback) {
          sectionCreate('for sale', regions[1], callback);
        },
        function(callback) {
          sectionCreate('housing', regions[0], callback);
        },
        function(callback) {
          sectionCreate('jobs', regions[0], callback);
        },
        function(callback) {
          sectionCreate('community', regions[0], callback);
        },
        function(callback) {
          sectionCreate('for sale', regions[2], callback);
        }
        ],
        // optional callback
        cb);
}


function createCategories(cb) {
    async.parallel([
        function(callback) {
          categoryCreate('antiques', sections[0], callback)
        },
        function(callback) {
          categoryCreate('instruments', sections[0], callback)
        },
        function(callback) {
          categoryCreate('furniture', sections[1], callback)
        },
        function(callback) {
          categoryCreate('apartments', sections[2], callback)
        },
        function(callback) {
          categoryCreate('sublets/temporary', sections[2], callback)
        },
        function(callback) {
          categoryCreate('vacation rentals', sections[2], callback)
        },
        function(callback) {
          categoryCreate('creative', sections[3], callback)
        }
        ],
        // Optional callback
        cb);
}

function createPostings(cb) {
  async.parallel([
      function(callback) {
        postingCreate('Mid-Century Modern Table', 'MOVING SALE - all items must go by Saturday 1/21', 275, categories[0], callback)
      },
      function(callback) {
        postingCreate('Moog Grandmother', 'Selling my like new Moog Grandmother. Just not using it as much as I should! $900 obo', 900, categories[1], callback)
      },
      function(callback) {
        postingCreate('2b+2ba Mar Vista', 'Must-see 2b+2ba in Mar Vista for rent! Hardwood floors, AC and heating, washer dryer in unit. Open house Sunday 1/22.', 3100, categories[3], callback)
      },
      function(callback) {
        postingCreate('Graphic Designer', 'Seeking a graphic designer to help us design our merch! We are a non-profit organization helping educate the community about pixies. Pay negotiable.', 1500, categories[6], callback)
      }
      ],
      // Optional callback
      cb);
}



async.series([
    createRegions,
    createSections,
    createCategories,
    createPostings
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Postings: '+postings);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



