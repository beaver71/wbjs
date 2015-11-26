// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBCopyShapes = function(p_descriptorsToCopy, p_toolbar) {
		if(typeof(p_toolbar)==='undefined') p_toolbar = null;
		this.initialize();
		this._copiedDescriptors = p_descriptorsToCopy;
		if (p_toolbar)
			this._copiedPropData = p_toolbar.get_propertyData();
		else 
			this._copiedPropData = null;
	}
	var p = WBCopyShapes.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p._copiedDescriptors;
	p._copiedPropData;

	p.unexecute = function()
	{
		this._canvas.model.resetClip();
	}
	
	p.execute = function()
	{
		this.canvas._model.resetClip();
		var l = this._copiedDescriptors.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.addShapeToClip(this._copiedDescriptors[i]);
		}
		if (this._copiedPropData) this.canvas._model.clipboardPropData = this._copiedPropData;
	}
		
		
	wb.WBCopyShapes = WBCopyShapes;
}());
