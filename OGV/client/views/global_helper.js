Template.registerHelper('embeddedView', function(){
		var url = Router.current().url;
		var parts = url.split('=');
		var shared = parts.pop();
		if(shared == "true"){
			return true;
		}else{
			return false;
		}
	}
);

Template.registerHelper('loggedInUser', function(){
		var user = Meteor.user();
		var picId = user.profile.pic;
		var name = user.profile.name;
		if(picId){
			var picUrl = ProfilePictures.findOne(picId).url();
		} else {
			var picUrl = "/icons/User.png";
		}
 		var followings = user.profile.following;
 		var followers = user.profile.follower;
 		var modelsCount = ModelFiles.find({owner:user._id, converted: true}).count();
	
 		if(!followings){
 		    followingsCount = 0
 		} else {
 		    followingsCount = followings.length;
 		}
 		
 		if ( !followers ){
 		    followersCount = 0;
 		} else {
 		    followersCount = followers.length;  
 		}
		
 		return {
		   obj : user,
		   profilePic: picUrl,
		   username: name,
		   _id: user._id,
		   followingCount: followingsCount,
		   followerCount: followersCount,
		   modelsCount: modelsCount
		};
	}
);
