// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBSendToBackShape = function(p_shape) {
		this.initialize();
		this._shape = p_shape;
	}
	var p = WBSendToBackShape.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._shape;

	p.unexecute = function()
	{
		// non esiste undo
	}
	
	p.execute = function()
	{
		this.canvas._model.sendToBackShape(this._shape);
	}
		
		
	wb.WBSendToBackShape = WBSendToBackShape;
}());
