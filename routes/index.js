var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.route("/login").get(function(req,res){    
    res.render("login",{title:'User Login'});
}).post(function(req,res){
    //get User info
    var User = global.db_handle.getModel('user');
    var uname = req.body.uname;                //获取post上来的 data数据中 uname的值
    User.findOne({name:uname},function(err,doc){   //通过此model以用户名的条件 查询数据库中的匹配信息       
        if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
            res.send(500);
            console.log(err);
        }else if(!doc){                                 //查询不到用户名匹配信息，则用户名不存在
            	User.create({                             // 创建一组user对象置入model
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
  //           	User.findOne({name:uname},function(err,doc){
  //           		if(err){                                         //错误就返回给原post处（login.html) 状态码为500的错误
		// 	            res.send(500);
		// 	            console.log(err);
		// 	        }else{
  // //res.render('home', {user: req.session.user});
		// 	        	req.session.user = doc;
	 //                    res.send(200);
		// 	        }
  //           	});
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
    req.session.user = null;  //clean the current session
    req.session.error = null;
    res.redirect("/");
});

module.exports = router;