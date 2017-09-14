var mongodb = require('mongodb');
var db = require('monk')('localhost/blog');

module.exports.getCategories = function(req, callback)
{
	var db = req.db;
	var categories = db.get('categories');
	categories.find({},{},function(err, categories){
		if(err){
			 callback(err, null);
		}
		callback(null, categories);
	});
}