// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var Event = function(type, bubbles, cancelable) {
		this.initialize(type, bubbles, cancelable);
	}
	var p = Event.prototype = new createjs.Event(); // inherit from Event

	// initialize
	p.Event_initialize = p.initialize;
	p.initialize = function(type, bubbles, cancelable) {
		this.Event_initialize(type, bubbles, cancelable);
	}
		
	wb.Event = Event;
}());