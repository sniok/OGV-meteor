/*                     M O D E L _ F E E D . J S
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

/**
 * @file OGV/client/views/model_feed.js
 * @brief helpers and events for model feed
 *
 * Model Feed is a place where all the models by all the users are shown.
 * Model Feed is comprised of Model Posts, each Model Post is for one
 * model and further has Model View that shows representative image of the
 * model in model feed. Apart from these 3 sub parts model feed also contain
 * various social elements which are taken care of in other files such as
 * OGV/clients/views/social.js
 */

Template.modelFeed.helpers({
    /**
     * models helper finds all the models from the database and then sorts
     * them in reverse chronological order.
     */
    posts() {
        url = Router.current().url
        url = url.split('/')
        modelId = url.pop()
        const model = ModelFiles.find(modelId)
        if (model.count()) {
            return model
        }
        const currentUser = Meteor.user()
        const audience = ['public', 'followers']
        posts = Posts.find({
            audience: {
                $in: audience,
            },
            postedBy: {
                $in: currentUser.profile.following,
            },
        }, {
            sort: {
                postedAt: -1,
            },
        })

        if (posts.count()) {
            return posts
        }
        return false
    },
})

Template.modelPost.events({
    'click .shareButton': function () {
        sharedBy = Meteor.userId()
        sharedModel = $('.shareButton')[0].dataset.src
        modelOwner = ModelFiles.findOne(sharedModel).owner
        sharedObject = {
            owner: modelOwner,
            sharedBy,
            model: sharedModel,
        }
        Meteor.call('share', sharedObject, () => {
            if (error) {
                sAlert.error(error.reason)
            } else {
                sAlert.success('You shared model')
            }
        })
    },
})

Template.modelPost.helpers({
    /**
     * returns image of the user from database, if there's no image a default
     * image is shown.
     */
    userImg() {
        if (this.postType === 'posted') {
            modelOwner = Meteor.users.findOne(this.postedBy)
        } else if (this.postType === 'shared') {
            sharedModel = SharedModels.find({
                _id: this.postId,
            }).fetch()[0]
            modelOwner = Meteor.users.findOne(sharedModel.sharedby)
        } else if (this.converted) {
            const ownerId = ModelFiles.findOne(this._id).owner
            modelOwner = Meteor.users.findOne(ownerId)
        }
        picId = modelOwner.profile.pic
        if (picId) {
            pic = ProfilePictures.findOne(picId)
            picUrl = pic.url()
            return picUrl
        }
        return '/icons/User.png'
    },

    owner() {
        if (this.postType === 'posted') {
            return Meteor.users.findOne(this.postedBy)
        } else if (this.postType === 'shared') {
            sharedModel = SharedModels.find({
                _id: this.postId,
            }).fetch()[0]
            return Meteor.users.findOne(sharedModel.ownerId)
        } else if (this.converted) {
            const ownerId = ModelFiles.findOne(this._id).owner
            return Meteor.users.findOne(ownerId)
        }
    },

    sharedInfo() {
        if (this.postType === 'posted') {
            return false
        } else if (this.postType === 'shared') {
            sharedModel = SharedModels.find({
                _id: this.postId,
            }).fetch()[0]
            owner = Meteor.users.find({
                _id: this.postedBy,
            }).fetch()[0]
            model = ModelFiles.find({
                _id: sharedModel.model,
            }).fetch()[0]
            message = `<a href="/profile/${this.postedBy}"> ${owner.profile.name}</a> shared this model`
            return message
        }
    },

    model() {
        if (this.postType === 'posted') {
            model = ModelFiles.find({
                _id: this.postId,
                converted: true,
            }).fetch()
        } else if (this.postType === 'shared') {
            sharedModel = SharedModels.find({
                _id: this.postId,
            }).fetch()[0]
            model = ModelFiles.find({
                _id: sharedModel.model,
            }).fetch()
        } else if (this.converted) {
            model = ModelFiles.find({
                _id: this._id,
                converted: true,
            }).fetch()
        }
        return model[0]
    },
})
