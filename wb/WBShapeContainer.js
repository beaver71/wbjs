// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapeContainer = function() {
	  this.initialize();
	}
	var p = WBShapeContainer.prototype = new createjs.Container(); // inherit from Container

	// protected
	p._content;		//:WBShapeBase;
	p._hitArea;
	p._originalPt;	//;
	p._rotCos = 1;
	p._rotSin = 0;
	p.rotation = 0;
	p.resizable = true;
	p.rotationEnabled = true;
	p.movable = true;
	//p._hitAreaFade:Fade;
		
	p._hitAreaVisible = true;

	// public
	p.deferredComponent;	//:IDeferredInstance;
	p.kid;		//:WBShapeContainer;
		
	// initialize
	p.Container_initialize = p.initialize;
	p.initialize = function() {
		trace("WBShapeContainer.initialize");
		this.Container_initialize();
		this.createChildren();
	}

	/* getter & setter */
	
	p.set_resizable = function(p_val)
	{
		if (p_val==this.resizable) {
			return;
		}
		this.resizable = p_val;
		//TODO invalidateDisplayList();
	}
	
	p.get_x = function()
	{
		return this.x;
		//TODO
		
		if (this.rotation==0) {
			return this.get_shapeX();
		} else {
			if (this.rotation>0 && this.rotation<=90) {
				return this.get_shapeX() - this._rotSin*this.shapeHeight();
			} else if (this.rotation>90 && this.rotation<=180) {
				return this.get_shapeX() - this.get_width();
			} else if (this.rotation>-90 && this.rotation<=0) {
				return this.get_shapeX();
			} else if (this.rotation>=-180 && this.rotation<=-90) {
				return this.get_shapeX() + this._rotCos*this.shapeWidth();
			}
		}
		return 0;
	}

	p.get_width = function()
	{
		return this.width;
		//TODO
		
		if (this.rotation==0) {
			return this.shapeWidth();
		} else {
			if (this.rotation>-90 && this.rotation<=90) {
				return Math.abs(this._rotSin)*this.shapeHeight() + this._rotCos*this.shapeWidth();
			} else { //if (rotation>90 && rotation<=180) {
				return Math.abs(this._rotSin)*this.shapeHeight() - this._rotCos*this.shapeWidth();
			}
			return 0;
		}
	}

	p.get_y = function()
	{
		return this.y;
		//TODO
		
		if (this.rotation==0) {
			return this.get_shapeY();
		} else {
			if (this.rotation>0 && this.rotation<=90) {
				return this.get_shapeY();
			} else if (this.rotation>90 && this.rotation<=180) {
				return this.get_shapeY() + this._rotCos*this.shapeHeight();
			} else if (this.rotation>-90 && this.rotation<=0) {
				return this.get_shapeY() + this._rotSin*this.shapeWidth();
			} else if (this.rotation>=-180 && this.rotation<=-90) {
				return this.get_shapeY() - this.get_height();
			}
			return 0;
		}
	}
		
	p.get_height = function()
	{
		return this.height;
		//TODO
		
		if (this.rotation==0) {
			return this.shapeHeight();
		} else {
			if (this.rotation>-90 && this.rotation<=90) {
				return this._rotCos*this.shapeHeight() + Math.abs(this._rotSin)*this.shapeWidth();
			} else { //if (rotation>90 && rotation<=180) {
				return Math.abs(this._rotSin)*this.shapeWidth() - this._rotCos*this.shapeHeight();
			}
			return 0;
		}
	}
		
	p.set_rotation = function(p_value)
	{
		this.rotation = p_value;
		this.invalidateDisplayList();
	}
	
	p.get_shapeX = function()
	{
		return this.x;
	}
	
	p.set_shapeX = function(p_x)
	{
		this.x = p_x;
	}
	
	p.get_shapeY = function()
	{
		return this.y;
	}
	
	p.set_shapeY = function(p_y)
	{
		this.y = p_y;
	}

	p.shapeWidth = function()
	{
		return this.width;
	}

	p.shapeHeight = function()
	{
		return this.height;
	}

	/* public methods */
	
	p.clearAllEvents = function()
	{
		this.clearMoveEvents();
	}

	p.move = function(p_x, p_y)
	{
		this.moveShape(p_x, p_y);
		if (this._content && this._content instanceof wb.WBBaseTextShape) {
			this._content.positionTA();
		}
		
		
/* 		if (this.rotation==0) {
			this.moveShape(p_x, p_y);
		} else {
			if (this.rotation>0 && this.rotation<=90) {
				this.moveShape(p_x + this._rotSin*this.shapeHeight(), p_y);
			} else if (this.rotation>90 && this.rotation<=180) {
				this.moveShape(p_x+this.get_width(), p_y-this._rotCos*this.shapeHeight());
			} else if (this.rotation>-90 && this.rotation<=0) {
				this.moveShape(p_x, p_y-this._rotSin*this.shapeWidth());
			} else if (this.rotation>=-180 && this.rotation<=-90) {
				this.moveShape(p_x-this._rotCos*this.shapeWidth(), p_y+this.get_height());
			}
		} */
	}

	p.moveShape = function(p_x, p_y)
	{
		//this.move(p_x, p_y);
		this.x = p_x;
		this.y = p_y;
	}

	p.set_content = function(p_content)
	{
		this._content = p_content;
		this.addChild(this._content);
		this.width = this._content.width;
		this.height = this._content.height;
		this.invalidateDisplayList();
	}
	
	p.get_content = function()
	{
		return this._content;
	}
	
	p.createChildren = function()
	{
		trace("WBShapeContainer.createChildren");	
		// create a rectangle shape the same size as the text, and assign it as the hitArea
		// note that it is never added to the display list.
		this._hitArea = new createjs.Shape();
		this._hitArea.graphics.beginFill("#AAA").drawRect(0, 0, this.get_width(), this.get_height());
		this.addChild(this._hitArea);
//TODO		this.hitArea = this._hitArea;
		
		this.addEventListener("rollover", this.moveRollOver, false);
	}
	
	p.updateDisplayList = function(w, h)
	{
		trace("WBShapeContainer.updateDisplayList: "+w+","+h);
		if (this._content) {
			this._content.setActualSize(this.shapeWidth(), this.shapeHeight());
			//this._content.validateDisplayList();
			this._content.validateNow();
		}
		
		//if (rotation!=super.rotation) {
			if (this._content) {
				this._content.isRotated = (this.rotation!=0);
				this._content.validateNow();
			}
		//	super.rotation = rotation;
			var rotRads = Math.PI*this.rotation/180;
			this._rotCos = Math.cos(rotRads);
			this._rotSin = Math.sin(rotRads);
		//}

		/*this._hitArea.visible = this._hitAreaVisible;
		this._hitArea.graphics.clear();
		this._hitArea.graphics.beginFill("#b9d9f2");
		this._hitArea.graphics.drawRoundRect(0, 0, this.shapeWidth(), this.shapeHeight(), 10, 10);
		this._hitArea.setBounds(0, 0, this.shapeWidth(), this.shapeHeight());
		this._hitArea.alpha = 0.1;
		*/
		this.width = w;
		this.height = h;
		this.setBounds(this.get_x(), this.get_y(), this.get_width(), this.get_height());
		this._hitArea.graphics.clear();
		this._hitArea.graphics.beginFill("#AAA").drawRect(0, 0, this.get_width(), this.get_height());
		this._hitArea.alpha = 0.1;
	}
	
	p.editorCreated = function(p_evt)
	{
		dispatchEvent(p_evt);
	}
	

	p.moveRollOver = function(p_evt)
	{
		var _this = p_evt.currentTarget;
		trace("WBShapeContainer.moveRollOver");
		if (stage.cursor == null || stage.cursor == "default") { 
			stage.cursor = "move";
		}
		_this._hitArea.alpha = 0.5;
		_this.addEventListener("rollout", _this.moveRollOut);
	}

	p.moveRollOut = function(p_evt)
	{
		trace("WBShapeContainer.moveRollOut");
		var _this = p_evt.currentTarget;
		stage.cursor = "default";
		_this.clearMoveEvents();
		
		_this._hitArea.alpha = 0.1;
		
		stage.update();
	}

	p.clearMoveEvents = function()
	{
		this.removeEventListener("rollout", this.moveRollOut);
	}
	
	p.validateNow = function()
	{
		//TODO CHECK
		this.getBounds();
		this.updateDisplayList(this.get_width(), this.get_height());
		if (this._content) this._content.validateNow();
	}
	
	p.invalidateDisplayList = function()
	{
		this.updateDisplayList(this.get_width(), this.get_height());
	}
	
	p.trigger = function(eventType, origEvent)
	{
		var p_evt = new createjs.Event("", false, false);
		p_evt.currentTarget = this;
		switch (eventType) {
			case "moveRollOver":
				this.moveRollOver(p_evt);
			break;
			case "moveRollOut":
				this.moveRollOut(p_evt);
			break;
			case "mouseDown":
				p_evt = new createjs.MouseEvent("mousedown", false, false);
				p_evt.currentTarget = this;
				if (origEvent) {
					p_evt.stageX = origEvent.pageX - stage.canvas.offsetLeft;
					p_evt.stageY = origEvent.pageY - stage.canvas.offsetTop;
				}
				this.dispatchEvent(p_evt);
			case "mouseDrag":
				//DRAG
				p_evt = new createjs.MouseEvent("pressmove", false, false);
				p_evt.currentTarget = this;
				if (origEvent) {
					p_evt.stageX = origEvent.pageX - stage.canvas.offsetLeft;
					p_evt.stageY = origEvent.pageY - stage.canvas.offsetTop;
				}
				this.dispatchEvent(p_evt);
			break;		
			break;		
		}
	}
		
	wb.WBShapeContainer = WBShapeContainer;
}());