// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'

import { GUI } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/libs/dat.gui.module.js'



let camera, scene, raycaster, renderer
const mouse = new THREE.Vector2()
const params = {
    clipIntersection: true,
    planeConstant: 0,
    showHelpers: false
}

const clipPlanes = [
    new THREE.Plane( new THREE.Vector3( 1000, 0, 0 ), 0 ),
    new THREE.Plane( new THREE.Vector3( 0, - 1000, 0 ), 0 ),
    new THREE.Plane( new THREE.Vector3( 0, 0, - 1000 ), 0 )
]

window.addEventListener( 'click', onClick, false);



init()
animate()

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene 
    scene = new THREE.Scene()

    scene.background = new THREE.Color( 0x443333 )
	scene.fog = new THREE.Fog( 0x443333, 300, 900 )
    ///scene.background = new THREE.Color(800080)

    // create a camera
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 2000 )
    camera.position.set( 0, 400, 400 )


    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000, 100 ),
        new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
    );
    plane.rotation.x = 0
    plane.position.y = 0.03
    plane.receiveShadow = true
    scene.add( plane )

    // Lights
    const hemiLight = new THREE.HemisphereLight( 0x443333, 0x111122 );
    scene.add( hemiLight )

    const spotLight = new THREE.SpotLight()
    spotLight.angle = Math.PI / 18
    spotLight.penumbra = 0.2
    spotLight.castShadow = true;
    spotLight.position.set( 1000, 1000, 800 )
    scene.add( spotLight )    



    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.localClippingEnabled = true
    document.body.appendChild( renderer.domElement )

    const controls = new OrbitControls( camera, renderer.domElement )
   
    raycaster = new THREE.Raycaster()

    //Load 3md file
    const loader = new Rhino3dmLoader()
    
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/' )

    loader.load( 'skylab.3dm', function ( object ) {

        document.getElementById('loader').remove()
        scene.add( object )
        console.log( object )

    } )



////!!!! ERROR PART START

    //Load 3md file
    //const group = new THREE.Group()
    
    //for ( let i = 1; i <= 30; i += 2 ) {
        
 //       const loader = new Rhino3dmLoader(i / 300, 480, 240 )
 //       loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/' )
 //       loader.load( 'skylab.3dm', function ( object ) {
//
 //           document.getElementById('loader').remove()
 //           scene.add( object )
  //          console.log( object )
    
  //      } )

    //    const material = new THREE.MeshLambertMaterial( {

 //           color: new THREE.Color().setHSL( Math.random(), 0.5, 0.5 ),
 //           side: THREE.DoubleSide,
 //           clippingPlanes: clipPlanes,
 //           clipIntersection: params.clipIntersection
//
 //       } );

   //     group.add( new THREE.Mesh( object, material ) );

//    }

////!!!! ERROR PART END






    // helpers

    const helpers = new THREE.Group();
    helpers.add( new THREE.PlaneHelper( clipPlanes[ 0 ], 2, 0xff0000 ) )
    helpers.add( new THREE.PlaneHelper( clipPlanes[ 1 ], 2, 0x00ff00 ) )
    helpers.add( new THREE.PlaneHelper( clipPlanes[ 2 ], 2, 0x0000ff ) )
    helpers.visible = false
    scene.add( helpers )

    // gui

    const gui = new GUI();

    gui.add( params, 'clipIntersection' ).name( 'clip intersection' ).onChange( function ( value ) {

        const children = object.children;

        for ( let i = 0; i < children.length; i ++ ) {

            children[ i ].material.clipIntersection = value;

        }

        render()

    } );

    gui.add( params, 'planeConstant', - 1, 1 ).step( 0.01 ).name( 'plane constant' ).onChange( function ( value ) {

        for ( let j = 0; j < clipPlanes.length; j ++ ) {

            clipPlanes[ j ].constant = value;

        }

        render()

    } )

    gui.add( params, 'showHelpers' ).name( 'show helpers' ).onChange( function ( value ) {

        helpers.visible = value;

        render()

    } )

    //
}




//--------------
function onClick( event ) {

    console.log( `click! (${event.clientX}, ${event.clientY})`)

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    
    raycaster.setFromCamera( mouse, camera )

	// calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children, true )

    let container = document.getElementById( 'container' )
    if (container) container.remove()

    // reset object colours
    scene.traverse((child, i) => {
        if (child.isMesh) {
            child.material.color.set( 'white' )
        }
    });

    if (intersects.length > 0) {

        // get closest object
        const object = intersects[0].object
        console.log(object) // debug

        object.material.color.set( 'magenta' )

        // get user strings
        let data, count
        if (object.userData.attributes !== undefined) {
            data = object.userData.attributes.userStrings
        } else {
            // breps store user strings differently...
            data = object.parent.userData.attributes.userStrings
        }

        // do nothing if no user strings
        if ( data === undefined ) return

        console.log( data )
        
        // create container div with table inside
        container = document.createElement( 'div' )
        container.id = 'container'
        
        const table = document.createElement( 'table' )
        container.appendChild( table )

        for ( let i = 0; i < data.length; i ++ ) {

            const row = document.createElement( 'tr' )
            row.innerHTML = `<td>${data[ i ][ 0 ]}</td><td>${data[ i ][ 1 ]}</td>`
            table.appendChild( row )
        }

        document.body.appendChild( container )
    }

}

function animate() {

    requestAnimationFrame( animate )
    renderer.render( scene, camera )

}