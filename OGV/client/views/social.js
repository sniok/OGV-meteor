/**
* Comments and its backend implementation
*/
Template.comment.helpers({
    submittedText: function() {
	return new Date(this.submitted).toString();
    }
});


Template.commentSubmit.events({
    'submit form': function(e, template) {
	e.preventDefault();
	    var $body = $(e.target).find('[name=body]');
	    if(this.converted){
		postId = this._id;
	    } else {
		postId = this.postId;
	   }
	    var comment = {
		body: $body.val(),
		postId: postId
	    };
    
	    Meteor.call('comment', comment, function(error, commentId) {
		if (error){
		    sAlert.error(error.reason);
		} else {
		    $body.val('');
		    var commentOnModel = Comments.findOne(commentId);
	    	ModelFiles.update(commentOnModel.postId, {$inc: {commentsCount: 1}});
		}
	   	
	   });
	    
    }
});


Template.commentBody.helpers({
    comments: function() 
    {
	var commentList = Comments.find({postId:this.postId});
	if (!commentList) commentList = Comments.find({postId:this.data._id});
	return commentList
    }
});


Template.comments.events({
    'click .comments-header':function(e,t)
    {
	console.log(e);
	$header = $(e.currentTarget);
	console.log($header);
	$content = $header.next();
	$content.slideToggle(500, function () {
	    $header.text(function () {
		return $content.is(":visible") ? "Hide Comments" : "Show Comments";
	    });
	});
    }
});

  
/**
* Likes and its backend implementation
*/      
Template.lovemeter.events({
    'click .lovemeter-wrapper':function(){
        var love = {
            postId: this.postId
        };
     	Meteor.call('love', love, function(error, loveId) {
		if (error){
		    sAlert.error(error.reason);
		}
	});
    }
});

Template.lovemeter.helpers({
    lovers: function(){
	if(this.postId){
		id = this.postId;
	} else {
		id = this._id;
	}
        loversObj = Lovers.findOne({postId: id});
        if(loversObj){
        loversArray = loversObj.lovers;
        return loversArray.length;
        } else{
            return 0;
        }
    }
});
