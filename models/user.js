var mongodb = require('mongodb')
var db = require('monk')('localhost/blog');
var bcrypt = require('bcryptjs');

module.exports.createUser = function(req, newUser, callback)
{	
	/*console.log(newUser);*/
	db = req.db;
	var users = db.get('users');
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
       newUser.password = hash;
       users.insert(newUser, callback);
    });
});
}

module.exports.getUserById = function(id,callback) {
		
		var users = db.get('users');
    	users.findById(id,callback);
	  }

module.exports.getByUsername = function(username, callback)
{	
	 console.log("This is "+username);
	//db = req.db;
	var users = db.get('users');
	
	var query = {username : username};
	users.findOne(query,callback);
}	  

module.exports.checkPassword = function(password, hash, callback)
{
	bcrypt.compare(password, hash , function(err, isMatch){
		callback(null, isMatch);
	});
}
//bcrypt.compareSync("B4c0/\/", hash);	  