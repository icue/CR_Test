var socket = io.connect();

function enterSend(event){    // enter  sendMessage
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

function showChatMsgs(){     // 获取聊天记录
   socket.emit("getChatList",$("#nickname span").html());     // 将用户名提交给服务器
}

function msgAppend(msg_list,name,time,content){
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
}

function scrollbarToBottom(){
	var div = document.getElementById("msg-list");
	div.scrollTop = div.scrollHeight;
}

socket.on("getChatListDone",function(datas){   //从服务器获取聊天记录
	var msg_list = $(".msg-list");
	for(var i=0;i<datas.length;i++){ 
		msgAppend(msg_list,datas[i].name,datas[i].time,datas[i].data);
	}
	scrollbarToBottom();
});

socket.on("connect",function(){   // 进入聊天室
	var userName = $("#nickname span").html();
	socket.send(userName);         // 向服务器发送自己的昵称
	console.log("send userName to server completed");
});

socket.on("userStatus",function(data){
	var msg_list = $(".msg-list");
		msg_list.append(
		'<div class="msg-wrap"><div class="bubble-box bubble-system">'+data+'</div></div>'
	);
	scrollbarToBottom();
});

socket.on("user_say",function(name,time,content){    // 获取用户的聊天信息并显示于面板
	console.log("client:  "+name + "say :  "+content);
	msgAppend($(".msg-list"),name,time,content);
	scrollbarToBottom();
});