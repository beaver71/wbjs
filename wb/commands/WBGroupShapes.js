// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBGroupShapes = function(p_shapesToGroup, p_groupID) {
		this.initialize();
		this._shapesToGroup = p_shapesToGroup;
		this._groupID = p_groupID;
	}
	var p = WBGroupShapes.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._shapesToGroup;
	p._groupID;

	p.unexecute = function()
	{
		// TODO
	}
	
	p.execute = function()
	{
		trace("WBGroupShapes.execute");
		var l = this._shapesToGroup.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.changeShapeGroup(this._shapesToGroup[i], this._groupID);
		}
	}
		
		
	wb.WBGroupShapes = WBGroupShapes;
}());
