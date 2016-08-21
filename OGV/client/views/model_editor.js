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

    'click .info-tool-toggle': function()
    {
	$('.edit-controls-info').toggleClass('edit-controls-hidden');
    },

    'click .model-tool-toggle': function()
    {
	$('.edit-controls-model').toggleClass('edit-controls-hidden');
    },

    'keyup .obj-search-bar': _.throttle(function(e){
	searchQuery = e.currentTarget.value.trim();
        var options = {gFile: this._id};
        ObjSearch.search(searchQuery, options);
	}, 200)
});

var objfields = ['original.name', 'gFile'];
ObjSearch = new SearchSource('objFiles', objfields);

Template.modelEditor.helpers({
   object: function()
   {
      return ObjSearch.getData({
      transform: function(matchText, regExp) {
        return matchText.replace(regExp, "$&")
      }
    });
   }
});

Template.modelEditor.rendered = function(){
  gfile = $('.edit-controls-wrapper').data('src');
  var options = {gFile: gfile};
  console.log(options);
  ObjSearch.search('', options);
}
