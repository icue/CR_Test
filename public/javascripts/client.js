
var socket = io.connect('http://localhost');
function wrapInfo(){   // 点击个人信息时方框外围
	$(".myInfo").addClass("wrapIt");
	var t = setTimeout(function(){ 
		$(".myInfo").removeClass("wrapIt");
	},1500);
	//clearTimeout(t);
}
function keySend(event){    // ctrl + enter  sendMessage
	if(event.ctrlKey && event.keyCode == 13){ 
		sendMyMessage();
	}
}
function sendMyMessage(){     // 发送消息 -- 处理
	var content = $("#msgIn").val();   //获取消息框数据
	
	if(content == ""){ 
		return;
	}
	if(content.substring(0,1) === '@' && content.indexOf(':') != -1){   //private message  format:  @user:
		var index = content.indexOf(':');
		if(content[index-1] != " "){
		var touser = content.substring(1,index);  //userName
		var content1 = content.substr(index+1);
		var fromuser = $("#nickname span").html();
	//	alert(touser+"   "+content1);
		socket.emit("say_private",fromuser,touser,content1);    //私聊
		}else{ 
			socket.emit("say",content);   // 正常群聊 给服务器提交数据 提供处理
		}
	}else{
	socket.emit("say",content);   // 正常群聊 给服务器提交数据 提供处理
	}
	$("#msgIn").val("");              //消息框置空
}
function ensure(){ 
   $("#chat-modal").modal("hide");
}

// quick-input
$(function(){  
	var T = setInterval(function(){ 
		var date = new Date();
	       var time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		$(".tip span").html(time);
	},1000);
	
	
	$(".quick-menu").on("click",function(event){   // 快捷信息拉取
		/* Act on the event */
		$("#msgIn").val($(event.target).text().substr(4));
	});
}); 

function showChatMsgs(){     // 获取聊天记录
   $("#chat-modal").modal("show");
   socket.emit("getChatList",$("#nickname span").html());     // 将用户名提交给服务器
}
socket.on("getChatListDone",function(datas){   //从服务器获取聊天记录
	$(".chat-list").html("");
	$(".chat-list").append("<tr class='row'><th class='col-sm-1'> ID </th><th class='col-sm-4'> Time </th><th class='col-sm-8'> Content </th></tr>");
	for(var i=0;i<datas.length;i++){ 
		$(".chat-list").append("<tr class='row'><td class='col-sm-1'>"+(i+1)+"</td><td class='col-sm-3'>"+datas[i].time+"</td><td class='col-sm-8'>"+datas[i].data+"</td></tr>");
	}
});

socket.on("connect",function(){   // 进入聊天室
	var userName = $("#nickname span").html();
	socket.send(userName);         // 向服务器发送自己的昵称
	console.log("send userName to server completed");
});

socket.on("userIn",function(data){ 
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+data+'</div></div>'
	);
});
socket.on("userOut",function(data){ 
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-system">'+data+'</div></div>'
	);
});
socket.on("system",function(data){ 
	var msg_list = $(".msg-list");
		msg_list.append( 
		'<div class="msg-wrap"><div class="msg-content msg-welcome">'+data+'</div></div>'
	);
});

socket.on("user_list",function(userList){    // 获取用户列表并展示
	$(".user-list").html("");

	for(var i=0;i<userList.length;i++){ 
		var sex = userList[i].sex, imgSrc;
		if(sex === 'girl'){ 
			imgSrc = "../images/girl.png";
		}else if(sex === 'boy'){ 
			imgSrc = "../images/boy.png";
		}
		$(".user-list").append("<tr class='row'><td class='col-sm-1'><img style='width:10px; height:20px;' src="+imgSrc+"></td><td class='col-sm-11 user-name' title='点此用户 可与其私聊哦~' onclick='toUser(this)'>"+userList[i].name+"</td></tr>");
	}
	var listCount = $(".user-list").find("tr").length;
	$("#list-count").text("当前在线：" + listCount + "人");
});

socket.on("user_say",function(name,time,content){    // 获取用户的聊天信息并显示于面板
	console.log("client:  "+name + "say :  "+content);
	var msg_list = $(".msg-list");
	msg_list.append( 
		'<div class="msg-wrap"><div class="msg-info"><span class="msg-name" title="点此用户 可与其私聊哦~" onclick="toUser(this)">'+name+' </span>'+
		'<span class="msg-time">'+time+' </span><span class="glyphicon glyphicon-bullhorn"></span></div>'+
		'<div class="msg-content">'+content+'</div></div>'
	);
	var hei = msg_list.height();
	msg_list.scrollTop(hei);
});