require('./db.js');
var mongoose = require('mongoose');
var chat = mongoose.model('Chat');

function create (data){
	
	var newchat= new chat();
	newchat.user =[{
		name : data.from,
		ts = new Date();
	},
	{
		name : data.to,
		ts : new Date();
	}]
	newchat.save(function(error,newpost){
		if(error)
			return error;
		else
			console.log("Data saved");
	});
}

function saveMsg (data){
	var updatechat = new chat();
	chat.update({
		$and: [
	    {$or: [{user1:data.to},{user2:data.to}]},
	    {$or:[{user1:data.from},{user2:data.from}]}
	    ]},

	    { $push: { 'from':data.from, 'to':data.to, 'body':data.msg}},
	    {upsert:true},
	    Function(err,result)
	    {
		    if(err)
			console.log("Failed to save to the database");
	    });
}	

