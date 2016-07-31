var socket = io.connect();

function keySend(event){    // enter  sendMessage
	if(event.keyCode == 13){ 
		sendMyMessage();
	}
}
function sendMyMessage(){     // 发送消息 -- 处理
	var content = $("#msgIn").val();   //获取消息框数据
	if(content == ""){
		return;
	}
	socket.emit("say",content);   // 正常群聊 给服务器提交数据 提供处理
	$("#msgIn").val("");              //消息框置空
}
function ensure(){ 
   $("#chat-modal").modal("hide");
}

function showChatMsgs(){     // 获取聊天记录
   socket.emit("getChatList",$("#nickname span").html());     // 将用户名提交给服务器
}

socket.on("getChatListDone",function(datas){   //从服务器获取聊天记录
	//$(".chat-list").html("");
	//$(".chat-list").append("<div class='msg-wrap'><div class='msg-content'> ID  Time  Content </div></div>");

	var msg_list = $(".msg-list");
	for(var i=0;i<datas.length;i++){ 
		msg_list.append("<div class='bubble-box'><table>"+
			        "<tr>"+
			          "<td class='bubble-name'>"+datas[i].name+"</td>"+
			          "<td class='bubble-time'>"+datas[i].time+"</td>"+
			        "</tr>"+
			        "<tr>"+
			          "<td class='bubble-content' colspan='2'>"+datas[i].data+"</td>" +
			        "</tr>"+
			        "</table></div>"
			);
	}
	// 	var hei = msg_list.height();
	// msg_list.scrollTop(hei);
	var div = document.getElementById("msg-list");
	div.scrollTop = div.scrollHeight;
});

socket.on("connect",function(){   // 进入聊天室
	var userName = $("#nickname span").html();
	socket.send(userName);         // 向服务器发送自己的昵称
	console.log("send userName to server completed");
});

socket.on("userIn",function(data){
	var msg_list = $(".msg-list");
		msg_list.append(
		'<div class="msg-wrap"><div class="bubble-box bubble-system">'+data+'</div></div>'
	);
});
socket.on("userOut",function(data){
	var msg_list = $(".msg-list");
		msg_list.append(
		'<div class="msg-wrap"><div class="bubble-box bubble-system">'+data+'</div></div>'
	);
});
socket.on("system",function(data){
	var msg_list = $(".msg-list");
		msg_list.append(
		'<div class="msg-wrap"><div class="bubble-box bubble-system">'+data+'</div></div>'
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
	msg_list.append("<div class='bubble-box'><table>"+
	        "<tr>"+
	          "<td class='bubble-name'>"+name+"</td>"+
	          "<td class='bubble-time'>"+time+"</td>"+
	        "</tr>"+
	        "<tr>"+
	          "<td class='bubble-content' colspan='2'>"+content+"</td>" +
	        "</tr>"+
	        "</table></div>"
	);
	var div = document.getElementById("msg-list");
	div.scrollTop = div.scrollHeight;
	 //div.scrollTop = div.scrollHeight - div.clientHeight;
	// var div = $("#msg_list");
	// var hei = div.offsetHeight();
 //     div.scrollTop(hei);
});