// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBSimpleShape = function() {
	  this.initialize();
	}
	var p = WBSimpleShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase

	// static const
	WBSimpleShape.ELLIPSE = "ellipse";
	WBSimpleShape.RECTANGLE = "rectangle";
	WBSimpleShape.ROUNDED_RECTANGLE = "roundedRectangle";
	WBSimpleShape.TRIANGLE = "triangle";
	WBSimpleShape.TRIANGLE_RECT = "triangleRect";
	WBSimpleShape.CIRCLE = "circle";
	WBSimpleShape.STAR = "star";
	WBSimpleShape.PENTA = "pentagon";
	WBSimpleShape.HEXA = "hexagon";
	WBSimpleShape.RHOMB = "rhombus";
	WBSimpleShape.EXPLO20 = "explo20";
	WBSimpleShape.CLOUD = "cloud";
	// protected	
	p._shapeType;
	p._lineThickness = 1;
	p._lineColor = 0x3a3a3a;
	p._primaryColor = 0xeaeaea;
	p._dashed = false;
	p._dropShadow = false;
	p._gradientFill = false;
	p._alpha = 1;
	p._sWidth = 0;	/* dimensioni con segno - signed width and height */
	p._sHeight = 0;
	p.p_ws;
	p.p_hs;
	p._dashLen = 10;		// dash length
	p._anchorsType = 1;		// tipo ancoraggi
	// public
	p.shapeID; //;
	p.userID; //;
	p.shapeFactory; //:IWBShapeFactory;
	p.shapeContainer; //:WBShapeContainer;
	p.popupTextToolBar = true; //:Boolean;
	p.animateEntry = false; //:Boolean;
	p.groupID; //;
	p.canvas; //:WBCanvas;
	p.isEditable = false; //:Boolean;
	p.containerType = p.CONTAINER_DEFAULT; //:int;
	// vedi WbImage
	p.currentX;
	p.currentY;
	p._drawingX = 0;
	p._drawingY = 0;

	// initialize
	p.WBShapeBase_initialize = p.initialize;
	p.initialize = function() {
		this.WBShapeBase_initialize();
		//...
	}

	/* getter & setter */
	
	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.lineThickness = this._lineThickness;
		returnObj.lineColor = this._lineColor;
		returnObj.primaryColor = this._primaryColor;
		returnObj.dropShadow = this._dropShadow;
		returnObj.gradientFill  = this._gradientFill;
		returnObj.alpha = this._alpha;
		returnObj._sWidth = this._sWidth;
		returnObj._sHeight = this._sHeight;
		returnObj.dashed = this._dashed;
		return returnObj;
	}
	
	p.WBShapeBase_set_propertyData = p.set_propertyData;
	p.set_propertyData = function(p_data)
	{
		this.WBShapeBase_set_propertyData(p_data);
		if (p_data.lineThickness!=null) {
			this._lineThickness = p_data.lineThickness;
			if (this._lineThickness<8)
				this._dashLen = 10;
			else if (this._lineThickness==8)
				this._dashLen = 15;
			else if (this._lineThickness==10)
				this._dashLen = 20;
			else if (this._lineThickness==15)
				this._dashLen = 25;
			else if (this._lineThickness==20)
				this._dashLen = 30;
		} 
		if (p_data.lineColor!=null) {
			this._lineColor = p_data.lineColor;
		}
		if (p_data.primaryColor!=null) {
			this._primaryColor = p_data.primaryColor;
		}
		if (p_data.dropShadow!=null) {
			this._dropShadow = p_data.dropShadow;
		}
		if (p_data.gradientFill!=null) {
			this._gradientFill = p_data.gradientFill;
		}
		if (p_data.alpha!=null) {
			this._alpha = p_data.alpha
		}
		if (p_data._sWidth!=null) {
			this._sWidth = p_data._sWidth;
		}
		if (p_data._sHeight!=null) {
			this._sHeight = p_data._sHeight;
		}
		if (p_data.dashed!=null) {
			this._dashed = p_data.dashed;
		}
		//TODO invalidateDisplayList();
	}
	
	p.WBShapeBase_get_definitionData = p.get_definitionData;
	p.get_definitionData = function()
	{
		var returnObj = this.WBShapeBase_get_definitionData();
		returnObj.shapeType = this._shapeType;
		return returnObj;
	}
	
	p.WBShapeBase_set_definitionData = p.set_definitionData;
	p.set_definitionData = function(p_data)
	{
		this.WBShapeBase_set_definitionData(p_data);
		if (p_data.shapeType) this._shapeType = p_data.shapeType;
		// qualora il container sia di tipo WBBoxContainer definisce _anchorsType
		if (this._shapeType==wb.WBSimpleShape.RECTANGLE || this._shapeType==wb.WBSimpleShape.ROUNDED_RECTANGLE || this._shapeType==wb.WBSimpleShape.TRIANGLE || this._shapeType==wb.WBSimpleShape.RHOMB) {
			this._anchorsType = 1;
		} else if (this._shapeType==wb.WBSimpleShape.ELLIPSE || this._shapeType==wb.WBSimpleShape.CIRCLE || this._shapeType==wb.WBSimpleShape.STAR || this._shapeType==wb.WBSimpleShape.HEXA || this._shapeType==wb.WBSimpleShape.PENTA || this._shapeType==wb.WBSimpleShape.EXPLO20 || this._shapeType==wb.WBSimpleShape.CLOUD) {
			this._anchorsType = 2;
		}
		//TODO if (shapeContainer && shapeContainer is WBBoxContainer) WBBoxContainer(shapeContainer).anchorsType = _anchorsType;
	}
	
	
	/* public methods */
	
	/**
	 * Imposta attributo shapeType di definitionData (da WbDragHandles) e propaga evento SHAPE_CHANGE 
	 * @param _shapeType
	 * 
	 */
	p.setShapeType = function(_shapeType)
	{
	//TODO
		this._shapeType = _shapeType;
		
		if ((this._shapeType==wb.WBSimpleShape.CIRCLE || this._shapeType==wb.WBSimpleShape.HEXA || this._shapeType==wb.WBSimpleShape.PENTA || this._shapeType==wb.WBSimpleShape.STAR) && this.height != this.width) {
			this.height = this.width;
			this.shapeContainer.height = this.shapeContainer.width = this.width;
		}
		
		this.invalidateDisplayList();
		
		this.dispatchEvent("SHAPE_CHANGE");
	}
	
	p.WBShapeBase_endDrawing = p.endDrawing;
	p.endDrawing = function(e, shape)
	{
		// a fine drawing salva h e w con segno (per triangRect)
		trace("WBSimpleShape.endDrawing");
		shape._sWidth = p_ws;
		shape._sHeight = p_hs;
		shape.WBShapeBase_endDrawing(e, shape);
	}
	
	
	/* protected methods */
	
	p.setupDrawing = function()
	{
		trace("WBSimpleShape.setupDrawing");
		var that = this;
		stage._listenerMove = function(e) { that.trackMouse(e, that) };
		stage.addEventListener("stagemousemove", stage._listenerMove);
	}
	
	p.cleanupDrawing = function()
	{
		trace("WBSimpleShape.cleanupDrawing");
		stage.removeEventListener("stagemousemove", stage._listenerMove);
		// chiamata solo per ridefinire i bounds corretti, in particolare x,y
		var bounds = this.getBounds();
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
		//trace("trackMouse="+pt.x+","+pt.y);
		//validateNow();
		shape.updateDisplayList(pt.x, pt.y);
	}
	
	p.updateDisplayList = function(p_w, p_h)
	{
		trace("WBSimpleShape.updateDisplayList: "+p_w+", "+p_h);
		this.width = this.sh.width = Math.abs(p_w);
		this.height = this.sh.height = Math.abs(p_h);
		
		var g = this.sh.graphics;
		g.clear();
		var lineAlpha = ((this._lineThickness==0 || this._lineColor==this.NULL_COLOR) ? 0 : this._alpha);
		// dashed
		if (this._dashed) {
			//g.lineStyle(_lineThickness, _primaryColor, (_primaryColor==this.NULL_COLOR ? 0 : lineAlpha), true);
			g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._primaryColor));
		} else {
			//g.lineStyle(_lineThickness, _lineColor, lineAlpha, true);
			g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		}
		this.alpha = this._alpha;
			
	/*	if (_gradientFill) {
			var secondColor:uint = ColorUtil.adjustBrightness(_primaryColor, -55);
			var rotationMatrix:Matrix = new Matrix();
			rotationMatrix.createGradientBox(p_w, p_h, Math.PI/2);
			g.beginGradientFill(GradientType.LINEAR, [_primaryColor, secondColor], [fillAlpha,fillAlpha], [0,255], rotationMatrix);
		} else {*/
			g.beginFill(numToHex(this._primaryColor));
	//	}
		var pX = ((p_w<0) ? p_w : 0);
		var pY = ((p_h<0) ? p_h : 0);
		/* mantiene distanze con segno */
		p_ws = p_w;
		p_hs = p_h;
		
		p_w = Math.abs(p_w);
		p_h = Math.abs(p_h);
		if (this._shapeType==wb.WBSimpleShape.RECTANGLE) {
			g.drawRect(pX, pY, p_w, p_h);
		} else if (this._shapeType==wb.WBSimpleShape.ROUNDED_RECTANGLE) {
			g.drawRoundRect(pX, pY, p_w, p_h, 12);
		} else if (this._shapeType==wb.WBSimpleShape.ELLIPSE) {
			g.drawEllipse(pX, pY, p_w, p_h);
		} else if (this._shapeType==wb.WBSimpleShape.STAR) {
			wb.GraphicsUtils.drawStar(g, pX, pY, p_w/2);
		} else if (this._shapeType==wb.WBSimpleShape.PENTA) {
			wb.GraphicsUtils.drawPolygon(g, p_w/2, 5, pX, pY, 0);
		} else if (this._shapeType==wb.WBSimpleShape.HEXA) {
			wb.GraphicsUtils.drawPolygon(g, p_w/2, 6, pX, pY, 0);
		} else if (this._shapeType==wb.WBSimpleShape.TRIANGLE) {
			g.moveTo(pX, pY+p_h);
			g.lineTo(pX+p_w/2, pY);
			g.lineTo(pX+p_w, pY+p_h);
			g.lineTo(pX, pY+p_h);
		} else if (this._shapeType==wb.WBSimpleShape.EXPLO20) {
			wb.GraphicsUtils.drawStar(g, pX, pY, p_w/2, 20, 0.7, p_h/2);
		} else if (this._shapeType==wb.WBSimpleShape.CLOUD) {
			wb.GraphicsUtils.drawCloud(g, pX, pY, p_w, p_h, this._lineColor, this._lineThickness, this._primaryColor);
		} else if (this._shapeType==wb.WBSimpleShape.RHOMB) {
			g.moveTo(pX, pY+p_h/2);
			g.lineTo(pX+p_w/2, pY);
			g.lineTo(pX+p_w, pY+p_h/2);
			g.lineTo(pX+p_w/2, pY+p_h);
			g.lineTo(pX, pY+p_h/2);
		} else if (this._shapeType==wb.WBSimpleShape.TRIANGLE_RECT) {
			if (this._sWidth != 0 && this._sHeight != 0) {
				// dopo endrawing va qui
				p_h = p_h*this._sHeight/Math.abs(this._sHeight);
				p_w = p_w*this._sWidth/Math.abs(this._sWidth);
				pX = ((p_w<0) ? Math.abs(p_w) : 0);
				pY = ((p_h<0) ? Math.abs(p_h) : 0);
			}else{
				// durante il drawing va qui
				p_h = p_hs;
				p_w = p_ws;
				pX = pY = 0;
			}
//				trace("upd: x="+pX+", y="+pY+" - h="+p_h+", w="+p_w +" - _sHeight="+ _sHeight);
			g.moveTo(pX, pY);
			g.lineTo(pX, pY+p_h);
			g.lineTo(pX+p_w, pY+p_h);
			g.lineTo(pX, pY);
		} else if (this._shapeType==wb.WBSimpleShape.CIRCLE) {
			g.drawCircle(pX+p_w/2, pY+p_w/2, p_w/2);
		}
		
		if (this._dashed) {
			g.endFill();
			this.drawDashed(g, pX, pY, p_w, p_h, this._shapeType);
		}
		
	/*	if (_dropShadow) {
			filters = [new DropShadowFilter(4, 45, 0, 0.3)];
		} else {
			filters = null;
		}*/
		
		stage.update();
	}
	
	p.drawDashed = function(g, pX, pY, p_w, p_h, _shapeType)
	{
		var lineAlpha = ((this._lineThickness==0 || this._lineColor==this.NULL_COLOR) ? 0 : this._alpha);
		//g.lineStyle(this._lineThickness, (this._lineColor==this.NULL_COLOR ? this._primaryColor : this._lineColor), lineAlpha, true);
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		
		if (this._shapeType==wb.WBSimpleShape.RECTANGLE) {
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY), new Point(pX + p_w, pY), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX + p_w, pY), new Point(pX + p_w, pY + p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX + p_w, pY + p_h), new Point(pX, pY + p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY + p_h), new Point(pX, pY), this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.ROUNDED_RECTANGLE) {
			var off = 10;
			wb.GraphicsUtils.drawLine(g, new Point(pX + off, pY), new Point(pX + p_w - off, pY), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX + p_w, pY + off), new Point(pX + p_w, pY + p_h - off), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX + p_w - off, pY + p_h), new Point(pX + off, pY + p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY + p_h - off), new Point(pX, pY + off), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawArc(g, new Point(pX + off, pY + off), off, 180, 270);
			wb.GraphicsUtils.drawArc(g, new Point(pX + p_w - off, pY + off), off, 270, 360);
			wb.GraphicsUtils.drawArc(g, new Point(pX + p_w - off, pY + p_h - off), off, 0, 90);
			wb.GraphicsUtils.drawArc(g, new Point(pX + off, pY + p_h - off), off, 90, 180);
		} else if (this._shapeType==wb.WBSimpleShape.ELLIPSE) {
			wb.GraphicsUtils.drawEllipse(g, pX+p_w/2, pY+p_h/2, p_w/2, p_h/2, this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.STAR) {
			wb.GraphicsUtils.drawStar(g, pX, pY, p_w/2, 5, 0.382, -1, this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.PENTA) {
			wb.GraphicsUtils.drawPolygon(g, p_w/2, 5, pX, pY, 0, this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.HEXA) {
			wb.GraphicsUtils.drawPolygon(g, p_w/2, 6, pX, pY, 0, this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.TRIANGLE) {
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY+p_h), new Point(pX+p_w/2, pY), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w/2, pY), new Point(pX+p_w, pY+p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w, pY+p_h), new Point(pX, pY+p_h), this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.EXPLO20) {
			wb.GraphicsUtils.drawStar(g, pX, pY, p_w/2, 20, 0.7, p_h/2, true);
		} else if (this._shapeType==wb.WBSimpleShape.CLOUD) {
			wb.GraphicsUtils.drawCloud(g, pX, pY, p_w, p_h, this._lineColor, this._lineThickness, (this._primaryColor==this.NULL_COLOR ? -1 : this._primaryColor));
		} else if (this._shapeType==wb.WBSimpleShape.RHOMB) {
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY+p_h/2), new Point(pX+p_w/2, pY), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w/2, pY), new Point(pX+p_w, pY+p_h/2), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w, pY+p_h/2), new Point(pX+p_w/2, pY+p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w/2, pY+p_h), new Point(pX, pY+p_h/2), this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.TRIANGLE_RECT) {
			if (this._sWidth != 0 && this._sHeight != 0) {
				// dopo endrawing va qui
//				p_h = p_h*this._sHeight/Math.abs(this._sHeight);
//				p_w = p_w*this._sWidth/Math.abs(this._sWidth);
				pX = ((p_w<0) ? Math.abs(p_w) : 0);
				pY = ((p_h<0) ? Math.abs(p_h) : 0);
			}else{
				// durante il drawing va qui
				p_h = p_hs;
				p_w = p_ws;
				pX = pY = 0;
			}
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY), new Point(pX, pY+p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX, pY+p_h), new Point(pX+p_w, pY+p_h), this._dashed, this._dashLen);
			wb.GraphicsUtils.drawLine(g, new Point(pX+p_w, pY+p_h), new Point(pX, pY), this._dashed, this._dashLen);
		} else if (this._shapeType==wb.WBSimpleShape.CIRCLE) {
			wb.GraphicsUtils.drawCircle(g, new Point(pX+p_w/2, pY+p_w/2), p_w/2, this._dashed, this._dashLen);
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
	

	wb.WBSimpleShape = WBSimpleShape;
}());