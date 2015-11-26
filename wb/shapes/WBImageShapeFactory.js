// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBImageShapeFactory = function() {
	  this.initialize();
	}
	var p = WBImageShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	WBImageShapeFactory.CURSOR_PEN = "crosshair";

	p._toolBar; //:IWBPropertiesToolBar;
	p._shapeData;
	p.wbImage;	//:WBImageShape;
	
	p.factoryID = function()
	{
		return "WBImageShapeFactory";
	}
	
	p.newShape = function()
	{
		this.wbImage = new wb.WBImageShape();
		return this.wbImage;
	}
	
	p.getShape = function()
	{
		return this.wbImage;
	}
	
	p.get_toolBar = function()
	{
		if (!this._toolBar) {
			this._toolBar = new wb.WBPropertiesToolBar();
			var tmpShape = new wb.WBImageShape();
			this._toolBar.set_propertyData(tmpShape.get_propertyData());
		}
		this._toolBar.isDashedShape = true;
		this._toolBar.isFilledShape = false;
		return this._toolBar;
	}
	
	p.get_toggleSelectionAfterDraw = function()
	{
		return false;
	}
	
	p.get_selectionToolAfterDraw = function()
	{
		return true;
	}

	p.set_shapeData = function(p_data)
	{
	}
	
	p.get_cursor = function()
	{
		return wb.WBImageShapeFactory.CURSOR_PEN;
	}
		
	wb.WBImageShapeFactory = WBImageShapeFactory;
}());