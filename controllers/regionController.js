const Region = require("../models/region");
const {body, validationResult} = require("express-validator");
const async = require("async");

//Display list of all regions
exports.region_list = (req,res,next) => {
    //find all regions
    Region.find()
    .sort([["name", "ascending"]])
    .exec( (err, results) => {
        if (err) {
            return next(err)
        }
        //render list view
        res.render("list", {
            keyword: "region",
            title: "crangslist",
            region_list: results,
        });
    });
};

//Display region create form on GET
exports.region_create_get  = (req,res) => {
    res.render("form-create", {
        keyword: "region",
        title: "create new region"
    })
};

//Display region create on POST
exports.region_create_post = [
    /*TODO: add custom validator that returns an error if 
    alias already exists?*/
    //validate and sanitize user input
    body("name", "region name required").trim().isLength({min:1}).escape()
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("region name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),
    body("alias", "region alias required").trim().isLength({min:1}).escape()
    .isAlphanumeric()
    .withMessage("region alias has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);

        //create region from user input
        const region = new Region({
            name: req.body.name,
            alias: req.body.alias,
        })

        //if errors, redisplay form with input and errors
        if (!errors.isEmpty()) {
            res.render("form-create", {
                keyword: "region",
                title: "create new region",
                region,
                errors: errors.array(),
            });
            return;
        } else {
            //check if region exists
            Region.findOne({
                $or: [
                    {name: req.body.name},
                    {alias: req.body.alias},
                ],
            })
            .exec((err, found_region) => {
                if (err) {
                    return next(err);
                }
                //if yes, redirect to existing region
                if (found_region) {
                    res.redirect(found_region.url);
                } else {
                    //if no, save and redirect to region page
                    region.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        res.redirect(region.url);
                    });
                }
            })
        }
    },
];

//Display region delete for on GET
exports.region_delete_get  = (req,res,next) => {
    Region.findOne({alias:req.params.region}).populate("sections").exec((err, result) => {
        if (err) {
            return next(err);
        }
        res.render("form-delete", {
            keyword: "region",
            title: `${result.name}`,
            region: result,
            section_count: result.sections.length,
        })
    });
};

//Display region delete on POST
exports.region_delete_post = (req,res,next) => {
    Region.findByIdAndDelete(req.body.regionid).exec((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    })
};

//Display region update for on GET
exports.region_update_get  = (req,res,next) => {
    Region.findOne({alias:req.params.region})
    .exec((err, result) => {
        if (err) {
            return next(err);
        }
        res.render("form-update", {
            keyword: "region",
            title: "update region",
            region: result,
        })
    });
};

//Display region update on POST
exports.region_update_post = [
    //validate and sanitize user input
    body("name", "region name required").trim().isLength({min:1}).escape()
    .isAlphanumeric('en-US', {ignore:" -"})
    .withMessage("region name has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),
    body("alias", "region alias required").trim().isLength({min:1}).escape()
    .isAlphanumeric()
    .withMessage("region alias has non-alphanumeric characters.")
    .customSanitizer((val) => {
        //make lowercase
        return val.toLowerCase()
    }),

    //process request
    (req, res, next) => {
        //extract errors
        const errors = validationResult(req);
        //find region
        Region.findById(req.body.regionid).exec( (err, result) => {
            if (err) {
                return next(err);
            }
            //create region from user input
            const region = new Region({
                name: req.body.name,
                alias: req.body.alias,
                sections: result.sections,
                _id: result.id,
            })

            //if errors, redisplay form with input and errors
            if (!errors.isEmpty()) {
                res.render("form-update", {
                    keyword: "region",
                    title: "update region",
                    region,
                    errors: errors.array(),
                });
                return;
            } else {
                //update region and redirect to region page
                Region.findOneAndUpdate({_id: region._id}, region, {new: true}, (err, result) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect(result.url)
                });

            };
        })
    },
];
