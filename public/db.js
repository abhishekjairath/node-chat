module.exports = function (mongoose){
var chatSchema = new mongoose.Schema({
	user1 : {
		name : String,
		ts : Date
	},
	user2 : {
		name : String,
		ts : Date
	},
	messages : [{
		from : String,
		to : String,
		body : String,
		timestamp : Date
	}]
});


var chat = mongoose.model('Chat',chatSchema);
var names=[];

var conversations=function(data,callback){
	    names.length=0;
	    chat.find({$or:[{"user1.name":data},{"user2.name":data}]},function(err,res){
	    	for(var i=0;i<res.length;i++){
	    		if(res[i].user1.name!==data)
		        	names.push(res[i].user1.name); 
		        else 
	                names.push(res[i].user2.name); 
	                
	        }
	        callback(names);        	         
	    });
	}

var convoMessages=function (calledby,calledit,callback){
	chat.find({$and: [
               {$or: [{"user1.name":calledby},{"user2.name":calledby}]},
               {$or:[{"user1.name":calledit},{"user2.name":calledit}]}
               ]},
               function(err,res){
            	/*  for(var i=0;i<res[0].messages.length;i++){
            		messages.from=res[0].messages[i].from;
            		messages.to=res[0].messages[i].from;
            		messages.msg=res[0].messages[i].body;
            	   }*/
            	callback(res[0].messages);     
            });
}

function create (data){
	var newchat= new chat();
		newchat.user1 ={
		    name : data.from,
		    ts : new Date()
	    };
	    newchat.user2 ={
		    name : data.to,
		    ts : new Date()
	    };
    	newchat.save(function(error,newpost){
	    	if(error)
		    	return error;
		    else
		    	console.log("Data saved");
	    });	
}

var findChat = function(data){
	chat.find({$and: [
               {$or: [{"user1.name":data.to},{"user2.name":data.to}]},
               {$or:[{"user1.name":data.from},{"user2.name":data.from}]}
               ]},
            function(err,chatDoc){
	    	if(chatDoc.length){
	    		return chatDoc; 
	    	}
	    	else
	    	{ 
	    	    create(data);
	    	    return 0;
	    	}    
	});
}	


function saveMsg (data){
	var updatechat = new chat();
	chat.update({$and: [
               {$or: [{"user1.name":data.to},{"user2.name":data.to}]},
               {$or:[{"user1.name":data.from},{"user2.name":data.from}]}
               ]},
               {$push:{messages: {from:data.from, to:data.to, body:data.msg, timestamp:new Date()}}},
                {upsert:true},
	    function(err,result)
	    {
		    if(err)
			console.log("Failed to save to the database");
		    else
		    console.log('from '+data.from+' to '+data.to+' body '+data.msg);
	    });
}
 
 return{
 	saveMsg:saveMsg,
 	findChat:findChat,
 	create:create,
 	conversations:conversations,
 	convoMessages:convoMessages
}	
}