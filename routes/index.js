var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('login');
});

/* GET login page. */
router.route("/login").get(function(req,res){    
    res.render("login",{title:'User Login'});
}).post(function(req,res){
    var User = global.db_handle.getModel('user');
    var uname = req.body.uname;
    User.findOne({name:uname},function(err,doc){
        if(err){
            res.send(500);
            console.log(err);
        }else if(!doc){     //no such user yet
        	User.create({
            name: uname
            },function(err,doc){ 
                 if (err) {
                        res.send(500);
                        console.log(err);
                    } else {
                        req.session.error = 'New user created.';
                        req.session.user = doc;
                        statusOnline(uname);
                        res.send(200);
                    }
                  });
        }else{
            req.session.user = doc;
            statusOnline(uname);
            res.sendStatus(200);
        }
    });
});

function statusOnline(uname){
	var User = global.db_handle.getModel('user');
	User.update({name:uname},{$set: {status: 'online'}},function(err,doc){
		if(err){
			console.log(err);
		}else{
			console.log(uname+ " logged in.");
		}
	});
}

/* GET home page. */
router.get("/home",function(req,res){ 
    if(!req.session.user){
        req.session.error = "Please log in."
        res.redirect("/login");
    }
    res.render("home",{title:'Home',user:req.session.user});
});

/* GET logout page. */
router.get("/logout",function(req,res){ 
    req.session.user = null;
    req.session.error = null;
    res.redirect("login");
});

module.exports = router;