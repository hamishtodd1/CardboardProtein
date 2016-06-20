function Initialize()
{
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  "http://hamishtodd1.github.io/Sysmic/gentilis.js", 
		function ( reponse ) {
			gentilis = reponse;
			
			init_loadingsign();
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
	
	var Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.enabled = true;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
	document.body.appendChild( Renderer.domElement );
	
	Scene = new THREE.Scene();
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 70, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Camera.position.set(0,0,0.6); //initial state subject to change! you may not want them on the floor. Owlchemy talked about this
	Camera.lookAt(new THREE.Vector3());
	
	OurVREffect = new THREE.VREffect( Renderer );
	
	//compatibility is a MASSIVE thing, can all be done here.
//	if ( WEBVR.isLatestAvailable() === false ){
////		document.body.appendChild( WEBVR.getMessage() );
//	}
//	else
	{
		//This is where the split could get more fundamental. Many things to take into account: it may be a google cardboard.
		OurVRControls = new THREE.VRControls( Camera,Renderer.domElement );
//		if ( WEBVR.isAvailable() === true )
//			document.body.appendChild( WEBVR.getButton( OurVREffect ) );
	}
	
	Add_stuff_from_demo();
	
//	get_NGL_protein();
	
	Render();
}

var loose_surface;
function get_NGL_protein()
{
	//Trp-Cage Miniprotein Construct TC5b, 20 residues: 1l2y. Rubisco: 1rcx. Insulin: 4ins
	var testproteinlink = "http://files.rcsb.org/download/4ins.pdb";
	var testobjlink = "http://threejs.org/examples/obj/male02/male02.obj";
	
	var xhr = new XMLHttpRequest();
	xhr.open( "GET", "http://mmtf.rcsb.org/v0.2/full/1l2y", true );
	xhr.addEventListener( 'load', function( event ){
		var blob = new Blob( [ xhr.response ], { type: 'application/octet-binary'} );
		
		stage.loadFile( blob, {
				ext: "mmtf", defaultRepresentation: true
		} ).then( function( o ){
			o.addRepresentation( "surface" );
			console.log(o.reprList);
			loose_surface = o.reprList[3].repr;
			
			//we would like to know when it has finished making its representation and call the code currently in input			
		} );
	} );
	xhr.responseType = "arraybuffer";
	xhr.send( null );
}