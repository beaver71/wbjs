// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapeContainersChange = function(p_descriptors) {
		this.initialize();
		this._changedDescriptors = p_descriptors;
	}
	var p = WBShapeContainersChange.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._changedDescriptors;
	p._oldDescriptors;

	p.unexecute = function()
	{
		var l = this._changedDescriptors.length;
		for (var i=0; i<l; i++) {
			var desc = this._oldDescriptors[i];
			this.canvas._model.moveSizeRotateShape(desc.shapeID, desc.x, desc.y, desc.width, desc.height, desc.rotation);
			//Questo try-catch per arginare problemi quando un altro cancella
			try{
				if (!this.areShapeContainersEqual(desc, this.canvas._model.getShapeDescriptor(desc.shapeID))) {
					var sContainer = this.canvas.getShapeContainer(desc.shapeID);
				}	
			}catch(e){
			
			}
		}
	}
	
	p.execute = function()
	{
		trace("WBShapeContainersChange.execute");
		this._oldDescriptors = new Array();
		var l = this._changedDescriptors.length;
		for (var i=0; i<l; i++) {
			var desc = this._changedDescriptors[i];
			this._oldDescriptors.push(this.canvas._model.getShapeDescriptor(desc.shapeID).clone());
			this.canvas._model.moveSizeRotateShape(desc.shapeID, desc.x, desc.y, desc.width, desc.height, desc.rotation);
			if (!this.areShapeContainersEqual(desc, this.canvas._model.getShapeDescriptor(desc.shapeID))) {
				var sContainer = this.canvas.getShapeContainer(desc.shapeID);
			}
		}
	}
	
	p.areShapeContainersEqual = function(p_shape1, p_shape2)
	{
		return (p_shape1.x==p_shape2.x && p_shape1.y==p_shape2.y && p_shape1.width==p_shape2.width && p_shape1.height==p_shape2.height && p_shape1.rotation==p_shape2.rotation);
	}
		
		
	wb.WBShapeContainersChange = WBShapeContainersChange;
}());
