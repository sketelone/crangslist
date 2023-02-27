const async = require("async")
const Category = require("../models/category");
const Section = require("../models/section");
const Region = require("../models/region");
const {body, validationResult} = require("express-validator");

//Display list of all categories
exports.category_list = (req,res,next) => {
    Region.findOne({alias: req.params.region})
    .populate({
        path: "sections", 
        populate: {path: "categories"}
    })
    .exec( (err, result) => {
        if(err) {
            return next(err)
        }
        //match section using name in URL
        var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/');
        for (const section of result.sections) {
            if(section.name == name) {
                var current_section = section;
            };
        };

        //else render list view
        res.render("list", {
            keyword: "category",
            title: `${current_section.name}`,
            category_list: current_section.categories,
            section: current_section,
            region: result,
        });
    });
};

//Display category create for on GET
exports.category_create_get  = (req,res,next) => {
    Region.find({}, "name")
    .populate({path: "sections", options: {sort: {"name":1}}})
    .exec((err, results) => {
        if (err) {
            return next(err);
        }
        res.render("form-create", {
            keyword: "category",
            title: "create new category",
            regions: results,
        });    
    });
};

//Display category create on POST
exports.category_create_post = [
    //validate user input
    body("name").trim().isLength({min:1}).escape()
    .withMessage("category name required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("category name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),
    body("region").trim().isLength({min:1}).escape()
    .withMessage("you must select a region."),
    body("section").trim().isLength({min:1}).escape()
    .withMessage("you must select a section."),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        //create new category
        const category = new Category({
            name: req.body.name,
        })

        //if errors, redisplay form with user input and errors
        if (!errors.isEmpty()) {
            console.log("There are errors!")
            Region.find({}, "name")
            .populate({path: "sections", options: {sort: {"name":1}}})
            .exec((err, results) => {
                if (err) {
                    return next(err);
                }
                res.render("form-create", {
                    keyword: "category",
                    title: "create new category",
                    regions: results,
                    category,
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
            //find section
            for (const section of region.sections) {
                if(section._id == req.body.section) {
                    var current_section = section;
                }
            };
            // console.log(current_section._id)
            Section.findById(current_section._id)
            .populate("categories")
            .exec((err, section) => {
                if (err) {
                    return next(err);
                }
                //if category exists, redirect to existing section
                for (const category of section.categories) {
                    if(category.name.toString() == req.body.name) {
                        console.log(region.url+section.url+category.url);
                        res.redirect(region.url+section.url+category.url);
                        return;
                    }
                };
                //if category does not exist
                async.series(
                    [
                        //create new category
                        function(callback) {
                            category.save(callback);
                        },
                        //assign category to section
                        function(callback) {
                            section.categories.push(category);
                            section.save(callback);
                        },
                    ],
                    (err) => {
                        if (err) {
                            return next(err);
                        }
                        //redirect to new category page
                        res.redirect(region.url+section.url+category.url)
                    }
                )
            })
        });
    },
];

//Display category delete for on GET
exports.category_delete_get = (req,res,next) => {
    Region.findOne({alias: req.params.region})
    .populate({
        path: "sections", 
        populate: {
            path: "categories", 
            populate: {path: "postings"}
        },
    })
    .exec( (err, result) => {
        if (err) {
            return next(err);
        }
        //match section using name in URL
        var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/');
        for (const section of result.sections) {
            if(section.name == name) {
                var current_section = section;
            };
        };
        //match using name in URL
        name = req.params.category.replace(/-/g, ' ').replace(/_/g, '/');
        for (const cat of current_section.categories) {
            if(cat.name == name) {
                var current_cat = cat;
            };
        };
        //render page
        res.render("form-delete", {
            keyword: "category",
            title:  "delete category",
            category: current_cat,
            section: current_section,
            region: result,
            posting_count: current_cat.postings.length,
        })
    });
};

//Display category delete on POST
exports.category_delete_post = (req,res,next) => {
    Category.findByIdAndDelete(req.body.categoryid).exec((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/"+req.params.region+"/"+req.params.section);
    })
};

//Display category update for on GET
exports.category_update_get  = (req,res,next) => {
    Region.findOne({alias: req.params.region})
    .populate({
        path: "sections", 
        populate: {
            path: "categories", 
            populate: {path: "postings"}
        },
        })
    .exec((err, region) => {
        if (err) {
            return next(err);
        }
        //match section using name in URL
        var name = req.params.section.replace(/-/g, ' ').replace(/_/g, '/');
        for (const section of region.sections) {
            if(section.name == name) {
                var current_section = section;
            };
        };
        //match category using name in URL
        name = req.params.category.replace(/-/g, ' ').replace(/_/g, '/');
        for (const cat of current_section.categories) {
            if(cat.name == name) {
                res.render("form-update", {
                    keyword: "category",
                    title: "update category",
                    region: region,
                    section: current_section,
                    category: cat,
                });
            };
        };
    });
};

//Display category update on POST
exports.category_update_post = [
    //validate user input
    body("name").trim().isLength({min:1}).escape()
    .withMessage("category name required.")
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("category name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),
    body("region").trim().isLength({min:1}).escape()
    .withMessage("you must select a region."),
    body("section").trim().isLength({min:1}).escape()
    .withMessage("you must select a section."),


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
                },
                cat(callback) {
                    Category.findById(req.body.categoryid).exec(callback);
                }
            },
            (err, results) => {
                if (err) {
                    return next(err);
                }
                //create new category
                const category = new Category({
                    name: req.body.name,
                    postings: results.cat.postings,
                    _id: results.cat._id,
                })

                //if errors, redisplay form with user input and errors
                if (!errors.isEmpty()) {
                    console.log("There are errors!")
                    res.render("form-update", {
                        keyword: "category",
                        title: "update category",
                        region: results.region,
                        section: results.section,
                        category: results.cat,
                    });
                    return;
                };

                //update category and redirect to category page
                Category.findOneAndUpdate({_id: results.cat._id}, category, {new: true}, (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(results.region.url+results.section.url+result.url)
                });
            },
        );
    },
];