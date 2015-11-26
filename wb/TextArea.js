// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var TextArea = function() {
		this.initialize();
	}
	var p = TextArea.prototype = new createjs.Container(); // inherit from Container

	p._txt;
	p._div;
	p._outline;
	p.wordWrap;	//TODO
	
	TextArea.counter = 0;

	// initialize
	p.Container_initialize = p.initialize;
	p.initialize = function(stage) {
		this.Container_initialize();
		this._outline = new createjs.Shape();
		this.addChild(this._outline);
	}
	
	p.move = function(_stageX, _stageY)
	{
		// da coordinate stage a coordinate della window
		var x = stage.canvas.offsetLeft + _stageX;
		var y = stage.canvas.offsetTop + _stageY;
		this._div.attr('style', "position: absolute;left: "+x+"px; top: "+y+"px;");
		this.x = _stageX;
		this.y = _stageY;
	}
	
	/**
	 * Crea e inserisce nello stage una TextArea
	 */
	p.addToStage = function(_parent, _x, _y)
	{
		trace("TextArea.addToStage: "+_x+", "+_y);
		// selector del div contenente il canvas/stage
		var sel = "#"+$(stage.canvas).parent();
		
		wb.TextArea.counter++;
		var id_txt = 'txt'+wb.TextArea.counter;
		this._txt = $( "<div id='"+id_txt+"'/>" );
		this._txt.css("resize", "none");
		var id_div = 'div'+wb.TextArea.counter;
		this._div = $("<div id='"+id_div+"'/>");
		this._div.append(this._txt);
		$(stage.canvas).parent().append(this._div);
		var pt = _parent.localToGlobal(_x, _y);
		this.move(pt.x, pt.y);
		
		var _this = this;
		this._div.mouseover(function() {
			_this.dispatchEvent("mouseover");
		});
		this._div.mouseout(function() {
			_this.dispatchEvent("mouseout");
			_this._div.off("mousemove");
		});
		this._div.mousedown(function(event) {
			_this.dispatchEvent(event);
			_this._div.on("mousemove", function(event) {
				_this.dispatchEvent(event);
			});
		});
		this._div.mouseup(function() {
			_this.dispatchEvent("mouseup");
			_this._div.off("mousemove");
		});
		this._div.dblclick(function() {
			_this.dispatchEvent("dblclick");
		});
		
		this._txt.keyup(function() {
			//trace("TextArea.keyup");
			_this.dispatchEvent("change");
		});
		this._txt.focusout(function() {
			//trace("TextArea.focusout");
			_this.dispatchEvent("focusout");
		});
		
		document.getElementById(id_txt).onchange = function() {
			trace("TextArea.change");
			_this.dispatchEvent("change");
		}
		
		_parent.addChild(this);
	}
	
	p.removeFromStage = function()
	{
		this._div.remove();
	}
	
	p.set_HtmlText = function(_html)
	{
		this._txt.html(_html);
	}
		
	p.get_htmlText = function()
	{
		this._txt.html();
	}
	
	
	p.setActualSize = function(w, h)
	{
		trace("TextArea.setActualSize: "+w+", "+h);
		//this.setBounds(this.x, this.y, w, h);
		this._txt.css({"width": w+"px", "height": h+"px"});
		this.width = this._outline.width = w;
		this.height = this._outline.height = h;
	}
	
	p.setEditable = function(value)
	{
		this._txt.attr('contentEditable', value);
	}
	
	p.setNotSelectable = function()
	{
		this._txt.css({"-moz-user-select": "none",
        "-khtml-user-select": "none",
        "-webkit-user-select": "none", 
        "-o-user-select": "none" });
	}

	p.setStyle = function(attr, value)
	{
		switch (attr) {
			case "borderStyle":
				if (value == "none") value = 0;
				this.borderStyle = value;
			break;
			case "borderColor":
				this.lineColor = value;
				var g = this._outline.graphics;
				if (this.borderStyle==undefined) this.borderStyle=1;
				g.setStrokeStyle(this.borderStyle,"round").beginStroke(numToHex(this.lineColor));
				if (this.fillColor) g.beginFill(numToHex(this.fillColor));
				g.drawRect(0, 0, this.width, this.height);
			break;
			case "fillColor":
				this.fillColor = value;
				var g = this._outline.graphics;
				if (this.lineColor) g.setStrokeStyle(1,"round").beginStroke(numToHex(this.lineColor));
				g.beginFill(numToHex(this.fillColor));
				g.drawRect(0, 0, this.width, this.height);
			break;
			case "backgroundAlpha":
				this._outline.alpha = value;
			break;
		}
		stage.update();
	}
	
	p.validateNow = function()
	{
	//TODO
	}

	
	wb.TextArea = TextArea;
}());