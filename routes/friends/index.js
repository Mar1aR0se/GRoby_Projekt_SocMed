var User =  require('../../database_models/user_model')


exports.register = function(plugin,options,next){
	plugin.route([
		{
			method: "GET",
			path: "/friends",
			config: {
				auth: "session",
				handler: function(request,reply){
					console.log("getting latest changes");
					User.find({"email": {$ne: request.auth.credentials.user}},function(err,users){
						reply.view("friends",{user_friends: users})
					});
				}
			}
		},
		{
			method: "POST",
			path: "/friend_request",
			config: {
				auth: "session",
				handler: function(request,reply){
					 User.find({"email": request.auth.credentials.user}, function(err,user){
					 		console.log("user",user[0].user_profile[0].profile_pic)
							User.find({"member_id": request.payload.friend_member_id}, function(err,sending_user){
								sending_user[0].update({$push: {"friend_requests": {"friend_email": request.auth.credentials.user ,"member_id": request.auth.credentials.member_id,"friend_name": request.auth.credentials.name,"profile_pic": user[0].user_profile[0].profile_pic}}},function(err){
									reply('Friend Request Successfully Sent')
								});
							});
					});				  
				}
			}
		},
		{
			method: "POST",
			path: "/accept_friend_request",
			config: {
				auth: "session",
				handler: function(request,reply){
					User.find({"email": request.auth.credentials.user}, function(err,user){
						console.log("member_id",request.payload.member_id)
						User.find({"member_id": request.payload.member_id}, function(err,accepted_friend_user){
								user[0].update({$push: {"friends": {"friend_email": accepted_friend_user[0].email,"member_id": accepted_friend_user[0].member_id,"friend_name": accepted_friend_user[0].name,"profile_pic": accepted_friend_user[0].user_profile[0].profile_pic}},$pull: {"friend_requests": {member_id: request.payload.member_id}}},
												function(err){
													console.log("err",err)
												}
				
								);

								accepted_friend_user[0].update({$push:{"friends": {"friend_email": request.auth.credentials.user,"member_id": user[0].member_id,"friend_name": user[0].name,"profile_pic": user[0].user_profile[0].profile_pic}}},
										function(err){
											console.log("err",err)
										}
								);

							reply('You have accepted a friend request');
						});
					});
								  
				}
			}
		},
		{
			method: "POST",
			path: "/reject_friend_request",
			config: {
				auth: "session",
				handler: function(request,reply){
					User.find({"email": request.auth.credentials.user}, function(err,user){
								user[0].update({$pull: {"friend_requests": {member_id: request.payload.member_id}}},
												function(err){
													reply(200)
												}
												
								);
					});
								  
				}
			}
		}

	]);
	next();
}

exports.register.attributes = {
	pkg: require("./package.json")
};