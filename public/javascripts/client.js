var socket = io.connect();

function enterSend(event){    // press enter to directly send message
	if(event.keyCode == 13){ 
		sendMyMessage();
	}
}

function sendMyMessage(){
	var content = $("#msgIn").val();
	if(content == ""){
		return;
	}
	socket.emit("say",content);
	$("#msgIn").val("");
}

function showChatHistory(){
   socket.emit("getChatHistory",$("#nickname span").html());
}

function msgAppend(msg_list,name,time,content){		//generate a msg box to display
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

socket.on("getChatHistoryDone",function(datas){
	var msg_list = $(".msg-list");
	for(var i=0;i<datas.length;i++){ 
		msgAppend(msg_list,datas[i].name,datas[i].time,datas[i].data);
	}
	scrollbarToBottom();
});

socket.on("connect",function(){
	var userName = $("#nickname span").html();
	socket.send(userName);
	console.log("Username sent to server.");
});

socket.on("userStatus",function(data){
	var msg_list = $(".msg-list");
		msg_list.append(
		'<div class="bubble-box bubble-system">'+data+'</div>'
	);
	scrollbarToBottom();
});

socket.on("userSay",function(name,time,content){
	console.log("[user]"+name + " [say]"+content);
	msgAppend($(".msg-list"),name,time,content);
	scrollbarToBottom();
});