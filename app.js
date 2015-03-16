var express = require("express");

var app = express();
var port = 3700;
var io = require('socket.io').listen(app.listen(port));
var mongoose = require('mongoose');
var db = require('./public/db.js')(mongoose);

mongoose.connect('mongodb://localhost/avyamchat');
var people={};

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

io.sockets.on('connection', function (socket){
	socket.on('joinserver',function(name){
        var convoName=[];
		people[socket.id] = {name : name , id : socket.id};
		io.sockets.emit('clientupdate', people);
        db.conversations(name,function (names){
           convoName=names;
           for (var i = 0; i<convoName.length ; i++) {
                socket.emit('load_convo',convoName[i]);
            }
        });    
  	});
	
    socket.on('convoClick',function (data){
        calledBy=people[socket.id].name;
        calledIt=data;
        db.convoMessages(calledBy,calledIt,function (messages){
            for(var i=0;i<messages.length;i++)
            {
                if(people[socket.id].name==messages[i].from)
                    socket.emit('update_convo',{msg:messages[i].body,from:"Me"});
                else
                    socket.emit('update_convo',{msg:messages[i].body,from:messages[i].from});
            }    
        });
    });


	socket.on('whisper', function (data){
		var sender = people[socket.id].name;
		io.sockets.socket(data.to).emit('update_chat',{ msg : data.message , from : sender , socketid : socket.id});
	    socket.emit('update_chat',{msg: data.message, from : 'Me' , socketid : data.to});
        db.saveMsg({to : people[data.to].name, from: people[socket.id].name, msg: data.message});
    });

    socket.on('list_click', function (data){
    	if(socket.id != data)
    	{    
    		var title1 = '<span class="label label-info">'+people[data].name + '</span><br />'; 
    		var title2 = '<span class="label label-info">'+people[socket.id].name + '</span><br / ';
    		socket.emit('chat_open',{uid : data, heading : title1});
            io.sockets.socket(data).emit('chat_open',{uid : socket.id, heading : title2});
            db.findChat({from : people[data].name,to:people[socket.id].name});
        }    
    });

});

app.get("/", function(req, res){
    res.render("page");
});
console.log("Listening on port " + port);