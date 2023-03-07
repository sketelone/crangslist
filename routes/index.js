var express = require('express');
var router = express.Router();

const region_controller = require("../controllers/regionController");
const section_controller = require("../controllers/sectionController");
const category_controller = require("../controllers/categoryController");
const posting_controller = require("../controllers/postingController");

/* GET home page. */
router.get('/', region_controller.region_list);

/// CREATE ROUTES ///
//GET request to create region
router.get('/region/create', region_controller.region_create_get);
//POST request to create region
router.post('/region/create', region_controller.region_create_post);

//GET request to create section
router.get('/section/create', section_controller.section_create_get);
//POST request to create section
router.post('/section/create', section_controller.section_create_post);

//GET request to create category
router.get('/category/create', category_controller.category_create_get);
//POST request to create category
router.post('/category/create', category_controller.category_create_post);

//GET request to create posting
router.get('/posting/create', posting_controller.posting_create_get);
//POST request to create posting
router.post('/posting/create', posting_controller.posting_create_post);


///REGION ROUTES///
/* GET request to see region info */
router.get('/:region', section_controller.section_list);

//GET request to update region
router.get('/:region/update', region_controller.region_update_get);
//POST request to update region
router.post('/:region/update', region_controller.region_update_post);

//GET request to delete region
router.get('/:region/delete', region_controller.region_delete_get);
//POST request to delete region
router.post('/:region/delete', region_controller.region_delete_post);

///SECTION ROUTES///
/* GET request to see section info */
router.get('/:region/:section', category_controller.category_list);

//GET request to update section
router.get('/:region/:section/update', section_controller.section_update_get);
//POST request to update section
router.post('/:region/:section/update', section_controller.section_update_post);

//GET request to delete section
router.get('/:region/:section/delete', section_controller.section_delete_get);
//POST request to delete section
router.post('/:region/:section/delete', section_controller.section_delete_post);

///CATEGORY ROUTES///
//GET request to see category info
router.get('/:region/:section/:category', posting_controller.posting_list);

//POST request to search within category
router.post('/:region/:section/:category/search', posting_controller.posting_search);
//GET request to search within category
router.get('/:region/:section/:category/search', posting_controller.posting_list);

//GET request to update category
router.get('/:region/:section/:category/update', category_controller.category_update_get);
//POST request to update category
router.post('/:region/:section/:category/update', category_controller.category_update_post);

//GET request to delete category
router.get('/:region/:section/:category/delete', category_controller.category_delete_get);
//POST request to delete category
router.post('/:region/:section/:category/delete', category_controller.category_delete_post);

///POSTING ROUTES///
/* GET request to see posting info */
router.get('/:region/:section/:category/:id', posting_controller.posting_detail);

//GET request to update posting
router.get('/:region/:section/:category/:id/update', posting_controller.posting_update_get);
//POST request to update posting
router.post('/:region/:section/:category/:id/update', posting_controller.posting_update_post);

//GET request to delete posting
router.get('/:region/:section/:category/:id/delete', posting_controller.posting_delete_get);
//POST request to delete posting
router.post('/:region/:section/:category/:id/delete', posting_controller.posting_delete_post);

module.exports = router;
