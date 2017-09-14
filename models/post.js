var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');
var _ = require('lodash');

module.exports.getPost = function(id, callback)
{	
	console.log('reached here now');
	//var db = req.db;
	console.log("id in model is " + id);
	var posts = db.get("posts");
	posts.findById(id, function(err, post){
			if (err){ callback(err,null) }
			
			callback(null, post);
		})
}

module.exports.addRecord = function(req,post, callback)
{
		var db = req.db;
		post.slug = _.camelCase(post.title);
		post.addedBy = req.user.username;
		var posts = db.get('posts');
		posts.insert(post,callback);
}

module.exports.updateRecord = function(req,post, callback)
{		
		post.slug = _.camelCase(post.title);
		post.addedBy = req.user.username;
		console.log("reached to update " + req.postid);
		console.log(post);	
		var posts = db.get('posts');
		posts.update({
			_id:req.body.postid
		}, post,callback);
}

module.exports.addComment = function(req, postid, comment, callback)
{
	var db = req.db;
		var posts = db.get('posts');
		posts.update({
			_id:postid
		},{
			$push:{
				comments:comment
			}
		},callback);
}

module.exports.validateFields = function(req, callback)
{	
	var post = {};
	post.title = req.body.title;
	post.category = req.body.category;
	post.author = req.body.author;
	post.body = req.body.body;
	post.date = new Date();

	
	req.checkBody('title','Title should not be empty').notEmpty();
	req.checkBody('category','Category should not be empty').notEmpty();
	req.checkBody('author','Author should not be empty').notEmpty();
	req.checkBody('body','Please add content').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		callback(errors, post);
	}
	else
	{	

		callback(null, post);
	}
}