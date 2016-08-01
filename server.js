var server = require('socket.io')();
var clients = new Array();  // 存储所有客户端 socket 和 name
function getTime(){   // 获取时间格式
	var date = new Date();
	var time = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	return time;
}

function storeContent(_name,_content,_time){       // 保存聊天记录
	var Content = global.db_handle.getModel('content');  
	Content.create({ 
		name: _name,
		data:_content,
		time:_time
	},function(err,doc){ 
		if(err){ 
			console.log(err);
		}else{ 
			console.log("store content :  success ");
		}
	});
}
				// 获取上线的用户
// function getOnlineUser(ssocket){
// var User = global.db_handle.getModel('user');  
//        User.find({status: "online"},function(err,docs){ 
//        	if(err){ 
//        		console.log(err);
//        	}else{ 
//        		console.log('users list --default: '+docs);
//        		// 因为是回调函数  socket.emit放在这里可以防止  用户更新列表滞后
//        		ssocket.broadcast.emit('user_list',docs);   		//更新用户列表
//        		ssocket.emit('user_list',docs);   		//更新用户列表
      			
//        	}
//        });
// }

server.on('connection',function(socket){   // server listening
	console.log('socket.id '+socket.id+ ':  connecting');  // console-- message
    // getOnlineUser(socket);	//获取在线用户
      
					// 构造用户对象client
	var client = { 
		Socket: socket,
		name: '----'
	};

	socket.on("message",function(name){ 
			client.name = name;                    // 接收user name
			clients.push(client);                     //保存此client
			console.log("client-name:  "+client.name);
			socket.broadcast.emit("userIn","system@: 【"+client.name+"】-- a newer ! Let's welcome him ~");
	});
	socket.emit("system","system@:  Welcome ! Now chat with others"); 

	//广播客户传来的数据并处理
	socket.on('say',function(content){         // 群聊阶段
		console.log("server: "+client.name + "  say : " + content);
		//置入数据库
		var time = getTime();
		socket.emit('user_say',client.name,time,content);
		socket.broadcast.emit('user_say',client.name,time,content);
		storeContent(client.name,content,time);   //保存聊天记录
	});


	socket.on("getChatList",function(uname){    //获取客户端用户名并从数据库拉取 聊天记录
		var Content =global.db_handle.getModel('content');
		Content.find({},function(err,docs){ 
			if(err){ 
				console.log(err);
			}else{     // 将docs 聊天记录返回给客户端处理
				socket.emit("getChatListDone",docs);
				console.log(uname+"  正在调取聊天记录");
				//console.log(docs);
			}
		});
	});

	socket.on('disconnect',function(){ 	  // Event:  disconnect
		var Name = "";       
		for(var n in clients){                       
			if(clients[n].Socket === socket){     // get socket match
				Name = clients[n].name;
			}
		}
		statusOffline(Name,socket);         // status  -->  set down
		
		socket.broadcast.emit('userOut',"system@: 【"+client.name+"】 leave ~");
		console.log(client.name + ':   disconnect');

	});
});
function statusOffline(uname,ssocket){    //注销  下线处理
	var User = global.db_handle.getModel('user');  
	User.update({name:uname},{$set: {status: 'offline'}},function(err,doc){ 
		if(err){ 
			console.log(err);
		}else{ 
			console.log(uname+ " logged out.");
			// getOnlineUser(ssocket);    // 放在内部保证顺序
		}
	});
}
exports.listen = function(charServer){    
	return server.listen(charServer);    // listening 
};