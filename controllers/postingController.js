const Posting = require("../models/posting");
const Category = require("../models/category");
const Section = require("../models/section");
const Region = require("../models/region");

const async = require("async");
const {body, validationResult} = require("express-validator");
const {DateTime} = require("luxon");
const posting = require("../models/posting");

//Display list of all postings
exports.posting_list = (req,res,next) => {
    async.waterfall(
        [
            function (callback) {
                //find region using alias in URL
                Region.findOne({alias: req.params.region})
                .populate("sections")
                .exec( (err, region) => {
                    if (err) {
                        return next(err)
                    } else {
                        // console.log("Region:" + region)
                        //match section using name in URL
                        var name = req.params.section.replace(/-/g, ' ').replace(/%/g, '/')
                        region.sections.forEach(section => {
                            if (section.name == name) {
                                // console.log("Section:" + section)
                                callback(null, section._id)
                            }
                        })
                    }
                }) 
            },
            //find all categories in section
            function (sectionId, callback) {
                Section.findById(sectionId)
                .populate("categories")
                .exec( (err, section) => {
                    if (err) {
                        return next(err)
                    } else {
                        //match category using name in URL
                        var name = req.params.category.replace(/-/g, ' ').replace(/_/g, '/')
                        // console.log(name)
                        section.categories.forEach(cat => {
                            // console.log(cat)
                            if (cat.name == name) {
                                // console.log("Category:" + cat)
                                callback(null, cat._id)
                            }
                        })
                    }
                }) 
            },
            //find all postings in category
            function (categoryId, callback) {
                Category.findById(categoryId)
                .populate({path: "postings", options: {sort: {"date":1}}})
                .exec( (err, category) => {
                    if (err) {
                        return next(err)
                    } else {
                        // console.log(category.postings.length + " posting(s) found")
                        callback(null, category)
                    }
                }) 
            },
        ],
        function (err, results) {
            if(err) {
                return next(err)
            }
            // console.log(results)
            //if no results, return error
            if (results == null) {
                err = new Error("No postings found for this category.");
                return next(err)
            }
            res.render("list", {
                keyword: "posting",
                title: `${results.name}`,
                posting_list: results.postings,
                current_url: req.url,
            })
        }
    )
};

//Display detail page for specific posting
exports.posting_detail = (req,res,next) => {
    Posting.findById(req.params.id)
    .exec(function(err, result) {
        if (err) {
            return next(err);
        }
        res.render("detail", {
            keyword: "posting",
            title: `${result.title} - $${result.price}`,
            posting: result,
            current_url: req.url,
        });
    })
};

//Display posting create for on GET
exports.posting_create_get  = (req,res,next) => {
    Region.find({}, "name")
    .populate({
        path: "sections", 
        populate: {path: "categories", options: {sort: {"name":1}}},
        options: {sort: {"name":1}}})
    .exec((err, results) => {
        if (err) {
            return next(err);
        }
        res.render("form-create", {
            keyword: "posting",
            title: "create new posting",
            regions: results,
        });    
    });
};

//Display posting create on POST
exports.posting_create_post = [
    //validate user input
    body("title").trim().isLength({min:1}).escape()
    .withMessage("posting title required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("category name has non-alphanumeric characters."),
    body("price").trim().isLength({min:1}).escape()
    .withMessage("posting price required.")
    .isInt({min:0})
    .withMessage("price must be greater than or equal to zero."),
    body("neighborhood").trim().optional({checkFalsy:true}).escape()
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("neighborhood has non-alphanumeric characters."),
    body("description").trim().optional({checkFalsy:true}).escape(),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        //create new posting
        const posting = new Posting({
            title: req.body.title,
            neighborhood: req.body.neighborhood,
            description: req.body.description,
            price: req.body.price,
        })

        //if errors, redisplay form with user input and errors
        if (!errors.isEmpty()) {
            console.log("There are errors!")
            Region.find({}, "name")
            .populate({
                path: "sections", 
                populate: {path: "categories", options: {sort: {"name":1}}},
                options: {sort: {"name":1}}})
            .exec((err, results) => {
                if (err) {
                    return next(err);
                }
                res.render("form-create", {
                    keyword: "posting",
                    title: "create new posting",
                    regions: results,
                    posting,
                    errors: errors.array(),
                });
            });
            return;
        } 
        //find region
        console.log("No errors!")
        Region.findById(req.body.region)
        .populate({
            path: "sections", 
            populate: {path: "categories"},
            })
        .exec((err, region) => {
            if (err) {
                return next(err);
            }
            //find section
            for (const section of region.sections) {
                if(section._id == req.body.section) {
                    var current_section = section;
                }
            };
            //find category
            for (const cat of current_section.categories) {
                if(cat._id == req.body.category) {
                    var current_cat = cat;
                }
            };

            //create new posting and add to category
            async.series(
                [
                    //create new posting
                    function(callback) {
                        posting.save(callback);
                    },
                    //assign posting to category
                    function(callback) {
                        current_cat.postings.push(posting);
                        current_cat.save(callback);
                    },
                ],
                (err) => {
                    if (err) {
                        return next(err);
                    }
                    //redirect to new posting page
                    res.redirect(region.url+current_section.url+current_cat.url+posting.url)
                }
            );
        });
    },
];

//Display posting delete for on GET
exports.posting_delete_get  = (req,res,next) => {
    {
        Posting.findById(req.params.id).exec((err, result) => {
            if (err) {
                return next(err);
            }
            res.render("form-delete", {
                keyword: "posting",
                title: `${result.title}`,
                posting: result,
            })
        });
    }
};

//Display posting delete on POST
exports.posting_delete_post = (req,res,next) => {
    Posting.findByIdAndDelete(req.body.postingid).exec((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/"+req.params.region+"/"+req.params.section+"/"+req.params.category);
    })
};

//Display posting update for on GET
exports.posting_update_get  = (req,res,next) => {
    async.parallel(
        {
            regions(callback) {
                Region.find({}, "name")
                .populate({
                    path: "sections", 
                    populate: {path: "categories", options: {sort: {"name":1}}},
                    options: {sort: {"name":1}}})
                .exec(callback)
            },
            posting(callback) {
                Posting.findById(req.params.id).exec(callback)
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            //render posting update form
            res.render("form-update", {
                keyword: "posting",
                title: "update posting",
                regions: results.regions,
                posting: results.posting,
            });
        },
    );
};

//Display posting update on POST
exports.posting_update_post = [
    //validate user input
    body("title").trim().isLength({min:1}).escape()
    .withMessage("posting title required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("category name has non-alphanumeric characters."),
    body("price").trim().isLength({min:1}).escape()
    .withMessage("posting price required.")
    .isInt({min:0})
    .withMessage("price must be greater than or equal to zero."),
    body("neighborhood").trim().optional({checkFalsy:true}).escape()
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("neighborhood has non-alphanumeric characters."),
    body("description").trim().optional({checkFalsy:true}).escape(),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        async.parallel(
            {
                //find original region
                region(callback) {
                    Region.findOne({alias: req.params.region})
                    .populate({
                        path: "sections", 
                        populate: {
                            path: "categories", 
                            populate: {path: "postings"}
                        },
                    })
                    .exec(callback)
                },
                posting(callback) {
                    Posting.findById(req.params.id).exec(callback);
                }
            },
            (err, results) => {
                if (err) {
                    return next(err);
                }
                //create new posting
                const posting = new Posting({
                    title: req.body.title,
                    neighborhood: req.body.neighborhood,
                    description: req.body.description,
                    price: req.body.price,
                    date_posted: results.posting.date_posted,
                    _id: results.posting._id,
                })
                //if errors, redisplay form with user input and errors
                if (!errors.isEmpty()) {
                    console.log("There are errors!")
                    Region.find({}, "name")
                    .populate({
                        path: "sections", 
                        populate: {path: "categories", options: {sort: {"name":1}}},
                        options: {sort: {"name":1}}
                    })
                    .exec((err, results) => {
                        if (err) {
                            return next(err);
                        }
                        //render posting update form
                        res.render("form-update", {
                            keyword: "posting",
                            title: "update posting",
                            regions: results,
                            posting: posting,
                        });
                        return;
                    });
                };

                //match origina section using name in URL
                var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/');
                for (const section of results.region.sections) {
                    if(section.name == name) {
                        var current_section = section;
                    };
                };
                //match category using name in URL
                name = req.params.category.replace(/-/g, ' ').replace(/_/g, '/');
                for (const cat of current_section.categories) {
                    if(cat.name == name) {
                        var current_cat = cat;
                    };
                };

                //update posting 
                Posting.findOneAndUpdate({_id: results.posting._id}, posting, {new: true}, (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    //check if category has changed
                    if (current_cat._id.toString() !== req.body.category) {
                        //remove posting from old category
                        var index = 0;
                        var i = 0;
                        console.log(result._id)
                        for (const post of current_cat.postings) {
                            console.log(post._id)
                            if (post._id.toString() == result._id.toString()) {
                                index = i;
                            }
                            i++;
                        }
                        current_cat.postings.splice(index,1)
                        current_cat.save((err) => {
                            if (err) {
                                return next(err);
                            }
                        });

                        //add posting to new category
                        //find new category
                        async.parallel(
                            {
                                region(callback) {
                                    Region.findById(req.body.region).exec(callback);
                                },
                                section(callback) {
                                    Section.findById(req.body.section).exec(callback);
                                },
                                cat(callback) {
                                    Category.findById(req.body.category).exec(callback);
                                },
                            },
                            (err, results) => {
                                if (err) {
                                    return next(err);
                                }
                                //add posting to category
                                results.cat.postings.push(result);
                                results.cat.save( (err) => {
                                    if (err) {
                                        return next(err);
                                    }
                                });
                                res.redirect(results.region.url+results.section.url+results.cat.url+result.url)
                            },
                        );
                    } else {
                        //redirect to posting
                        res.redirect(results.region.url+current_section.url+current_cat.url+result.url);
                    };
                });
            },
        );
    },
];