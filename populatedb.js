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

function regionCreate(name, alias, sections, cb) {
  regiondetail = { 
    name: name,
    alias: alias,
  }
  if (sections != false) regiondetail.sections = sections

  var region = new Region(regiondetail);
       
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

function sectionCreate(name, categories, cb) {
  sectiondetail = { 
    name: name,
  }
  if (categories != false) sectiondetail.categories = categories

  var section = new Section(sectiondetail);
       
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

function categoryCreate(name, postings, cb) {
  categorydetail = { 
    name: name,
  }
  if (postings != false) categorydetail.postings = postings

  var category = new Category(categorydetail);
       
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

function postingCreate(title, description, price, cb) {
  postingdetail = { 
    title: title,
    description: description,
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
          regionCreate('east los angeles', 'ela', sections[0], callback);
        },
        function(callback) {
          regionCreate('west los angeles', 'wla', sections[1], callback);
        },
        function(callback) {
          regionCreate('san gabriel valley', 'sgv', sections.slice(2,4), callback);
        },
        function(callback) {
          regionCreate('san fernando valley', 'sfv', sections.slice(4), callback);
        }
        ],
        // optional callback
        cb);
}


function createSections(cb) {
    async.series([
        function(callback) {
          sectionCreate('for sale', categories[0], callback);
        },
        function(callback) {
          sectionCreate('for sale', [categories[2], categories[3]], callback);
        },
        function(callback) {
          sectionCreate('for sale', false, callback);
        },
        function(callback) {
          sectionCreate('housing', categories[4], callback);
        },
        function(callback) {
          sectionCreate('housing', categories.slice(5,-1), callback);
        },
        function(callback) {
          sectionCreate('jobs', categories[8], callback);
        },
        function(callback) {
          sectionCreate('community', false, callback);
        },
        function(callback) {
          sectionCreate('for sale', categories[0], callback);
        }
        ],
        // optional callback
        cb);
}


function createCategories(cb) {
  console.log(postings)
    async.series([
        function(callback) {
          categoryCreate('antiques', postings[0], callback)
        },
        function(callback) {
          categoryCreate('antiques', false, callback)
        },
        function(callback) {
          categoryCreate('instruments', postings[1], callback)
        },
        function(callback) {
          categoryCreate('furniture', false, callback)
        },
        function(callback) {
          categoryCreate('apartments', postings[2], callback)
        },
        function(callback) {
          categoryCreate('apartments', postings[2], callback)
        },
        function(callback) {
          categoryCreate('sublets/temporary', false, callback)
        },
        function(callback) {
          categoryCreate('vacation rentals', false, callback)
        },
        function(callback) {
          categoryCreate('creative', postings[3], callback)
        }
        ],
        // Optional callback
        cb);
}

function createPostings(cb) {
  async.parallel([
      function(callback) {
        postingCreate('Mid-Century Modern Table', 'MOVING SALE - all items must go by Saturday 1/21', 275, callback)
      },
      function(callback) {
        postingCreate('Moog Grandmother', 'Selling my like new Moog Grandmother. Just not using it as much as I should! $900 obo', 900, callback)
      },
      function(callback) {
        postingCreate('2b+2ba Mar Vista', 'Must-see 2b+2ba in Mar Vista for rent! Hardwood floors, AC and heating, washer dryer in unit. Open house Sunday 1/22.', 3100, callback)
      },
      function(callback) {
        postingCreate('Graphic Designer', 'Seeking a graphic designer to help us design our merch! We are a non-profit organization helping educate the community about pixies. Pay negotiable.', 1500, callback)
      }
      ],
      // Optional callback
      cb);
      console.log(postings)
}



async.series([
    createPostings,
    createCategories,
    createSections,
    createRegions,    
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



