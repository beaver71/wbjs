// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBImageShape = function() {
	  this.initialize();
	}
	var p = WBImageShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase

	WBImageShape.ICON_IMG_BROKEN = './wb/assets/notfound_48.png';
	
	// protected	
	p._shapeType;
	p._imageUrl;				// url completa
	p._contentID = 0;	// contentID di iLibrary oppure -1 se immagine da Gallery
	p._info;				// eventuali info associate all'immagine

	p._lineThickness = 1;
	p._lineColor = 0x3a3a3a;
	p._lineAlpha = 1;
	p._dashed = false;
	p._dropShadow = false;

//	p._settings:WBSettings;
		
	p._img;				//:Image
	p._image;			//:Bitmap
	p._imgStatus = 0;
	p._imgBroken = false;
	p._invImageUrl = false;		// invalidate URL => reload image
		
	// initialize
	p.WBShapeBase_initialize = p.initialize;
	p.initialize = function() {
		this.WBShapeBase_initialize();
		//_settings = WBSettings.getInstance();
		this.createChildren();
	}	

	p.createChildren = function()
	{
		this._img = new Image();
	}
		
	/* getter & setter */
	
	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.lineThickness = this._lineThickness;
		returnObj.lineColor = this._lineColor;
		returnObj.alpha = this._lineAlpha;
		returnObj.dropShadow = this._dropShadow;
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
		if (p_data.dropShadow!=null) {
			this._dropShadow = p_data.dropShadow;
		}
		if (p_data.alpha!=null) {
			this._lineAlpha = p_data.alpha
			if (this._image!=null) this._image.alpha = this._lineAlpha;
		}
		if (p_data.dashed!=null) {
			this._dashed = p_data.dashed;
		}
		this.invalidateDisplayList();
	}
		
	
	p.WBShapeBase_get_definitionData = p.get_definitionData;
	p.get_definitionData = function()
	{
		var returnObj = this.WBShapeBase_get_definitionData();
		returnObj.shapeType = this._shapeType;
		returnObj.imageUrl = this._imageUrl;
		returnObj.contentID = this._contentID;
		returnObj.info = this._info;
		return returnObj;
	}

	p.WBShapeBase_set_definitionData = p.set_definitionData;
	p.set_definitionData = function(p_data)
	{
		this.WBShapeBase_set_definitionData(p_data);
		if (p_data.shapeType!=null) this._shapeType = p_data.shapeType;
		if (p_data.imageUrl!=null) {
			this._imageUrl = p_data.imageUrl;
			this._invImageUrl = true;
			this.commitProperties();
		}
		if (p_data.contentID!=null) {
			this._contentID = p_data.contentID;
			this._invImageUrl = true;
			this.commitProperties();
		}
		if (p_data.info!=null) {
			this._info = p_data.info;
		}			
//TODO		invalidateDisplayList();
	}

	/**
	 * Imposta attributo shapeType, _imageUrl o _contentID di definitionData (da WbDragHandles) e propaga evento SHAPE_CHANGE 
	 * @param _shapeType
	 * 
	 */
	p.setShapeType = function(_shapeType, _imageUrl, _contentID, _info)
	{
		if (typeof(_shapeType) != 'undefined' && _shapeType != null) this._shapeType = _shapeType;
		if (typeof(_imageUrl) != 'undefined' && _imageUrl != null) this._imageUrl = _imageUrl;
		if (typeof(_contentID) != 'undefined' && _contentID != null) this._contentID = _contentID;
		if (typeof(_info) != 'undefined' && _info != null) this._info = _info;
		
		this.invalidateDisplayList();
		
		this.dispatchEvent("SHAPE_CHANGE");
	}
	
	// override
	p.beginDrawing = function(p_evt)
	{
		trace("WBImageShape.beginDrawing");
		this.x = this.currentX = p_evt.stageX; //p_evt.localX;
		this.y = this.currentY = p_evt.stageY; //p_evt.localY;
		
		this._isDrawing = true;

		this.setupDrawing(p_evt);
	}
		
	// override
	p.setupDrawing = function(p_evt)
	{
		this.move(this.currentX, this.currentY);
	}
		
	// override
	p.endDrawing = function()
	{
		trace("WBImageShape.endDrawing");
	/*	if (stage != null)
		{

		}else{
			trace("	>DRAWING CANCEL");
			dispatchEvent(new WBShapeEvent(WBShapeEvent.DRAWING_CANCEL));
			return;
		}*/
		this.cleanupDrawing();
		this._isDrawing = false;
		this.dispatchEvent("DRAWING_COMPLETE");
	}
		
	p.cleanupDrawing = function()
	{
	}

	p.commitProperties = function()
	{
		trace("WBImageShape.commitProperties");
		if (this._invImageUrl == true) {
			this._invImageUrl = false;
			var url;
			// (1) url completa
			if (this._imageUrl.toLowerCase().indexOf("http")>=0 || this._contentID == -2){
				url = this._imageUrl;
				// (2) _contentID = -1 ==> immagine da GALLERY
			} else if (this._contentID == -1) {
//				url = _settings.getValue("gallery.urlImageBase")+_settings.getValue("gallery.imageFolder")+_imageUrl;
				// (3) url relativa ==> immagine da LIBRARY
			} else {
//				url = WhiteBoardClient.libraryBaseUrl + _imageUrl;
			}
			trace("	> load url = " + url);
			//_image.load(new URLRequest(url));
			var _this = this;
			this._img.onload = function(e) {
				_this.completeHandler(e, _this);
			}
			this._img.onerror = function(e) {
				_this.errorHandler(e, _this);
			}
			this._img.src = url;
		}
	}

	p.completeHandler = function(e, _this)
	{
		_this._image = new createjs.Bitmap(e.target);
		_this.addChild(_this._image);
		_this.setBounds(_this.x, _this.y, e.target.width, e.target.height);
		_this.shapeContainer.width = _this._image.width = e.target.width;
		_this.shapeContainer.height = _this._image.height = e.target.height;
		_this.invalidateDisplayList();
		if (_this._isDrawing) {
			_this.endDrawing();
		}
	}

	p.errorHandler = function(e, _this)
	{
		trace("WBImageShape.errorHandler: msg = "+e);
		_this._img.src = wb.WBImageShape.ICON_IMG_BROKEN;
		return true;
	}
		
	p.updateDisplayList = function(p_w, p_h)
	{
		trace("WBImageShape.updateDisplayList: w,h="+p_w+", "+p_h);
		var g = this.sh.graphics;
		g.clear();
		var lineAlpha = ((this._lineThickness==0 || this._lineColor==this.NULL_COLOR) ? 0 : this._lineAlpha);
		g.setStrokeStyle(this._lineThickness,"round").beginStroke(numToHex(this._lineColor));
		
		var pX = (p_w<0) ? p_w : 0;
		var pY = (p_h<0) ? p_h : 0;
		
		p_w = Math.abs(p_w);
		p_h = Math.abs(p_h);
		
		if (this._image) {
			var scaleX = p_w/this._image.width;
			var scaleY = p_h/this._image.height;
			this._image.scaleX = scaleX;
			this._image.scaleY = scaleY;
		}

		wb.GraphicsUtils.drawLine(g, new Point(pX, pY), new Point(pX + p_w, pY), this._dashed, this._dashLen);
		wb.GraphicsUtils.drawLine(g, new Point(pX + p_w, pY), new Point(pX + p_w, pY + p_h), this._dashed, this._dashLen);
		wb.GraphicsUtils.drawLine(g, new Point(pX + p_w, pY + p_h), new Point(pX, pY + p_h), this._dashed, this._dashLen);
		wb.GraphicsUtils.drawLine(g, new Point(pX, pY + p_h), new Point(pX, pY), this._dashed, this._dashLen);

		/*if (_dropShadow) {
			filters = [new DropShadowFilter(4, 45, 0, 0.3)];
		} else {
			filters = null;
		}*/
		stage.update();
	}
	
		
	wb.WBImageShape = WBImageShape;
}());