// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBPropertiesToolBar = function() {
	  this.initialize();
	}
	var p = WBPropertiesToolBar.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	// protected
	p._fillColorPicker;
	p._strokeColorPicker;
	p._thicknessCombo;
	p._alphaCombo;
	p._dashedCheck;
	//protected var _arrowLeft:Button;
	//protected var _arrowRight:Button;

	p._propertyData = {};
	p._invPropsChanged = false
	p._isFilledShape = true;
	p._isDashedShape = false;
	p._isArrowShape = false;
	
	// public
	p._fillChanged = false;
	p._strokeChanged = false;
	p._thicknessChanged = false;
	p._alphaChanged = false;
	p._dashChanged = false;
	p._arrowLChanged = false;
	p._arrowRChanged = false;
	
	p.canvas;

	// initialize
	p.EventDispatcher_initialize = p.initialize;
	p.initialize = function() {
		this.EventDispatcher_initialize();
	}

	/* getter & setter */
	
	p.get_propertyData = function()
	{
		var returnObj = this._propertyData;
		/*if (this._isFilledShape) {
			if (this._fillColorPicker) 
				returnObj.primaryColor = this._fillColorPicker.selectedColor;
		}*/
		//if (this._isDashedShape) {
		if (this._dashedCheck) returnObj.dashed = this._dashedCheck.prop('checked');
		//}
		/*if (_isArrowShape) {
			returnObj.arrowHead = _arrowRight.selected;
			returnObj.arrowBase = _arrowLeft.selected;
		}*/
		//returnObj.lineColor = _strokeColorPicker.selectedColor;
		if (this._thicknessCombo) returnObj.lineThickness = parseInt(this._thicknessCombo.val());
		if (this._alphaCombo) returnObj.alpha = this._alphaCombo.val() / 100;
		return returnObj;
	}
		
	p.set_propertyData = function(p_data)
	{
		this._propertyData = p_data;
		this._invPropsChanged = true;
		//invalidateProperties();
		this.commitProperties();
		
		this._fillChanged = false;
		this._strokeChanged = false;
		this._thicknessChanged = false;
		this._alphaChanged = false;
		this._dashChanged = false;
		this._arrowLChanged = false;
		this._arrowRChanged = false;
	}
		
	p.set_isFilledShape = function(p_fill)
	{
		if (p_fill!=this._isFilledShape) {
			this._isFilledShape = p_fill;
			//invalidateDisplayList();
		}
	}
	
	p.get_isFilledShape = function()
	{	
		return this._isFilledShape;
	}
		
	p.set_isDashedShape = function(p_dash)
	{
		if (p_dash!=_this.isDashedShape) {
			this._isDashedShape = p_dash;
			//invalidateDisplayList();
		}
	}
		
	p.get_isDashedShape = function()
	{
		return this._isDashedShape;
	}
	
	p.set_isArrowShape = function(p_arrow)
	{
		if (p_arrow!=this._isArrowShape) {
			this._isArrowShape = p_arrow;
			//invalidateDisplayList();
		}
	}
	
	p.get_isArrowShape = function()
	{
		return this._isArrowShape;
	}
		
	p.commitProperties = function()
	{
		if (this._invPropsChanged) {
			this._invPropsChanged = false;
			if (this._isFilledShape) {
				//this._fillColorPicker.setColor(this._propertyData.primaryColor);
				if (this._fillColorPicker!=undefined && this._propertyData.primaryColor!=undefined) {
					var c = numToHex(this._propertyData.primaryColor);
					this._fillColorPicker.wColorPicker('color', c);
					this._fillColorPicker.button( "widget" ).find(".wColorPicker-button-color").css("background-color", c);
				}
			}
			if (this._isDashedShape && this._dashedCheck!=undefined && this._propertyData.dashed!=undefined) {
				this._dashedCheck.prop('checked', this._propertyData.dashed);
			}
			/*if (this._isArrowShape) {
				_arrowRight.selected = _propertyData.arrowHead;
				_arrowLeft.selected = _propertyData.arrowBase;
			}*/
//			this._strokeColorPicker.setColor(this._propertyData.lineColor);
			if (this._strokeColorPicker!=undefined && this._propertyData.lineColor!=undefined) {
				var c = numToHex(this._propertyData.lineColor);
				this._strokeColorPicker.wColorPicker('color', c);
				this._strokeColorPicker.button( "widget" ).find(".wColorPicker-button-color").css("background-color", c);
			}
			
			if (this._thicknessCombo) this._thicknessCombo.spinner("value", this._propertyData.lineThickness);
			if (this._alphaCombo) this._alphaCombo.val(this._propertyData.alpha * 100);
		}
	}

	// omissis TODO
	p.createControls = function()
	{
		trace("WBPropertiesToolBar.createControls");
		var html = "<option>100</option>";
		html += "<option>75</option>";
		html += "<option>50</option>";
		html += "<option>25</option>";
		this._alphaCombo.html(html);
		
		this._thicknessCombo.spinner({ max: 20, min: 1 });
		this._strokeColorPicker.button({ text: false });
		this._fillColorPicker.button({ text: false });
		this._strokeColorPicker.button( "widget" ).find(".ui-button-text").hide();
		this._fillColorPicker.button( "widget" ).find(".ui-button-text").hide();
		
		var _this = this;
		
		this._dashedCheck.change(function() {
			_this._dashChanged = true;
			_this.dispatchEvent("shapePropertyChange");
		});
		this._alphaCombo.change(function() {
			_this._alphaChanged = true;
			_this.dispatchEvent("shapePropertyChange");
		});
		this._thicknessCombo.on( "spinchange", function( event, ui ) {
			_this._thicknessChanged = true;
			_this.dispatchEvent("shapePropertyChange");
		});
		this._thicknessCombo.on( "spin", function( event, ui ) {
			_this._thicknessChanged = true;
			_this.dispatchEvent("shapePropertyChange");
		});
		/*this._thicknessCombo.focus(function() {
			trace("$$$$$_thicknessCombo GET focus");
			_this._propertyData.lineThickness = parseInt(_this._thicknessCombo.val());
		});
		this._thicknessCombo.blur(function() {
			trace("*****_thicknessCombo lose focus");
			if (_this._propertyData.lineThickness != parseInt(_this._thicknessCombo.val())) {
				_this._thicknessChanged = true;
				_this.dispatchEvent("shapePropertyChange");
			}
		});*/
		this._strokeColorPicker.wColorPicker({
			color: numToHex(_this._propertyData.lineColor),
			mode:'click', effect:'none', position: 'rt',
			onSelect: function(color){
				_this._propertyData.lineColor = hexToNum(color);
				_this._strokeChanged = true;
				_this.dispatchEvent("shapePropertyChange");
			}
		})
		this._fillColorPicker.wColorPicker({
			color: numToHex(_this._propertyData.primaryColor),
			mode:'click', effect:'none', position: 'rt',
			onSelect: function(color){
				_this._propertyData.primaryColor = hexToNum(color);
				_this._fillChanged = true;
				_this.dispatchEvent("shapePropertyChange");
			}
		})
	}
	
	wb.WBPropertiesToolBar = WBPropertiesToolBar;
}());