//"get position data from other users" and "get our controller data" might be very different abstractions
var InputObject = { //only allowed to use this in this file and maybe in initialization
	UserDisconnect: "",
	UserData: Array(), //maybe the coming values should be properties of the objects? There are probably best practices...
	
	ModelPositions: Array(),
	ModelQuaternions: Array(),
	ModelsReSynched: 0,
	
	UserOrbitRequest: new THREE.Vector3(), //vector2, but we may want to cross product
	UserString: "",
	UserPressedEnter: 0,
	
	clientX: 0,
	clientY: 0
};

function UpdateVRCameraPosition()
{
	var oldCameraPosition = Camera.position.clone();
	OurVRControls.update();
	if(!Camera.position.equals(oldCameraPosition))
	{
		//if that changed anything, we need to process it
		console.log("yesss")
		Camera.position.add(INITIAL_CAMERA_POSITION);
	}
}

function ReadInput(Users, ControllerModel,Models)
{
	//eventually this will do everything that the mouse event listeners and the first "User.getinput" currently does
	if(VRMODE)
		UpdateVRCameraPosition();
	
	handle_Connects_and_Disconnects(Users,ControllerModel,Models);
	
	//orbit stuff. GearVR stuff will be very comparable. WARNING, uncomment this and you have problems with camera being picked up!
	if(!VRMODE)
	{
		var FocussedModelPosition = new THREE.Vector3();
		
		var CameraRelativeToModelZero = Camera.position.clone();
		CameraRelativeToModelZero.sub(FocussedModelPosition); //Models[0].position
		
		var CameraLongtitude = Math.atan2(CameraRelativeToModelZero.z, CameraRelativeToModelZero.x);
		CameraLongtitude += InputObject.UserOrbitRequest.x * 0.01;
		
		var CameraLatitude = Math.atan2(CameraRelativeToModelZero.y, Math.sqrt(
				CameraRelativeToModelZero.z * CameraRelativeToModelZero.z + 
				CameraRelativeToModelZero.x * CameraRelativeToModelZero.x ));
		CameraLatitude += InputObject.UserOrbitRequest.y * 0.0077;
		
		var polerepulsion = 0.01;
		if(Math.abs(CameraLatitude) + polerepulsion > TAU / 4 )
		{
			if( CameraLatitude > 0 )
				CameraLatitude = TAU / 4 - polerepulsion;
			else
				CameraLatitude =-TAU / 4 + polerepulsion;
		}
		
		Camera.position.set(
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.cos(CameraLongtitude),
			CameraRelativeToModelZero.length() * Math.sin(CameraLatitude),
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.sin(CameraLongtitude) );
		Camera.position.add(FocussedModelPosition);
		Camera.lookAt(FocussedModelPosition);
		
		InputObject.UserOrbitRequest.set(0,0,0);
				//don't let them get up to the pole
	}
	
	

	if( InputObject.UserPressedEnter === 1 )
	{
		Loadpdb( "http://files.rcsb.org/download/" + InputObject.UserString + ".pdb", Models);
		ChangeUserString("");
		InputObject.UserPressedEnter = 0;
	}
	
	for(var i = 0; i < Users.length; i++)
		Users[i].GetInput();
	
	for(var i = 1; i < Users.length; i++)
	{
		if(Users[i].CameraObject.position.distanceTo(Camera.position) < 0.07)
			Users[i].CameraObject.visible = false;
		else
			Users[i].CameraObject.visible = true;
	}
	
	if(InputObject.ModelsReSynched && Models.length === InputObject.ModelPositions.length ) //will be destroyed by the possibility of deleting models
	{
		for(var i = 0; i < Models.length; i++)
		{
			Models[i].position.copy(InputObject.ModelPositions[i]);
			Models[i].quaternion.copy(InputObject.ModelQuaternions[i]);
		}
		
		InputObject.ModelsReSynched = 0;
	}
	
	socket.emit('UserStateUpdate', InputObject.UserData[0] ); //we could emit it with every control change?
}

//keyboard crap. Currently using "preventdefault" then "return" on everything you use, there's probably a better way
document.addEventListener( 'keydown', function(event)
{	
	//arrow keys
	if( 37 <= event.keyCode && event.keyCode <= 40)
	{
//		if(event.keyCode === 38)
//			Scene.scale.multiplyScalar(0.5);
//		if(event.keyCode === 40)
//			Scene.scale.multiplyScalar(2);
		
		//tank controls
//		var movingspeed = 0.8;
//		var turningspeed = 0.05;
//		
//		var forwardvector = Camera.getWorldDirection();
//		forwardvector.setLength(movingspeed);
//		
//		if(event.keyCode === 37)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, turningspeed));
//		if(event.keyCode === 38)
//			Camera.position.add(forwardvector);
//		if(event.keyCode === 39)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis,-turningspeed));
//		if(event.keyCode === 40)
//			Camera.position.sub(forwardvector);
//		return;
	}
	
	if(event.keyCode === 190 )
	{
		event.preventDefault();
		VRMODE = 1; //once you're in I guess you're not coming out!
		OurVREffect.setFullScreen( true );
		
		//bug if we do this earlier(?)
		for(var i = 0; i < 6; i++)
			OurVREffect.scale *= 0.66666666;
		
		return;
	}
	
	if(event.keyCode === 13) //enter
	{
		event.preventDefault();
		InputObject.UserPressedEnter = 1;
		return;
	}
	if(event.keyCode === 8) //backspace
	{
		event.preventDefault();
		ChangeUserString( InputObject.UserString.slice(0, InputObject.UserString.length - 1) );
		return;
	}
	
	//symbols
	{
		var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
		var arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
			arrayposition = event.keyCode - 48;
		if( 65 <= event.keyCode && event.keyCode <= 90 )
			arrayposition = event.keyCode - 55;
		
		if(typeof arrayposition != 'undefined')
		{
//			event.preventDefault(); //want to be able to ctrl+shift+j
			ChangeUserString(InputObject.UserString + keycodeArray[arrayposition]);
			return;
		}
	}
	
}, false );

function ChangeUserString(newstring)
{	
	InputObject.UserString = newstring;
	
	//remove the previous string that was in there
	for(var i = 0; i < Scene.children.length; i++)
	{
		if( Scene.children[i].name === "The User's string")
			Scene.remove(Scene.children[i]);
	}
	
	if(newstring === "")
		return;
	
	var TextMesh = new THREE.Mesh(
			new THREE.TextGeometry(newstring,{size: 5, height: 1, font: gentilis}),
			new THREE.MeshPhongMaterial( {
				color: 0x156289,
				emissive: 0x072534,
				shading: THREE.FlatShading
			}) );
	
	TextMesh.scale.set(0.02,0.02,0.02)
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = TextMesh.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( TextMesh.geometry.vertices[ i ] );
	}
	
	TextMesh.name = "The User's string";

	TextCenter.multiplyScalar( 1 / TextMesh.geometry.vertices.length );
	TextCenter.multiplyScalar( TextMesh.scale.x );
	TextMesh.position.sub(TextCenter);
	Scene.add(TextMesh);
}

document.addEventListener( 'mousemove', function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	if(InputObject.UserData[0].Gripping) //and only if you're not in VR
	{
		InputObject.UserOrbitRequest.x = event.clientX - InputObject.clientX;
		InputObject.UserOrbitRequest.y = event.clientY - InputObject.clientY;
	}
	
	InputObject.clientX = event.clientX;
	InputObject.clientY = event.clientY;
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
//	InputObject.UserData[0].HandPosition.copy(finalposition);
}, false );


document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 1;
	
	placeholder_interpret_ngl();
}, false );

function placeholder_interpret_ngl()
{
	//if it's surface then you need loose_surface.bufferList[0].group.children[0].children[0].geometry
//	console.log(loose_surface);
	var ProteinGeometry = loose_surface.bufferList[0].geometry;
	
	var ourcopy = new THREE.Mesh( new THREE.BufferGeometry(),
				  new THREE.MeshPhongMaterial({side: THREE.DoubleSide /* temp */ }) );
	
	var random_vertices = new Float32Array( [
-8.607999801635742, 3.134999990463257, -1.6180000305175781, 
-5.631483554840088, 3.997194290161133, -2.678326368331909,
1.4131258726119995,-6.485607147216797,-1.058377742767334
	                              ] );
	
	var processed_verts = new Float32Array(ProteinGeometry.attributes.position.array.length / 2);
	for(var i = 0; i < processed_verts.length / 3; i++)
	{
		processed_verts[i*3+0] = ProteinGeometry.attributes.position.array[i*6+0];
		processed_verts[i*3+1] = ProteinGeometry.attributes.position.array[i*6+1];
		processed_verts[i*3+2] = ProteinGeometry.attributes.position.array[i*6+2];
	}
	
	
	var random_indices = new Uint16Array(999);
	for(var i = 0; i < 999; i++)
	{
		random_indices[i] = Math.round((ProteinGeometry.attributes.position.array.length / 3 - 1) * Math.random());
	}
	
	ourcopy.geometry.addAttribute( 'position', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.position.array, 3 ) );
	ourcopy.geometry.addAttribute( 'normal', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.normal.array, 3 ) );
	ourcopy.geometry.setIndex(
			new THREE.BufferAttribute( ProteinGeometry.index.array, 1 ) );
	console.log(ProteinGeometry.attributes.position.array)
	console.log(processed_verts)
	
	var num_NaNs =  0;
	for(var i = 0; i < ProteinGeometry.attributes.position.array.length; i++)
		if( isNaN( ProteinGeometry.attributes.position.array[i] ))
			num_NaNs++; //you get this with some proteins
	if(num_NaNs)console.log("NaNs: ", num_NaNs);
	
	ourcopy.scale.set(0.01,0.01,0.01);
	Scene.add(ourcopy);
}

document.addEventListener( 'mouseup', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 0;
}, false );

//bug: will need to think about deleted models somehow. InputObject's arrays have an uncertain length which maybe needs updating?

socket.on('ModelsReSync', function(msg)
{
	if(msg.ModelPositions.length > InputObject.ModelPositions.length)
	{
		for(var i = InputObject.ModelPositions.length; i < msg.ModelPositions.length; i++)
		{
			InputObject.ModelPositions[i] = new THREE.Vector3();
			InputObject.ModelQuaternions[i] = new THREE.Quaternion();
		}
	}
	
	for(var i = 0; i < msg.ModelPositions.length; i++)
	{
		copyvec(InputObject.ModelPositions[i], msg.ModelPositions[i]);
		copyquat(InputObject.ModelQuaternions[i], msg.ModelQuaternions[i]);
	}
	
	InputObject.ModelsReSynched = 1;
});