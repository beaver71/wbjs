// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBTextShape = function() {
	  this.initialize();
	}
	var p = WBTextShape.prototype = new wb.WBBaseTextShape(); // inherit from WBBaseTextShape
	
	wb.WBTextShape = WBTextShape;
}());