var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});

router.get('/login', function(req, res, next) {
  
  res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local',{successRedirect: '/', failureRedirect:'login',failureFlash:'Invalid username and password'}),
  function(req, res) {
   
  req.flash('success', 'You are successfullly logged in');
  res.redirect('/');
});

passport.serializeUser(function(user, done) {
  //console.log(user);
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    //console.log("Hello "+id);
  User.getUserById( id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  //console.log(username);
  User.getByUsername(username,function(err,user){
    //console.log(user);
    if(err) throw err;
    //console.log(user);
    if(!user)
    { 
      return done(null,false,{message:'Unknown user'});
    }
    //console.log(user);
    User.checkPassword(password, user.password, function(err, isMatch){
      if(isMatch)
      { 
        //console.log('matched');
        return done(null,user);
      }
      else
      {
        done(null,false,{message:'Password does not match'})
      }
    })
  })

}));

router.post('/register', upload.single('profile_image') ,function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
  	console.log('Uploading File...');
  	var profileimage = req.file.filename;
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('cpassword','Passwords do not match').equals(req.body.password);

  // Check Errors
  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {
  		errors: errors
  	});
  } else{
  	console.log('No Errors');
  	var newUser = {
  		name:name,
  		username:username,
  		email:email,
  		password:password,
  		profileimage:profileimage,
  	};

  	User.createUser(req, newUser,function(err, user){
  		if(err) throw err;
  		
  	});
    req.flash('success','Thank you for registering')
  	res.location('/');
  	res.redirect('/');
  }
});

router.get('/logout', function(req, res, next){
  req.logout();
  req.flash('success','You are successfully logged out!');
  res.redirect('/users/login');
});


module.exports = router;