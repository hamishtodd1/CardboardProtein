//var placeholderprotein = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
//placeholderprotein.position.set(0,0,3);


function ReadInput()
{
	if(typeof OurVRControls !== 'undefined')
		OurVRControls.update();
	
	Camera.position.set(0,0,0); //we're doing this to simulate a cardboard.
	
	PointOfFocus.set(0,0,-1);
	Camera.localToWorld(PointOfFocus);
}

document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	placeholder_interpret_ngl();
}, false );

document.addEventListener( 'keydown', function(event)
{
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
});

function placeholder_interpret_ngl()
{
	//if it's surface then you need loose_surface.bufferList[0].group.children[0].children[0].geometry
//			console.log(loose_surface);
	var ProteinGeometry = loose_surface.bufferList[0].geometry;
	
	var ourcopy = new THREE.Mesh( new THREE.BufferGeometry(),
				  new THREE.MeshPhongMaterial({side: THREE.DoubleSide /* temp */ }) );
	
	ourcopy.geometry.addAttribute( 'position', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.position.array, 3 ) );
	ourcopy.geometry.addAttribute( 'normal', 
			new THREE.BufferAttribute( ProteinGeometry.attributes.normal.array, 3 ) );
	ourcopy.geometry.setIndex(
			new THREE.BufferAttribute( ProteinGeometry.index.array, 1 ) );
	
	var num_NaNs =  0;
	for(var i = 0; i < ProteinGeometry.attributes.position.array.length; i++)
		if( isNaN( ProteinGeometry.attributes.position.array[i] ))
			num_NaNs++; //you get this with some proteins
	if(num_NaNs)console.log("NaNs: ", num_NaNs);
	
	var ourscale = 0.03;
	ourcopy.scale.set(ourscale,ourscale,ourscale);
	OurObject.add(ourcopy);
	OurObject.remove(LoadingSign);
	
	//then need to scale it so that it is of a reasonable size
}