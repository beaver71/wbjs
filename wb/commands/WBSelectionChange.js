// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBSelectionChange = function(p_newSelection) {
		this.initialize();
		this._newSelection = p_newSelection;
	}
	var p = WBSelectionChange.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._oldSelection;
	p._newSelection;
	
	p.unexecute = function()
	{
	//TODO
		this.canvas.set_selectedShapeIDs(this._oldSelection);
	}
	
	p.execute = function()
	{
		trace("WBSelectionChange.execute");
		this._oldSelection = this.canvas.get_selectedShapeIDs().slice();
		this.canvas.set_selectedShapeIDs(this._newSelection);
	}
		
		
	wb.WBSelectionChange = WBSelectionChange;
}());
