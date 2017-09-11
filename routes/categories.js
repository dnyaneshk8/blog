var express = require('express');
var router = express.Router();
var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');

/* GET home page. */
router.get('/addcategory', function(req, res, next) {
	
		res.render('addcategory', { title:'Add category'});
	
});

router.get('/show/:category', function(req, res, next) {
		//console.log(req.pa)
		var db = req.db;
		var posts = db.get("posts");
		posts.find({category:req.params.category}, {}, function(err, posts){
			if (err){ res.send(err); }
			res.render('index', { title:req.params.category, posts:posts});
		})
});

router.post('/savecategory', function(req, res, next) {
	var name = req.body.name;
	
	req.checkBody('name','Name should not be empty').notEmpty();
	
	var errors = req.validationErrors();

	if(errors)
	{
		res.render('addcategory', { title:'Add category'});
	}
	else
	{	
		var db = req.db;
		var category = db.get('categories');
		category.insert({
			name:name,
		},function(err, category){

			req.flash('success','Category added successfully');

			res.redirect('/');
		})
	}

	
});

module.exports = router;