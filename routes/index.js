var express = require('express');
var router = express.Router();
var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');

/* GET home page. */
router.get('/', function(req, res, next) {  
	var db = req.db;
	var posts = db.get('posts');
	posts.find({}, {sort:{date:-1}}, function(err, posts){
		//console.log(posts);
		res.render('index', { title:'Blog', posts:posts });
	});

  
});

module.exports = router;
