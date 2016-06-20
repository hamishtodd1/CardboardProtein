//A live fish

function UpdateWorld(Models,Hands)
{
	//there's a sphere, centered on you
	//we will change the position of the protein based on where you are looking
	//it will "catch up", maybe bounce back and forth a bit. Destination is a set distance from you, on a sphere, but it can go through the sphere, allowing you to fly through.
	
	update_loadingsign();
}

function Render() {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render();
	} );
	OurVREffect.render( Scene, Camera ); //will be fine if VR is not enabled
}
