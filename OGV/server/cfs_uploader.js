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


Meteor.methods({
	/**
	 * Converts g into obj iles 
	 */
	convertFile: function(fileId) {
		/**
		 * 3 NPM packages sys, fs and child_process
		 * are required for executing shell commands 
		 * from within node
		 */
		var sys = Npm.require('sys'),
			fs = Npm.require('fs'),
			exec = Npm.require('child_process').exec;
		var convertPercentage = 0;

		var modelObj = ModelFiles.findOne(fileId),
			readStream = modelObj.createReadStream('modelFiles'),
			filePath = readStream.path,
			objects,
			objPath,
			settings = OgvSettings.findOne(),
			mgedPath = settings.mgedPath,
			g_objPath = settings.gobjPath,
			cmd = mgedPath + " -c  " + filePath + " ls -a 2>&1",
			filePathArray = filePath.split('-');
		uploadDirPath = filePath.substring(0, filePath.lastIndexOf("/"));

		modelObj.update({
			$set: {
				conversion: convertPercentage
			}
		});

		/**
		 * exec() function executes system commands and Meteor.BindEnvironment binds it
		 * meteor environment so that they can share each other's variables
		 */
		child = exec(cmd, Meteor.bindEnvironment(function(error, stdout, stderr) {
			/**
			 * the command in cmd returns a list of model parts
			 */
			objects = stdout;
			// Escaping ' and "
			objects = objects.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
			sys.print('stderr' + stderr);

			if (error != null) {
				console.log('exec error: ' + error);
			} else {
				objPath = uploadDirPath + "/" + fileId + ".obj";
				cmd = g_objPath + " -n 10 -o " + objPath + " " + filePath + " " + objects;
				console.log(cmd);
				child = exec(cmd, Meteor.bindEnvironment(function(error, stdout, stderr) {
					if (error) {
						throw (new Meteor.Error("There's some error in converting file" + error));
					} else {
						console.log("File #" + fileId + " has been converted");
						objFS = new FS.File(objPath);
						objFS.gFile = fileId;
						objFS.show = true;
						objFS.color = '#ffffff';
						OBJFiles.insert(objFS, function(err, objFile) {
							if (err) {
								console.log(err);
							} else {
								modelObj.update({
									$set: {
										conversion: 100
									}
								});
								console.log("Object added");
								modelObj.update({
									$set: {
										converted: true
									}
								});
								console.log(modelObj);
							}
						});
					}
				}));
			}
		}));
	}
});