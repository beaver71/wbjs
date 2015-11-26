// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBBringToFrontShape = function(p_shape) {
		this.initialize();
		this._shape = p_shape;
	}
	var p = WBBringToFrontShape.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._shape;

	p.unexecute = function()
	{
		// non esiste undo
	}
	
	p.execute = function()
	{
		this.canvas._model.bringToFrontShape(this._shape);
	}
		
		
	wb.WBBringToFrontShape = WBBringToFrontShape;
}());