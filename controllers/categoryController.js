const async = require("async")
const Category = require("../models/category");
const Section = require("../models/section");
const Region = require("../models/region");


//Display list of all categories
exports.category_list = (req,res,next) => {
    async.waterfall(
        [
            function (callback) {
                Region.find({alias: req.params.region}).exec( (err, result) => {
                    if (err) {
                        return next(err)
                    } else {
                        // console.log(result)
                        callback(null, result)
                    }
                }) 

            },
            function (result, callback) {
                var name = req.params.section.replace(/-/g, ' ')
                Section.find({region: result[0]._id, name: name}).exec( (err, result) => {
                    if (err) {
                        return next(err)
                    } else {
                        console.log("First result:" + result)
                        callback(null, result)
                    }
                }) 

            },
            function (result, callback) {
                console.log(result[0]._id)
                Category.find({section: result[0]._id})
                .sort([["name", "ascending"]])
                .populate("section")
                .exec( (err,results) => {
                    if (err) {
                        return next(err)
                    }
                    if (results[0] == null) {
                        console.log("results are empty")
                        err = new Error("No categories found for this section.");
                        return next(err)
                    } else {
                        console.log(results)
                        callback(null, results)
                    }
                })
                
            },
        ],
        function (err, results) {
            if(err) {
                return next(err)
            }
            res.render("list", {
                keyword: "category",
                title: `${results[0].section[0].name}`,
                category_list: results,
                current_url: req.url,
            })
        }
    )
};

//Display detail page for specific category
// exports.category_detail = (req,res) => {
//     res.send("detail view for category")
// };

//Display category create for on GET
exports.category_create_get  = (req,res) => {
    res.send("category create form get method")
};

//Display category create on POST
exports.category_create_post = (req,res) => {
    res.send("category create form post method")
};

//Display category update for on GET
exports.category_update_get  = (req,res) => {
    res.send("category update form get method")
};

//Display category update on POST
exports.category_update_post = (req,res) => {
    res.send("category update form post method")
};
//Display category delete for on GET
exports.category_delete_get  = (req,res) => {
    res.send("category delete form get method")
};

//Display category delete on POST
exports.category_delete_post = (req,res) => {
    res.send("category delete form post method")
};
