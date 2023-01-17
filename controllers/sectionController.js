const Section = require("../models/section");
const Region = require("../models/region");
const async = require("async")

//Display list of all sections
exports.section_list = (req,res,next) => {
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
                // console.log(result[0]._id)
                Section.find({region: result[0]._id})
                .sort([["name", "ascending"]])
                .populate("region")
                .exec( (err,results) => {
                    if (err) {
                        return next(err)
                    } if (results[0] == null) {
                        console.log("results are empty")
                        err = new Error("No sections found for this region.");
                        return next(err)
                    } else {
                        // console.log(results)
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
                keyword: "section",
                title: `${results[0].region[0].name}`,
                section_list: results,
                current_url: req.url,
            })
        }
    )
};

//Display detail page for specific section
// exports.section_detail = (req,res) => {
//     res.send("detail view for section")
// };

//Display section create for on GET
exports.section_create_get  = (req,res) => {
    res.send("section create form get method")
};

//Display section create on POST
exports.section_create_post = (req,res) => {
    res.send("section create form post method")
};

//Display section update for on GET
exports.section_update_get  = (req,res) => {
    res.send("section update form get method")
};

//Display section update on POST
exports.section_update_post = (req,res) => {
    res.send("section update form post method")
};
//Display section delete for on GET
exports.section_delete_get  = (req,res) => {
    res.send("section delete form get method")
};

//Display section delete on POST
exports.section_delete_post = (req,res) => {
    res.send("section delete form post method")
};
