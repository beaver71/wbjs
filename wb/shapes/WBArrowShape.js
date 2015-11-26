// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBArrowShape = function() {
	  this.initialize();
	}
	var p = WBArrowShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase
	
	// static const
	WBArrowShape.MIN_DIMENSIONS = 30;	  // multiplo di 15 (gridUnit)
	WBArrowShape.HEAD_ANGLE = Math.PI/8; // 45 degrees
	// protected
	p._basePercentX = 0;
	p._basePercentY = 0;
	p._headPercentX = 1;
	p._headPercentY = 1;
	p._drawingX = 0;
	p._drawingY = 0;
	p._isStraight = false;
	p._lineThickness = 5;
	p._lineColor = 0x3a3a3a;
	p._dropShadow = false;
	p._gradientFill = true;
	p._lineAlpha = 1;
	p._arrowHeadSprite;	//:Sprite;
	//p._lineSprite;	sostituito da p.sh	//:Sprite;
	p._arrowHead = true;

	// initialize
	p.WBShapeBase_initialize = p.initialize;
	p.initialize = function() {
		this.WBShapeBase_initialize();
		this.createChildren();
	}
	
	/* getter & setter */

	p.WBShapeBase_get_definitionData = p.get_definitionData;
	p.get_definitionData = function()
	{
		var returnObj = this.WBShapeBase_get_definitionData();
		returnObj.basePercentX = this._basePercentX;
		returnObj.basePercentY = this._basePercentY;
		returnObj.headPercentX = this._headPercentX;
		returnObj.headPercentY = this._headPercentY;
		returnObj.arrowHead = this._arrowHead;
		return returnObj;
	}

	p.WBShapeBase_set_definitionData = p.set_definitionData;
	p.set_definitionData = function(p_data)
	{
		this.WBShapeBase_set_definitionData(p_data);
		this._basePercentX = p_data.basePercentX;
		this._basePercentY = p_data.basePercentY;
		this._headPercentX = p_data.headPercentX;
		this._headPercentY = p_data.headPercentY;
		this._arrowHead = p_data.arrowHead;
	}
		
	p.WBShapeBase_set_propertyData = p.set_propertyData;
	p.set_propertyData = function(p_data)
	{
		this.WBShapeBase_set_propertyData(p_data);
		if (p_data.lineThickness!=null) {
			this._lineThickness = p_data.lineThickness;
		} 
		if (p_data.lineColor!=null) {
			this._lineColor = p_data.lineColor;
		}
		if (p_data.dropShadow!=null) {
			this._dropShadow = p_data.dropShadow;
		}
		if (p_data.gradientFill!=null) {
			this._gradientFill = p_data.gradientFill;
		}
		if (p_data.alpha!=null) {
			this._lineAlpha = p_data.alpha
			this.alpha = this._lineAlpha;
		}
		//TODO invalidateDisplayList();
	}
		
	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.lineThickness = this._lineThickness;
		returnObj.lineColor = this._lineColor;
		returnObj.dropShadow = this._dropShadow;
		returnObj.gradientFill  = this._gradientFill;
		returnObj.alpha = this._lineAlpha;
		return returnObj;
	}
	
	// override
	p.createChildren = function()
	{
		this._arrowHeadSprite = new createjs.Shape();
		this.addChild(this._arrowHeadSprite);
		//this._lineSprite = new createjs.Shape();
		//this.addChild(this._lineSprite);
	}
		
	p.setupDrawing = function(p_evt)
	{
		trace("WBArrowShape.setupDrawing");
		var that = this;
		stage._listenerMove = function(e) { that.trackMouse(e, that) };
		stage.addEventListener("stagemousemove", stage._listenerMove, false);
	}
		
	p.cleanupDrawing = function()
	{
		trace("WBArrowShape.cleanupDrawing");
		stage.removeEventListener("stagemousemove", stage._listenerMove);
		this.normalizePoints();
	}
		
	p.trackMouse = function(p_evt, shape)
	{
		var pt = stage.localToGlobal(p_evt.stageX, p_evt.stageY);
		pt = shape.globalToLocal(pt.x, pt.y);
		/*if (WhiteBoardClient.gridVisible) {
			pt.x = Math.round(pt.x / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			pt.y = Math.round(pt.y / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
		}*/
		shape._drawingX = pt.x;
		shape._drawingY = pt.y;
		//invalidateDisplayList();
		//validateNow();
		shape.updateDisplayList(pt.x, pt.y);
	}
	
	p.normalizePoints = function()
	{
		//trace("WBArrowShape.normalizePoints");
		var realBounds = this.getBounds();
		var newBounds = realBounds;
		var inflateAmount = 0;
		if (realBounds.width<wb.WBArrowShape.MIN_DIMENSIONS) {
			this._basePercentX = inflateAmount/newBounds.width;
			this._headPercentX = (newBounds.width-inflateAmount)/newBounds.width;
		}
		if (realBounds.height<wb.WBArrowShape.MIN_DIMENSIONS) {
			this._basePercentY = inflateAmount/newBounds.height;
			this._headPercentY = (newBounds.height-inflateAmount)/newBounds.height;
		}
		if (this._drawingX<0) { 
			var tmpBaseX = this._basePercentX;
			this._basePercentX = this._headPercentX;
			this._headPercentX = tmpBaseX; 
		}
		if (this._drawingY<0) {
			var tmpBaseY = this._basePercentY;
			this._basePercentY = this._headPercentY;
			this._headPercentY = tmpBaseY;
		}
	}
		
	p.getBounds = function()
	{
		var _xMin = 0;
		var _xMax = 0;
		var _yMin = 0;
		var _yMax = 0;
		if (this._drawingX>_xMax) _xMax = this._drawingX;
		if (this._drawingX<_xMin) _xMin = this._drawingX;
		if (this._drawingY>_yMax) _yMax = this._drawingY;
		if (this._drawingY<_yMin) _yMin = this._drawingY;
		if (this._isDrawing) {
			this.width = this.sh.width = Math.abs(_xMax-_xMin);
			this.height = this.sh.height = Math.abs(_yMax-_yMin);
			this.x = this.x+_xMin;
			this.y = this.y+_yMin;
		}
		return {x: this.x, y: this.y, width: this.width, height: this.height, _xMin: _xMin, _yMin: _yMin};
	}
		
	p.updateDisplayList = function(p_w, p_h)
	{
		trace("WBArrowShape.updateDisplayList: "+p_w+", "+p_h);
		this.width = this.sh.width = Math.abs(p_w);
		this.height = this.sh.height = Math.abs(p_h);
		
		g = this.sh.graphics;
		g.clear();
		//g.lineStyle(this._lineThickness, this._lineColor, this._lineAlpha,true);
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		
		var headPointX;
		var headPointY;
		var basePointX = 0;
		var basePointY = 0;
		
		if (this._isDrawing) {
			headPointX = this._drawingX;
			headPointY = this._drawingY;
			g.moveTo(0, 0);
			g.lineTo(this._drawingX, this._drawingY);

		} else {
			basePointX = p_w*this._basePercentX;
			headPointX = p_w*this._headPercentX;
			var halfLineThickness = this._lineThickness/2;
			var modifier = (basePointX<headPointX) ? 1 : -1;
			basePointX += halfLineThickness*modifier;
			headPointX -= halfLineThickness*modifier;

			basePointY = p_h*this._basePercentY;
			headPointY = p_h*this._headPercentY;
			modifier = (basePointY<headPointY) ? 1 : -1;
			basePointY += halfLineThickness*modifier;
			headPointY -= halfLineThickness*modifier;
			
			g.moveTo(basePointX, basePointY);
			g.lineTo(headPointX, headPointY);
		}

		if (!this._arrowHead) {
			return;
		}
		var angle = wb.WBArrowShape.HEAD_ANGLE;
		var arrowHeadLength = 20 + this._lineThickness * 3;
		var rightHeadX = Math.sin(angle)*arrowHeadLength;
		var rightHeadY = Math.cos(angle)*arrowHeadLength;
		
		var g = this._arrowHeadSprite.graphics;
		g.clear();
		
		//g.lineStyle(this._lineThickness, this._lineColor, this._lineAlpha,true);
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		g.moveTo(0,0);
		g.lineTo(rightHeadX, rightHeadY);
		g.moveTo(0,0);
		g.lineTo(-rightHeadX, rightHeadY);
		
		this._arrowHeadSprite.x = headPointX;
		this._arrowHeadSprite.y = headPointY;

		var arrowHeadAngle = 90 + 180*Math.atan2(headPointY-basePointY, headPointX-basePointX)/Math.PI;
		this._arrowHeadSprite.rotation = arrowHeadAngle;
		
		stage.update();
	}
	

	wb.WBArrowShape = WBArrowShape;
}());