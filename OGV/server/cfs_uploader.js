/*                C F S _ U P L O A D E R . J S
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

/** @file OGV/server/cfs_uploader.js
 *  @brief uploads files to server
 *
 *  it uploads .g files to server and then converts them to .obj files
 */


ModelFiles.allow({
    insert: function(userId, file) 
    {
	if ((file.extension() == 'g') || (file.extension() == 'obj')) {	
	    return true;
	} else {
	    return false;
	}
    },
    update: function(userId,file) 
    {
	return !! userId;
    },
    download: function(userId, file) 
    {
    	return true;
    }	
});

Meteor.methods({
    convertFile:function(fileId)
    {
	var sys = Npm.require('sys'),
	    fs = Npm.require('fs'),
	    exec = Npm.require('child_process').exec;

	findModel(convertModel);

	function findModel(callback) 
	{
	    ModelFiles.find(fileId).forEach(function (modelObj) {
		var readStream = modelObj.createReadStream('modelFiles');
		var filePath = readStream.path;
	        callback(modelObj, filePath);
	    });
	}

	function convertModel(model,filePath)
	{
	   console.log(model);
	   console.log(filePath);
           
	    var objects;
	    var mgedPath = '/usr/brlcad/dev-7.25.0/bin/mged';
	    var g_objPath = '/usr/brlcad/dev-7.25.0/bin/g-obj';
	    var cmd = mgedPath + " -c  " + filePath +" ls -a 2>&1";
	    console.log (cmd);
	    var uploadDirPath = filePath.substring(0, filePath.lastIndexOf("/")); 
	    console.log (uploadDirPath); 
	    child = exec(cmd, function (error, stdout, stderr) {
		sys.print('stdout' + stdout);
		objects = stdout.split(" ");
		console.log(objects);
		sys.print('stderr' + stderr);
	   
		if (error != null) {
		    console.log('exec error: ' + error);
	    	} else {
		
		for (i in objects) {
		    var objPath = uploadDirPath + "/" + objects[i] + ".obj";
		    cmd = g_objPath + " -n 10 -o " + objPath + " " + filePath  + " " +  objects[i];
	            console.log(cmd);
	            child = exec(cmd, function (error, stdout, stderr) {
			if (error) {
			    console.log("There's some error in converting file" + error);
			} else {
			    console.log("File has been converted");
			    
			}
	   	    });
		}}
	    });
	}
    }
});		
