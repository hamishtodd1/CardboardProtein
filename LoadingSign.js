var LoadingSign;

function init_loadingsign()
{
	LoadingSign = new THREE.Mesh(
		new THREE.TextGeometry("Loading...",{size: 5 * 0.02, height: 0.01, font: gentilis}),
		new THREE.MeshPhongMaterial( {
			color: 0x156289,
			emissive: 0x072534,
			shading: THREE.FlatShading
		}) );
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = LoadingSign.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( LoadingSign.geometry.vertices[ i ] );
	}
	TextCenter.multiplyScalar( 1 / LoadingSign.geometry.vertices.length );
	for ( var i = 0, l = LoadingSign.geometry.vertices.length; i < l; i ++ ){
		LoadingSign.geometry.vertices[ i ].sub(TextCenter)
	}
	
	LoadingSign.throb_parameter = 0;
	
	Scene.add(LoadingSign);
}

function update_loadingsign()
{
	if( typeof LoadingSign === 'undefined')
		return;
	
	LoadingSign.throb_parameter += 0.05;
	while( LoadingSign.throb_parameter > TAU )
		LoadingSign.throb_parameter -= TAU;
	
	var OurScale = ( 1 + 0.07 * Math.sin(LoadingSign.throb_parameter) );
	LoadingSign.scale.set(OurScale, OurScale, OurScale);
	
	LoadingSign.position.set(0,0,0); //actually set it to where the user is looking
	
	LoadingSign.lookAt(Camera.position);
	
	//we make it get bigger and smaller, rotate to face the player, and maybe change the number of dots after the string
}