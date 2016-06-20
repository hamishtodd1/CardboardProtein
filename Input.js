//var placeholderprotein = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
//placeholderprotein.position.set(0,0,3);


function ReadInput()
{
	OurVRControls.update();
}

document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
//	placeholder_interpret_ngl();
}, false );

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
	
	ourcopy.scale.set(0.01,0.01,0.01);
	Scene.add(ourcopy);
	Scene.remove(LoadingSign);
}