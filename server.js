var server = require('socket.io')();
var clients = new Array();

function addZeroToTime(t){
	return t<10 ? "0"+t : t;
} 

function getTime(){
	var date = new Date();
	return addZeroToTime(date.getMonth()+1)+"/"+addZeroToTime(date.getDate())+"/"+date.getFullYear()+" "+addZeroToTime(date.getHours())+":"+addZeroToTime(date.getMinutes())+":"+addZeroToTime(date.getSeconds());
}

function storeContent(_name,_content,_time){
	var Content = global.db_handle.getModel('content');  
	Content.create({ 
		name: _name,
		data:_content,
		time:_time
	},function(err,doc){ 
		if(err){ 
			console.log(err);
		}else{ 
			console.log("Content stored to database.");
		}
	});
}

server.on('connection',function(socket){
	console.log('socket.id '+socket.id+ ' is connecting.');

	var client = { 
		Socket: socket,
		name: 'unknown'
	};

	socket.on("message",function(uname){ 
		client.name = uname;
		clients.push(client);
		console.log("clientname is "+client.name+".");
		socket.broadcast.emit("userStatus","User "+client.name+" is now online!");
	}); 

	socket.on('say',function(content){		//broadcast what the user says
		console.log("[client]"+client.name + " [say]" + content);
		var time = getTime();
		socket.emit('userSay',client.name,time,content);
		socket.broadcast.emit('userSay',client.name,time,content);
		storeContent(client.name,content,time);
	});

	socket.on("getChatHistory",function(uname){
		var Content =global.db_handle.getModel('content');
		Content.find({}).sort({'_id':1}).exec(function(err,docs){ 
			if(err){ 
				console.log(err);
			}else{
				socket.emit("getChatHistoryDone",docs);
				console.log(uname+" is fetching chat history.");
				socket.emit("userStatus", "You're now online.");
			}
		});
	});

	socket.on('disconnect',function(){
		var nameLeft = "";       
		for(var n in clients){                       
			if(clients[n].Socket === socket){
				statusOffline(clients[n].name);
				break;
			}
		}
		socket.broadcast.emit('userStatus',"User "+client.name+" is now offline.");
		console.log(client.name + ' disconnected.');
	});
});

function statusOffline(uname){
	var User = global.db_handle.getModel('user');
	User.update({name:uname},{$set: {status: 'offline'}},function(err,doc){
		if(err){ 
			console.log(err);
		}else{ 
			console.log(uname+ " logged out.");
		}
	});
}

exports.listen = function(_server){    
	return server.listen(_server);
};