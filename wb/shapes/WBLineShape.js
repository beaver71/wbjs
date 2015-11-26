// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBLineShape = function() {
	  this.initialize();
	}
	var p = WBLineShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase

	// static const
	WBLineShape.CURVE = "curve";
	WBLineShape.LINE = "line";
	
	p._toolEdit = './wb/assets/tool_edit.png';
	p._editCursor = 'move';
		
	// protected
	p._points;
	p._closedPolygon = false;
	p._shapeType;
	p._scaleX = 1;
	p._scaleY = 1;
	p._lastPtIndexRendered = -1;
		
	p._lineColor = 0x000000;
	p._lineThickness = 2;
	p._lineAlpha = 0.75;
	p._dropShadow = false;
	p._fillColor = 0xCCCCCC;
	p._fillAlpha = 1;
	p._dashed = false;
		
	// colore segmento nuovo (temporaneo)
	p._newLineColor = 0xFF0000;
	// dash length
	p._dashLen = 10;
		
	p._drawingTmpSprite;
	
	p.trackingInterval = 80;			//Intervallo era 10
	p._markerTimer;	

	p.lastPosPt;
		
	p._editingPoints = false;
	p._currentHandle;
	p._handleSize = 10;
	p._originalPt;
		
	p._handleContainer;
	p._outline;
		
	p._eHandle;
//	p._poptoolbar:WBPopToolBar;
		
		// popup menu
//		private var myMenu:Menu;
//		private var _tmp:Object;
		
	p.currentPoint;
	
	// initialize
	p.WBShapeBase_initialize = p.initialize;
	p.initialize = function() {
		this.WBShapeBase_initialize();
		if (!this._points) {
			this._points = new Array();
		}
		this.createChildren();
	}

	p.createChildren = function()
	{
		this._drawingTmpSprite = new createjs.Shape();
		this.addChild(this._drawingTmpSprite);
	}
	
	/* getter & setter */
	
	p.WBShapeBase_get_definitionData = p.get_definitionData;
	p.get_definitionData = function()
	{
		var returnObj = this.WBShapeBase_get_definitionData();
		returnObj.points = this._points;
		returnObj.closedPolygon = this._closedPolygon;
		returnObj.shapeType = this._shapeType;
		if (this.sh) {
			returnObj.scaleX = this.sh.scaleX;
			returnObj.scaleY = this.sh.scaleY;
		}
		return returnObj;
	}
	
	p.WBShapeBase_set_definitionData = p.set_definitionData;
	p.set_definitionData = function(p_data)
	{
		this.WBShapeBase_set_definitionData(p_data);
		if (p_data.points) this._points = p_data.points;
		if (p_data.closedPolygon != null) this._closedPolygon = p_data.closedPolygon;
		if (p_data.scaleX != null) {
			this._scaleX = p_data.scaleX; 
		}
		if (p_data.scaleY != null) {
			this._scaleY = p_data.scaleY;
		}
		if (p_data.shapeType != this._shapeType) {
			this._shapeType = p_data.shapeType;
			this.invalidateDisplayList();
		}
	}
	
	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.lineColor = this._lineColor;
		returnObj.lineThickness = this._lineThickness;
		returnObj.alpha = this._lineAlpha;
		returnObj.primaryColor = this._fillColor;
		returnObj.dashed = this._dashed;
		return returnObj;
	}
	
	p.WBShapeBase_set_propertyData = p.set_propertyData;
	p.set_propertyData = function(p_data)
	{
		this.WBShapeBase_set_propertyData(p_data);
		if (p_data) {
			this._lineColor = p_data.lineColor;
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
			this._lineAlpha = p_data.alpha;
			this._fillAlpha = p_data.alpha;
			this.alpha = this._lineAlpha;
			if (p_data.primaryColor!=null) {
				this._fillColor = p_data.primaryColor;
			}
			if (p_data.dashed!=null) {
				this._dashed = p_data.dashed;
			}
//TODO			invalidateDisplayList();
		}
	}
	
	/* public methods */
	
		/**
		 * Override per tener conto se il container e' ruotato, nel qual caso la shape e' non editabile 
		 * @return 
		 * 
		 */		
/*		public override function get isEditable():Boolean
		{
			if (shapeContainer && shapeContainer.rotation != 0)
				return false;
			else
				return _isEditable;
		}*/
		
	p.setupDrawing2 = function()
	{
		this.setupDrawing();
	}
	
	/* protected methods */
	
	// override
	p.beginDrawing = function(p_evt)
	{
		if (! this._isDrawing) {
			trace("WBLineShape.beginDrawing");
			this.x = this.currentX = p_evt.stageX; //p_evt.localX;
			this.y = this.currentY = p_evt.stageY; //p_evt.localY;
			/*if (WhiteBoardClient.gridVisible) {
				this.currentX = Math.round(currentX / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
				this.currentY = Math.round(currentY / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			}*/

			// handle di fine edit
		/*	_poptoolbar = new WBPopToolBar();
			PopUpManager.addPopUp(_poptoolbar, parentApplication as DisplayObject);
			_eHandle = new Button();
			_eHandle.setStyle("icon", _toolEdit);
			_eHandle.label = Localization.impl.getString("EndDrawShape");
			_eHandle.toolTip = Localization.impl.getString("EndDrawShape.tip");
			_eHandle.addEventListener(MouseEvent.MOUSE_DOWN, endDrawClick);
			_poptoolbar.addControl(_eHandle);
			var p:Point = localToGlobal(new Point(-30-_poptoolbar.measuredWidth, -30-_poptoolbar.measuredHeight));
			_poptoolbar.move(p.x, p.y);
		*/	
			// handle di fine draw
			this._eHandle = $("<button id='btnEndDraw'/>");
			this._eHandle.html("end");
			var that = this;
			this._eHandle.on("click", function(e) {
				that.endDrawClick(e, that);
			});
			// global della window
			var x = stage.canvas.offsetLeft+this.x-30;
			var y = stage.canvas.offsetTop+this.y-35;
			this._eHandle.attr("style", "width:60px; height:30px; position: absolute;left: "+x+"px; top: "+y+"px;")
			$(stage.canvas).parent().append(this._eHandle);
		
			this._isDrawing = true;
			
			var that = this;
			this.canvas._drawingSurface._listenerDb = function(e) { that.onMouseDoubleHandler(e, that) };
			this.canvas._drawingSurface.addEventListener("dblclick", this.canvas._drawingSurface._listenerDb);
			
			this.canvas._drawingSurface._listenerDn = function(e) { that.trackMarker(e, that) };
			this.canvas._drawingSurface.addEventListener("mousedown", this.canvas._drawingSurface._listenerDn);

			this._markerTimer = setInterval(function(e) { that.trackMouse(e, that) }, this.trackingInterval);
			
//			this.addEventListener("mousedown", this.trackMarker, false);
//			this.addEventListener("pressmove", this.trackMouse, false);
			
			this.setupDrawing(p_evt, this);
		}
	}
		
	p.setupDrawing = function(p_evt, shape)
	{
		if(typeof(p_evt)==='undefined') p_evt = null;
		trace("WBLineShape.setupDrawing");
		/*
		if (!WhiteBoardClient.gridVisible) {
			var _curPoint:Object = {x:mouseX, y:mouseY};
		} else {
			var _x:Number = Math.round(mouseX / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			var _y:Number = Math.round(mouseY / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			_curPoint = {x:_x, y:_y};
		}*/
		var l = shape._points.length;
		var pt = shape.globalToLocal(stage.mouseX, stage.mouseY);
		if (l!=0) {
			// arriva qui quando viene creata una shape con descrittore gia' esistente e quindi
			// _points gia' definito ma normalizzato
			shape.deNormalizePoints();
		} else {
			shape._points.push({x:pt.x, y:pt.y});
		}
		if (shape._lastPtIndexRendered < 0)
		{
			shape.renderPoints(0);
		}else{
			shape.renderPoints(shape._lastPtIndexRendered);	
		}
	}
	
	p.cleanupDrawing = function()
	{
		trace("WBLineShape.cleanupDrawing");
//		stage.removeEventListener("dblclick", this.onMouseDoubleHandler);
		this.canvas._drawingSurface.removeEventListener("dblclick", this.canvas._drawingSurface._listenerDb);		
		//this.removeEventListener("mousedown", this.trackMarker);
		this.canvas._drawingSurface.removeEventListener("mousedown", this.canvas._drawingSurface._listenerDn);
		//this.removeEventListener("pressmove", this.trackMouse);
		
		if (this._markerTimer) {
			clearInterval(this._markerTimer);
			this._markerTimer = null;
		}
		
		this.normalizePoints();
	}
	
	p.trackMarker = function(p_evt, shape)
	{
		trace("WBLineShape.trackMarker");
	/*	if (!WhiteBoardClient.gridVisible) {
			var _curPoint:Object = {x:mouseX, y:mouseY};
		} else {
			var _x:Number = Math.round(mouseX / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			var _y:Number = Math.round(mouseY / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			_curPoint = {x:_x, y:_y};
		}*/
		var l = shape._points.length;
		var pt = shape.globalToLocal(p_evt.stageX, p_evt.stageY);
		if (l!=0) {
			var lastPt = shape._points[l-1];
			if (lastPt.x==pt.x && lastPt.y==pt.y) {
				return;
			}
		}
		shape._points.push({x:pt.x, y:pt.y});
		if (shape._lastPtIndexRendered < 0) {
			shape.renderPoints(0);
		} else {
			shape.renderPoints(shape._lastPtIndexRendered);	
		}
	}
	
	p.updateDisplayList = function(p_w, p_h)
	{
//			trace("WBLineShape.updateDisplayList: " + this.name);
		if (this.sh && ! this._editingPoints) {
//				trace("upd: width="+width+", p_w="+p_w+", DrwSprite.x="+sh.x);
			this.sh.scaleX = this._scaleX;
			this.sh.x = (this.sh.scaleX>0) ? 0 : -this.sh.scaleX * this.width;
			this.sh.scaleY = this._scaleY;
			this.sh.y = (this.sh.scaleY>0) ? 0 : -this.sh.scaleY * this.height;
		}
		if (!this._isDrawing) {
			this.renderPoints();
		}
	}
	
	p.renderPoints = function(p_startIndex)
	{
		if(typeof(p_startIndex)==='undefined') p_startIndex = 0;
		trace("WBLineShape.renderPoints");
		if (!this._points) return;
		var lastPt;
		var g = this.sh.graphics;
		var l = this._points.length;
		if (p_startIndex<this._lastPtIndexRendered) {
			// we're backtracking - start over
			g.clear();
			p_startIndex = 0;
		}
		
		if (this._points.length == 0)
		{
			return;
		}
		
		if (p_startIndex==0) {
			lastPt = this._points[0];
		} else {
			lastPt = this._points[this._lastPtIndexRendered];
		}

		var pt;
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		var multiplierW = (this._isDrawing) ? 1 : this.width;
		var multiplierH = (this._isDrawing) ? 1 : this.height;
		//trace("renderPoints: multipl="+multiplierW);

		
		var isClosed = false;
		if (this._points[0].x == this._points[l-1].x && this._points[0].y == this._points[l-1].y) isClosed = true;
		
		var lineAlpha = ((this._lineThickness==0 || this._lineColor==this.NULL_COLOR) ? 0 : this._alpha);

		//g.lineStyle(_lineThickness, _lineColor, lineAlpha, true, LineScaleMode.NORMAL, CapsStyle.ROUND, JointStyle.ROUND, 8);
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));

		if (this._shapeType == wb.WBLineShape.CURVE && l>1) {
			var pts = [];
			for (var i=0; i<l; i++) {
				pts.push(new Point(this._points[i].x*multiplierW, this._points[i].y*multiplierH));
			}
			g.clear();
			// figura chiusa AND poligono AND fillcolor != vuoto
			if (isClosed && this._closedPolygon == true && this._fillColor != this.NULL_COLOR) {
				//g.beginFill(_fillColor, _fillAlpha);
				g.beginFill(numToHex(this._fillColor));
				wb.GraphicsUtils.drawCurve(g, pts, this._lineThickness, this._fillColor, this._fillAlpha, false);
				g.endFill();
			}
			wb.GraphicsUtils.drawCurve(g, pts, this._lineThickness, this._lineColor, this._lineAlpha, this._dashed, this._dashLen, this._editingPoints);
		} else {
			// figura chiusa AND poligono AND fillcolor != vuoto
			if (isClosed && this._closedPolygon == true && this._fillColor != this.NULL_COLOR) {
				if (this._dashed) {
					//g.beginFill(_fillColor, _fillAlpha);
					g.beginFill(numToHex(this._fillColor));
					//g.lineStyle(this._lineThickness, this._fillColor, this._fillAlpha, true);
					g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._fillColor));
					g.moveTo(this._points[0].x*multiplierW, this._points[0].y*multiplierH);
					for (var i=1; i<l; i++) {
						g.lineTo(this._points[i].x*multiplierW, this._points[i].y*multiplierH);
					}
					g.endFill();
				} else {
					//g.beginFill(_fillColor, _fillAlpha);
					g.beginFill(numToHex(this._fillColor));
				}
			}
			//g.lineStyle(_lineThickness, _lineColor, lineAlpha, true, LineScaleMode.NORMAL, CapsStyle.ROUND, JointStyle.ROUND, 8);
			g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
			var pt;
			for (var i=p_startIndex; i<l; i++) {
				if (i==0) {
					if (this._dashed)
						lastPosPt = new Point(lastPt.x*multiplierW, lastPt.y*multiplierH);
					else
						g.moveTo(lastPt.x*multiplierW, lastPt.y*multiplierH);
//						trace(" r.p("+i+")= " + lastPt.x*multiplierW+","+lastPt.y*multiplierH);
					continue;
				}
				pt = this._points[i];
				if (this._dashed) {
					var proxPt = new Point(pt.x*multiplierW, pt.y*multiplierH);
					wb.GraphicsUtils.drawLine(g, lastPosPt, proxPt, this._dashed, this._dashLen);
					lastPosPt = proxPt;
				} else {
					g.lineTo(pt.x*multiplierW, pt.y*multiplierH);
				}
				lastPt = pt;
//					trace(" r.p("+i+")= " + lastPt.x*multiplierW+","+lastPt.y*multiplierH);
			}
		}
		this._lastPtIndexRendered = i-1;
		if (! this._dashed) {
			g.endFill();
		}
		stage.update();
	}
	
		
	p.endDrawClick = function(p_evt, shape)
	{
		shape.onMouseDoubleHandler(p_evt, shape);
	}
		
	p.onMouseDoubleHandler = function(event, shape)
	{
		trace("WBLineShape.onMouseDoubleHandler");
		shape.endDrawing();
	}
		
	/**
	 * Chiude una spezzata e la rende un poligono chiuso 
	 * 
	 */
	p.closeLine = function()
	{
		if (this._points.length != 0) {
			var firstPt = this._points[0];
			// clona il punto iniziale e lo inserisce come punto terminale
			var lastPt = {x: firstPt.x, y: firstPt.y};
			this._points.push(lastPt);
			this.renderPoints(this._lastPtIndexRendered);
		}
	}

	/**
	 * Apre un poligono chiuso lo rende una spezzata  
	 * 
	 */
	p.openLine = function()
	{
		if (this._points.length != 0) {
			this._points.pop();
			this.renderPoints(this._lastPtIndexRendered);
		}
	}
		
	/**
	 * Imposta attributo shapeType e/o closedPolygon di definitionData (da WbDragHandles) e propaga evento SHAPE_CHANGE 
	 * @param _shapeType	se != null setta lo shapeType (altrimenti resta invariato)
	 * @param _closedPolygon
	 * 
	 */
	p.setShapeType = function(_shapeType, _closedPolygon)
	{
		if (_shapeType != null) this._shapeType = _shapeType;
		// se _closedPolygon=true ed era false allora provvede a chiudere la linea, altrimenti la apre
		if (this._closedPolygon != _closedPolygon) {
			if (_closedPolygon) {
				this.closeLine();
			} else {
				this.openLine();
			}
		}
		this._closedPolygon = _closedPolygon;
		this.invalidateDisplayList();
		this.dispatchEvent("SHAPE_CHANGE");
	}
		
	// override
	p.endDrawing = function()
	{
		trace("WBLineShape.endDrawing");
		/*
		if (_eHandle) _eHandle.removeEventListener(MouseEvent.MOUSE_DOWN, endDrawClick);
		if (_poptoolbar) PopUpManager.removePopUp(_poptoolbar);
		_eHandle = null;
		_poptoolbar = null;
		*/
		if (this._eHandle) {
			$("#btnEndDraw").remove();
		}
		
		if (this._closedPolygon) {
			this.closeLine();
		}
		
		if (!(this._points.length == 1 || this._points.length == 2 && this._points[0].x == this._points[1].x && _points[0].y == this._points[1].y)) {
			
		} else {
			trace("DRAWING CANCEL");
			this.dispatchEvent("DRAWING_CANCEL");
			return;
		}

		this.cleanupDrawing();
		// il flag sottostante va impostato dopo la chiamata di cleanupDrawing()
		this._isDrawing = false;
		this.dispatchEvent("DRAWING_COMPLETE");
	}
	
	p.trackMouse = function(p_evt, shape)
	{
		shape.drawTempLine();
	}
		
	p.drawTempLine = function()
	{
		//trace("WBLineShape.drawTempLine");
		var g = g = this._drawingTmpSprite.graphics;
		/*if (!WhiteBoardClient.gridVisible) {
			currentPoint = {x:mouseX, y:mouseY};
		} else {
			var _x:Number = Math.round(mouseX / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			var _y:Number = Math.round(mouseY / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			currentPoint = {x:_x, y:_y};
		}*/
		
		
		var currentPoint = this.globalToLocal(stage.mouseX, stage.mouseY);		
		var lastPt;
		if (this._lastPtIndexRendered) {
			lastPt = this._points[this._lastPtIndexRendered];
		} else {
			lastPt = this._points[0];
		}
		g.clear();
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._newLineColor));
		if (this._dashed) {
			wb.GraphicsUtils.drawLine(g, new Point(lastPt.x, lastPt.y), new Point(currentPoint.x, currentPoint.y), this._dashed, this._dashLen);
		} else {
			g.moveTo(lastPt.x, lastPt.y);
			g.lineTo(currentPoint.x, currentPoint.y);
		}
		stage.update();
	}
	
	p.normalizePoints = function()
	{
		trace("WBLineShape.normalizePoints");
		var bounds = this.getBounds(false);
		// determina posizione sh in base allo scale ed alle dimensioni effettive del draw
		this.sh.x = (this.sh.scaleX>0) ? 0 : -this.sh.scaleX * bounds.width;
		this.sh.y = (this.sh.scaleY>0) ? 0 : -this.sh.scaleY * bounds.height;
		// se scaleX/scaleY sono negative (flip/mirror) allora occorre ricalcolare i bounds
		// poiche' si avra' un valore bounds.x/bounds.y
		//NO, altrimenti modifica x,y!!!! bounds = this.getBounds();
//			trace(" (w,h)= " + width+" , "+height+", DrwSprite.x="+sh.x);
//			trace(" bounds(x,y)= " + bounds.x+" , "+bounds.y);
//			trace(" bounds(w,h)= " + bounds.width+" x "+bounds.height);
		var l = this._points.length;
		for (var i=0; i<l; i++) {
			var pt = this._points[i];
//				trace(" .p("+i+")= " + pt.x+","+pt.y);
			pt.x = (pt.x-bounds._xMin*this._scaleX)/bounds.width;
			pt.y = (pt.y-bounds._yMin*this._scaleY)/bounds.height;
		}
	}
	
	p.deNormalizePoints = function()
	{
		trace("WBLineShape.deNormalizePoints:");
		var bounds = this.getBounds();
		var l = this._points.length;
		for (var i=0; i<l; i++) {
			this._points[i].x = this._points[i].x*this.width;
			this._points[i].y = this._points[i].y*this.height;
//				trace(" .p("+i+")= " + _points[i].x+","+_points[i].y);
		}
	}
	
	p.beginEditing = function()
	{
		if (! this._isDrawing) {
			trace("WBLineShape.beginEditing");
			this._isDrawing = false;
			this._editingPoints = true;
			
			var that = this;
			
			// handle di fine edit
			this._eHandle = $("<button id='btnEndEdit'/>");
			this._eHandle.html("end");
			this._eHandle.on("click", function(e) {
				that.endEditing(e, that);
			});
			// global della window
			var x = stage.canvas.offsetLeft+this.shapeContainer.x-30;
			var y = stage.canvas.offsetTop+this.shapeContainer.y-35;
			this._eHandle.attr("style", "width:60px; height:30px; position: absolute;left: "+x+"px; top: "+y+"px;")
			$(stage.canvas).parent().append(this._eHandle);
	
			this.canvas._background._listenerDb = function(e) { that.viewMenuAddPoint(e, that) };
			this.canvas._background.addEventListener("dblclick", this.canvas._background._listenerDb);
			
//			this.stage.addEventListener(MouseEvent.DOUBLE_CLICK, viewMenuAddPoint, false, 0, true);

//TODO			this.shapeContainer.stage.addEventListener(MouseEvent.CLICK, onOutsideClick, false, 0, true);
			
			this.renderPoints(0);
			this.createEditHandles();
			
			// container non selezionabile
			this.shapeContainer._hitArea.visible = false;
		}
	}
		
	p.createEditHandles = function()
	{
		// disegna outline
		this._handleContainer = new createjs.Container();
		this._handleContainer.scaleX = this.sh.scaleX;
		this._handleContainer.x = this.sh.x;
		this._handleContainer.scaleY = this.sh.scaleY;
		this._handleContainer.y = this.sh.y;
		this._outline = new createjs.Shape();
		this._handleContainer.addChild(this._outline);
		this._outline.alpha = 0.1;
		var g = this._outline.graphics;
		g.clear();
		//g.beginFill("#b9d9f2");
		g.beginFill("#FF0000");
		g.drawRoundRect(0, 0, this.width, this.height, 10, 10);
		g.endFill();
		//g.setStrokeStyle(2,"round").beginStroke("#AAAAAA");
		g.setStrokeStyle(2,"round").beginStroke("#00FF00");
		wb.GraphicsUtils.drawLine(g, new Point(0, 0), new Point(0, this.height), true, 3);
		wb.GraphicsUtils.drawLine(g, new Point(0, this.height), new Point(this.width, this.height), true, 3);
		wb.GraphicsUtils.drawLine(g, new Point(this.width, this.height), new Point(this.width, 0), true, 3);
		wb.GraphicsUtils.drawLine(g, new Point(this.width, 0), new Point(0, 0), true, 3);
//		_handleContainer.toolTip = Localization.impl.getString("DOPPIO_CLIC_END");
		this.addChild(this._handleContainer);
		// disegna point edit handles
		var l = this._points.length;
		if (this._closedPolygon == true) l=l-1;
		for (var i=0; i<l; i++) {
			var _pHandle = this.createSquareHandle(this._handleSize);
			_pHandle.name = i+"";	// salva indice point nel nome
//			_pHandle.toolTip = Localization.impl.getString("Editpoint");
			_pHandle.addEventListener("rollover", this.editRollOver, false);
//			_pHandle.addEventListener("mousedown", this.viewMenuEditPoint, false);
			this._handleContainer.addChild(_pHandle);
			_pHandle.x = this._points[i].x * this.width - this._handleSize/2;
			_pHandle.y = this._points[i].y * this.height - this._handleSize/2;
		}
		stage.update();
	}
	
	p.onOutsideClick = function(event)
	{
		var p = globalToLocal(stage.localToGlobal(new Point(event.stageX, event.stageY)));
		if (p.x<0 || p.y<0 || p.x>width || p.y>height && event.target.parent != _handleContainer) 
			endEditing(event);
	}
	
	p.endEditing = function(event, _this)
	{
		trace("WBLineShape.endEditing");
		_this.removeChild(_this._handleContainer);
		_this._handleContainer = null;
		
		if (_this._eHandle) {
			$("#btnEndEdit").remove();
		}
		
		_this.recalcDimensions();
		if (_this._closedPolygon) {
			if (_this._points.length != 0) {
				var firstPt = _this._points[0];
				// clona il punto iniziale e lo inserisce come punto terminale
				var lastPt = {x: firstPt.x, y: firstPt.y};
				_this._points[_this._points.length - 1] = lastPt;
			}
		}
		// va messo dopo recalcDimensions
		_this._editingPoints = false;
		// rimuove handles e cancella outline
		_this.renderPoints(0);
		
		_this.canvas._drawingSurface.removeEventListener("dblclick", _this.canvas._drawingSurface._listenerDb);
//		shapeContainer.stage.removeEventListener(MouseEvent.CLICK, onOutsideClick);
		
		// container nuovamente selezionabile
		_this.shapeContainer._hitArea.visible = true;
		_this.dispatchEvent("SHAPE_CHANGE");
	}
		
	p.getBounds = function(_normalized)
	{
		if (typeof(_normalized)==undefined) _normalized = false;
		//var multiplierW = (this._isDrawing || !_normalized) ? 1 : this.width;
		//var multiplierH = (this._isDrawing || !_normalized) ? 1 : this.height;
		var multiplierW = (this._isDrawing) ? 1 : this.width;
		var multiplierH = (this._isDrawing) ? 1 : this.height;
/*		if (_normalized) {
			multiplierW = this.width;
			multiplierH = this.height;
		}*/
		var _xMin = 0;
		var _xMax = 0;
		var _yMin = 0;
		var _yMax = 0;
		var l = this._points.length;
		for (var i=0; i<l; i++) {
			var pt = this._points[i];
			if (pt.x*multiplierW>_xMax) _xMax = pt.x*multiplierW;
			if (pt.x*multiplierW<_xMin) _xMin = pt.x*multiplierW;
			if (pt.y*multiplierH>_yMax) _yMax = pt.y*multiplierH;
			if (pt.y*multiplierH<_yMin) _yMin = pt.y*multiplierH;
		}
		this.width = this.sh.width = Math.abs(_xMax-_xMin);
		this.height = this.sh.height = Math.abs(_yMax-_yMin);
		if (this._isDrawing) {
			this.x = this.x+_xMin;
			this.y = this.y+_yMin;
		}
		return {x: this.x, y: this.y, width: this.width, height: this.height, _xMin: _xMin, _yMin: _yMin};
	}
		
	p.recalcDimensions = function()
	{
		var bounds = this.getBounds();
		var p = this.localToGlobal(bounds.x, bounds.y);
		if (this.shapeContainer && this.shapeContainer.rotation == 0) {
//			this.deNormalizePoints();
			if (Math.abs(this.shapeContainer.x - p.x) > 1) this.shapeContainer.x = p.x;
			if (Math.abs(this.shapeContainer.y - p.y) > 1) this.shapeContainer.y = p.y;
			if (Math.abs(this.shapeContainer.width - bounds.width) > 1) this.shapeContainer.width = bounds.width;
			if (Math.abs(this.shapeContainer.height - bounds.height) > 1) this.shapeContainer.height = bounds.height;
//			this.normalizePoints();
//				trace("WBLineShape.recalcDimensions");
//				trace("	cont(x,y)= " + shapeContainer.x+" , "+shapeContainer.y);
//				trace("	cont(w,h)= " + shapeContainer.width+" x "+shapeContainer.height);
//				trace(" bounds(x,y)= " + bounds.x+" , "+bounds.y);
//				trace(" bounds(w,h)= " + bounds.width+" x "+bounds.height);
		};
	}
		
	p.createSquareHandle = function(handleSize)
	{
		var sp = new createjs.Shape();
		var g = sp.graphics;
		g.clear();
		g.setStrokeStyle(this._lineThickness,"round").beginStroke("#666666");
		g.beginFill("#AAAAAA");
		g.drawRect(0, 0, handleSize, handleSize);
		return sp;
	}
		
	p.colorHandle = function(sp, handleSize, fillColor)
	{
		if(typeof(fillColor)==='undefined') fillColor = 0xAAAAAA;

		var g = sp.graphics;
		g.clear();
		g.setStrokeStyle(this._lineThickness,"round").beginStroke("#666666");
		g.beginFill(numToHex(fillColor));
		g.drawRect(0, 0, handleSize, handleSize);
	}

	p.editRollOver = function(p_evt)
	{
		p_evt.stopImmediatePropagation();
		trace("WbLineShape.editRollOver");
		var _this = p_evt.currentTarget.parent.parent;
		_this._currentHandle = p_evt.target;
		if (stage.cursor == null || stage.cursor == "default" || stage.cursor == _this._editCursor) { 
			stage.cursor = _this._editCursor;
			_this._currentHandle.addEventListener("mousedown", _this.beginEdit, false);
			_this._currentHandle.addEventListener("rollout", _this.editRollOut);
			_this.colorHandle(_this._currentHandle, _this._handleSize, 0xFFAAAA);
			stage.update();
		}
	}
	
	p.editRollOut = function(p_evt)
	{
		trace("WbLineShape.editRollOut");
		var _this = p_evt.currentTarget.parent.parent;
		_this._currentHandle = p_evt.target;
		if (_this._currentHandle) _this.colorHandle(_this._currentHandle, _this._handleSize, 0xAAAAAA);
		_this.clearEditEvents();

		stage.cursor = "default";
		stage.update();
	}
		
	p.beginEdit = function(p_evt)
	{
		p_evt.stopImmediatePropagation();
		trace("WbLineShape.beginEdit");
		var _this = p_evt.currentTarget.parent.parent;
		_this._tmp = new Date().time;
		_this.clearEditEvents();
		_this._currentHandle = p_evt.target;
		_this._originalPt = _this._points[_this._currentHandle.name];
		
		_this.viewMenuEditPoint(p_evt);
		
		_this._currentHandle._listenerUp = function(e) { _this.endEdit(e, _this) };
		_this._currentHandle.addEventListener("pressup", _this._currentHandle._listenerUp, false);
		
		_this._currentHandle._listenerMv = function(e) { _this.trackEdit(e, _this) };
		_this._currentHandle.addEventListener("pressmove", _this._currentHandle._listenerMv, false);
	}
	
	p.endEdit = function(p_evt, _this)
	{
// TODO
		_this._tmp = new Date().time - Number(_this._tmp);
		_this.editRollOut(p_evt);
	}
	
	p.trackEdit = function(p_evt, _this)
	{
		var localPoint = _this.sh.globalToLocal(stage.localToGlobal(p_evt.stageX, p_evt.stageY));
		/*if (WhiteBoardClient.gridVisible) {
			localPoint.x = Math.round(localPoint.x / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			localPoint.y = Math.round(localPoint.y / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
		}*/
		_this._points[_this._currentHandle.name] = {x: localPoint.x/_this.width, y: localPoint.y/_this.height};
		_this._currentHandle.x = localPoint.x - _this._handleSize/2;
		_this._currentHandle.y = localPoint.y - _this._handleSize/2;
		if (_this._closedPolygon == true) {
			_this._points[_this._points.length-1] = {x: _this._points[0].x, y: _this._points[0].y};;
		}
		
		_this.invalidateDisplayList();
	}
	
	p.clearEditEvents = function()
	{
		if (this._currentHandle) {
			this._currentHandle.removeEventListener("rollout", this.editRollOut);
			this._currentHandle.removeEventListener("mousedown", this.beginEdit);
			this._currentHandle.removeEventListener("pressup", this._currentHandle._listenerUp, false);
			this._currentHandle.removeEventListener("pressmove", this._currentHandle._listenerMv, false);
		}
		this.canvas._background.removeEventListener("dblclick", this.canvas._background._listenerDb);
		this._currentHandle = null;
	}
		
	p.viewMenuAddPoint = function(p_evt, _this)
	{
		trace("viewMenuAddPoint");
		_this._tmp = {x: p_evt.stageX, y: p_evt.stageY, point: ""};
		_this.menuEditCommand("add");
	}
		
	p.viewMenuEditPoint = function(p_evt)
	{
/*		p_evt.stopImmediatePropagation();
		trace("viewMenuEditPoint");
		var _this = p_evt.currentTarget.parent.parent;	// WbLine
		var _handle = p_evt.target;
		// se tempo di edit maggiore di 150 ms allora no popup menu
		if (_this._tmp > 150) return;
		_this._tmp = {x: p_evt.stageX, y: p_evt.stageY, point: _handle.name};
		if (_this._closedPolygon == true) {
			// non permette di eliminare primo ed ultimo 
			if (_this._tmp.point==0 || _this._tmp.point==_this._points.length-1) return;
		}
*/

var _this = this;
var _handle = p_evt.target;	
		// crea menu
		var _items = {
				"del": {name: "Delete", icon: "delete"},
			};
		var pos_x = _handle.x + _this._handleSize;
		var pos_y = _handle.y + _this._handleSize;
		var p = _this.localToGlobal(pos_x, pos_y);
		
		wb.Menu.createContextMenu(
			_items, 
			function(key, options) {
				_this.menuEditCommand(key);
			}, 
			p.x, p.y);
	}
	
	p.menuEditCommand = function(cmd)  {
		trace("menuEditCommand");
		if (this._handleContainer == null) return;
		switch (cmd) {
			case "del":
				trace("	>del: " + this._tmp.point);
				var ll = 1;
				if (this._closedPolygon == true) {
					// non permette di eliminare primo ed ultimo 
					if (this._tmp.point==0 || this._tmp.point==this._points.length-1) return;
					ll=4; // numero minimo di punti per figura chiusa
				}
				if (this._points.length>ll) {
					this._points.splice(this._tmp.point, 1);
					this.renderPoints(0);
					this.removeChild(this._handleContainer);
					this.createEditHandles();
				}
				break;
			case "add":
				trace("	>add: x=" + this._tmp.x + ", y=" + this._tmp.y);
				var localPoint = this.sh.globalToLocal(this._tmp.x, this._tmp.y);
				localPoint.x = localPoint.x/this.width;
				localPoint.y = localPoint.y/this.height;
				// controlla se il punto e' situato sopra ad un segmento che congiunge due punti
				var pos = this.checkIsOverLine(localPoint);
				if (this._closedPolygon == true) {
					if (pos==-1) {
						var last = this._points.pop();
						this._points.push({x:localPoint.x, y:localPoint.y});
						this._points.push(last);
					} else {
						this._points.splice(pos, 0, {x:localPoint.x, y:localPoint.y});
					}
				} else {
					if (pos==-1)
						this._points.push({x:localPoint.x, y:localPoint.y});
					else {
						this._points.splice(pos, 0, {x:localPoint.x, y:localPoint.y});
					}
				}
				this.renderPoints(0);
				this.removeChild(this._handleContainer);
				this.createEditHandles();
				break;
		}
	}

		
	/**
	 * Ritorna la posizione pos in _points in cui inserire il nuovo punto
	 * poiche' situato sul segmento congiungente i punti pos-1 e pos 
	 * @param p
	 * @return 
	 * 
	 */
	p.checkIsOverLine = function(p)
	{
		var tol1 = 1+0.05;	// tolleranza 5%
		var tol2 = 1-0.05;
		var l = this._points.length;
		for (var i=0; i<l-1; i++) {
			var m = (this._points[i+1].y - this._points[i].y)/(this._points[i+1].x - this._points[i].x);
			var fy = m * (p.x - this._points[i].x) + this._points[i].y;
			var delta = Math.abs(fy/p.y);
			var x0 = Math.min(this._points[i+1].x, this._points[i].x);
			var x1 = Math.max(this._points[i+1].x, this._points[i].x);
			if (p.x<=x1 && p.x>=x0 && delta<tol1 && delta>tol2)
				return i+1;
		}
		return -1;
	}

	p.get_editingPoints = function()
	{
		return this._editingPoints;
	}

	p.set_editingPoints = function(value)
	{
		this._editingPoints = value;
		if (value) {
			this.renderPoints(0);
		}
	}

	p.mirror = function()
	{
		this.sh.scaleX = - this.sh.scaleX;
		this.sh.x = (this.sh.scaleX>0) ? 0 : -this.sh.scaleX * this.width;
		this.dispatchEvent("SHAPE_CHANGE");
	}
	
	p.flip = function()
	{
		this.sh.scaleY = - this.sh.scaleY;
		this.sh.y = (this.sh.scaleY>0) ? 0 : -this.sh.scaleY * this.height;
		this.dispatchEvent("SHAPE_CHANGE");
	}
		
	p.set_width = function(p_value)
	{
		if (this.sh) {
			this.sh.x = (this.sh.scaleX>0) ? 0 : -this.sh.scaleX * this.width;
//				trace("sizeWidth: width="+width+" , DrwSprite.x="+sh.x);
		}
//TODO		super.width = p_value;
	}
	
	p.set_height = function(p_value)
	{
		if (this.sh) this.sh.y = (this.sh.scaleY>0) ? 0 : -this.sh.scaleY * this.height;
//TODO		super.height = p_value;
	}
		
	// override 
	p.setActualSize = function(w, h)
	{
		this.setBounds(this.x, this.y, w, h);
		if (this.sh) {
//				trace("size: width="+width+", w="+w+", DrwSprite.x="+sh.x);
			this.sh.scaleX = this._scaleX;
			this.sh.x = (this.sh.scaleX>0) ? 0 : -this.sh.scaleX * this.width;
			this.sh.scaleY = this._scaleY;
			this.sh.y = (this.sh.scaleY>0) ? 0 : -this.sh.scaleY * this.height;
		}
	}

	wb.WBLineShape = WBLineShape;
}());