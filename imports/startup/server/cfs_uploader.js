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
            execSync = require('child_process').execSync,
            fs = require('fs'),
            convertPercentage = 0,
            modelObj = ModelFiles.findOne(fileId),
            readStream = modelObj.createReadStream('modelFiles'),
            filePath = readStream.path,
            settings = OgvSettings.findOne(),
            mgedPath = settings.mgedPath,
            gobjPath = settings.gobjPath,
            uploadDirPath = filePath.substring(0, filePath.lastIndexOf('/'))

        let objects,
            objPath,
            tree

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
        const cmdMged = `${mgedPath} -c ${filePath} tops 2>&1`
        exec(cmdMged, Meteor.bindEnvironment((error, stdout, stderr) => {
            if (error) {
                throw (new Meteor.Error(`Error while executing ${cmdMged} : ${error}`))
            }

            objects = stdout
            objects = objects.split(/[ \n]+/).join(' ')

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
                insertMaterialsToObj()
            }))
        }

        function insertMaterialsToObj() {
            let obj = fs.readFileSync(objPath, {
                encoding: 'UTF-8',
            })
            obj = `mtllib ${fileId}.mtl\n` + obj // eslint-disable-line
            const objLine = obj.split('\n')
            for (let i = 0; i < objLine.length; i++) {
                if (objLine[i][0] === 'g') {
                    const mtlName = objLine[i].slice(2)
                    insert(objLine, i, `usemtl ${mtlName}`)
                    i += 2
                }
            }
            fs.writeFileSync(objPath, objLine.join('\n'), {
                encoding: 'UTF-8',
            })

            createMtlFile()
        }

        function createMtlFile() {
            /**
             * Build tree
             */
            tree = {}
            const treeCommand = part => `mged -c ${filePath} tree -a -i 2 ${part} 2>&1`

            const objectsArray = objects.split(' ')
            objectsArray.pop()

            for (const obj of objectsArray) {
                const currentObject = tree[obj[obj.length - 1] === '/' ? obj.substring(0, obj.length - 1) : obj] = {}

                if (obj[obj.length - 1] === '/') {
                    let lines = execSync(treeCommand(obj.substring(0, obj.length - 1)), {
                        encoding: 'UTF-8',
                    })
                    lines = lines.split('\n')
                    let prevIndent = 0
                    let road = [currentObject] // eslint-disable-line
                    for (const line of lines) {
                        const args = line.split(/ +/)

                        if (args[1] === '@') {
                            road[road.length - 1][args[2]] = args[3]
                        }
                        if (args[1] === 'u' && trimR(args[2]) !== args[2]) {
                            const indent = /^ +/.exec(line)
                            let indentLength = 0
                            if (indent) {
                                indentLength = indent[0].length
                            }
                            const indentChange = indentLength - prevIndent

                            if (indentChange < 0) {
                                road.pop()
                                if (road[road.length - 1] === {}) {
                                    delete road[road.length - 1]
                                }
                                for (let i = indentChange; i < 0; i += 2) {
                                    road.pop()
                                }
                                road.push(road[road.length - 1][trimR(args[2])] = {})
                            } else if (indentChange > 0) {
                                road.push(road[road.length - 1][trimR(args[2])] = {})
                            } else if (indentChange === 0) {
                                road.pop()
                                road.push(road[road.length - 1][trimR(args[2])] = {})
                            }

                            prevIndent = indentLength
                        }
                    }
                }
            }

            /**
             * Build colors range from command prcolor
             */
            const colorsRange = []
            let colors = execSync(`mged -c ${filePath} prcolor 2>&1`, {
                encoding: 'UTF-8',
            })
            if (colors !== 'none\n') {
                colors = colors.split('\n')
                if (colors[colors.length - 1] === '') {
                    colors.pop()
                }
                for (const color of colors) {
                    const regions = /([0-9]+)..([0-9]+)/.exec(color)
                    const regionColors = /([0-9]{1,3}),[ ]+([0-9]{1,3}),[ ]+([0-9]{1,3})/.exec(color)
                    colorsRange.push({
                        from: regions[1],
                        to: regions[2],
                        color: `${regionColors[1]}/${regionColors[2]}/${regionColors[3]}`,
                    })
                }
                console.log(`[cfs_uploader] Got colors for ${colorsRange.length} ranges`)
            }

            /**
             * Update tree with colors
             */
            putColors(tree, '33/33/33')

            function putColors(obj, rgb) {
                for (const partName in obj) {
                    const part = obj[partName]
                    if (typeof part === 'object') {
                        if (!part.rgb) {
                            part.rgb = rgb
                        }
                        for (const range of colorsRange) {
                            if (parseInt(part.region_id, 10) >= parseInt(range.from, 10) && parseInt(part.region_id, 10) <= parseInt(range.to, 10)) {
                                part.rgb = range.color
                            }
                        }
                        putColors(part, rgb)
                    }
                }
            }

            /**
             * Save .mtl
             * File with materials
             */
            mtl = ''
            getColors(tree, '')

            function getColors(obj, path) {
                for (const partName in obj) {
                    const part = obj[partName]
                    if (typeof part === 'object') {
                        const rgb = part.rgb.split('/')
                        mtl += `newmtl ${path === '' ? partName : `${path}/${partName}`}
Ka ${rgb[0] / 255} ${rgb[1] / 255} ${rgb[2] / 255}
Kd ${rgb[0] / 255} ${rgb[1] / 255} ${rgb[2] / 255}
Ks 1 1 1
`
                        getColors(part, path === '' ? partName : `${path}/${partName}`)
                    }
                }
            }

            fs.writeFileSync(`${uploadDirPath}/${fileId}.mtl`, mtl, {
                encoding: 'UTF-8',
            })

            console.log(`[cfs_uploader] Saved ${fileId}.mtl`)
            mtlFS = new FS.File(`${uploadDirPath}/${fileId}.mtl`)
            mtlFS.gFile = fileId
            MTLFiles.insert(mtlFS, (err) => {
                if (err) {
                    throw new Meteor.Error(err)
                }
            })
            save()
        }

        function save() {
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
                        tree: JSON.stringify(tree),
                    },
                })
            })
        }
    },
})

/**
 * UTIL
 */
function insert(array, index) {
    array.splice(...[index, 0].concat(
        Array.prototype.slice.call(arguments, 2))) // eslint-disable-line
    return this
}

function trimR(s) {
    if (s[s.length - 1] === 'R' && s[s.length - 2] === '/') {
        s = s.substring(0, s.length - 2)
    }
    if (s[s.length - 1] === '/') {
        s = s.substring(0, s.length - 1)
    }
    return s
}
