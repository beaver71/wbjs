// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBRemoveShapes = function(p_descriptorsToRemove) {
		this.initialize();
		this._removedDescriptors = p_descriptorsToRemove;
	}
	var p = WBRemoveShapes.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._removedDescriptors;

	p.unexecute = function()
	{
		var l = this._removedDescriptors.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.addShape(_removedDescriptors[i]);
		}
	}
	
	p.execute = function()
	{
		var l = this._removedDescriptors.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.removeShape(_removedDescriptors[i].shapeID);
		}
	}
		
		
	wb.WBRemoveShapes = WBRemoveShapes;
}());
