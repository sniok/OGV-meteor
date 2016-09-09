/*                     U P L O A D E R . J S
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

/** @file OGV/client/views/uploader.js
 *  @brief client side uploading mechanism
 *
 * User file uploading is handled by calling a SaveFile method defined
 * in server/uploader.js.
 */

/**
 * Checks if the file is text or binary and then encode it accordingly
 */
Meteor.saveFile = function (blob, name, path, _type) {
    console.log(path)
    const fileReader = new FileReader(),
        type = _type || 'binary'

    let method,
        encoding = 'binary'

    switch (type) {
    case 'text':
        method = 'readAsText'
        encoding = 'utf8'
        break

    case 'binary':
        method = 'readAsBinaryString'
        encoding = 'binary'
        break

    default:
        method = 'readAsBinaryString'
        encoding = 'binary'
        break
    }
    /**
     * Call server method saveFile
     */
    fileReader.onload = function (file) {
        Meteor.call('saveFile', file.srcElement.result, name, path, encoding, (err) => {
            if (err) {
                Session.set('alert', `Sorry, ${err}`)
            } else {
                Session.set('alert', 'Yay! file uploaded')
            }
        })
    }

    fileReader[method](blob)
}

/**
 * Whenever the input changes, save the file by calling saveFile function
 * which is defined in server/uploader.js from server
 */

Template.uploader.events({
    'change input': function (ev) {
        Session.set('alert', 'Uploading . . .')
        _.each(ev.currentTarget.files, (file) => {
            Meteor.saveFile(file, file.name)
        })
    },
})
