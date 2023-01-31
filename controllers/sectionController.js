const Section = require("../models/section");
const Region = require("../models/region");
const async = require("async");
const {body, validationResult} = require("express-validator");
const region = require("../models/region");

//Display list of all sections
exports.section_list = (req,res,next) => {
    //find region using alias in URL
    Region.findOne({alias: req.params.region})
    .populate({path: "sections", options: {sort: {"name":1}}})
    .exec( (err, result) => {
        if (err) {
            return next(err)
        } 
        //if no sections found, show error
        if (result == null) {
            err = new Error("No sections found for this region.");
            return next(err)
        }

        //else render list view
        res.render("list", {
            keyword: "section",
            title: `${result.name}`,
            section_list: result.sections,
            current_url: req.url,
        });
    })
};

//Display section create for on GET
exports.section_create_get  = (req,res,next) => {
    Region.find({}, "name").sort([["name", "ascending"]]).exec((err, results) => {
        if (err) {
            return next(err);
        }
        res.render("form-create", {
            keyword: "section",
            title: "create new section",
            regions: results,
        });    
    });
};

//Display section create on POST
exports.section_create_post = [
    //validate user input
    body("name").trim().isLength({min:1}).escape()
    .withMessage("section name required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("section name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        //create new section
        const section = new Section({
            name: req.body.name,
        })

        //if errors, redisplay form with user input and errors
        if (!errors.isEmpty()) {
            console.log("There are errors!")
            Region.find({}, "name").sort([["name", "ascending"]]).exec((err, results) => {
                if (err) {
                    return next(err);
                }
                res.render("form-create", {
                    keyword: "section",
                    title: "create new section",
                    regions: results,
                    region_selected: req.body.region, 
                    section,
                    errors: errors.array(),
                });
            });
            return;
        } 
        //find region
        Region.findById(req.body.region)
        .populate("sections")
        .exec((err, region) => {
            if (err) {
                return next(err);
            }
            //if section exists, redirect to existing section
            for (const section of region.sections) {
                if(section.name == req.body.name) {
                    res.redirect(region.url+section.url);
                    return;
                }
            };
            //if section does not exist
            async.series([
                //create new section
                function(callback) {
                    section.save(callback);
                },
                //assign section to region
                function(callback) {
                    region.sections.push(section);
                    region.save(callback);
                },
                ],
                (err) => {
                    if (err) {
                        return next(err);
                    }
                    //redirect to new section page
                    res.redirect(region.url+section.url)
                }
            )
        });
    },
];

//Display section delete for on GET
exports.section_delete_get = (req,res,next) => {
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
                        //NOTE: is this else loop necessary?
                        //match section using name in URL
                        var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/')
                        region.sections.forEach(section => {
                            if (section.name == name) {
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
                        callback(null, section)
                    }
                }) 
            },
        ],
        (err, result) => {
            if (err) {
                return next(err);
            }
            res.render("form-delete", {
                keyword: "section",
                title: `${result.name}`,
                section: result,
                category_count: result.categories.length,
            })

        }
    )
};

//Display section delete on POST
exports.section_delete_post = (req,res,next) => {
    Section.findByIdAndDelete(req.body.sectionid).exec((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/"+req.params.region);
    })
};

//Display section update for on GET
exports.section_update_get  = (req,res,next) => {
    Region.findOne({alias: req.params.region})
    .populate("sections")
    .exec( (err, region) => {
        if (err) {
            return next(err)
        } else {
            //match section using name in URL
            var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/')
            region.sections.forEach(section => {
                if (section.name == name) {
                    res.render("form-update", {
                        keyword: "section",
                        title: "update section",
                        region: region,
                        section: section,
                    });
                };
            });
        };
    });
};

//Display section update on POST
exports.section_update_post = [
    //validate user input
    body("name").trim().isLength({min:1}).escape()
    .withMessage("section name required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("section name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        async.parallel(
            {
                region(callback) {
                    Region.findById(req.body.regionid).exec(callback);
                },
                section(callback) {
                    Section.findById(req.body.sectionid).exec(callback);
                }
            },
            (err, results) => {
                if (err) {
                    return next(err);
                }
                //create new section
                const section = new Section({
                    name: req.body.name,
                    categories: results.section.categories,
                    _id: results.section._id,
                })

                //if errors, redisplay form with user input and errors
                if (!errors.isEmpty()) {
                    console.log("There are errors!")
                    res.render("form-update", {
                        keyword: "section",
                        title: "update section",
                        region: results.region,
                        section: results.section,
                    });
                    return;
                };

                //update section and redirect to section page
                Section.findOneAndUpdate({_id: results.section._id}, section, {new: true}, (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(results.region.url+result.url)
                });

            },
        );
    },
];