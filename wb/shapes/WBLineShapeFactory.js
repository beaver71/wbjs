// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBLineShapeFactory = function() {
	  this.initialize();
	}
	var p = WBLineShapeFactory.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	WBLineShapeFactory.CURSOR_SHAPELINE = "crosshair";
	WBLineShapeFactory.CURSOR_CLOSED_POLYGON = "crosshair";

	WBLineShapeFactory.CLOSED_POLYGON = "closedpolygon";
	WBLineShapeFactory.OPEN_POLYGON = "openpolygon";
	WBLineShapeFactory.OPEN_CURVE = "opencurve";
		
	p._shapeData;
	p._toolBar;
	
	p.factoryID = function()
	{
		return "WBLineShapeFactory";
	}
	
	p.newShape = function()
	{
		var nShape = new wb.WBLineShape();
		if (this.get_toolBar()) {
			nShape.set_propertyData(this.get_toolBar().get_propertyData());
		}
		if (this._shapeData!=null) {
			var _defData = nShape.get_definitionData();
			if (this._shapeData==wb.WBLineShapeFactory.CLOSED_POLYGON) {
				_defData.shapeType = wb.WBLineShape.LINE;
				_defData.closedPolygon = true;
			} else if (this._shapeData==wb.WBLineShapeFactory.OPEN_POLYGON) {
				_defData.shapeType = wb.WBLineShape.LINE;
				_defData.closedPolygon = false;
			} else if (this._shapeData==wb.WBLineShapeFactory.OPEN_CURVE) {
				_defData.shapeType = wb.WBLineShape.CURVE;
				_defData.closedPolygon = false;
			}
			this._toolBar.isFilledShape = true;
			this._toolBar.isDashedShape = true;
			nShape.set_definitionData(_defData);
		}

		nShape.isEditable = true;
		
		return nShape;
	}
		
	p.get_toolBar = function()
	{
		if (!this._toolBar) {
			this._toolBar = new wb.WBPropertiesToolBar();
			var tmpShape = new wb.WBLineShape();
			var props = tmpShape.get_propertyData();
			this._toolBar.set_propertyData(tmpShape.get_propertyData());
		}
		this._toolBar.isFilledShape = true;
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
		if (this._shapeData==wb.WBLineShapeFactory.CLOSED_POLYGON) {
			return wb.WBLineShapeFactory.CURSOR_CLOSED_POLYGON;
		} else {
			return wb.WBLineShapeFactory.CURSOR_SHAPELINE;
		}
	}
		
	wb.WBLineShapeFactory = WBLineShapeFactory;
}());