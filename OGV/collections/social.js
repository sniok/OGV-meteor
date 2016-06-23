/*                     S O C I A L . J S
 * BRL-CAD
 *
 * Copyright (c) 1995-2013 United States Government as represented by
 * the U.S. Army Research Laboratory.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 2.1 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this file; see the file named COPYING for more
 * information.
 */

/** @file OGV/client/views/social.js
 *  @brief Collections required for the social functionality of OGV
 */

commentSchema = new SimpleSchema({
	author: {
		type:String
	},
	body: {
		type: String
	},
	postId: {
		type: String
	},
	submitted: {
		type: Number
	},
	userId: {
		type: String
	}
});

loverSchema = new SimpleSchema({
	lovers: {
		type: Array
	},
	"lovers.$": {
		type: String
	},
	postId: {
		type: String
	},
	submitted: {
		type: Number
	}
});

shareSchema = new SimpleSchema({
	ownerId: {
		type:String
	},
	model: {
		type:String
	},
	sharedby: {
		type:String
	}
});

Comments = new Meteor.Collection('comments');
Lovers = new Meteor.Collection('lovers');
SharedModels = new Meteor.Collection('sharedModels');

Comments.attachSchema(commentSchema);
Lovers.attachSchema(loverSchema);
SharedModels.attachSchema(shareSchema);

Meteor.methods({
    /**
     * Adds new comment to post 
     */
    share: function(shareAttributes){
	var user = Meteor.user();
	
	if(!user) { 
		throw new Meteor.Error(401, "You need to login to make comments");
	}
	var owner = shareAttributes.owner;
	var post = shareAttributes.model;
	var sharedBy = shareAttributes.sharedBy;
	
	SharedModels.insert({owner: owner, sharedby: sharedBy, model: post});

    
	if(user._id != owner){
		Notifications.insert({
		    user: sharedBy,
		    ownerId: owner,
		    modelId: post,
		    type: "share",
		    seen: false,
		    timeNotified: new Date()
		});
	}
	

    },

    comment: function(commentAttributes) {
	var user = Meteor.user();
	var post = ModelFiles.findOne(commentAttributes.postId);
	
	/** 
	 * Validations before adding comments.
	 */
	if (!user) {
	    throw new Meteor.Error(401, "You need to login to make comments");
	}
	
	if (!commentAttributes.body) {
	    throw new Meteor.Error(422, 'Please write some content');
	}	
	
	if (!post) {
	    throw new Meteor.Error(422, 'You must comment on a post');
	}
	
	modelId = commentAttributes.postId;
        ownerId = post.owner;
	if(user._id != ownerId){
		Notifications.insert({
		    user: user._id,
		    ownerId: ownerId,
		    modelId: modelId,
		    type: "comment",
		    seen: false,
		    timeNotified: new Date()
		});
	}
	comment = _.extend(_.pick(commentAttributes, 'postId', 'body'), {
	    userId: user._id,
	    author: user.profile.name,
	    submitted: new Date().getTime()
        });

	return Comments.insert(comment);
    },
    
    /**
     * Adds one to lovemeter
     */
    love: function(loveAttributes){
	var lovers = [];
	var alreadyLoved = false;
	var user = Meteor.user();

	lovers.push(user._id);
        
	var post = ModelFiles.findOne(loveAttributes.postId);
	var loversObj = Lovers.findOne({postId: loveAttributes.postId});

	if (!user) {
	    throw new Meteor.Error(401, "You need to login to love post");
	}
        
	if (!post) {
	    throw new Meteor.Error(422, 'You must love a post');
	}
       
        /**
	 * If someone has loved the post aka there's at least one love
	 * in the lovemeter then add 1 to it otherwise create new lovers
	 * Object in the database.
	 */

	if (loversObj) {
	    loversArray = loversObj.lovers;
 	    
	    for (l in loversArray) {
		if (loversArray[l] == user._id) {
		    alreadyLoved = true;
		} 
	    }
	    /**
	     * If user already loves the post, then throw an error
	     */
            if(alreadyLoved) {  
                throw (new Meteor.Error(550,"you already love this"));
	    } else {
		loversArray.push(user._id);
		return Lovers.update({postId: loveAttributes.postId},{$set: {lovers: loversArray, countLovers: loversArray.length}}); // update lovers
            }

        } else {
	    modelId = loveAttributes.postId;
            ownerId = post.owner;
	    if(user._id != ownerId){
		    Notifications.insert({
			user: user._id,
			ownerId: ownerId,
			modelId: modelId,
			type: "love",
			seen: false,
			timeNotified: new Date()
		    });
	    }
		
	    love = _.extend(_.pick(loveAttributes, 'postId'), {
		lovers: lovers,
		submitted: new Date().getTime()
	    });
	    return Lovers.insert(love);
        }
    }
});
