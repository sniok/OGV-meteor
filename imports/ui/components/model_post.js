import "./model_post.html";
import "./model_post.css";

Template.modelPost.events({
  "click .shareButton": function() {
    sharedBy = Meteor.userId();
    sharedModel = $(".shareButton")[0].dataset.src;
    modelOwner = ModelFiles.findOne(sharedModel).owner;
    sharedObject = {
      owner: modelOwner,
      sharedBy,
      model: sharedModel
    };
    Meteor.call("share", sharedObject, () => {
      if (error) {
        sAlert.error(error.reason);
      } else {
        sAlert.success("You shared model");
      }
    });
  },
  "click .commentButton": function(e) {
    $(e.target).parents(".post").find(".comments").slideToggle();
  }
});

Template.modelPost.helpers({
  /**
     * returns image of the user from database, if there's no image a default
     * image is shown.
     */
  userImg() {
    if (this.postType === "posted") {
      modelOwner = Meteor.users.findOne(this.postedBy);
    } else if (this.postType === "shared") {
      sharedModel = SharedModels.find({
        _id: this.postId
      }).fetch()[0];
      modelOwner = Meteor.users.findOne(sharedModel.sharedby);
    } else if (this.converted) {
      const ownerId = ModelFiles.findOne(this._id).owner;
      modelOwner = Meteor.users.findOne(ownerId);
    }
    picId = modelOwner.profile.pic;
    if (picId) {
      pic = ProfilePictures.findOne(picId);
      picUrl = pic.url();
      return picUrl;
    }
    return "/icons/User.png";
  },

  owner() {
    if (this.postType === "posted") {
      return Meteor.users.findOne(this.postedBy);
    } else if (this.postType === "shared") {
      sharedModel = SharedModels.find({
        _id: this.postId
      }).fetch()[0];
      return Meteor.users.findOne(sharedModel.ownerId);
    } else if (this.converted) {
      const ownerId = ModelFiles.findOne(this._id).owner;
      return Meteor.users.findOne(ownerId);
    }
  },

  sharedInfo() {
    if (this.postType === "posted") {
      return false;
    } else if (this.postType === "shared") {
      sharedModel = SharedModels.find({
        _id: this.postId
      }).fetch()[0];
      owner = Meteor.users
        .find({
          _id: this.postedBy
        })
        .fetch()[0];
      model = ModelFiles.find({
        _id: sharedModel.model
      }).fetch()[0];
      modelOwner = Meteor.users.findOne(sharedModel.sharedby);
      picId = modelOwner.profile.pic;
      if (picId) {
        pic = ProfilePictures.findOne(picId);
        picUrl = pic.url();
      } else {
        picUrl = "/icons/User.png";
      }
      message =
        `<a href="/profile/${this.postedBy}">` +
        `<img src="${picUrl}"> ${owner.profile.name}</a>` +
        ` shared <a href="/profile/${modelOwner._id}">` +
        `${modelOwner.profile.name}</a>'s model`;
      return message;
    }
  },

  model() {
    if (this.postType === "posted") {
      model = ModelFiles.find({
        _id: this.postId,
        converted: true
      }).fetch();
    } else if (this.postType === "shared") {
      sharedModel = SharedModels.find({
        _id: this.postId
      }).fetch()[0];
      model = ModelFiles.find({
        _id: sharedModel.model
      }).fetch();
    } else if (this.converted) {
      model = ModelFiles.find({
        _id: this._id,
        converted: true
      }).fetch();
    }
    return model[0];
  },

  lovers() {
    if (this.postId) {
      id = this.postId;
    } else {
      id = this._id;
    }
    loversObj = Lovers.findOne({
      postId: id
    });
    if (loversObj) {
      loversArray = loversObj.lovers;
      return loversArray.length;
    }
    return 0;
  }
});
