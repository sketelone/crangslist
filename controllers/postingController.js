const async = require("async");
const Posting = require("../models/posting");
const Category = require("../models/category");
const Section = require("../models/section");
const Region = require("../models/region");

//Display list of all postings
exports.posting_list = (req,res,next) => {
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
                        callback(null, result)
                    }
                }) 

            },
            function (result,callback) {
                var name = req.params.section.replace(/-/g, ' ')
                Category.find({name: name}).exec( (err, result) => {
                    if (err) {
                        return next(err)
                    } else {
                        callback(null, result)
                    }
                }) 

            },
            function (result, callback) {
                console.log("ID:" + result[0]._id)
                Posting.find({category: result[0]._id})
                .sort([["date", "ascending"]])
                .populate("category")
                .exec( (err,results) => {
                    if (err) {
                        return next(err)
                    }
                    if (results[0] == null) {
                        console.log("results are empty")
                        err = new Error("No postings found for this category.");
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
                keyword: "posting",
                title: `${results[0].category[0].name}`,
                posting_list: results,
            })
        }
    )
};

//Display detail page for specific posting
exports.posting_detail = (req,res) => {
    res.send("detail view for posting")
};

//Display posting create for on GET
exports.posting_create_get  = (req,res) => {
    res.send("posting create form get method")
};

//Display posting create on POST
exports.posting_create_post = (req,res) => {
    res.send("posting create form post method")
};

//Display posting update for on GET
exports.posting_update_get  = (req,res) => {
    res.send("posting update form get method")
};

//Display posting update on POST
exports.posting_update_post = (req,res) => {
    res.send("posting update form post method")
};
//Display posting delete for on GET
exports.posting_delete_get  = (req,res) => {
    res.send("posting delete form get method")
};

//Display posting delete on POST
exports.posting_delete_post = (req,res) => {
    res.send("posting delete form post method")
};
