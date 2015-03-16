window.onload = function() {

    var socket = io.connect('http://localhost:3700');
    var clientList = [];

    $("#name").show();
    $("#clients").hide();
    $("#conversations").hide();
    
    //joining of the client,sending his name to the database
    $("#join").click(function(){
      var name = $("#name").val();
      if (name != "") {
        $("#name").hide();
        $("#join").hide();
        $("#conversations").show();
        $("#clients").show();
        socket.emit("joinserver", name);
       }
       else
        alert("Enter name first");   
    });

    //Loadin the previous conversations that the person has had     
    socket.on('load_convo',function(data){
        $('#convo_list').append('<a href="#" class="list-group-item" data-uname="'+data+'"">'+data+'</a>');  
    });

    //Updating the clients online right now
    socket.on('clientupdate',function (people){
        var list = '';
        $("#clients").empty();
        $.each(people,function(a,obj){
            $("#clients").append('<li class="list-group-item" data-name="'+ obj.name+' " data-uid="'+obj.id +'">'+obj.name+'</li>' );
            clientList.push(obj.name);
            });
        $("#clients").append("</ul>");   
    });

    //Applying click event to the conversation list
    $(document).on('click','#convo_list a',function(){
        $('#convo_content').empty();
        socket.emit('convoClick',$(this).data("uname"));
    });

    //Applying the click event on the list of online clients
    $(document).on('click',"#clients li", function(){
        socket.emit('list_click',$(this).data("uid"));
    });

    //Opening the chat box for the clicked client  
    socket.on('chat_open',function(data){
        if(($('#chat_view'+data.uid)).length===0)  //check if chat_view exists or not
        {
            $("#chat_window").append('<br /><div id="chat_view'+data.uid+'">'+data.heading+'</div>');  //uses name to identify
            /*Input uses id to identif and the value of id is attached as data-id with send button */  
            $("#chat_window").append('<input type="text" id="'+data.uid+'"></input><button class="btn btn-success" id="chat_userID'+data.uid+'">Send</button>');
        }
    });
    
    //Sending the message to the server on clicking the send button 
    $(document).on("click", '#chat_window button', function(){
        var clicked_id = this.id.substring(11);
        var msg = document.getElementById(clicked_id);
        if(msg.value!=null)
            socket.emit('whisper',{message : msg.value , to : clicked_id});
        else
            alert("Enter your message first!");

    });
    
    socket.on('update_convo', function (data){
        var received = '';
        received = '<b>' + data.from + ':</b>' + data.msg + '<br />';
        $('#convo_content').append(received);
    });

    //Getting the message from server and updating the message box on client side     
    socket.on('update_chat', function (data){
        var received = '';
        received = '<b>' + data.from + ':</b>' + data.msg + '<br />';
        $('#chat_view'+data.socketid).append(received);
    }); 
}