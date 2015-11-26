// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBArrowShapeFactory = function() {
	  this.initialize();
	}
	var p = WBArrowShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	WBArrowShapeFactory.ARROW_HEAD = "arrowHead";
	WBArrowShapeFactory.NO_ARROW_HEAD = "noArrowHead";
	
	WBArrowShapeFactory.CURSOR_ARROW = "crosshair";
	WBArrowShapeFactory.CURSOR_LINE = "crosshair";
		
	p._toolBar; //:IWBPropertiesToolBar;
	p._shapeData;
	
	p.factoryID = function()
	{
		return "WBArrowShapeFactory";
	}
	
	p.newShape = function()
	{
		var shape = new wb.WBArrowShape();
		var tmpObj = shape.get_definitionData();
		tmpObj.arrowHead = (this._shapeData==wb.WBArrowShapeFactory.ARROW_HEAD);
		shape.set_definitionData(tmpObj);
		if (this._toolBar) {
			//shape.set_propertyData(_toolBar.propertyData); // TODO
		}
		return shape;
	}
	
	p.get_toolBar = function()
	{
		if (!this._toolBar) {
			this._toolBar = new wb.WBPropertiesToolBar();
			var tmpShape = new wb.WBArrowShape();
			this._toolBar.set_propertyData(tmpShape.get_propertyData());
		}
		this._toolBar.isFilledShape = false;
		return this._toolBar;

	}
	
	p.get_toggleSelectionAfterDraw = function()
	{
		return false;
	}
	
	p.get_selectionToolAfterDraw = function()
	{
		return false;
	}
	
	p.set_shapeData = function(p_data)
	{
		this._shapeData = p_data;
	}
	
	p.get_cursor = function()
	{
		if (this._shapeData==wb.WBArrowShapeFactory.ARROW_HEAD) {
			return wb.WBArrowShapeFactory.CURSOR_ARROW;
		} else {
			return wb.WBArrowShapeFactory.CURSOR_LINE;
		}
	}
	
	wb.WBArrowShapeFactory = WBArrowShapeFactory;
}());