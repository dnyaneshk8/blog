var express = require('express');
var router = express.Router();
var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');
var multer = require('multer');
var upload = multer({dest: './public/uploads'});

/* GET home page. */

router.get('/show/:id', function(req, res, next) {
		//console.log(req.pa)
		var db = req.db;
		var posts = db.get("posts");
		posts.findById(req.params.id, function(err, post){
			if (err){ res.send(err); }
			console.log(post);
			res.render('showpost', { title:post.title, post:post});
		})
});

router.get('/addpost', function(req, res, next) {
	var db = req.db;
	var categories = db.get('categories');
	categories.find({}, {}, function(err, categories){
		console.log(categories);
		res.render('addpost', { title:'Add post',categories:categories });
	});
});

router.post('/savepost',upload.single('mainimage'), function(req, res, next) {
	var title = req.body.title;
	var category = req.body.category;
	var author = req.body.author;
	var body = req.body.body;
	var date = new Date();

	if(req.file)
	{
		var image = req.file.filename;
	}else
	{
		var image = 'noImage.jpeg';
	}
	req.checkBody('title','Title should not be empty').notEmpty();
	req.checkBody('category','Category should not be empty').notEmpty();
	req.checkBody('author','Author should not be empty').notEmpty();
	req.checkBody('body','Please add content').notEmpty();
	var errors = req.validationErrors();

	if(errors)
	{	
		var db = req.db;
		var categories = db.get('categories');
		categories.find({}, {}, function(err, categories){
		res.render('addpost',{title:'Add post',errors : errors, categories:categories});
		});
	}
	else
	{
		var db = req.db;
		var posts = db.get('posts');
		posts.insert({
			title:title,
			category:category,
			author:author,
			body:body,
			date:date,
			image:image,

		},function(err, post){

			req.flash('success','Post added successfully');

			res.redirect('/');
		})
	}

	
});

router.post('/addcomment', function(req, res, next) {
	var name = req.body.name;
	var email = req.body.email;
	var body = req.body.body;
	var postid = req.body.postid;
	var date = new Date();


	req.checkBody('name','Name should not be empty').notEmpty();
	req.checkBody('email','Please add valid email address').isEmail();
	req.checkBody('body','Please add a comment').notEmpty();
	var errors = req.validationErrors();

	if(errors)
	{	
		var db = req.db;
		var posts = db.get('posts');
		posts.findById(postid, function(err, post){
		res.render('showpost',{title:post.title,errors : errors, post:post});
		});
	}
	else
	{	

		var comment = {
			name:name,
			email:email,
			body:body,
			date:date,

		}
		var db = req.db;
		var posts = db.get('posts');
		posts.update({
			_id:postid
		},{
			$push:{
				comments:comment
			}
		},function(err, post){

			req.flash('success','Comment added successfully');

			res.redirect('/posts/show/'+postid);
		})
	}

	
});

module.exports = router;