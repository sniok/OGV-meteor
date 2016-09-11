/**
/*               M O D E L _ V I E W E R . J S
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

/** @file OGV/client/views/model_viewer.js
 * Events, helpers and other logic required to render 3d models in
 * model Viewer.
 */

import './model_viewer.html'

import '../../utils/OBJloader.js'
import '../../utils/OrbitControls.js'
import '../../utils/Detector.js'
import Clipboard from '../../utils/clipboard.min.js'

import '../components/model_editor.js'

Template.modelViewer.events({
    'click #sm-item-love': function () {
        const love = {
            postId: this._id,
        }
        Meteor.call('love', love, (error) => {
            if (error) {
                sAlert.error(error.reason)
            }
        })
    },

    'click #sm-item-edit': function () {
        Router.current().render(Template.ModelViewer).data()
    },

    'click #sm-item-embed': function () {
        sAlert.success('Embed code has been copied to clipboard')
    },

    'click #sm-item-comment': function () {
        $('.comments-toolbar').removeClass('ec-inactive')
        $('.ec-model').addClass('ec-inactive')
        $('.edit-controls').toggleClass('edit-controls-hidden')
    },

    'click #comments-close-button': function () {
        $('#overlay-comments').css({
            bottom: '-10000px',
        })
    },

    'click #sm-item-owner': function () {
        ownerId()
    },
})

Template.modelViewer.helpers({
    embedCode() {
        const thisURL = `${Meteor.absoluteUrl()}models/${this._id}/shared=true`
        embedCode = `<iframe width="500" height="250" src="${thisURL}" frameborder="0"></iframe>`
        return embedCode
    },

    lovers() {
        loversObj = Lovers.findOne({
            postId: this._id,
        })
        if (loversObj) {
            loversArray = loversObj.lovers
            return loversArray.length
        }
        return 0
    },

    model() {
        return this.data
    },

    ownerId() {
        model = ModelFiles.findOne(this._id)
        return model.owner
    },

    ownerDp() {
        imgId = Meteor.users.findOne(model.owner).profile.pic
        if (imgId) {
            return ProfilePictures.findOne(imgId).url()
        }
        return '/icons/User.png'
    },
})

Template.modelViewer.rendered = function () {
    model = this.data
    objList = getObjFiles(model)
    console.log(objList)
    clipboard = new Clipboard('#sm-item-embed')
    clipboard.on('success', (e) => {
        console.log('Action:', e.action)
        console.log('Text:', e.text)
        console.log('Trigger:', e.trigger)

        e.clearSelection()
    })

    clipboard.on('error', (e) => {
        console.log('Action:', e.action)
        console.log('Trigger:', e.trigger)
    })
    init()
    render()
}

/**
 * Get list of OBJ files for the current .g database
 */

function getObjFiles(model) {
    objUrls = []
    sAlert.success('Getting obj files')
    modelId = model._id
    OBJFiles.find({
        gFile: modelId,
    }).forEach((objFile) => {
        objUrls.push(objFile)
    })
    console.log(objUrls)
    return objUrls
}

/**
 * Initializes the model viewer
 */
const targetRotationX = 0

const targetRotationY = 0


let finalRotationY
// var keyboard = new KeyboardState();

function init() {
    /**
     * Setting Up the scene:
     * Grabs the model-container div from template into a variable
     * named container, and sets up the scene
     */
    container = document.getElementById('model-container')
    controller = document.getElementById('modelController')
    const target = document.getElementById('main')

    /**
     * Create a scene, that will hold all our elements such
     * as objects, cameras and lights
     */
    scene = new THREE.Scene()

    /**
     * Create a camera, which defines where we're looking at.
     */
    camera = new THREE.PerspectiveCamera(65, target.clientWidth / target.clientHeight, 1, 100000)
    camera.position.z = 2000
    camera.position.x = 2000
    camera.position.y = 2000

    /**
     * Light up the scene
     */
    ambient = new THREE.AmbientLight(0x555555)
    scene.add(ambient)

    directionalLight = new THREE.PointLight(0xaaaaaa)
    directionalLight.position = camera.position
    scene.add(directionalLight)

    /** Axes */
    axes = new THREE.AxisHelper(10000)
    scene.add(axes)

    /** Grid */
    grid = new THREE.GridHelper(3000, 100)
    scene.add(grid)

    /**
     * Loader Managerial tasks
     */
    manager = new THREE.LoadingManager()
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total)
        animate()
    }

    /**
     * Adds the model to the viewer aka loads OBJ files
     * using OBJ-Loader
     */

    group = new THREE.Object3D()
    loader = new THREE.OBJLoader(manager)

    /**
     * Adds material to the model, which hence controls
     * how the model shall look
     */
    OBJMaterialArray = []
    OBJMaterialOver = new THREE.MeshPhongMaterial({
        visible: false,
    })
    for (i in objList) {
        const OBJMaterial = new THREE.MeshPhongMaterial()
        OBJMaterialArray.push(OBJMaterial)
        loader.load(objList[i].url(), (object) => {
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    colorhex = handleColorChange(objList[i].color)
                    colorhex = parseInt(colorhex, 16)
                    color = new THREE.Color(colorhex)
                    OBJMaterialArray[i].needsUpdate = true
                    OBJMaterialArray[i].color = color
                    child.material = OBJMaterialArray[i]
                }
            })

            object.position.y = 0.1
            object.rotation.z = (90 * Math.PI) / 180
            object.rotation.x = (-90 * Math.PI) / 180


            group.add(object)
            scene.add(group)
        })
    }


    /**
     * datGUI variable initializations
     */
    /*    guiControls = new function() {
            this.backgroundColor = "#a1a1a1";

            this.opacity = OBJMaterial.opacity;
            this.transparent = OBJMaterial.transparent;
            this.ambient = OBJMaterial.ambient.getHex();
            this.emissive = OBJMaterial.emissive.getHex();
            this.wireframe = OBJMaterial.wireframe;
            this.wireframeLinewidth = OBJMaterial.wireframeLinewidth;
            this.shininess = OBJMaterial.shininess;
            this.visible = OBJMaterial.visible;

            this.visible = OBJMaterialOver.visible;
            this.wireframe = OBJMaterialOver.wireframe;
            this.wireframeLinewidth = OBJMaterialOver.wireframeLinewidth;
            this.color = OBJMaterialOver.color;
        }*/

    // Initialize dat.GUI

    //    datGUI = new dat.GUI({autoPlace:false});

    /**
     * Add folders/sub categories in controls
     */
    // Consisting of changes to be shown in the model
    //  var modelGui = datGUI.addFolder("Model");
    // Activated OBJMAterialOver that overlaps the existing models
    // var overmodelGui = datGUI.addFolder("WireFrame + Model");

    /**
     * datGUI GUI and of variables defined above functionality
     */
    /*    modelGui.add(guiControls, 'visible').onChange(function (e) {
            OBJMaterial.visible = e;
        });*/
    /*    modelGui.add(guiControls, 'opacity', 0, 1).onChange(function (e) {
            OBJMaterial.opacity = e;
        });
        modelGui.add(guiControls, 'transparent').onChange(function (e) {
            OBJMaterial.transparent = e;
        });
        modelGui.addColor(guiControls, 'ambient').onChange(function (e) {
            OBJMaterial.ambient = new THREE.Color(e);
        });
        modelGui.addColor(guiControls, 'emissive').onChange(function (e) {
            OBJMaterial.emissive = new THREE.Color(e);
        });
        modelGui.add(guiControls, 'wireframe').onChange(function (e) {
            OBJMaterial.wireframe = e;
        });
        modelGui.add(guiControls, 'wireframeLinewidth', 0, 10).onChange(function (e) {
            OBJMaterial.wireframeLinewidth = e;
        });
        modelGui.add(guiControls, 'shininess', 0, 100).onChange(function (e) {
            OBJMaterial.shininess = e;
        });

        overmodelGui.add(guiControls, 'visible').onChange(function (e) {
            OBJMaterialOver.visible = e;
        });
        overmodelGui.add(guiControls, 'wireframe').onChange(function (e) {
            OBJMaterialOver.wireframe = e;
        });
        overmodelGui.add(guiControls, 'wireframeLinewidth', 0, 10).onChange(function (e) {
            OBJMaterialOver.wireframeLinewidth = e;
        });
        overmodelGui.addColor(guiControls, 'color').onChange(function (e) {
            OBJMaterialOver.color = new THREE.Color(e);
        });*/

    /**
     * If webgl is there then use it otherwise use canvas
     */
    if (Detector.webgl) {
        const pixelRatio = window.devicePixelRatio || 1
        renderer = new THREE.WebGLRenderer({
            antialias: false,
            preserveDrawingBuffer: true,
            devicePixelRatio: pixelRatio,
        })
    } else {
        renderer = new THREE.CanvasRenderer()
    }

    /**
     * Sets size and color to renderer
     */

    renderer.setSize(target.clientWidth, target.clientHeight)
    renderer.setClearColor(0x555555, 1)

    container.appendChild(renderer.domElement)

    /**
     * orbitControls for zoom in/ zoom out and other basic controls
     */
    controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)

    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('keydown', onKeyDown, false)
}

/**
 * when window resizes, the size of modelviewer needs to resize
 */
function onWindowResize() {
    const target = document.getElementById('main')

    camera.aspect = target.clientWidth / target.clientHeight
    camera.updateProjectionMatrix()

    renderer.setSize(target.clientWidth, target.clientHeight)

    render()
}


function render() {
    // horizontal rotation
    group.rotation.y += (targetRotationX - group.rotation.y) * 0.1
    // vertical rotation
    finalRotationY = (targetRotationY - group.rotation.x)
    group.rotation.x += finalRotationY * 0.1

    finalRotationY = (targetRotationY - group.rotation.x)
    if (group.rotation.x <= 1 && group.rotation.x >= -1) {
        group.rotation.x += finalRotationY * 0.1
    }
    if (group.rotation.x > 1) {
        group.rotation.x = 1
    }

    if (group.rotation.x < -1) {
        group.rotation.x = -1
    }

    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(render)
}

function handleColorChange(color) {
    if (typeof color === 'string') {
        color = color.replace('#', '0x')
    }
    return color
}
/**
 * onKeyDown function helps to view model from
 * different angles on keyboard button press.
 */

function onKeyDown(event) {
    switch (event.keyCode) {
    case 84:
            /* T */
        camera.position.set(0, 3000, 0) // top view
        camera.lookAt(scene.position)
        break
    case 66:
            /* B */
        camera.position.set(0, -3000, 0) // bottom view
        camera.lookAt(scene.position)
        break
    case 70:
            /* F */
        camera.position.set(-3000, 0, 0) // front view
        camera.lookAt(scene.position)
        break
    case 82:
            /* R */
        camera.position.set(3000, 0, 0) // rear view
        camera.lookAt(scene.position)
        break
    case 78:
            /* N */
        camera.position.set(2000, 2000, 2000) // Reset view using N
        camera.lookAt(scene.position)
        break
    default:
        break
    }
    animate()
}
