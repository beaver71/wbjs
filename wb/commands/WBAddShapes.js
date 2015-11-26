// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBAddShapes = function(p_descriptorsToAdd) {
		this.initialize();
		this._descriptorsToAdd = p_descriptorsToAdd;
	}
	var p = WBAddShapes.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._descriptorsToAdd;

	p.unexecute = function()
	{
		var l = this._descriptorsToAdd.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.removeShape(this._descriptorsToAdd[i].shapeID);
		}
	}
	
	p.execute = function()
	{
		var l = this._descriptorsToAdd.length;
		for (var i=0; i<l; i++) {
			var desc = this._descriptorsToAdd[i];
			this.canvas._model.addShape(desc);
		}
	}
		
		
	wb.WBAddShapes = WBAddShapes;
}());