// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBBaseTextShape = function() {
	  this.initialize();
	}
	var p = WBBaseTextShape.prototype = new wb.WBShapeBase(); // inherit from WBShapeBase

	// static const
	p.WORD_WRAP = true;
	
	// protected
	p._textArea;					//:TextArea;
	p._currentTextFormat;			//:TextFormat;
	p._tempEditor;					//:CustomTextEditor;
	p._wordWrap = p.WORD_WRAP;
	p._drawnPt;
	p._tEBitmap;

	p._editable = false;


	
	/* getter & setter */
	
	p.WBShapeBase_get_propertyData = p.get_propertyData;
	p.get_propertyData = function()
	{
		var returnObj = this.WBShapeBase_get_propertyData();
		returnObj.wordWrap = this._wordWrap;
		return returnObj;
	}
	
	p.WBShapeBase_set_propertyData = p.set_propertyData;
	p.set_propertyData = function(p_data)
	{
		this.WBShapeBase_set_propertyData(p_data);
		if (p_data && p_data.wordWrap!=null) {
			this._wordWrap = p_data.wordWrap;
//TODO			invalidateDisplayList();
		}
	}

/*		
		public function get toolBar():UIComponent
		{
			if (_textToolBar) {
				return _textToolBar;
			}
			return null;
		}
		
		public override function get textToolBar():UIComponent
		{
			return _textToolBar;
		}
		
		public override function get textEditor():CustomTextEditor
		{
			return _tempEditor;
		}
		
		public override function get currentTextFormat():TextFormat
		{
			return _currentTextFormat;
		}
*/
		
	p.commitProperties = function()
	{
		trace("WBBaseText.commitProperties");
		if (this._htmlText && !this._textArea) {
			this.createTA();
		}
		if (this._invTextChange && this._textArea) {
			this._textArea.set_HtmlText(this._htmlText);
			this.sizeTA();
			this._invTextChange = false;
		}
	}

	p.updateDisplayList = function(p_w, p_h)
	{
		this.commitProperties();

		if (this._textArea) {
			this.positionTA();
		}
	}
		
/*		
		public override function parentChanged(p:DisplayObjectContainer)
		{
//			trace("parentChanged");
			super.parentChanged(p);
			shapeContainer = p as WBShapeContainer;
		}
		
		protected override function setupDrawing(p_evt:MouseEvent = null)
		{
//			trace("WBBaseTextShape.setupDrawing");
			focusTextEditor();
		}

		protected override function onMouseUpHandler(p_evt:MouseEvent)
		{
		}
		
		public override function disposeTextChanges()
		{
			if (_textArea) {
				_textArea.visible = true;
			}
			if (_tEBitmap) {
				_tEBitmap.visible = true;
			}
			if (_tempEditor) {
				disposeTextEditor();
			}
		}
		
		protected function disposeTextEditor(p_evt:Event=null)
		{
			if (!_isRotated) {
				var pt:Point = new Point(_tempEditor.x+4, _tempEditor.y+4);
				var containerPt:Point = _tempEditor.parent.localToGlobal(pt);

				var eM:EdgeMetrics = _tempEditor.viewMetrics;
				var lastLine = (htmlText=="") ? 0 : lastLineHeightHack(_tempEditor);

				_tempEditor.height = _tempEditor.textHeight + eM.top + eM.bottom + 8 - lastLine; // TODO : MAGIC NUMBER?
				positionTextEditor();
				
				if (_isDrawing) {
					_drawnPt = containerPt;
				} else {
					// Piero
					//MANNAGGIA A ME! se non commentavo la shape continuava a spostarsi dopo ogni fine edit
//					if (shapeContainer) {
//						containerPt = shapeContainer.parent.globalToLocal(containerPt);
//						shapeContainer.x = containerPt.x - 2;
//						shapeContainer.y = containerPt.y + eM.top + 5;
//					}
				}
			}
			
			_currentTextFormat = _tempEditor.editorTextField.defaultTextFormat;
			_tempEditor.removeEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, finishEditingText);
			PopUpManager.removePopUp(_tempEditor);
			PopUpManager.removePopUp(_textToolBar);
			_textToolBar = null;
			_tempEditor = null;
			dispatchEvent(new WBShapeEvent(WBShapeEvent.TEXT_EDITOR_DESTROY));
			
			if (_isDrawing) {
				if (_htmlText==null || StringUtil.trim(_htmlText)=="") {
					dispatchEvent(new WBShapeEvent(WBShapeEvent.DRAWING_CANCEL));
				} else {
					endDrawing();
				}
			}
		}
		
		protected function createTextEditor(p_forEditing:Boolean=false)
		{
			if (_tempEditor) {
				disposeTextEditor();
			}
			_tempEditor = new CustomTextEditor();
			_tempEditor.setStyle("modalTransparency", false);
			_tempEditor.setStyle("modalTransparencyBlur", false);
			//DS:Modificato
			_tempEditor.addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, finishEditingText, false, 0, true);
			_tempEditor.setStyle("borderStyle", "inset");
			_tempEditor.setStyle("backgroundColor", 0xffffff);
			_tempEditor.setStyle("backgroundAlpha", 1);
			PopUpManager.addPopUp(_tempEditor, this);
			_tempEditor.scaleX = canvas.scaleX;
			_tempEditor.scaleY = canvas.scaleY;
			_tempEditor.verticalScrollPolicy = _tempEditor.horizontalScrollPolicy = "off";
			// Piero (era false)
			_tempEditor.wordWrap = _wordWrap;
			// allineamento centrato di default e no bullet
			var tf:TextFormat = new TextFormat();
			tf.align = "center";
			tf.bullet = null;
			_tempEditor.defaultTextFormat = tf;
			
			if (!p_forEditing) {
				_tempEditor.setStyle("borderStyle", "none");
				_tempEditor.setStyle("backgroundAlpha", 0);
			}
		}		
		
		protected function sizeTextEditor()
		{
			if (!_tempEditor) {
				return;
			}
			_tempEditor.validateNow();
			
			//Piero
			if (_wordWrap) {
				_tempEditor.width = _textArea.width;
				_tempEditor.height = _textArea.height;
			} else {
				var eM:EdgeMetrics = _tempEditor.viewMetrics;
				var lastLine = 0;
	//			var lastLine = (htmlText=="") ? 0 : lastLineHeightHack(_tempEditor);
				_tempEditor.height = canvas.scaleY * (_tempEditor.textHeight + eM.top + eM.bottom + 8 - lastLine); // TODO : MAGIC NUMBER?
				var possWidth = canvas.scaleX * (_tempEditor.textWidth + eM.left + eM.right + 10);
				// Piero
				var wd = Math.max(possWidth, utilHtmlTextLength(_tempEditor.htmlText));
	//			wd = Math.min(Math.max(wd, MIN_WIDTH), MAX_WIDTH);
				wd = Math.min(wd, MAX_WIDTH);
				_tempEditor.width = wd;
			}
			_tempEditor.verticalScrollPosition = _tempEditor.horizontalScrollPosition = 0;
			_tempEditor.validateNow();
		}
		
		public override function focusTextEditor():EditorToolBar
		{
			if (_textArea) {
				_textArea.visible = false;
			}
			if (_tEBitmap) {
				_tEBitmap.visible = false;
			}
			createTextEditor(true);
			_tempEditor.htmlText = htmlText;
			sizeTextEditor();
			positionTextEditor();
			//DS:Modificato
			_tempEditor.addEventListener(Event.CHANGE, textEditing, false, 0, true);
			
			_textToolBar = new WBTextToolBar();
			_textToolBar.textEditor = _tempEditor;
			if (htmlText=="") {
				_tempEditor.setTextStyles("size", 16);
				// allineamento centrato di default e no bullet
				_tempEditor.setTextStyles("align", "center");
				_tempEditor.setTextStyles("bullet", null);
			}
			if (popupTextToolBar) {
				PopUpManager.addPopUp(_textToolBar, this);
				_textToolBar.validateNow();
				_textToolBar.width = _textToolBar.measuredWidth;
				_textToolBar.height = _textToolBar.measuredHeight;
			}
			var evt:WBShapeEvent = new WBShapeEvent(WBShapeEvent.TEXT_EDITOR_CREATE);
			evt.textEditor = _tempEditor;
			dispatchEvent(evt);
			if (_tempEditor.parent) {
				_tempEditor.setFocus();
				_tempEditor.selectAllText();
				_tempEditor.getTextStyles();
				_textToolBar.invalidateProperties();
				_textToolBar.validateNow();
			}
			return _textToolBar;
		}
		
		public override function finishEditingText(p_evt:FlexMouseEvent=null)
		{
			var editorPoint:Point;
			var mousePoint:Point;
			// we need to see if the click happened in our toolbar, which is the only exception to clicking needing to dispose the editor
			if (p_evt) {
				var currTarget:Object = p_evt.relatedObject;
				while (currTarget!=null) {
					if (currTarget is WBTextToolBar) {
						return;
					}
					if (currTarget.hasOwnProperty("owner")) {
						currTarget = currTarget.owner;
					} else {
						currTarget = currTarget.parent;
					}
				}
				// Hack to prevent the self-destruction of the text-editor ie if point on editor equals mouse coordinates
				//then plz dont destroy the editor.
				editorPoint = absPoint(globalToLocal(new Point(p_evt.currentTarget.x , p_evt.currentTarget.y)));
				mousePoint = absPoint(contentToLocal(new Point(p_evt.localX , p_evt.localY)));
			}
			
			if (_textArea) {
				_textArea.visible = true;
			}
			if (_tEBitmap) {
				_tEBitmap.visible = true;
			}
			
			if (_tempEditor) {
				if(editorPoint && !editorPoint.equals(mousePoint)) {
					htmlText = _tempEditor.htmlText;
					disposeTextEditor();
					dispatchEvent(new WBShapeEvent(WBShapeEvent.PROPERTY_CHANGE));
				} else if(p_evt == null) {
					htmlText = _tempEditor.htmlText;
					disposeTextEditor();
					dispatchEvent(new WBShapeEvent(WBShapeEvent.PROPERTY_CHANGE));
				}
			}
		}
	*/	
		p.createTA = function()
		{
			trace("WBBaseText.createTA");
			this._textArea = new wb.TextArea();
			this._textArea.addToStage(this, 0, 0);
			//addChild(_textArea);
//			_textArea.verticalScrollPolicy = _textArea.horizontalScrollPolicy = "off";
			this._textArea.wordWrap = this._wordWrap;
//			if (_wordWrap) _textArea.width = DEFAULT_WIDTH;
			
			this._textArea.setStyle("borderStyle", "none");
			this._textArea.setStyle("borderColor", 0xFF0000);
			this._textArea.setStyle("fillColor", 0xFF00FF);
			
			this._textArea.setStyle("backgroundAlpha", 0.5);
			
			this._textArea.setNotSelectable();
			var _this = this;
			
			this._textArea.addEventListener("mouseover", function(e)
			{
				trace("WBBaseText.onTextAreaMouseOver");
				if (_this.shapeContainer) _this.shapeContainer.trigger("moveRollOver");
				if (_this.canvas.isSelected(_this.shapeID)) {
					_this.canvas._groupSelectionHandles.trigger("moveRollOver");
				}
			});
			this._textArea.addEventListener("mouseout", function(e)
			{
				trace("WBBaseText.onTextAreaMouseOut");
				if (_this.shapeContainer) _this.shapeContainer.trigger("moveRollOut");
				if (_this.canvas.isSelected(_this.shapeID)) {
					_this.canvas._groupSelectionHandles.trigger("moveRollOut");
				}
			});
			this._textArea.addEventListener("mousedown", function(e)
			{
				trace(">>>>>WBBaseText.onTextAreaMouseDown: "+e.pageX+", "+e.pageY);
				if (_this.shapeContainer) _this.shapeContainer.trigger("mouseDown", e);
				if (_this.canvas.isSelected(_this.shapeID)) {
					_this.canvas._groupSelectionHandles.trigger("mouseDown", e);
				}
			});
			this._textArea.addEventListener("mousemove", function(e)
			{
				trace("WBBaseText.onTextAreaMouseDrag: "+e.pageX+", "+e.pageY);
				if (_this.canvas.isSelected(_this.shapeID)) {
					_this.canvas._groupSelectionHandles.trigger("mouseDrag", e);
				}
			});
			this._textArea.addEventListener("change", function(e)
			{
				trace("WBBaseText.onTextAreaChange");
				_this._htmlText = _this._textArea.get_htmlText();
			});
			this._textArea.addEventListener("focusout", function(e)
			{
				trace("WBBaseText.onTextAreaFocusOut");
				_this._textArea.setEditable(false);
			});
			
			
			this._textArea.addEventListener("dblclick", this.onTextAreaMouseDblclik);
		}
		
		p.onTextAreaMouseDblclik = function(e)
		{
			trace("WBBaseText.onTextAreaMouseDblclik");
		}


		
		p.sizeTA = function()
		{
/*		TODO
			this._textArea.validateNow();
			var eM:EdgeMetrics = _textArea.viewMetrics;
			var posWidth = _textArea.textWidth + eM.left + eM.right + 10;
			var wd = Math.max(posWidth,utilHtmlTextLength(_textArea.htmlText));
			wd = Math.min(wd, MAX_WIDTH);
			_textArea.width = wd;
			_textArea.height = _textArea.textHeight + eM.top + eM.bottom + 8 - lastLineHeightHack(_textArea);
			*/
//			_textArea.verticalScrollPosition = _textArea.horizontalScrollPosition = 0;
			this.positionTA();
			this._textArea.validateNow();
			this._textArea.setEditable(this._editable);
		}
		
		p.positionTA = function()
		{
			trace("WBBaseText.positionTA");
			if (this._wordWrap) {
				this._textArea.setActualSize(this.width, this.height);
			}
			//var posX = Math.round((this.width-this._textArea.width)/2);
			//var posY = Math.round((this.height-this._textArea.height)/2);
			if (this.shapeContainer) {
				this._textArea.move(this.shapeContainer.x, this.shapeContainer.y);
			}
	/*		if (_tEBitmap) {
				_tEBitmap.x = _textArea.x;
				_tEBitmap.y = _textArea.y;
			}*/
		}
		
		p.removeTA = function()
		{
			this._textArea.removeFromStage();
		}
			
		p.beginEditing = function()
		{
			this._textArea.setEditable(true);
		}
		
	/*	
		p.positionTextEditor = function()
		{
			if (!_tempEditor) {
				return;
			}
			
			var centerPt:Point = new Point(width/2, height/2);
			var popUpPt:Point = _tempEditor.parent.globalToLocal(localToGlobal(centerPt));
			_tempEditor.x = popUpPt.x-_tempEditor.width/2;
			_tempEditor.y = popUpPt.y-_tempEditor.height/2;
			
		}
		p.textEditing = function(p_evt)
		{
			sizeTextEditor();
			//DS: Commentare riga qui sotto se non si vuole lo spostamento per centrare la textarea ad ogni
			//nuovo carattere
			positionTextEditor();
		}

		protected function utilHtmlTextLength(p_htmlText:String)
		{
			var tempTxt:TextField = new TextField();
			tempTxt.multiline = true;
			tempTxt.autoSize = TextFieldAutoSize.LEFT;
			tempTxt.wordWrap = false;
			tempTxt.htmlText = p_htmlText;
			if (_tempEditor) {
				var eM:EdgeMetrics = _tempEditor.viewMetrics;
				// Adding the magic number 10 to prevent truncation. Wish I had a logical reason for choosing 10 :(
				return tempTxt.width + eM.left + eM.right + 10 + 5;
			}else {
				return tempTxt.width + 14 + 5;
			}
		}
		
		protected function lastLineHeightHack(p_tA:TextArea)
		{
			var lastHeight;
			for (var i:int=0; i<2000; i++) {
				try {
					lastHeight = _textArea.getLineMetrics(i).height;
				} catch (e:Error) {
					// HOLY COW IS THIS STUPID! I want to shave off the last line of text, but TA gives me 
					// no way to see what the last line is. So, iterate through them, and once we get
					// an error (index out-of-bounds), it's time to stop.
					break;
				}
			}
			return (i>1) ? lastHeight : 0;
		}

		public static function get editable():Boolean
		{
			return _editable;
		}

		public static function set editable(value:Boolean)
		{
			_editable = value;
		}
*/


	wb.WBBaseTextShape = WBBaseTextShape;
}());