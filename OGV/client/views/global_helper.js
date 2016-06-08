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
		var picUrl = ProfilePictures.findOne(picId).url();
		return {
		   obj : user,
		   profilePic: picUrl,
		   username: name,
		   _id: user._id
		};
	}
);
