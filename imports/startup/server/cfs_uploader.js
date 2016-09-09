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

/**
 * Converts g into obj iles
 */

Meteor.methods({ convertFile(fileId) {
    check(fileId, String)
/**
 * 3 NPM packages sys, fs and child_process
 * are required for executing shell commands
 * from within node
 */
    const sys = Npm.require('sys'),
        exec = Npm.require('child_process').exec,
        convertPercentage = 0,
        modelObj = ModelFiles.findOne(fileId),
        readStream = modelObj.createReadStream('modelFiles'),
        filePath = readStream.path,
        settings = OgvSettings.findOne(),
        mgedPath = settings.mgedPath,
        gobjPath = settings.gobjPath,
        uploadDirPath = filePath.substring(0, filePath.lastIndexOf('/'))

    let objects,
        objPath

    modelObj.update({
        $set: {
            conversion: convertPercentage,
        },
    })

/**
 * exec() function executes system commands and Meteor.BindEnvironment binds it
 * meteor environment so that they can share each other's variables
 */

    // Get object parts
    const cmdMged = `${mgedPath} -c ${filePath} ls -a 2>&1`
    exec(cmdMged, Meteor.bindEnvironment((error, stdout, stderr) => {
        objects = stdout
        // Escaping ' and "
        objects = objects.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
        sys.print(`stderr ${stderr}`)

        if (error != null) {
            console.log(`exec error:  ${error}`)
        } else {
            objPath = `${uploadDirPath}/${fileId}.obj`
            cmd = `${gobjPath} -n 10 -o ${objPath} ${filePath} ${objects}`
            console.log(cmd)
            convertAndSave(cmd)
        }
    }))

    // Convert to obj
    function convertAndSave(cmd) {
        exec(cmd, Meteor.bindEnvironment((error) => {
            if (error) {
                throw (new Meteor.Error(`There's some error in converting file ${error}`))
            }

            console.log(`File #${fileId} has been converted`)
            objFS = new FS.File(objPath)
            objFS.gFile = fileId
            objFS.show = true
            objFS.color = '#ffffff'
            OBJFiles.insert(objFS, (err) => {
                if (err) {
                    throw (new Meteor.Error(`There's some error in converting file ${error}`))
                }
                modelObj.update({
                    $set: {
                        conversion: 100,
                    },
                })
                console.log('Object added')
                modelObj.update({
                    $set: {
                        converted: true,
                    },
                })
                console.log(modelObj)
            })
        }))
    }
} })
