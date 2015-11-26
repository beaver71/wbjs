// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBDragHandles = function() {
	  this.initialize();
	}
	var p = WBDragHandles.prototype = new wb.WBShapeContainer(); // inherit from WBShapeContainer
	
	WBDragHandles.ROTATOR_START_Y = -25;
	WBDragHandles.DASH_SPACING = 3;
	WBDragHandles.HANDLE_SIZE_DEFAULT = 8;
	WBDragHandles.DOUBLE_CLICK_TIME = 500;
		
	WBDragHandles.HANDLE_EDIT_TEXT = "t";
	WBDragHandles.HANDLE_EDIT_POINTS = "p";
/*
	p._delete:Class;
	p._toolEditText:Class;
*/		
	p._toolEdit = './wb/assets/tool_edit.png';
	p._toolEditText = './wb/assets/tool_edit_text.png';
	p._toolMenu = './wb/assets/tool_menu_conn.png';
	p._handleContainer;
	p._outline;
	p._tLHandle;
	p._tMHandle;
	p._tRHandle;
	p._mLHandle;
	p._mRHandle;
	p._bLHandle;
	p._bMHandle;
	p._bRHandle;
	p._eHandle;			// edit text/point handle
	p._mHandle;			// menu shape handle
	p._rotateHandle;
	p._centerCircle;
	p._cursorTable;		//:Dictionary;
	p._currentHandle;
	p._mouseBlocking = true;
	p._isMoving = false;
	p._handlesEnabled = true;
	p.moveEnabled = true;
	p._dblClickTimer;
	p.isGroup = false;
	p.outlineVisible = true;
	p.canvas = null;
	p.handleEditType = null;
	p._imEditIco;		//:Image;
	p._imTextIco		//:Image;
	p._menuType;
	
	p.offset;
      
	p.handleSize;

	
	// initialize
	p.initialize = function() {
		this.Container_initialize();
		this.createChildren();
	}

	p.set_mouseBlocking = function(p_val)
	{
		if (p_val==this._mouseBlocking) {
			return;
		}
		this._mouseBlocking = p_val;
		this.invalidateDisplayList();
	}

	p.get_mouseBlocking = function()
	{
		return this._mouseBlocking;
	}

	p.beginMouseTracking = function()
	{
		this._isMoving = true;
		this.beginMove();
		/* TODO
		_dblClickTimer.reset();
		_dblClickTimer.start();
		*/
	}

	p.set_handlesVisible = function(p_val)
	{
		if (p_val) {
			// ???? throwFocus();
		} else {
		/* TODO
			if (this._content is WBTextShape) {
				WBTextShape(_content).finishEditingText();
			}
		*/
		}
		this._handleContainer.visible = p_val;
	}
		
	p.get_handlesVisible = function()
	{
		return this._handleContainer.visible;
	}
		
	p.clearAllEvents = function()
	{
		this.clearMoveEvents();
		this.clearRotateEvents();
		this.clearSizeEvents();
	}
		
	p.set_handlesEnabled = function(p_value)
	{
		if (p_value!=this._handlesEnabled) {
			this._handlesEnabled = p_value;
			if (!this._handlesEnabled && this._tLHandle) {
				this._tLHandle.removeEventListener("rollover", this.resizeRollOver);
				this._tMHandle.removeEventListener("rollover", this.resizeRollOver);
				this._tRHandle.removeEventListener("rollover", this.resizeRollOver);
				this._mLHandle.removeEventListener("rollover", this.resizeRollOver);
				this._mRHandle.removeEventListener("rollover", this.resizeRollOver);
				this._bLHandle.removeEventListener("rollover", this.resizeRollOver);
				this._bMHandle.removeEventListener("rollover", this.resizeRollOver);
				this._bRHandle.removeEventListener("rollover", this.resizeRollOver);
				this._rotateHandle.removeEventListener("rollover", this.rotateRollOver);
				this._eHandle.removeEventListener("rollover", this.editRollOver);
				this._tLHandle.visible = false;
				this._tMHandle.visible = false;
				this._tRHandle.visible = false;
				this._mLHandle.visible = false;
				this._mRHandle.visible = false;
				this._bLHandle.visible = false;
				this._bMHandle.visible = false;
				this._bRHandle.visible = false;
				this._rotateHandle.visible = false;
				if (this.kid != null && this.kid._content.isEditable)
					this._eHandle.visible = true;
				else
					this._eHandle.visible = false;
			} else if (this._handlesEnabled && this._tLHandle) {
				this._tLHandle.addEventListener("rollover", this.resizeRollOver);
				this._tMHandle.addEventListener("rollover", this.resizeRollOver);
				this._tRHandle.addEventListener("rollover", this.resizeRollOver);
				this._mLHandle.addEventListener("rollover", this.resizeRollOver);
				this._mRHandle.addEventListener("rollover", this.resizeRollOver);
				this._bLHandle.addEventListener("rollover", this.resizeRollOver);
				this._bMHandle.addEventListener("rollover", this.resizeRollOver);
				this._bRHandle.addEventListener("rollover", this.resizeRollOver);
				this._rotateHandle.addEventListener("rollover", this.rotateRollOver);
				this._eHandle.addEventListener("rollover", this.editRollOver);
				this._tLHandle.visible = true;
				this._tMHandle.visible = true;
				this._tRHandle.visible = true;
				this._mLHandle.visible = true;
				this._mRHandle.visible = true;
				this._bLHandle.visible = true;
				this._bMHandle.visible = true;
				this._bRHandle.visible = true;
				this._rotateHandle.visible = true;
				if (this.kid != null && this.kid._content.isEditable)
					this._eHandle.visible = true;
				else
					this._eHandle.visible = false;
				if (this.kid != null && this.kid.rotationEnabled)
					this._rotateHandle.visible = true;
				else
					this._rotateHandle.visible = false;
			}
			// Piero: di default se MoveEnable = HandlesEnable
			this.moveEnabled = this._handlesEnabled;
		}
	}
		
	p.get_handlesEnabled = function()
	{
		return this._handlesEnabled;
	}
		
	p.setTag = function(dp, tag)
	{
		for (key in dp) {
			if (dp.hasOwnProperty(key)) {
				var item = dp[key];
				if (item.tag == tag)
					item.toggled = true;
				else 
					item.toggled = false;
			}
		}
	}
	
	// override
	p.WBShapeContainer_createChildren = p.createChildren;
	p.createChildren = function()
	{
		trace("WbDrag.createChildren");
		this.handleSize = wb.WBDragHandles.HANDLE_SIZE_DEFAULT;
		
		//this._cursorTable = {};
		
		this.WBShapeContainer_createChildren();	//super
		this._handleContainer = new createjs.Container();
		this.addChild(this._handleContainer);
		this._handleContainer.visible = false;
		
		this._outline = new createjs.Shape();
		this._handleContainer.addChild(this._outline);
		
		this._centerCircle = this.createCircleHandle();
		
		
		//var resizeTip = Localization.impl.getString("ResizeShape");
		this._tLHandle = this.createSquareHandle();
		//this._tLHandle.toolTip = resizeTip;
		this._tLHandle._cursor = "nw-resize";
		this._tLHandle.name = "_tLHandle";
		this._tLHandle.addEventListener("rollover", this.resizeRollOver);
		
		this._tMHandle = this.createSquareHandle();
		//this._tMHandle.toolTip = resizeTip;
		this._tMHandle._cursor = "n-resize";
		this._tMHandle.name = "_tMHandle";
		this._tMHandle.addEventListener("rollover", this.resizeRollOver);
		
		this._tRHandle = this.createSquareHandle();
		//this._tRHandle.toolTip = resizeTip;
		this._tRHandle._cursor = "ne-resize";
		this._tRHandle.name = "_tRHandle";
		this._tRHandle.addEventListener("rollover", this.resizeRollOver);

		this._mLHandle = this.createSquareHandle();
		//this._mLHandle.toolTip = resizeTip;
		this._mLHandle._cursor = "ew-resize";
		this._mLHandle.name = "_mLHandle";
		this._mLHandle.addEventListener("rollover", this.resizeRollOver);

		this._mRHandle = this.createSquareHandle();
		//this._mRHandle.toolTip = resizeTip;
		this._mRHandle._cursor = "ew-resize";
		this._mRHandle.name = "_mRHandle";
		this._mRHandle.addEventListener("rollover", this.resizeRollOver);

		this._bLHandle = this.createSquareHandle();
		//this._bLHandle.toolTip = resizeTip;
		this._bLHandle._cursor = "sw-resize";
		this._bLHandle.name = "_bLHandle";
		this._bLHandle.addEventListener("rollover", this.resizeRollOver);

		this._bMHandle = this.createSquareHandle();
		//this._bMHandle.toolTip = resizeTip;
		this._bMHandle._cursor = "s-resize";
		this._bMHandle.name = "_bMHandle";
		this._bMHandle.addEventListener("rollover", this.resizeRollOver);

		this._bRHandle = this.createSquareHandle();
		//this._bRHandle.toolTip = resizeTip;
		this._bRHandle._cursor = "se-resize";
		this._bRHandle.name = "_bRHandle";
		this._bRHandle.addEventListener("rollover", this.resizeRollOver);

		this._rotateHandle = this.createCircleHandle();
		//this._rotateHandle.toolTip = Localization.impl.getString("RotateShape");
		this._rotateHandle.addEventListener("rollover", this.rotateRollOver);

		this._eHandle = new createjs.Container();
		var sp = new createjs.Shape();
		this._eHandle.addChild(sp);
		sp.graphics.beginFill("#FFFFFF");
		sp.alpha = 0.1;
		sp.graphics.drawRect(0, 0, 24, 24);
		this._imEditIco = new createjs.Bitmap(this._toolEdit);
		this._imEditIco.width = this._imEditIco.height = 24;
		this._eHandle.addChild(this._imEditIco);

		this._imTextIco = new createjs.Bitmap(this._toolEditText);
		this._imTextIco.width = this._imTextIco.height = 24;
		this._eHandle.addChild(this._imTextIco);
		this._imTextIco.visible = false;

		/*
		_imTextIco = new Image();
		_imTextIco.source = _toolEditText;
		_imTextIco.width = _imTextIco.height = 24;
		_eHandle.addChild(_imTextIco);
		_imTextIco.visible = false;
		*/
		//_eHandle.toolTip = Localization.impl.getString("EditShape");
		this._eHandle.alpha = 0.7;
		this._eHandle.addEventListener("rollover", this.editRollOver);
		this.addChild(this._eHandle);
		this._eHandle.visible = false;
	
		this._mHandle = new createjs.Container();
		this._mHandle.width = this._mHandle.height = 24;
		var sh = new createjs.Shape();
		this._mHandle.addChild(sh);
		sh.graphics.beginFill("#FFFFFF");
		sh.alpha = 0.1;
		sh.graphics.drawRect(0, 0, 24, 24);
		var _imMenuIco = new createjs.Bitmap(this._toolMenu);
		_imMenuIco.width = _imMenuIco.height = 24;
		this._mHandle.addChild(_imMenuIco);
		this._mHandle.alpha = 0.7;
		this._mHandle.addEventListener("rollover", this.menuRollOver);
		this.addChild(this._mHandle);
		this._mHandle.visible = false;
		
		
		this.addEventListener("mousedown", this.beginMove, false);

		
//		_dblClickTimer = new Timer(DOUBLE_CLICK_TIME, 1);
	}

	// override
	p.WBShapeContainer_updateDisplayList = p.updateDisplayList;
	p.updateDisplayList = function(unscaledWidth, unscaledHeight)
	{
		trace("WbDrag.updateDisplayList("+unscaledWidth+","+unscaledHeight+")");
		this.WBShapeContainer_updateDisplayList(unscaledWidth, unscaledHeight);
		
		if (this.outlineVisible) 
			this.drawOutline();
		else
			this._centerCircle.visible = false;
		
		var adjustPos = this.handleSize/2;
		this._tLHandle.x = this._mLHandle.x = this._bLHandle.x = -adjustPos;
		this._tMHandle.x = this._bMHandle.x = this._rotateHandle.x = this._centerCircle.x = this.shapeWidth()/2-adjustPos;
		this._tRHandle.x = this._mRHandle.x = this._bRHandle.x = this.shapeWidth()-adjustPos;
		this._tLHandle.y = this._tMHandle.y = this._tRHandle.y = -adjustPos;
		this._mLHandle.y = this._mRHandle.y = this._centerCircle.y = this.shapeHeight()/2-adjustPos;
		this._bLHandle.y = this._bMHandle.y = this._bRHandle.y = this.shapeHeight()-adjustPos;
		this._eHandle.x = -24 - this.handleSize/2;
		this._eHandle.y = -24 - this.handleSize/2;

		if (this._handlesEnabled) {
			this._tLHandle.visible = this._tMHandle.visible = this._tRHandle.visible = this._mLHandle.visible = this._mRHandle.visible = this._bLHandle.visible = this._bMHandle.visible = this._bRHandle.visible = this.resizable;
			if (this.kid != null && this.kid.rotationEnabled)
				this._rotateHandle.visible = true;
			else
				this._rotateHandle.visible = false;
		}
	
		var _isEditable = false;
		if (this.kid != null) _isEditable = this.kid._content.isEditable;
		if (this.handleEditType == wb.WBDragHandles.HANDLE_EDIT_POINTS && _isEditable) {
			// edit shape
			this._eHandle.visible = true;
			this._imEditIco.visible = true;
			this._imTextIco.visible = false;
			this._eHandle.addEventListener("rollover", this.editRollOver);
		} else if (this.handleEditType == wb.WBDragHandles.HANDLE_EDIT_TEXT && _isEditable) {
			// edit testo
			this._eHandle.visible = true;
			this._imEditIco.visible = false;
			this._imTextIco.visible = true;
			this._eHandle.addEventListener("rollover", this.editRollOver);
		} else {
			this._eHandle.visible = false;
			this._eHandle.removeEventListener("rollover", this.editRollOver);
		}
		/*if (this.kid != null && this.kid._content != null && (this.kid._content is WBBoxShape || this.kid is WBLinkContainer)) {
			// se WbBoxShape o WbLinkShape allora rende visibile il menu specifico
			this.showMenuHandler();
			if (this.kid is WBLinkContainer) this._menuType = 1; else this._menuType = 2;
			// se WbLineShape allora rende visibile il menu specifico
		} else */
			if (this.kid != null && this.kid._content != null && this.kid._content instanceof wb.WBLineShape) {
			this.showMenuHandler();
			this._menuType = 6;
			// se WbSimpleShape allora rende visibile il menu specifico
		} else if (this.kid != null && this.kid._content != null && this.kid._content instanceof wb.WBSimpleShape) {
			this.showMenuHandler();
			this._menuType = 7;
		} else if (this.kid != null && this.kid._content != null && this.rotation == 0 && (this.kid._content instanceof wb.WBImageShape)) {
			this.showMenuHandler();
			this._menuType = 8;
		} else if (this.kid == null) {
			// selezione multipla
			this.showMenuHandler();
			if (!this.isGroup)
				this._menuType = 3;
			else
				this._menuType = 4;
		} else {
			// altra shape singola
			this.showMenuHandler();
			this._menuType = 5;
		}
		
///////TODO	
/////////this._eHandle.visible = true;
/////////this.showMenuHandler();		
		
		
		this._rotateHandle.y = wb.WBDragHandles.ROTATOR_START_Y-adjustPos;
		if (this._hitArea) this._hitArea.visible = this._mouseBlocking;
		
		this._handleContainer.setBounds(0, 0, this.get_width(), this.get_height());
		stage.update();
	}
	
	p.showMenuHandler = function()
	{
		this._mHandle.x = this.shapeWidth() + this.handleSize/2;
		this._mHandle.y =  -24 - this.handleSize/2;
		this._mHandle.visible = true;	
	}
	
	p.drawOutline = function()
	{
		var g = this._outline.graphics;
		g.clear();
		var lastColor;
		// top and bottom borders
		lastColor = "#6a6a6a";
		for (var i=0; i<this.shapeWidth(); i+=wb.WBDragHandles.DASH_SPACING) {
			lastColor = (lastColor=="#6a6a6a") ? "#faeaea" : "#6a6a6a";
			//g.lineStyle(2, lastColor, 1, true);
			g.setStrokeStyle(2,"round").beginStroke(lastColor);
			g.moveTo(i, 0);
			g.lineTo(i+wb.WBDragHandles.DASH_SPACING, 0);
			g.moveTo(i, this.shapeHeight());
			g.lineTo(i+wb.WBDragHandles.DASH_SPACING, this.shapeHeight());
		}
		// left and right borders
		lastColor = "#6a6a6a";
		for (i=0; i<this.shapeHeight(); i+=wb.WBDragHandles.DASH_SPACING) {
			lastColor = (lastColor=="#6a6a6a") ? "#faeaea" : "#6a6a6a";
			//g.lineStyle(2, lastColor, 1, true);
			g.setStrokeStyle(2,"round").beginStroke(lastColor);
			g.moveTo(0, i);
			g.lineTo(0, i+wb.WBDragHandles.DASH_SPACING);
			g.moveTo(this.shapeWidth(), i);
			g.lineTo(this.shapeWidth(), i+wb.WBDragHandles.DASH_SPACING);
		}
		// Piero: la rotationBar e' visibile solo se lo e' il rotationHandle
		if (this.kid != null && this.kid.rotationEnabled) {
			// rotation bar
			var endY = this.shapeHeight()/2;
			var midX = this.shapeWidth()/2;
			lastColor = "#6a6a6a";
			for (i=wb.WBDragHandles.ROTATOR_START_Y; i<endY; i+=wb.WBDragHandles.DASH_SPACING) {
				lastColor = (lastColor=="#6a6a6a") ? "#faeaea" : "#6a6a6a";
				//g.lineStyle(2, lastColor, 1, true);
				g.setStrokeStyle(2,"round").beginStroke(lastColor);
				g.moveTo(midX, i);
				g.lineTo(midX, i+wb.WBDragHandles.DASH_SPACING);
			}
		}

	}

	p.createSquareHandle = function()
	{
		var sp = new createjs.Shape();
		var g = sp.graphics;
		g.clear();
		g.setStrokeStyle(2,"round").beginStroke("#FF0000");
		g.beginFill("#ffffff");
		//g.beginGradientFill(GradientType.LINEAR, [0xffffff, 0xdadada], [1,1], [100,255]);
		g.drawRect(0, 0, this.handleSize, this.handleSize);
		sp.setBounds(0, 0, this.handleSize, this.handleSize);
		
		this._handleContainer.addChild(sp);
		return sp;
	}

	p.createCircleHandle = function()
	{
		var sp = new createjs.Shape();
		var g = sp.graphics;
		g.clear();
		g.setStrokeStyle(1,"round").beginStroke("#666666");
		g.beginFill("#ffffff");
		//g.beginGradientFill(GradientType.LINEAR, [0xffffff, 0xdadada], [1,1], [100,255]);
		var adjustPos = this.handleSize/2;
		g.drawCircle(adjustPos, adjustPos, adjustPos);
		sp.setBounds(0, 0, this.handleSize, this.handleSize);
		
		this._handleContainer.addChild(sp);
		return sp;
	}
		
	p.menuRollOver = function(p_evt)
	{
		trace("WbDrag.menuRollOver");
		var _this = p_evt.currentTarget.parent;	// WbDrag
		if (stage.cursor == null || stage.cursor == "default" || stage.cursor == "pointer") { 
			stage.cursor = "pointer";
			_this._mHandle.alpha = 1;
			_this._mHandle.addEventListener("mousedown", _this.openMenu, false);
			_this._mHandle.addEventListener("rollout", _this.menuRollOut);
			stage.update();
		}
	}
		
	p.menuRollOut = function(p_evt)
	{
		trace("WbDrag.menuRollOut");
		var _this = p_evt.currentTarget.parent;	// WbDrag
		_this._mHandle.alpha = 0.7;
		_this._mHandle.removeEventListener("mousedown", _this.openMenu);
		_this._mHandle.removeEventListener("rollout", _this.menuRollOut);
		
		stage.cursor = "default";
		stage.update();
	}

	p.openMenu = function(event)
	{
		event.stopImmediatePropagation();
		trace("WbDrag.openMenu");
		var _this = event.currentTarget.parent;	// WbDrag
		
		// crea menu
		/*var _items = {
				cut: {name: "Cut", icon: "cut"},
				"copy": {name: "Copy", icon: "copy"},
				"paste": {name: "Paste", icon: "paste"},
				"delete": {name: "Delete", icon: "delete", disabled: true},
				"sep1": "---------",
				"quit": {name: "Quit", icon: "quit"}
			};*/
		var shape = null;
		if (_this.kid && _this.kid._content) shape = _this.kid._content;
		var _items = wb.Menu.getMenu(_this._menuType, shape)
			
		var pos_x = _this._mHandle.x + _this._mHandle.width;
		var pos_y = _this._mHandle.y + _this._mHandle.height;
		var p = _this.localToGlobal(pos_x, pos_y);
		
		wb.Menu.createContextMenu(
			_items, 
			function(key, options) {
				//var m = "menu selected: " + key;
				//window.console && console.log(m) || alert(m);
				wb.Menu.onMenuItemClick(key, shape);
			}, 
			p.x, p.y);
		
		
	/*	
		// costruisce il menu in base alla shape
		var shape:WBShapeBase = null;
		if (kid && kid._content) shape = kid._content;
		var menu:Menu = WBShapeMenu.createMenu(_menuType, this.parent, shape, canvas, this);
		var pos_x = _mHandle.x + _mHandle.width;
		var pos_y = _mHandle.y + _mHandle.height;
		var p:Point = localToGlobal(new Point(pos_x, pos_y));
		WBShapeMenu.showMenu(p);
		// sposta in su' se il menu e' parzialmente fuoriscito dall'area della parentApp
		pos_y = Math.min(p.y, parentApplication.height - menu.height);
		menu.move(p.x, pos_y);
	*/
	}
	
	p.editRollOver = function(p_evt)
	{
		trace("WbDrag.editRollOver");
		var _this = p_evt.currentTarget.parent;	// WbDrag
		if (stage.cursor == null || stage.cursor == "default" || stage.cursor == "pointer") { 
			stage.cursor = "pointer";
			_this._eHandle.alpha = 1;
			_this._eHandle.addEventListener("rollout", _this.editRollOut);
			_this._eHandle.addEventListener("mousedown", _this.beginEdit);
			stage.update();
		}			
	}
	
	p.editRollOut = function(p_evt)
	{
		trace("WbDrag.editRollOut");
		var _this = p_evt.currentTarget.parent;	// WbDrag
		_this._eHandle.alpha = 0.7;
		_this._eHandle.removeEventListener("rollout", _this.editRollOut);
		_this._eHandle.removeEventListener("mousedown", _this.beginEdit);
		
		stage.cursor = "default";
		stage.update();
	}
	
	p.beginEdit = function(p_evt)
	{
		p_evt.stopImmediatePropagation();
		trace("WbDrag.beginEdit");
		var _this = p_evt.currentTarget.parent;	// WbDrag
		_this.dispatchEvent("BEGIN_EDIT_SHAPE");
	}

	p.rotateRollOver = function(p_evt)
	{
		trace("WbDrag.rotateRollOver");
		var _this = p_evt.currentTarget.parent.parent;
		if (_this.cursor == null || _this.cursor == "default" || _this.cursor == "pointer") { 
			stage.cursor = "pointer";
			stage.update();
			_this._rotateHandle.addEventListener("mousedown", _this.beginRotate, false);
			_this._rotateHandle.addEventListener("rollout", _this.rotateRollOut);
			stage.update();
		}			
	}

	p.rotateRollOut = function(p_evt)
	{
		trace("WbDrag.rotateRollOut");
		var _this = p_evt.currentTarget.parent.parent;
		//cursorManager.removeAllCursors();
//			_this.clearRotateEvents();

		stage.cursor = "default";
		stage.update();
	}
	
	p.beginRotate = function(p_evt)
	{
		trace("WbDrag.beginRotate");
		var _this = p_evt.currentTarget.parent.parent;
		_this.clearRotateEvents();
		_this.addEventListener("pressup", _this.endRotate);
		_this.addEventListener("pressmove", _this.trackRotate);
		// find the center of the box in the parent's space
		var pt = _this.localToGlobal(_this.shapeWidth()/2, _this.shapeHeight()/2);
		_this._originalPt = _this.parent.globalToLocal(pt.x, pt.y);
	}

	p.endRotate = function(p_evt)
	{
		//rotateRollOut(p_evt);
		var _this = p_evt.currentTarget;
		var rotRads = Math.PI*_this.rotation/180;
		_this._rotCos = Math.cos(rotRads);
		_this._rotSin = Math.sin(rotRads);
		//throwFocus();			
		_this.dispatchEvent("POSITION_SIZE_ROTATE_END");
		_this.clearRotateEvents();
	}
	
	p.trackRotate = function(p_evt)
	{
		var _this = p_evt.currentTarget;
		var _curPoint = stage.localToGlobal(p_evt.stageX, p_evt.stageY);
		
		var localPoint = _this.parent.globalToLocal(_curPoint.x, _curPoint.y);
		var diffX = localPoint.x-_this._originalPt.x;
		var diffY = localPoint.y-_this._originalPt.y;
		var rotRads = -Math.atan(diffX/diffY);
		var rotDegs = Math.round(36*rotRads/Math.PI)*5;
		if (diffY>=0) {
			if (diffX>=0) {
				// bottom-right quad
				_this.set_rotation(180+rotDegs);
			} else {
				// bottom-left quad
				_this.set_rotation(-180+rotDegs);
			}
		} else {
			_this.set_rotation(rotDegs);
		}
		_this.validateNow();
		_this._rotCos = Math.cos(rotRads);
		_this._rotSin = Math.sin(rotRads);
		var pt = _this.localToGlobal(_this.shapeWidth()/2, _this.shapeHeight()/2);
		var centerPt = _this.parent.globalToLocal(pt.x, pt.y);
		pt = new Point(_this._originalPt.x,_this._originalPt.y);
		var diffPt = pt.subtract(new Point(centerPt.x,centerPt.y));
		_this.moveShape(_this.get_x()+diffPt.x, _this.get_y()+diffPt.y);

		_this.dispatchEvent("ROTATION_CHANGE");
	}

	p.resizeRollOver = function(p_evt)
	{
		//p_evt.stopImmediatePropagation();
		trace("WbDrag.resizeRollOver");
		var _this = p_evt.currentTarget.parent.parent;
		_this._currentHandle = p_evt.target;
		if (stage.cursor == null || stage.cursor == "default" || stage.cursor == _this._currentHandle._cursor) { 
			stage.cursor = _this._currentHandle._cursor;
			_this._currentHandle.addEventListener("mousedown", _this.beginResize, false);
			_this._currentHandle.addEventListener("rollout", _this.resizeRollOut);
			stage.update();
		}
	}
	
	p.resizeRollOut = function(p_evt)
	{
		trace("WbDrag.resizeRollOut");
		var _this = p_evt.currentTarget.parent.parent;
		//cursorManager.removeAllCursors();
//			_this.clearSizeEvents();

		stage.cursor = "default";
		stage.update();
	}

	p.beginResize = function(p_evt)
	{
		trace("WbDrag.beginResize");
		var _this = p_evt.currentTarget.parent.parent;
		_this.clearSizeEvents();
		_this._currentHandle = p_evt.target;
		var _curPoint = stage.localToGlobal(p_evt.stageX, p_evt.stageY);
		/*if (WhiteBoardClient.gridVisible) {
			_curPoint.x = Math.round(_curPoint.x / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			_curPoint.y = Math.round(_curPoint.y / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
		}*/
		_this._originalPt = _this.globalToLocal(_curPoint.x, _curPoint.y);
		_this.addEventListener("pressup", _this.endResize);
		_this.addEventListener("pressmove", _this.trackResize);
	}

	p.endResize = function(p_evt)
	{
		trace("WbDrag.endResize");
		var _this = p_evt.currentTarget;
		//_this.resizeRollOut(p_evt);
		//throwFocus();
		_this.dispatchEvent("POSITION_SIZE_ROTATE_END");
		_this.clearSizeEvents();
	}

	p.trackResize = function(p_evt)
	{
		var _this = p_evt.currentTarget;
		var _curPoint = stage.localToGlobal(p_evt.stageX, p_evt.stageY);
		/*if (WhiteBoardClient.gridVisible) {
			_curPoint.x = Math.round(_curPoint.x / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			_curPoint.y = Math.round(_curPoint.y / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
		}*/
		var localPoint = _this.globalToLocal(_curPoint.x, _curPoint.y);
		var aspectRatio;
		var oldH;
		var sizeDir;
		trace("WbDrag.trackResize: "+localPoint.x+", "+localPoint.y);
		
		if (_this._currentHandle.name=="_tLHandle") {
			localPoint.x = Math.min(localPoint.x, _this.shapeWidth()-5);
			// constrained aspect ratio - choose the most changed
			aspectRatio = _this.shapeWidth()/_this.shapeHeight();
			_this.width = _this.shapeWidth() - localPoint.x;
			oldH = _this.shapeHeight();
			_this.height = _this.shapeWidth()/aspectRatio;				
			_this.x = _this.get_x() + localPoint.x*_this._rotCos - (oldH-_this.shapeHeight())*_this._rotSin;
			_this.y = _this.get_y() + (oldH-_this.shapeHeight())*_this._rotCos + localPoint.x*_this._rotSin;
			sizeDir = "SIZING_BOTH";

		} else if (_this._currentHandle.name=="_tRHandle") {
			localPoint.x = Math.max(localPoint.x, 5);
			aspectRatio = _this.shapeWidth()/_this.shapeHeight();
			_this.width = localPoint.x;
			oldH = _this.shapeHeight();
			_this.height = _this.shapeWidth()/aspectRatio;
			_this.y = _this.get_y() + (oldH-_this.shapeHeight())*_this._rotCos;
			_this.x = _this.get_x() - (oldH-_this.shapeHeight())*_this._rotSin;
			sizeDir = "SIZING_BOTH";
			
		} else if (_this._currentHandle.name=="_bLHandle") {
			localPoint.x = Math.min(localPoint.x, _this.shapeWidth()-5);
			aspectRatio = _this.shapeWidth()/_this.shapeHeight();
			_this.width = _this.shapeWidth() - localPoint.x;
			_this.height = _this.shapeWidth()/aspectRatio;				
			_this.x = _this.get_x() + localPoint.x*_this._rotCos;
			_this.y = _this.get_y() + localPoint.x*_this._rotSin;
			sizeDir = "SIZING_BOTH";

		} else if (_this._currentHandle.name=="_bRHandle") {
			localPoint.x = Math.max(localPoint.x, 5);
			aspectRatio = _this.shapeWidth()/_this.shapeHeight();
			_this.width = localPoint.x;
			_this.height = _this.shapeWidth()/aspectRatio;
			sizeDir = "SIZING_BOTH";
			
		} else if (_this._currentHandle.name=="_tMHandle") {
			localPoint.y = Math.min(localPoint.y, _this.shapeHeight()-5);
			_this.y = _this.get_y() + localPoint.y*_this._rotCos;
			_this.x = _this.get_x() - localPoint.y*_this._rotSin;
			_this.height = _this.shapeHeight() - localPoint.y;
			sizeDir = "SIZING_HEIGHT";
			
		} else if (_this._currentHandle.name=="_mRHandle") {
			localPoint.x = Math.max(localPoint.x, 5);
			_this.width = localPoint.x;
			sizeDir = "SIZING_WIDTH";
			
		} else if (_this._currentHandle.name=="_bMHandle") {
			localPoint.y = Math.max(localPoint.y, 5);
			_this.height = localPoint.y;
			sizeDir = "SIZING_HEIGHT";

		} else if (_this._currentHandle.name=="_mLHandle") {
			localPoint.x = Math.min(localPoint.x, _this.shapeWidth()-5);
			_this.x = _this.get_x() + localPoint.x*_this._rotCos;
			_this.y = _this.get_y() + localPoint.x*_this._rotSin;
			_this.width = _this.shapeWidth() - localPoint.x;
			sizeDir = "SIZING_WIDTH";
		}
		_this.validateNow();

		var evt = new createjs.Event("SIZE_CHANGE");
		evt.sizingDirection = sizeDir;
		_this.dispatchEvent(evt);
	}
	
	p.clearSizeEvents = function()
	{
		trace("WbDrag.clearSizeEvents");
		if (this._currentHandle) {
			this._currentHandle.removeEventListener("rollout", this.resizeRollOut);
			this._currentHandle.removeEventListener("mousedown", this.beginResize);
		}
		//stage.removeEventListener(MouseEvent.MOUSE_UP, endResize);
		//stage.removeEventListener(MouseEvent.MOUSE_MOVE, trackResize);
		//stage.removeEventListener(MouseEvent.MOUSE_DOWN, beginResize);
		
		this.removeEventListener("pressup", this.endResize);
		this.removeEventListener("pressmove", this.trackResize);
		
		this._currentHandle = null;
	}

	p.clearRotateEvents = function()
	{
		trace("WbDrag.clearRotateEvents");
		this._rotateHandle.removeEventListener("rollout", this.rotateRollOut);
		this._rotateHandle.removeEventListener("mousedown", this.beginRotate);
		this.removeEventListener("pressup", this.endRotate);
		this.removeEventListener("pressmove", this.trackRotate);
	}

	p.moveRollOver = function(p_evt)
	{
		if (typeof(p_evt)==='undefined')
			var _this = this;
		else
			_this = p_evt.currentTarget;
		if (_this._isMoving || !_this.moveEnabled) {
			return;
		}
		trace("WbDrag.moveRollOver");
		if (stage.cursor == null || stage.cursor == "default" || stage.cursor == "move") { 
			stage.cursor = "move";
		
			_this._hitArea.alpha = 0.5;
			_this.addEventListener("rollout", _this.moveRollOut);
//***			_this.addEventListener("mousedown", _this.beginMove, false);
			
			stage.update();
		}
	}
	
	p.beginMove = function(p_evt)
	{
		if (stage.cursor != "move") return;
		trace("WbDrag.beginMove");
		var _this = p_evt.currentTarget;
		_this.offset = {x: _this.get_x()-p_evt.stageX, y: _this.get_y()-p_evt.stageY};
		_this.addEventListener("pressup", _this.endMove);
		// the pressmove event is dispatched when the mouse moves after a mousedown on the target_until the mouse is released.
		_this.addEventListener("pressmove", _this.trackMove);
		
		createjs.Ticker.addEventListener("tick", _this.tick);
		/*
			if (WhiteBoardClient.gridVisible) {
				_originalPt.x = Math.round(_originalPt.x / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
				_originalPt.y = Math.round(_originalPt.y / WhiteBoardClient.gridUnit) * WhiteBoardClient.gridUnit;
			}
		*/
	}
	
	p.trackMove = function(p_evt)
	{
		trace("WbDrag.trackMove");
		var _this = p_evt.currentTarget;
		_this.x = p_evt.stageX + _this.offset.x;
		_this.y = p_evt.stageY + _this.offset.y;
		// indicate that the stage should be updated on the next tick:
		update = true;
		_this.dispatchEvent("POSITION_CHANGE");
	}
		
	p.endMove = function(p_evt)
	{
		trace("WbDrag.endMove");
		var _this = p_evt.currentTarget;
		_this.moveRollOut(p_evt);
		stage.update();
		_this._isMoving = false;
		//_this.moveRollOver(p_evt);
		//throwFocus();
		_this.dispatchEvent("POSITION_SIZE_ROTATE_END");
		_this.clearMoveEvents();
	}
	
	p.clearMoveEvents = function()
	{
		trace("WbDrag.clearMoveEvents");
		this.removeEventListener("rollout", this.moveRollOut);
		
		//DRAG
//		this.removeEventListener("mousedown", this.beginMove);
		this.removeEventListener("pressmove", this.trackMove);
		this.removeEventListener("pressup", this.endMove);
		
		createjs.Ticker.removeEventListener("tick", this.tick);
		stage.update();
	}
		
	p.dispatchDoubleClick = function(p_evt)
	{
		this.dispatchEvent("dblclick");
	}
	
	var update = false;
	
	p.tick = function(event)
	{
		// this set_makes it so the stage only re-renders when an event handler indicates a change has happened.
		if (update) {
			update = false; // only update once
			stage.update(event);
		}
	}
	
	p.invalidateDisplayList = function()
	{
	//TODO
		this.updateDisplayList(this.get_width(), this.get_height());
	}

	p.validateNow = function()
	{
	//TODO
		this.updateDisplayList(this.get_width(), this.get_height());
	}
	
	wb.WBDragHandles = WBDragHandles;
}());