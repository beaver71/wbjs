// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapeBase = function() {
	  this.initialize();
	}
	var p = WBShapeBase.prototype = new createjs.Container(); // inherit from Container

	// const
	p.NULL_COLOR = 0xFFFFFFE;
	p.MAX_WIDTH = 1200;		// Piero

	// protected	
	p._htmlText = ""; //:String;
	p._textToolBar; //:EditorToolBar;

	// public
	p.shapeID; //:String;
	p.userID; //:String;


	// initialize
	p.Container_initialize = p.initialize;
	p.initialize = function() {
		this.Container_initialize();
		//...
	}

	/* getter & setter */

	p.set_isRotated = function(p_value)
	{
		
	}
	
	p.get_isRotated = function()
	{
		return _isRotated;
	}
	
	/* public methods */
	
	p.beginDrawing = function(p_evt)
	{
		
	}
	
	
	/* protected methods */


	wb.WBShapeBase = WBShapeBase;
}());