Template.modelEditor.events({
   'click .obj-heading':function(e)
    {
	objId = this._id;
        controlDiv = e.currentTarget.nextElementSibling;
	$(controlDiv).slideToggle("fast");
    }
});

Template.modelEditor.helpers({
   object: function()
   {
	obj = OBJFiles.find({gFile: this._id});
	return obj;
   }
});
