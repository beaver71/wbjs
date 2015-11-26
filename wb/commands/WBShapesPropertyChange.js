// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapesPropertyChange = function(p_changedDescriptors) {
		this.initialize();
		this._changedDescriptors = p_changedDescriptors;
	}
	var p = WBShapesPropertyChange.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._changedDescriptors;
	p._oldDescriptors;

	p.unexecute = function()
	{
		var l = this._oldDescriptors.length;
		for (var i=0; i<l; i++) {
			var desc = this._oldDescriptors[i];
			this.canvas._model.changeShapeProperties(desc.shapeID, desc.propertyData);
		}
	}
	
	p.execute = function()
	{
		this._oldDescriptors = new Array();
		var l = this._changedDescriptors.length;
		for (var i=0; i<l; i++) {
			var desc = this._changedDescriptors[i];
			this._oldDescriptors.push(this.canvas._model.getShapeDescriptor(desc.shapeID).clone());
			this.canvas._model.changeShapeProperties(desc.shapeID, desc.propertyData);
		}
	}
		
		
	wb.WBShapesPropertyChange = WBShapesPropertyChange;
}());
