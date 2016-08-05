Template.cfsUploader.events({
    'dropped #dropzone': function(event, temp) 
    {
	uploadFile(event, temp);
    },

    'change #fileInput': function(event, temp)
    {
	 uploadFile(event, temp);
    }

});

function uploadFile(event, temp)
{
    FS.Utility.eachFile(event, function(file) {
	var fileId;
	var fsFile = new FS.File(file);
	fsFile.owner = Meteor.userId();
	fsFile.converted = false;
	fsFile.timeUploaded = new Date();
	fsFile.about = "The model " + fsFile.name() + " was uploaded on " + fsFile.timeUploaded;
	fsFile.viewsCount = 0;
	fsFile.conversion = 0;
	var currentUser = Meteor.user();

	ModelFiles.insert(fsFile,function(err) {
	    if (err) {
	    	sAlert.error("There was some error in uploading your file, please try again/later");
	    } else {
	    	sAlert.success("File Uploaded, and will appear in file manager after it's converted");
		}	   
	});
	Router.go("/description/" + fsFile._id);
    });
}
