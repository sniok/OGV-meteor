Template.modelEditor.events({
   'change .color-picker': function(e)
   {
	color = e.currentTarget.value;
	colorhex = color.replace('#', '0x');
	colorhex = parseInt(colorhex, 16);

	index = e.currentTarget.dataset.src;
	objFile = this._id;
	OBJFiles.update(objFile, {$set: {color: color}});
	OBJMaterialArray[index].color = new THREE.Color(colorhex);
   },

   'click .all-objs': function(e)
   {
	eyePath = $('.eye-img').attr('src');
	if(eyePath == "/icons/eye.png"){
	   $('.eye-img').attr("src","/icons/not-eye.png");
	   $('.white-eye-img').attr('src', '/icons/white-not-eye.png');

	   group.traverse( function(object) { object.visible = false; });

	} else {
	   $('.eye-img').attr("src","/icons/eye.png");
	   $('.white-eye-img').attr('src', '/icons/white-eye.png');

	   group.traverse( function(object) { object.visible = true; });
	}
	
   },

   'click .obj-heading':function(e)
    {
	test =  e;
	index = e.currentTarget.dataset.src;
        if(e.target.classList[0] == "eye-img"){
	   eyeImg = e.target;
	   if( eyeImg.attributes.src.value == "/icons/not-eye.png") {
		group.children[index].traverse( function(object) { object.visible = true; });
		eyeImg.src = "/icons/eye.png";
	   } else{
		group.children[index].traverse( function(object) { object.visible = false; });
		eyeImg.src = "/icons/not-eye.png";
	   }
	} else {
        controlDiv = e.currentTarget.nextElementSibling;
	$(controlDiv).slideToggle("fast");
	}
    },

    'click .eye-img':function(e)
    {
    },

    'click .edit-thumb-btn': function()
    {
	imageData = renderer.domElement.toDataURL('image/png');
	model = ModelFiles.findOne(this._id);
	ModelFiles.update(this._id, {$set: {screenshot: imageData}}, function(error, res) {
	    if (error) {
			sAlert.error(error.reason);
	    } else {
			sAlert.success("Updated thumbnail preview");
	    }
	});
	
    },

    'click .image-toggle': function()
    {
	$('.preview-box').toggleClass('preview-box-hidden');
    }
});

Template.modelEditor.helpers({
   object: function()
   {
	obj = OBJFiles.find({gFile: this._id});
	return obj;
   }
});
