// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBMarkerShape = function() {
	  this.initialize();
	}
	var p = WBMarkerShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase

	// static const
	WBMarkerShape.MARKER_SIZE = 10;
	WBMarkerShape.MARKER_COLOR = 0x3a3a3a;
	// protected
	p.trackingInterval = 40;			//Intervallo era 10
	p._markerTimer;
	p._points;
	p._lastPtIndexRendered = -1;
	p._primaryColor = 0x000000;
	p._lineThickness = 2;
	p._lineAlpha = 0.75;
	p._dropShadow = false;
//	p._settings:WBSettings;
	
	// initialize
	p.WBShapeBase_initialize = p.initialize;
	p.initialize = function() {
		this.WBShapeBase_initialize();
		if (!this._points) {
			this._points = new Array();
		}
	}

/*	protected override function createChildren():void
	{
		//trace("WBMS: Create children");
		_drawingSprite = new Sprite();
		addChild(_drawingSprite);
		_settings = WBSettings.getInstance();
		trackingInterval = _settings.getValue("marker.trackingInterval");
		if (_settings.getValue("marker.transformToCurve")==true) {
			trackingInterval = trackingInterval * 2;
		}
	}*/
	
	/* getter & setter */

	p.WBShapeBase_get_definitionData = p.get_definitionData;
	p.get_definitionData = function()
	{
		var returnObj = this.WBShapeBase_get_definitionData();
		returnObj.points = this._points;
		return returnObj;
	}
	
	p.WBShapeBase_set_definitionData = p.set_definitionData;
	p.set_definitionData = function(p_data)
	{
		this.WBShapeBase_set_definitionData(p_data);
		if (p_data.points) this._points = p_data.points;
	}

	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.lineColor = this._primaryColor;
		returnObj.lineThickness = this._lineThickness;
		returnObj.alpha = this._lineAlpha;
		return returnObj;
	}
	
	p.WBShapeBase_set_propertyData = p.set_propertyData;
	p.set_propertyData = function(p_data)
	{
		this.WBShapeBase_set_propertyData(p_data);
		if (p_data) {
			this._primaryColor = p_data.lineColor;
			this._lineThickness = p_data.lineThickness;
			this._lineAlpha = p_data.alpha;
			this.alpha = this._lineAlpha;
//TODO			invalidateDisplayList();
		}
	}
	
	/* public methods */

	p.setupDrawing2 = function()
	{
		this.setupDrawing();
	}
	
	/* protected methods */
	
	p.setupDrawing = function(p_evt, shape)
	{
		if(typeof(p_evt)==='undefined') p_evt = null;
		
		trace("WBMarkerShape.setupDrawing");
		if (stage == null) stage = shape.getStage();
		
		//_markerTimer = new Timer(trackingInterval);
		shape._markerTimer = setInterval(function(e) { shape.trackMarker(e, shape) }, shape.trackingInterval);
		// // priority = 10 ==> priorita' maggiore rispetto agli altri eventi
		//_markerTimer.addEventListener(TimerEvent.TIMER, trackMarker, false, 10, true);
		//_markerTimer.start();
		
		//Copia da trackMarker per prendere il primo dei punti subito al click
		var l = shape._points.length;
		var pt = shape.globalToLocal(stage.mouseX, stage.mouseY);
		if (l!=0) {
			var lastPt = shape._points[l-1];
			if (lastPt.x==pt.x && lastPt.y==pt.y) {
				return;
			}
		}
		shape._points.push({x:pt.x, y:pt.y});
		//renderPoints(0);
		if (shape._lastPtIndexRendered < 0)
		{
			shape.renderPoints(0);
		}else{
			shape.renderPoints(shape._lastPtIndexRendered);	
		}
	}
	
	p.cleanupDrawing = function()
	{
		trace("WBMarkerShape.cleanupDrawing");
		if (this._markerTimer) {
			//_markerTimer.stop();
			//_markerTimer.removeEventListener(TimerEvent.TIMER, trackMarker);
			clearInterval(this._markerTimer);
			this._markerTimer = null;

			// qualora vi sia un solo click provvede ad inserire un secondo punto per consentire render grafico di almeno un punto
			if (this._points.length == 1) {
				this._points.push({x: this._points[0].x+1, y: this._points[0].y+1});
				this.renderPoints(0);
			}
		}
		this.normalizePoints();
	}

	p.trackMarker = function(p_evt, shape)
	{
//			trace("WBMS - trackMarker "+_markerTimer.currentCount+", "+new Date().getTime());
		if (stage == null) stage = shape.getStage();
		var l = shape._points.length;
		var pt = shape.globalToLocal(stage.mouseX, stage.mouseY);
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
//			trace("WBMarkerShape.updateDisplayList: " + this.name);
		if (!this._isDrawing) {
			this.renderPoints();
		}
	}
	
	p.renderPoints = function(p_startIndex)
	{
		if(typeof(p_startIndex)==='undefined') p_startIndex = 0;
		//trace("WBMarkerShape.renderPoints")
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
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._primaryColor));
		var multiplierW = (this._isDrawing) ? 1 : this.width;
		var multiplierH = (this._isDrawing) ? 1 : this.height;
		//trace("renderPoints: multipl="+multiplierW);
		
		for (var i=p_startIndex; i<l; i++) {
			if (i==0) {
				g.moveTo(lastPt.x*multiplierW, lastPt.y*multiplierH);
				continue;
			}
			pt = this._points[i];
			g.lineTo(pt.x*multiplierW, pt.y*multiplierH);
			lastPt = pt;
		}
		this._lastPtIndexRendered = i-1;
		
		//trace("renderPoints: l="+l);
		
		stage.update();
	}
	
	p.normalizePoints = function()
	{
		//trace("WBMarkerShape.normalizePoints");
		var bounds = this.getBounds();
		//trace("--sh: x="+this.x+", y="+this.y);
		//trace("--bn: x="+bounds.x+", y="+bounds.y+", _xMin="+bounds._xMin+", _yMin="+bounds._yMin);
		var l = this._points.length;
		for (var i=0; i<l; i++) {
			var pt = this._points[i];
			var x = pt.x, y = pt.y;
			pt.x = (pt.x-bounds._xMin)/bounds.width;
			pt.y = (pt.y-bounds._yMin)/bounds.height;
			//trace("("+i+"): x="+x+", y="+y + " ! x="+pt.x+", y="+pt.y);
		}
	}
	
	p.getBounds = function()
	{
		var multiplierW = (this._isDrawing) ? 1 : this.width;
		var multiplierH = (this._isDrawing) ? 1 : this.height;
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

	wb.WBMarkerShape = WBMarkerShape;
}());