// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBSimpleShapeFactory = function() {
	  this.initialize();
	}
	var p = WBSimpleShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	WBSimpleShapeFactory.HIGHLIGHT_AREA = "highlight_area";
	
	WBSimpleShapeFactory.CURSOR_HIGHLIGHT_AREA = "crosshair";
	WBSimpleShapeFactory.CURSOR_RECTANGLE = "crosshair";
	WBSimpleShapeFactory.CURSOR_ELLIPSE = "crosshair";
	WBSimpleShapeFactory.CURSOR_ROUNDED_RECTANGLE = "crosshair";
	WBSimpleShapeFactory.CURSOR_TRIANGLE = "crosshair";
	WBSimpleShapeFactory.CURSOR_STAR = "crosshair";		
	WBSimpleShapeFactory.CURSOR_PENTA = "crosshair";
	WBSimpleShapeFactory.CURSOR_HEXA = "crosshair";
	WBSimpleShapeFactory.CURSOR_RHOMB = "crosshair";
	WBSimpleShapeFactory.CURSOR_CIRCLE = "crosshair";
	WBSimpleShapeFactory.CURSOR_TRIANGLE_RECT = "crosshair";
	WBSimpleShapeFactory.CURSOR_DEFAULT = "crosshair";
		
	p._toolBar; //:IWBPropertiesToolBar;
	p._shapeData;
	
	p.factoryID = function()
	{
		return "WBSimpleShapeFactory";
	}
	
	p.newShape = function()
	{
		var shape = new wb.WBSimpleShape();
		if (this._shapeData!=null) {
			var _defData = shape.get_definitionData();
			if (this._shapeData==wb.WBSimpleShapeFactory.HIGHLIGHT_AREA) {
				_defData.shapeType = wb.WBSimpleShape.ROUNDED_RECTANGLE;
			} else {
				_defData.shapeType = this._shapeData;
			}
			shape.set_definitionData(_defData);
		}
		if (this._toolBar) {
			//shape.set_propertyData(_toolBar.get_propertyData()); // TODO
		}
		return shape;
	}
		
	p.get_toolBar = function()
	{
		if (!this._toolBar) {
			this._toolBar = new wb.WBPropertiesToolBar();
			var tmpShape = new wb.WBSimpleShape();
			if (this._shapeData==wb.WBSimpleShapeFactory.HIGHLIGHT_AREA) {
				var props = tmpShape.get_propertyData();
				props.primaryColor = props.lineColor = 0xffff00;
				props.alpha = 0.5;
				tmpShape.set_propertyData(props);
			}
			this._toolBar.set_propertyData(tmpShape.get_propertyData());
		}
		this._toolBar.isDashedShape = true;
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
		if (this._shapeData==wb.WBSimpleShapeFactory.HIGHLIGHT_AREA) {
			return wb.WBSimpleShapeFactory.CURSOR_HIGHLIGHT_AREA;
		} else if (this._shapeData==wb.WBSimpleShape.ELLIPSE) {
			return wb.WBSimpleShapeFactory.CURSOR_ELLIPSE;
		} else if (this._shapeData==wb.WBSimpleShape.RECTANGLE) {
			return wb.WBSimpleShapeFactory.CURSOR_RECTANGLE;
		} else if (this._shapeData==wb.WBSimpleShape.TRIANGLE) {
			return wb.WBSimpleShapeFactory.CURSOR_TRIANGLE;
		} else if (this._shapeData==wb.WBSimpleShape.STAR) {
			return wb.WBSimpleShapeFactory.CURSOR_STAR;
		} else if (this._shapeData==wb.WBSimpleShape.PENTA) {
			return wb.WBSimpleShapeFactory.CURSOR_PENTA;
		} else if (this._shapeData==wb.WBSimpleShape.HEXA) {
			return wb.WBSimpleShapeFactory.CURSOR_HEXA;
		} else if (this._shapeData==wb.WBSimpleShape.ROUNDED_RECTANGLE) {
			return wb.WBSimpleShapeFactory.CURSOR_ROUNDED_RECTANGLE;
		} else if (this._shapeData==wb.WBSimpleShape.TRIANGLE_RECT) {
			return wb.WBSimpleShapeFactory.CURSOR_TRIANGLE_RECT;
		} else if (this._shapeData==wb.WBSimpleShape.RHOMB) {
			return wb.WBSimpleShapeFactory.CURSOR_RHOMB;
		} else if (this._shapeData==wb.WBSimpleShape.CIRCLE) {
			return wb.WBSimpleShapeFactory.CURSOR_CIRCLE;
		}
		return wb.WBSimpleShapeFactory.CURSOR_DEFAULT;
	}
	
	wb.WBSimpleShapeFactory = WBSimpleShapeFactory;
}());