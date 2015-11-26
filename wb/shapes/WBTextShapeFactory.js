// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBTextShapeFactory = function() {
	  this.initialize();
	}
	var p = WBTextShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	WBTextShapeFactory.CURSOR_TEXT = "text";
	
	p._toolBar; //:IWBPropertiesToolBar;
	p._shapeData;
	
	p.factoryID = function()
	{
		return "WBTextShapeFactory";
	}
	
	p.newShape = function()
	{
		var nShape = new wb.WBTextShape();
		nShape.isEditable = true;		// consente edit anche tramite edit handle dei DragHandles
		return nShape;
	}
		
	p.get_toolBar = function()
	{
		return null;
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
		
		return wb.WBTextShapeFactory.CURSOR_TEXT;
	}
	
	wb.WBTextShapeFactory = WBTextShapeFactory;
}());