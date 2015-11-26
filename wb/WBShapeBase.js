// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapeBase = function() {
	  this.initialize();
	}
	var p = WBShapeBase.prototype = new createjs.Container(); // inherit from Shape

	var stage = p.getStage();
	
	// const
	p.NULL_COLOR = 0xFFFFFFE;
	p.MAX_WIDTH = 1200;		// Piero
	p.DEFAULT_WIDTH = 600;	// Piero (width alla creazione se WordWrap attivo)
	p.CONTAINER_DEFAULT; //:int;
	p.CONTAINER_BOX = 1; //:int;
	p.CONTAINER_LINK = 2; //:int;
	// protected	
	p._htmlText = ""; //:String;
	p._textToolBar; //:EditorToolBar;
	p._isRotated = false; //:Boolean;
	p._isDrawing = false; //:Boolean;
	p._invTextChange = false; //:Boolean;
	p._invRotationChange = false; //:Boolean;
	// public
	p.shapeID; //:String;
	p.userID; //:String;
	p.shapeFactory; //:IWBShapeFactory;
	p.shapeContainer; //:WBShapeContainer;
	p.popupTextToolBar = true; //:Boolean;
	p.animateEntry = false; //:Boolean;
	p.groupID; //:String;
	p.canvas; //:WBCanvas;
	p.isEditable = false; //:Boolean;
	p.containerType = p.CONTAINER_DEFAULT; //:int;
	
	p.width;
	p.height;
	// vedi WbImage
	p.currentX;
	p.currentY;
	
	p.sh;	// the shape! Ora WbBaseShape e' un container e contiene almeno una shape (sh)

	// initialize
	p.Shape_initialize = p.initialize;
	p.initialize = function() {
		this.Shape_initialize();
		this.sh = new createjs.Shape();
		this.addChild(this.sh);
	}

	/* getter & setter */
	
	p.get_propertyData = function()
	{
		var returnObj = {};
		returnObj.htmlText = this._htmlText;
		return returnObj;
	}
		
	p.set_propertyData = function(p_data)
	{
		if (p_data!=null) {
			if (p_data.htmlText!=null) {
				this._htmlText = p_data.htmlText;
				this._invTextChange = true;
			}
		}
	}
	
	p.get_definitionData = function()
	{
		return {containerType: this._containerType};
	}
	
	p.set_definitionData = function(p_data)
	{
		if (p_data && p_data.containerType) this._containerType = parseInt(p_data.containerType); // as int;
	}
	
	p.get_htmlText = function()
	{
		return this._htmlText;
	}
	
	p.set_htmlText = function(p_value)
	{
		//TODO _htmlText = StringUtils.highLightURLs(p_value);		// parse di eventuali URL http
		this._htmlText = p_value;
		this._invTextChange = true;
		//TODO invalidateProperties();
		//TODO invalidateDisplayList();
	}

	p.set_isRotated = function(p_value)
	{
		if (p_value!=_isRotated) {
			this._isRotated = p_value;
			this._invRotationChange = true;
			//TODO invalidateDisplayList();
		}
	}
	
	p.get_isRotated = function()
	{
		return this._isRotated;
	}
	
	
	/* public methods */
	
	p.Shape_setBounds = p.setBounds;
	p.setBounds = function(x, y, width, height)
	{
		trace("WBShapeBase.setBounds("+x+", "+y+", "+width+", "+height+")");
		this.Shape_setBounds(x, y, width, height);
		this.width = this.sh.width = width;
		this.height = this.sh.height = height;
		this.updateDisplayList(width, height);
	}
	
	p.beginDrawing = function(p_evt)
	{
		trace("WBShapeBase.beginDrawing");
		this.x = this.currentX = p_evt.stageX; //p_evt.localX;
		this.y = this.currentY = p_evt.stageY; //p_evt.localY;
		
		if (stage == null) stage = p_evt.currentTarget;
		
		this._isDrawing = true;
		
		var that = this;
		this.canvas._drawingSurface._listenerUp = function(e) { that.endDrawing(e, that) };
		this.canvas._drawingSurface.addEventListener("pressup", this.canvas._drawingSurface._listenerUp);
		
		//stage._listenerUp = function(e) { that.endDrawing(e, that) };
		//stage.addEventListener("stagemouseup", stage._listenerUp);
		
		this.setupDrawing(p_evt, this);
	}
	
	p.endDrawing = function(e, shape)
	{
		trace("WBShapeBase.endDrawing");
		if (stage == null) stage = shape.getStage();
		if (stage != null) {
			shape.canvas._drawingSurface.removeEventListener("pressup", shape.canvas._drawingSurface._listenerUp);
		} else {
			trace("DRAWING CANCEL");
			shape.dispatchEvent("DRAWING_CANCEL");
			return;
		}
		shape.cleanupDrawing();
		// il flag sottostante va impostato dopo la chiamata di cleanupDrawing()
		shape._isDrawing = false;
		shape.dispatchEvent("DRAWING_COMPLETE");
	}
	
	p.parentChanged = function(p)
	{
		this.shapeContainer = p;  // as WBShapeContainer;
	}
	
	
	/* protected methods */
	
	p.absPoint = function(p_point)
	{
		return {x: Math.abs(p_point.x), y: Math.abs(p_point.y)};
	}
	
	p.setupDrawing = function(p_evt)
	{
		trace("WBShapeBase.setupDrawing");
	}
	
	p.cleanupDrawing = function()
	{
		trace("WBShapeBase.cleanupDrawing");
	}
	
	p.move = function(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
	p.setActualSize = function(w, h)
	{
		this.setBounds(this.x, this.y, w, h);
	}
	
	p.validateNow = function()
	{
		//TODO CHECK
		var b = this.getBounds();
		this.width = b.width;
		this.height = b.height;
		this.updateDisplayList(this.width, this.height);
	}
	
	p.invalidateDisplayList = function()
	{
		this.updateDisplayList(this.width, this.height);
	}
	
	p.hitTestObject = function(object){
		var b1 = this.getBounds();
		var tmp = this.localToGlobal(b1.x, b1.y);
		b1.x = tmp.x;
		b1.y = tmp.y;
		var b2 = object.getBounds();
		var tmp = object.localToGlobal(b2.x, b2.y);
		b2.x = tmp.x;
		b2.y = tmp.y;
		var horTest = false;
		var verTest = false;
		if (((b1.x >= b2.x)&&(b1.x <= b2.x + b2.width))||((b2.x >= b1.x)&&(b2.x <= b1.x + b1.width))){
			horTest = true;
		}
		if (((b1.y >= b2.y)&&(b1.y <= b2.y + b2.height))||((b2.y >= b1.y)&&(b2.y <= b1.y + b1.height))){
			verTest = true;
		}
		return horTest && verTest;
	}

	wb.WBShapeBase = WBShapeBase;
}());