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
     * Converts .g file to .obj and saves
     *
     * @param {string} fileId - File ID
     */
    convertFile(fileId) {
        check(fileId, String)
        /**
         * child_process
         * is required for executing shell commands
         * from within node
         */
        const exec = require('child_process').exec,
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

        /**
         * Get object's parts by using mged's 'ls' command
         */
        const cmdMged = `${mgedPath} -c ${filePath} ls -a 2>&1`
        exec(cmdMged, Meteor.bindEnvironment((error, stdout, stderr) => {
            if (error) {
                throw (new Meteor.Error(`Error while executing ${cmdMged} : ${error}`))
            }

            objects = stdout
            objects = objects.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')

            console.log(`stderr ${stderr}`)

            objPath = `${uploadDirPath}/${fileId}.obj`
            cmd = `${gobjPath} -n 10 -o ${objPath} ${filePath} ${objects}`
            convertAndSave(cmd)
        }))

        /**
         * Convert .g file to .obj and save
         *
         * @param {string} cmd - g-obj command
         */
        function convertAndSave(cmd) {
            exec(cmd, Meteor.bindEnvironment((error) => {
                if (error) {
                    throw (new Meteor.Error(`There's some error in converting file ${error}`))
                }

                console.log(`[cfs_uploader] File #${fileId} has been converted`)
                objFS = new FS.File(objPath)
                objFS.gFile = fileId
                objFS.show = true
                objFS.color = '#ffffff'
                OBJFiles.insert(objFS, (err) => {
                    if (err) {
                        throw (new Meteor.Error(`Error while saving file ID - ${fileId} : ${error}`))
                    }
                    modelObj.update({
                        $set: {
                            conversion: 100,
                        },
                    })
                    console.log(`[cfs_uploader] File #${fileId} saved`)
                    modelObj.update({
                        $set: {
                            converted: true,
                        },
                    })
                    console.log(modelObj)
                })
            }))
        }
    },
})
