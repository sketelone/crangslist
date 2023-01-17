const Region = require("../models/region");

//Display list of all regions
exports.region_list = (req,res,next) => {
    Region.find()
    .sort([["name", "ascending"]])
    .exec( (err, results) => {
        if (err) {
            return next(err)
        }
        res.render("list", {
            keyword: "region",
            title: "crangslist",
            region_list: results,
        });
    });
};

//Display detail page for specific region
// exports.region_detail = (req,res) => {
//     res.send("detail view for region")
// };

//Display region create for on GET
exports.region_create_get  = (req,res) => {
    res.send("region create form get method")
};

//Display region create on POST
exports.region_create_post = (req,res) => {
    res.send("region create form post method")
};

//Display region update for on GET
exports.region_update_get  = (req,res) => {
    res.send("region update form get method")
};

//Display region update on POST
exports.region_update_post = (req,res) => {
    res.send("region update form post method")
};
//Display region delete for on GET
exports.region_delete_get  = (req,res) => {
    res.send("region delete form get method")
};

//Display region delete on POST
exports.region_delete_post = (req,res) => {
    res.send("region delete form post method")
};
