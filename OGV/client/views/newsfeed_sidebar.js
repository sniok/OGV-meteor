Template.newsfeedSidebar.events({
    /**
    * Follow button functionality for suggested Users.
    */
    'click #followButton': function(e, t)
    {
	button = $('#followButton')[0];
	if(button.dataset.src){
		var otherId = button.dataset.src;
	} else{
        	var parts = location.href.split('/');
	        var otherId = parts.pop(); //id of user whose page is being visited
    	}
        var currentUser = Meteor.user(); //user who is using OGV at that moment     
        
        //updates "following" array of currentUser
        Meteor.users.update(currentUser._id, {$addToSet: {"profile.following": otherId}}, function(error, res) {
            if (error) {
            sAlert.error(error.reason);
            } else {
            //updates "follower" array of other user
            Meteor.users.update(otherId, {$addToSet: {"profile.follower": currentUser._id}}, function(error, res) {
                if (error) {
                    sAlert.error(error.reason);
                } else {
                    sAlert.success("You are now following this user");
                }
            });
            }
        });
    }
});

Template.newsfeedSidebar.items = function() {
  return popular_Models();
};

Template.newsfeedSidebar.helpers({
    /**
    * Returns user info of other user
    * All users excluding the ones who are being already followed and the user himself
    * Sorted on the basis of number of Models.
    * Users having highest number of models will be displayed on top.
    */
    suggestownerInfo: function()
    {
        var currentUser = Meteor.user();
        return Meteor.users.find( {$and: [{"profile.follower": {$not: currentUser._id}}, {_id: {$not: currentUser._id}}]}, {sort:{"profile.follower":-1}, limit: 1});
    },

    /**
    * Returns image details of the same users in the same order as mentioned above.
    */
    suggestownerImg: function()
    {
        var currentUser = Meteor.user();
        var otherUser = Meteor.users.find( {$and: [{"profile.follower": {$not: currentUser._id}}, {_id: {$not: currentUser._id}}]}, {sort:{createdAt:-1}}).fetch();
        var picIds = _.pluck(otherUser, "_id");
        return ProfilePictures.find({user: {$in :picIds}}, {limit: 1});
    },

    /**
    * Returns models based on popularity be seeing the number of views.
    */
    suggestedModel: function()
    {
        var currentUser = Meteor.user();
        return ModelFiles.find({owner: {$not: currentUser._id}});
    },

    sharedModel: function() {
    	var currentUser = Meteor.user();
	model = SharedModels.find( {sharedby: {$in: currentUser.profile.following}}, {sort: {timeShared: -1}});
	
	if (model.count()) {
	    return model;
	} else {
	    return false;
	} 
    }

    
}); 

Template.shareTickr.helpers({
	'shareMessage': function(){
	    var userName = Meteor.users.findOne(this.sharedby).profile.name;
	    var ownerName = Meteor.users.findOne(this.ownerId).profile.name;
	    var modelName = ModelFiles.findOne(this.model).name;
	    var message = userName + " shared " + ownerName + "'s model " + modelName;
	    return message;
	}
});

Meteor.subscribe('popular_Models');

/**
* returns details about the current user to be displayed on the newsfeed
*/

