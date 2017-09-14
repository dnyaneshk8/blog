var express = require('express');
var router = express.Router();
var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');
var multer = require('multer');
var post = require('../models/post.js');
var category = require('../models/category.js');
var upload = multer({dest: './public/uploads'});

/* GET home page. */

router.get('/show/:id', function(req, res, next) {
		//console.log(req.pa)
		console.log(post);
		post.getPost(req.params.id, function(err, post){
			if (err){ res.send(err); }
			console.log(post);
			res.render('showpost', { title:post.title, post:post});
		})
});

router.get('/addpost', function(req, res, next) {
	
	if(req.isAuthenticated())
	  {
	  	category.getCategories(req , function(err, categories){
		console.log(categories);
		res.render('addpost', { title:'Add post',categories:categories });
		});	
	  }
	else
	  {
	  	req.flash('error','Please login first');
	  	res.redirect('/users/login');
	  }	
});

router.get('/edit/:postid', function(req, res, next) {
	
	if(!req.isAuthenticated())
	  {

	  	req.flash('error','Please login first');
	  	res.redirect('/users/login');

	  }
	  	
	  	post.getPost(req.params.postid, function(err, record){
			if (err){ res.send(err); }
			category.getCategories(req , function(err, categories){
				
				res.render('editpost', { title:'Edit post',categories:categories,post:record });
			});
		})	 
});

router.post('/savepost',upload.single('mainimage'), function(req, res, next) {

	if(!req.isAuthenticated())
	  
	  {
	  	req.flash('error','Please login first');
	  	res.redirect('/users/login');
	  }

	post.validateFields(req, function(errors, record){
		
		if(errors)
		{	
			category.getCategories(req, function(err, categories){
			res.render('addpost',{title:'Add post',errors : errors, categories:categories});
			});
		}
		else
		{	
			if(req.file)
				{
					record.image = req.file.filename;
				}else
				{	
					record.image = 'noImage.jpeg';
				}
			post.addRecord(req,record, function(err, post){

				req.flash('success','Post added successfully');

				res.redirect('/');
			})
		}

	});

});

router.post('/update',upload.single('mainimage'), function(req, res, next) {

	if(!req.isAuthenticated())
	  
	  {
	  	req.flash('error','Please login first');
	  	res.redirect('/users/login');
	  }

	post.validateFields(req, function(errors, record){
		
		if(errors)
		{	
			category.getCategories(req, function(err, categories){
			res.render('editpost',{title:'Edit post',post:record, errors : errors, categories:categories});
			});
		}
		else
		{	
			if(req.file && req.file.filename)
				{	
					console.log('uploading file....')
					record.image = req.file.filename;
				}
				else
				{
					record.image = req.body.image;
				}
				console.log("form data is");
				console.log(record);	
			post.updateRecord(req,record, function(err, record){
				
				req.flash('success','Post updated successfully');

				res.redirect('/');
			})
		}

	});

});

router.post('/addcomment', function(req, res, next) {

	if(req.isAuthenticated())
	  {
	  	next();
	  }
	else
	  {
	  	req.flash('error','Please login first');
	  	res.redirect('/users/login');
	  }
	  
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
		post.addComment(req, postid, comment,function(err, post){

			req.flash('success','Comment added successfully');

			res.redirect('/posts/show/'+postid);
		})
	}

	
});

module.exports = router;