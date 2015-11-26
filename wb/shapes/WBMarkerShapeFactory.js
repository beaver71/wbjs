// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBMarkerShapeFactory = function() {
	  this.initialize();
	}
	var p = WBMarkerShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	WBMarkerShapeFactory.CURSOR_HIGHLIGHTER_PEN = "crosshair";
	WBMarkerShapeFactory.CURSOR_PEN = "crosshair";
	
	WBMarkerShapeFactory.PEN = "pen";
	WBMarkerShapeFactory.HIGHLIGHTER = "hightlighter";
	
	WBMarkerShapeFactory.DEFAULT_COLOR = 0x000000;

	p._shapeData;
	// toolbar dedicate per i due tipi di shape al fine di conservare le properties specifiche
	p._toolBarPen;
	p._toolBarMarker;
	
	p.factoryID = function()
	{
		return "WBMarkerShapeFactory";
	}
	
	p.newShape = function()
	{
		var shape = new wb.WBMarkerShape();
		if (this.get_toolBar()) {
			shape.set_propertyData(this.get_toolBar().get_propertyData());
		}
		return shape;
	}
		
	p.get_toolBar = function()
	{
		if (this._shapeData==wb.WBMarkerShapeFactory.HIGHLIGHTER) {
			// evidenziatore
			if (!this._toolBarPen) {
				this._toolBarPen = new wb.WBPropertiesToolBar();
				var tmpShape = new wb.WBMarkerShape();
				var props = tmpShape.get_propertyData();
				props.lineColor = 0xffff00;
				props.alpha = 0.5;
				props.lineThickness = 20;
				tmpShape.set_propertyData(props);
				this._toolBarPen.set_propertyData(tmpShape.get_propertyData());
			}
			this._toolBarPen.isFilledShape = false;
			return this._toolBarPen;
		} else if (this._shapeData==wb.WBMarkerShapeFactory.PEN || this._shapeData==null) {
			// penna
			if (!this._toolBarMarker) {
				this._toolBarMarker = new wb.WBPropertiesToolBar();
				tmpShape = new wb.WBMarkerShape();
				props = tmpShape.get_propertyData();
				props.lineColor = wb.WBMarkerShapeFactory.DEFAULT_COLOR;
				props.alpha = 1.0;
				props.lineThickness = 2;
				tmpShape.set_propertyData(props);
				this._toolBarMarker.set_propertyData(tmpShape.get_propertyData());
			}
			this._toolBarMarker.isFilledShape = false;
			return this._toolBarMarker;
		}
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
		if (this._shapeData==wb.WBMarkerShapeFactory.HIGHLIGHTER) {
			return wb.WBMarkerShapeFactory.CURSOR_HIGHLIGHTER_PEN;
		} else {
			return wb.WBMarkerShapeFactory.CURSOR_PEN;
		}
	}
	
	wb.WBMarkerShapeFactory = WBMarkerShapeFactory;
}());