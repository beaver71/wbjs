/*
 WBCanvas
 Beaver71 - 2014
 */

// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBCanvas = function(stage) {
	  this.initialize(stage);
	}
	var p = WBCanvas.prototype = new createjs.Container(); // inherit from Container

	p.stage;				// riferimento allo stage
	p._background;
	
	p.drawEnabled = false;
	/**
	 * @private
	 */	
	p._drawingSurface;		//:Sprite;
	p._drawingSurfaceVisible = true;
	p._tmpHitSurface;		//:UIComponent;
	p._selectionRect;		//:UIComponent;
	p._selectionOrigin;		//;
	p._selectionGroup;		//;
	p._selectionGroupDetails;	//;
	p._groupSelectionHandles;	//:WBDragHandles;
	p._enableSelection = true;
	p._shapeFactory;		//:IWBShapeFactory;
	p._currentDrawingShape;	//:WBShapeBase;
	p._currentShapeID;		//;
	p._currentTextShape;	//:WBShapeBase;
	p._registeredFactories = {};
	p._pendingAddedShapes = new Array();
	p._invSelectionChange = false;
	p._invDontMoveShape = false;
	p._invNewShapeFactory = false;
	p._invEnableSelection = true;
	p._isClosing = false;
	p._isShiftDown = false;
	p._isControlDown = false;
	p._model;				//:WBModel;
	p._shapeContainersByID;	//:Object;
	p._commandMgr;			//:WBCommandManager;
	p._cursorID=-1;
	p._currentCursorClass;	//:Class;
	p._currentShapeToolBar;	//:IWBPropertiesToolBar;
	p._commandMgr;
	/**
	 * @public
	 */
	p.selectionHandlesContainer;	//:DisplayObjectContainer;
	p.popupPropertiesToolBar = true;	
	
	// initialize
	p.Container_initialize = p.initialize;
	p.initialize = function(stage) {
		this.Container_initialize();
		this.createChildren();
		this.stage = stage;
		this.name = "WBCanvas";
	}
	
	// override setBounds
	p.Container_setBounds = p.setBounds;
	p.setBounds = function(x, y, width, height)
	{
		trace("WBCanvas.setBounds");
		p.Container_setBounds(x, y, width, height);
		this._drawingSurface.setBounds(x, y, width, height);
		this.drawHitArea();
	}
	
	p.setUserID = function(_userID)
	{
		if (this._model) this._model.userID = _userID;
	}
	
	p.createChildren = function()
	{
		trace("WBCanvas.createChildren");
		this._commandMgr = new wb.WBCommandManager(this);
		this._shapeContainersByID = {};
		this._background = new createjs.Shape();
		this._background.name = "_back";
		this.addChild(this._background);
		this._drawingSurface = new createjs.Shape();
		//TODO this.rawChildren.addChild(this._drawingSurface);
		//this._drawingSurface.doubleClickEnabled = true;
		var that = this;
		this._drawingSurface._listenerDraw = function(e) { that.beginDrawingShape(e, that) };
		this._drawingSurface.addEventListener("mousedown", this._drawingSurface._listenerDraw);
		//_drawingSurface.addEventListener(MouseEvent.MOUSE_OVER, showCursor);
		//_drawingSurface.addEventListener(MouseEvent.MOUSE_OUT, hideCursor);

		//addEventListener(FocusEvent.FOCUS_IN, focusInHandler, false, 0, true);
		//addEventListener(FocusEvent.FOCUS_OUT, focusOutHandler, false, 0, true);
		this.addChild(this._drawingSurface);
		this.initializeSelection();
		
		
		if (!this._model) {
			this._model = new wb.WBModel();
			this._model._canvas = this;
		}
	}
	
	p.updateSelection = function()
	{
		this._enableSelection = true;
		this._invEnableSelection = true;
	}
	
	p.initializeSelection = function()
	{
		trace("WBCanvas.initializeSelection");
		this._selectionGroup = new Array();
		this._selectionGroupDetails = new Array();
	}
	
	/**
	 * Add a shape to list of selected shapes.
	 */
	p.addToSelection = function(p_shapeID)
	{
		var idx = this._selectionGroup.indexOf(p_shapeID);
		if (idx!=-1) {
			return;
		}
		this._selectionGroup.push(p_shapeID);
		this._invSelectionChange = true;
		this.invalidateProperties();
	}
	
	/**
	 * Remove a shape from list of selected shapes.
	 */
	p.removeFromSelection = function(p_shapeID)
	{
		var idx = this._selectionGroup.indexOf(p_shapeID);
		if (idx==-1) {
			return;
		}
		this._selectionGroup.splice(idx, 1);
		this._invSelectionChange = true;
		this.invalidateProperties();
	}
	
	/**
	 * Clear list of selected shapes.
	 */
	p.clearSelection = function()
	{
		this.initializeSelection();
		this._invSelectionChange = true;
		this.invalidateProperties();
	}
	/**
	 * Enables/disables Shape Selection on Canvas.
	 */
	p.enableShapeSelection = function(p_val)
	{
		if (p_val!=this._enableSelection) {
			this._enableSelection = p_val;
			this._invEnableSelection = true
			this.invalidateProperties();
			
			if (this._selectionRect != null && p_val == false) {
				this.endGroupSelection();
			}
		}
	}
	
	p.onToolBarChange = function(p_evt)
	{
		trace("WBCanvas.onToolBarChange");
		var _this = p_evt.currentTarget.canvas;
		for (var s = 0; s < _this._selectionGroup.length; s++)
		{
			var shape = _this._shapeContainersByID[_this._selectionGroup[s]]._content;
			var desc = _this._model.getShapeDescriptor(shape.shapeID).clone();
			var shapeData = shape.get_propertyData();
			var toolData = _this._currentShapeToolBar.get_propertyData();
			for (var i in toolData) {
				// applica solo le property che sono state modificate
				if (_this._currentShapeToolBar._fillChanged && i=="primaryColor")			
					if (toolData[i]!=null) shapeData[i] = toolData[i];
				if (_this._currentShapeToolBar._alphaChanged && i=="alpha")
					if (toolData[i]!=0) shapeData[i] = toolData[i]; 			
				if (_this._currentShapeToolBar._strokeChanged && i=="lineColor")					
					if (toolData[i]!=null) shapeData[i] = toolData[i];
				if (_this._currentShapeToolBar._thicknessChanged && i=="lineThickness")
					if (toolData[i]!=null) shapeData[i] = toolData[i];
				if (_this._currentShapeToolBar._dashChanged && i=="dashed")
					if (toolData[i]!=null) shapeData[i] = toolData[i];
				if (_this._currentShapeToolBar._arrowRChanged && i=="arrowHead")
					if (toolData[i]!=null) shapeData[i] = toolData[i];
				if (_this._currentShapeToolBar._arrowLChanged && i=="arrowBase")
					if (toolData[i]!=null) shapeData[i] = toolData[i];
			}
			desc.propertyData = shapeData;
			_this._commandMgr.addCommand(new wb.WBShapesPropertyChange([desc]));
		}
		
	}
	
	/**
	 * Sets the current Shape Factory.
	 */
	p.set_currentShapeFactory = function(p_shapeFactory)
	{
		if (this._shapeFactory!=p_shapeFactory) {
			this._shapeFactory = p_shapeFactory;
			this._invNewShapeFactory = true;
			this.invalidateProperties();
		} else {
			// lo switch tra tipi diversi di Marker Pen produce l'effetto di cambiare PropertiesToolbar
			if (p_shapeFactory instanceof wb.WBMarkerShapeFactory) {
				this._invNewShapeFactory = true;
				this.invalidateProperties();
			}
		}
		if (this._shapeFactory) {
			this._currentCursorClass = this._shapeFactory.cursor;
		} else {
			this._currentCursorClass = null;
			//cursorManager.removeAllCursors();
			this.cursor = "default";
		}
		//dispatchEvent(new WBCanvasEvent(WBCanvasEvent.CURSOR_CHANGE));
	}
	
	p.drawHitArea = function()
	{
		trace("WBCanvas.drawHitArea");
		var g = this._drawingSurface.graphics;
		g.clear();
		//var color = "#FAFFAA"; 
		var color = "#FFFF80";
		var alpha = (color == "#FFFFFF") ? 0.1 : 0.5;
		g.beginFill(color);
		var b = this._drawingSurface.getBounds();
		g.drawRect(0, 0, b.width, b.height);
		this._drawingSurface.alpha = 0.1;
		g = this._background.graphics;
		this._background.alpha = 0.1;
		g.clear();
		g.beginFill("#FFFFFF");
		g.drawRect(0, 0, b.width, b.height);
	}
	
	p.enableDraw = function(value)
	{
		this.drawEnabled = value;
		this._drawingSurface.visible = value;
		stage.update();
	}
	
	p.beginDrawingShape = function(p_evt, _this) // _this = canvas, this = stage
	{
		trace("WBCanvas.beginDrawingShape");
		if (_this._shapeFactory == null || _this._currentDrawingShape) {
			trace("	_shapeFactory NULL or _currentDrawingShape !NULL");
			return;
		}
		_this.cursor = "crosshair";
		_this._currentDrawingShape = _this._shapeFactory.newShape();
		// inserito il riferimento alla factory per successivi controlli
		_this._currentDrawingShape.shapeFactory = _this._shapeFactory;
		_this._currentDrawingShape.canvas = _this;
		_this._currentDrawingShape.addEventListener("DRAWING_COMPLETE", _this.endDrawingShape);
		_this._currentDrawingShape.addEventListener("DRAWING_CANCEL", _this.drawCancelled);
		/*if (_currentDrawingShape is WBTextShape || _currentDrawingShape is WBBoxShape || _currentDrawingShape is WBLinkShape) {
			_currentDrawingShape.addEventListener(WBShapeEvent.TEXT_EDITOR_CREATE, textEditorCreate, false, 0, true);
			_currentDrawingShape.popupTextToolBar = popupPropertiesToolBar;
		}*/
		_this.addChild(_this._currentDrawingShape);		
		
		//var pt = _this.globalToLocal(p_evt.stageX, p_evt.stageY);
		//var _curPoint = {x:pt.x, y:pt.y};
		//_this._currentDrawingShape.move(_curPoint.x, _curPoint.y);
		
		var prop = _this._currentShapeToolBar.get_propertyData();
		_this._currentDrawingShape.set_propertyData(prop);
		_this._currentDrawingShape.beginDrawing(p_evt);
	}
	
	p.endDrawingShape = function(p_evt)
	{
		trace("WBCanvas.endDrawingShape:");
		var sh = p_evt.currentTarget;
		var _this = sh.canvas;
		_this.cursor = "default";
		trace("	>shape: w,h= "+sh.width+", "+sh.height+"	>x,y= "+sh.x+", "+sh.y);
		
		_this._currentDrawingShape.removeEventListener("DRAWING_COMPLETE", _this.endDrawingShape);
		_this._currentDrawingShape.removeEventListener("DRAWING_CANCEL", _this.drawCancelled);
		
		var bounds = _this._currentDrawingShape.getBounds();
		// qualora la shape abbia dimensioni nulle allora annulla l'inserimento
		if (bounds.width==0 || bounds.height==0) {
			trace("WBCanvas: currentShape NULL");
			_this._currentDrawingShape = null;
			return;
		}
		// se factory diversa da quella corrente allora elimina la shape in fase di creazione
		if (_this._currentDrawingShape.shapeFactory != _this._shapeFactory) {
			trace("WBCanvas: currentShape shapeFactory CHANGED");
			_this.removeChild(_this._currentDrawingShape);
			_this._currentDrawingShape = null;
			return;
		}
		trace("	>bounds: w,h= "+bounds.width+", "+bounds.height+"	>x,y= "+bounds.x+", "+bounds.y);
		
		_this._pendingAddedShapes.push(_this._currentDrawingShape);

		var shapeDesc = new wb.WBShapeDescriptor();
		shapeDesc.x = bounds.x;
		shapeDesc.y = bounds.y;
		shapeDesc.width = bounds.width;
		shapeDesc.height = bounds.height;
		shapeDesc.factoryID = _this._shapeFactory.factoryID();	//_this.getFactoryID(_this._shapeFactory);
		shapeDesc.definitionData = _this._currentDrawingShape.get_definitionData();
		shapeDesc.propertyData = _this._currentDrawingShape.get_propertyData();
		
/*		if (_settings.getValue("marker.transformToCurve")==true && _shapeFactory is WBMarkerShapeFactory && (_shapeFactory as WBMarkerShapeFactory).shapeData != WBMarkerShapeFactory.HIGHLIGHTER) {
			// crea nuovo descriptor di tipo LineFactory && shapeDesc.factoryID.indexOf("WBMarkerShapeFactory")!=-1 
			shapeDesc = trasformDescToLineDesc(shapeDesc);
		}*/
		
		if (_this._shapeFactory.factoryID()=="WBMarkerShapeFactory")
			shapeDesc = _this.trasformDescToLineDesc(shapeDesc);
		
		//_this._model.createAddShape(shapeDesc);
		_this._commandMgr.addCommand(new wb.WBCreateAddShapes([shapeDesc]));
		_this.removeChild(_this._currentDrawingShape);
		_this._currentDrawingShape = null;
		_this._currentShapeID = shapeDesc.shapeID;
		
//		_this.enableDraw(_this.drawEnabled);
		_this.drawHitArea();
		stage.update();
	}
	
	p.drawCancelled = function(p_evt)
	{
		trace("WBCanvas.drawCancelled");
		var _this = p_evt.currentTarget.canvas;
//		_this.enableDraw(_this.drawEnabled);
		_this.cursor = "default";
	}
	
	// override addChild
	p.Container_addChild = p.addChild;
	p.addChild = function(child)
	{
		this.Container_addChild(child);

		if (child instanceof wb.WBShapeContainer) {
			if (child instanceof wb.WBDragHandles == false) {
				trace("WBCanvas.addChild(CONTAINER)");
				var _this = this;
				child._listenerMouseDn = function(e) { _this.shapeContainerMouseDown(e, _this) };
				child.addEventListener("mousedown", child._listenerMouseDn, false);
			}
		}
		//this.positionDrawingSurface();
		this.swapChildren(this._drawingSurface, child);
		this.setChildIndex(this._background, 0);
	}
	
	/**
	 * Posiziona la _drawingSurface in primo piano o in background in base al flag WhiteBoardClient.drawSurfaceOver
	 */
	p.positionDrawingSurface = function()
	{
		this.setChildIndex(this._drawingSurface, 0);
		stage.update();
	}

	/**
	 * Sets the model.
	 */
	p.set_model = function(p_model)
	{
		if (p_model == this._model) {
			return;
		}
		this.clearCanvas();
		this._model = p_model;
		this._model._canvas = this;
		if (this._model.isSynchronized) {
			this.onModelSync();
		} else {
			this._model.addEventListener("SYNCHRONIZATION_CHANGE", this.onModelSync, false);
		}
	}
	
	p.get_model = function()
	{
		if (!_model) { 
			this._model = new wb.WBModel();
			this._model._canvas = this;
		}
		return _model;
	}
	
	p.onModelSync = function(p_evt)
	{
		if (_model.isSynchronized) {
			// when the model is ready for us, we build from what's there already
			this.drawFromExistingModel();
			this._model.addEventListener("MODEL_SHAPE_CREATE", this.onShapeCreate, false);
			this._model.addEventListener("MODEL_SHAPE_ADD", this.onShapeAdd, false);
			this._model.addEventListener("MODEL_SHAPE_POSITION_SIZE_ROTATION_CHANGE", this.onShapePositionSizeRotate, false);
			this._model.addEventListener("MODEL_SHAPE_PROPERTIES_CHANGE", this.onShapePropertiesChange, false);
			this._model.addEventListener("MODEL_SHAPE_CHANGE", this.onShapeChange, false);
			this._model.addEventListener("MODEL_SHAPE_BRINGTOFRONT", this.onShapeBringToFront, false);
			this._model.addEventListener("MODEL_SHAPE_SENDTOBACK", this.onShapeSendToBack, false);
			this._model.addEventListener("MODEL_SHAPE_REMOVE", this.onShapeRemove, false);
			//this._model.addEventListener(CollectionNodeEvent".RECONNECT, this.onReconnect, false);
		}
	}

	p.onShapeCreate = function(p_evt)
	{
		if (p_evt.isLocalChange) {
			//trace("WBCanvas.onShapeCreate");
			var shapeDesc = this._model.getShapeDescriptor(p_evt.shapeID);
			//_commandMgr.addCommand(new WBAddShapes([shapeDesc]), false); // <<<< false
		}
	}
	
	p.onShapeAdd = function(p_evt)
	{
		trace("WBCanvas.onShapeAdd");
		var shapeDesc = this._model.getShapeDescriptor(p_evt.shapeID);
		var factory = this._registeredFactories[shapeDesc.factoryID];
		if (factory == null) {
			trace("	>>factory not registered: "+shapeDesc.factoryID);
			return;			
		}
		this.drawShape(shapeDesc, !p_evt.isLocalChange);
		if (p_evt.isLocalChange) {
			if (this._pendingAddedShapes.length>1) 
				trace("WBCanvas._pendingAddedShapes: NNN = "+this._pendingAddedShapes.length);
			while (this._pendingAddedShapes.length>0) {
				var oldShape = this._pendingAddedShapes.shift(); //as WBShapeBase;
				this.removeChild(oldShape);
			}
			/*TODO if (factory.toggleSelectionAfterDraw) {
				_commandMgr.addCommand(new WBSelectionChange([p_evt.shapeID]));
			}*/				
		}else{
			trace("WBCanvas: NO LOCAL CHANGE in onShapeAdd in WBCanvas");
		}
	}
	
	p.onShapePositionSizeRotate = function(p_evt)
	{
		trace("WBCanvas.onShapePositionSizeRotate");
		var sContainer = this._shapeContainersByID[p_evt.shapeID];
		var shapeDesc = this._model.getShapeDescriptor(p_evt.shapeID);
		
		if (!p_evt.isLocalChange && (sContainer.x!=shapeDesc.x || sContainer.y!=shapeDesc.y || 
				sContainer.shapeWidth()!=shapeDesc.width || sContainer.shapeHeight()!=shapeDesc.height || sContainer.rotation!=shapeDesc.rotation)) {
			if (sContainer.rotation != shapeDesc.rotation) {
				sContainer.rotation = shapeDesc.rotation;
				//TODO sContainer.validateNow();
			}
			sContainer.width = shapeDesc.width;
			sContainer.height = shapeDesc.height;
			sContainer.move(shapeDesc.x, shapeDesc.y);
			//TODO sContainer.validateNow();
			
			//WORKAROUND: resize in presenza di rotation
			if (sContainer.rotation != shapeDesc.rotation) {
				sContainer.move(shapeDesc.x, shapeDesc.y);
				//TODO sContainer.validateNow();
			}
			sContainer.validateNow();
			this.updateSelectionRect();
		}
		
		/*TODO if ((sContainer as WBBoxContainer) != null) {
			// box container fine positionSizeRotation
			(sContainer as WBBoxContainer).commitPositionSizeRotation();
		}*/
	}
	
	p.onShapePropertiesChange = function(p_evt)
	{
		var data = this._model.getShapeDescriptor(p_evt.shapeID).propertyData;
		this._shapeContainersByID[p_evt.shapeID]._content.set_propertyData(data);
		this._shapeContainersByID[p_evt.shapeID].validateNow();
	}
	
	p.onShapeChange = function(p_evt)
	{
		var sContainer = this._shapeContainersByID[p_evt.shapeID];
		var shapeDesc = this._model.getShapeDescriptor(p_evt.shapeID);

		if (sContainer) {
			sContainer._content.groupID = shapeDesc.groupID;
			if (p_evt.info != "group") {
				// va qui solo se non e' uno SHAPE CHANGE GROUP
				sContainer._content.set_propertyData(shapeDesc.propertyData);
				sContainer._content.set_definitionData(shapeDesc.definitionData);
				// se la modifica e' locale (non ordine ricevuto da server) allora non effettua resize e move (gia' fatto in fase di modifica)
				if (!p_evt.isLocalChange) {
					sContainer.validateNow();
					
					sContainer.width = shapeDesc.width;
					sContainer.height = shapeDesc.height;
					sContainer.move(shapeDesc.x, shapeDesc.y);
					
					sContainer.validateNow();
					
					//WORKAROUND: resize in presenza di rotation
					if (sContainer.rotation != shapeDesc.rotation) {
						sContainer.move(shapeDesc.x, shapeDesc.y);
						sContainer.validateNow();
					}
				}
			}
		} else {
			trace("WbCanvas.onShapeChange: ERR shapeID inesistente, "+p_evt.shapeID);
		}
	}
	
	p.onShapeBringToFront = function(p_evt)
	{
//			trace("WbCanvas.onShapeBringToFront");			
		this.shapeBringToFrontLocal(p_evt.shapeID);
	}
	
	/**
	 * Porta in primo piano una shape (senza propagare ordini) - effetto solo locale
	 */
	p.shapeBringToFrontLocal = function(shapeID)
	{
		trace("WbCanvas.shapeBringToFrontLocal");			
		var shapeContainer = this._shapeContainersByID[shapeID];
		// prova a spostare il container davanti a tutti i children
		try {
			this.setChildIndex(shapeContainer, this.getNumChildren()-1);
			/*// informa il container che e' stato portato in primo piano
			if (shapeContainer is WBBoxContainer) {
				WBBoxContainer(shapeContainer).propagateBringToFront();
			}*/
		} catch(e) { 
			trace("shapeBringToFrontLocal ERR: "+e.message); 
		}
		stage.update();
		//TODO setFocus();		
	}
	
	p.onShapeSendToBack = function(p_evt)
	{
//			trace("WbCanvas.onShapeSendToBack");			
		this.shapeSendToBackLocal(p_evt.shapeID);
	}
	
	/**
	 * Porta in secondo piano una shape (senza propagare ordini) - effetto solo locale
	 */
	p.shapeSendToBackLocal = function(shapeID)
	{
		trace("WbCanvas.shapeSendToBackLocal");			
		var shapeContainer = this._shapeContainersByID[shapeID];
		// prova a spostare il container davanti a tutti i children
		try {
			this.setChildIndex(shapeContainer, 0);
		} catch(e) { 
			trace("shapeSendToBackLocal ERR: "+e.message); 
		}
		stage.update();
		// TODO setFocus();		
	}
	
	p.selectedShapeBringToFront = function(_shapeIdSelected)
	{	
		if (!this._groupSelectionHandles) {
			// no op
			return;
		}
		this._groupSelectionHandles.clearAllEvents();
		
		//this._commandMgr.removeRecentCommands(wb.WBSelectionChange);
		this._commandMgr.addCommand(new wb.WBBringToFrontShape(_shapeIdSelected));
		//cursorManager.removeAllCursors();
	}
	
	p.selectedShapeSendToBack = function(_shapeIdSelected)
	{	
		if (!this._groupSelectionHandles) {
			// no op
			return;
		}
		this._groupSelectionHandles.clearAllEvents();
		
		//this._commandMgr.removeRecentCommands(wb.WBSelectionChange);
		this._commandMgr.addCommand(new wb.WBSendToBackShape(_shapeIdSelected));
		//cursorManager.removeAllCursors();
	}
	
	p.onShapeRemove = function(p_evt)
	{
		var removedShapeContainer = this._shapeContainersByID[p_evt.shapeID];
		if (removedShapeContainer == null) {
			trace("onShapeRemove NOT FOUND: shapeID="+p_evt.shapeID);
			return;
		}
		removedShapeContainer._content.removeEventListener("PROPERTY_CHANGE", this.shapePropertyChange);
		removedShapeContainer._content.removeEventListener("TEXT_EDITOR_CREATE", this.textEditorCreate);
		
		/*
		// elimina eventuali listener specifici dei Link
		if (removedShapeContainer._content is WBLinkShape) {
			WBLinkShape(removedShapeContainer._content).removeListeners(); 
		}
		
		// se elimino una shape con anchors allora propago a tutti i link presenti nella pagina
		// il comando di unlink da quella shape
		if (removedShapeContainer is WBBoxContainer) {
			 var boxShapeID = removedShapeContainer._content.shapeID;
			 for (var shapeID in _shapeContainersByID) {
				 var container = _shapeContainersByID[shapeID];
				 if (container is WBLinkContainer) {
					 WBLinkShape(container._content).unlink(boxShapeID);
				 }
			 }
		}*/
		
		if (removedShapeContainer._content instanceof wb.WBBaseTextShape) {
			removedShapeContainer._content.removeTA();
		}
		
		this.removeChild(removedShapeContainer);
		delete this._shapeContainersByID[p_evt.shapeID];
		if (this._selectionGroup.length>0) {
//TODO			this.updateSelectionRect();
		}
		stage.update();
	}

	/**
	 * Returns the container of the given shape.
	 */
	p.getShapeContainer = function(p_shapeID)
	{
		return this._shapeContainersByID[p_shapeID];
	}
	
	p.drawFromExistingModel = function()
	{
		var shapeIDs = this._model.getShapeIDs();
		var l = shapeIDs.length;
		for (var i=0; i<l; i++) {
			this.drawShape(this._model.getShapeDescriptor(shapeIDs[i]));
		}
	}
	
	p.drawShape = function(p_desc)
	{
		var factory = this._registeredFactories[p_desc.factoryID];
		var shape = factory.newShape();
		trace("WBCanvas.drawShape - "+p_desc.factoryID);
		if (!factory) {
			// we should not get here, but a little defensive coding to prevent RTEs
			return;
		}
		shape.canvas = this;					// importante: deve essere prima di shape.definitionData
		shape.set_definitionData(p_desc.definitionData);
		var newContainer;
		// crea un container diverso in funzione del tipo di shape
		/*if (shape.containerType == WBShapeBase.CONTAINER_LINK) {
			newContainer = new WBLinkContainer();
		} else if (shape.containerType ==  WBShapeBase.CONTAINER_BOX || _settings.getValue("whiteboard.connectAllShapes") == true) {
			newContainer = new WBBoxContainer();
			newContainer.addEventListener(WBShapeEvent.BOX_ROLL_OVER, boxRollOver, false, 0, true);
			newContainer.addEventListener(WBShapeEvent.BOX_ROLL_OUT, boxRollOut, false, 0, true);
			newContainer.addEventListener(WBShapeEvent.BOX_MOUSE_DOWN, beginDrawingLink, false, 0, true);
		} else {*/
			newContainer = new wb.WBShapeContainer();
		/*}*/
		this.addChild(newContainer);

		shape.set_propertyData(p_desc.propertyData);
		shape.shapeFactory = factory;
		shape.shapeID = p_desc.shapeID;
		shape.userID = p_desc.userID;
		shape.groupID = p_desc.groupID;
		shape.shapeContainer = newContainer;
		this._shapeContainersByID[p_desc.shapeID] = newContainer;
		
		shape.setBounds(0, 0, p_desc.width, p_desc.height);
		newContainer.set_content(shape);
		//trace("	>sh.definitionData: "+JSON.stringify(shape.get_propertyData()));
		//trace("	>sh.propertyData: "+JSON.stringify(shape.get_definitionData()));
		trace("	>sh.x,y: "+shape.x+", "+shape.y+"	>sh.w,h: "+shape.width+", "+shape.height);
		
		shape.addEventListener("PROPERTY_CHANGE", this.shapePropertyChange, false);
		shape.addEventListener("SHAPE_CHANGE", this.shapeChange, false);
		/*if (shape is WBTextShape || shape is WBBoxShape || shape is WBLinkShape) {
			shape.addEventListener(WBShapeEvent.TEXT_EDITOR_CREATE, textEditorCreate, false, 0, true);
			shape.addEventListener(WBShapeEvent.TEXT_EDITOR_DESTROY, textEditorDestroy, false, 0, true);
			shape.popupTextToolBar = popupPropertiesToolBar;
		}*/
		
		// prende h e w con segno per disegnare triangolo rettangolo nella direzione corretta (figura non simmetrica)
		/* TODO TODO
		if (shape is WBSimpleShape &&  shape.definitionData.shapeType == WBSimpleShape.TRIANGLE_RECT) {
			WBSimpleShape(shape)._sHeight = WBSimpleShape(shape).propertyData._sHeight;
			WBSimpleShape(shape)._sWidth = WBSimpleShape(shape).propertyData._sWidth;
		}*/

		if (newContainer.rotation != p_desc.rotation) {
			newContainer.rotation = p_desc.rotation;
			//TODO newContainer.validateNow();
		}
		newContainer.width = p_desc.width;
		newContainer.height = p_desc.height;
		newContainer.move(p_desc.x, p_desc.y);
		trace("	>container x,y: "+p_desc.x+", "+p_desc.y);
		//TODO newContainer.validateNow();
		stage.update();
		
		// Piero
		//TODO newContainer.addEventListener(WBEvent.SHAPE_ROLL_OVER, shapeRollOver, false, 0, true);
	}
	
	/**
	 * Clears all shapes and selection from the WBCanvas 
	 */
	p.clearCanvas = function()
	{
		//trace("Clear Canvas");
		this.clearSelection();
		for (var shapeID in this._shapeContainersByID) {
			var container = this._shapeContainersByID[shapeID];
			/* TODO TODO TODO
			container._content.removeEventListener(WBShapeEvent.PROPERTY_CHANGE, shapePropertyChange);
			container._content.removeEventListener(WBShapeEvent.SHAPE_CHANGE, shapeChange);
			container._content.removeEventListener(WBShapeEvent.TEXT_EDITOR_CREATE, textEditorCreate);
			removeChild(container);
			*/
		}
		this._shapeContainersByID = {};
	}
	
	
	// ::: SHAPE listeners
	/**
	 * @private
	 */
	p.shapePropertyChange = function(p_evt)
	{
		var shape = p_evt.target;
		var _this = shape.canvas;
		if (_this._isClosing) {
			return;
		}
		// ripristina listener per selezione sul container
		shape.shapeContainer.addEventListener("mousedown", shape.shapeContainer._listenerMouseDn, false);
		var desc = _this._model.getShapeDescriptor(shape.shapeID).clone();
		desc.propertyData = shape.get_propertyData();
		_this._commandMgr.addCommand(new wb.WBShapesPropertyChange([desc]));
		_this._invSelectionChange = true;
		_this.invalidateProperties();
	}
	
	/**
	 * @private
	 */
	p.shapeChange = function(p_evt)
	{
		var shape = p_evt.target;
		var _this = shape.canvas;
		if (_this._isClosing) {
			return;
		}
		
		var desc = _this._model.getShapeDescriptor(shape.shapeID);
		// opera solo se la shape esiste ancora nel model			
		if (desc) {
			// ripristina listener per selezione sul container
			shape.shapeContainer.addEventListener("mousedown", shape.shapeContainer._listenerMouseDn, false);
			
			desc = desc.clone();
			desc.x = shape.shapeContainer.x;
			desc.y = shape.shapeContainer.y;
			desc.width = shape.shapeContainer.width;
			desc.height = shape.shapeContainer.height;
			desc.propertyData = shape.get_propertyData();
			desc.definitionData = shape.get_definitionData();
			_this._model.changeShape(desc.shapeID, desc);

//			_invSelectionChange = true;
			_this.invalidateProperties();
		}
	}

	p.shapeDoubleClick = function(p_evt)
	{
		var _this = p_evt.currentTarget.canvas;
/*		// check: se la shape e' una textbox allora edit text altrimenti bringToFront
		var shapeSelected = _this._shapeContainersByID[_selectionGroup[0]]).content;
		if (shapeSelected is WBTextShape || shapeSelected is WBBoxShape || shapeSelected is WBLinkShape) {
			if (_currentShapeToolBar) {
				removeToolBar();
			}
			var toolBar:EditorToolBar = shapeSelected.focusTextEditor();
			if (popupPropertiesToolBar) {
				var pt:Point = new Point(Math.round((width-toolBar.width)/2), height-toolBar.height);
				pt = toolBar.parent.globalToLocal(localToGlobal(pt));
				toolBar.move(pt.x, pt.y);			
			}
		} else {*/
			_this.selectedShapeBringToFront(_this._selectionGroup[0]);
		//}
	}
	
	p.shapeDeselect = function(shapeID)
	{
//TODO
		var idx = _this._selectionGroup.indexOf(shapeID);
		if (idx!=-1) {
			if (_this._groupSelectionHandles && _this._groupSelectionHandles.isGroup) {
				// se e' un gruppo non permette di deselezionare alcuni elementi
			} else {
				// it's selected - unselect
				var newSelection = _this._selectionGroup.slice();
				newSelection.splice(idx,1);
				_this.set_selectedShapeIDs(newSelection);
			}
		}			
	}
	
	p.isSelected = function(shapeID)
	{
		if (this._selectionGroup.length==0) return 0;
		var i = this._selectionGroup.indexOf(shapeID);
		return i+1;
	}
	
	p.shapeContainerMouseDown = function(p_evt, _this)
	{
		var container = p_evt.currentTarget;
		var shapeIDClicked = container._content.shapeID;
		var groupIDClicked = container._content.groupID;
		trace("WBCanvas.shapeContainerMouseDown: "+shapeIDClicked);
		
		///////////////_this.addToSelection(container._content.shapeID);
		var newSelection;
		var selChange;
		if (_this.isModifierDown) {	//CHECK
			newSelection = _this._selectionGroup.slice();
			p_evt.stopImmediatePropagation();
			// adding or removing from current selection
			var idx = _this._selectionGroup.indexOf(shapeIDClicked);
			if (idx!=-1) {
				if (_this._groupSelectionHandles && _this._groupSelectionHandles.isGroup) {
					// se e' un gruppo non permette di deselezionare alcuni elementi
				} else {
					// it's selected - unselect
					newSelection.splice(idx,1);
					selChange = new wb.WBSelectionChange(newSelection);
					_this._commandMgr.addCommand(selChange);
				}
			} else {
				if (groupIDClicked) {
					// selezionato shape appartenente a un gruppo, aggiunge l'intero gruppo
					newSelection = newSelection.concat(_this.getGroupShapeContainers(groupIDClicked));
				} else {
					newSelection.push(shapeIDClicked);
				}
				selChange = new wb.WBSelectionChange(newSelection);
				_this._commandMgr.addCommand(selChange);
			}
		} else {
			if (groupIDClicked) {
				// selezionato shape appartenente a un gruppo, seleziona l'intero gruppo
				newSelection = _this.getGroupShapeContainers(groupIDClicked);
			} else {
				newSelection = [shapeIDClicked];
			}
			selChange = new wb.WBSelectionChange(newSelection);
			_this._commandMgr.addCommand(selChange);
			_this._invDontMoveShape = false;
//			_this.validateNow();
		}
		//setFocus();
	}
	
	/**
	 * Group all selected shapes.
	 */
	p.groupSelectedShapes = function()
	{
		if (!this._groupSelectionHandles) {
			// no op
			return;
		}
		var groupID = this._model.createGroupID();
		this._groupSelectionHandles.clearAllEvents();
		this._commandMgr.addCommand(new wb.WBGroupShapes(this._selectionGroup, groupID));
		//cursorManager.removeAllCursors();
	}
	
	/**
	 * UnGroup selected shapes.
	 */
	p.ungroupSelectedShapes = function()
	{
		if (!this._groupSelectionHandles) {
			// no op
			return;
		}
		this._groupSelectionHandles.clearAllEvents();
		this._commandMgr.addCommand(new wb.WBGroupShapes(this._selectionGroup, ""));
		//cursorManager.removeAllCursors();
		this.disposeGroupSelection();
	}	
	
	p.getGroupShapeContainers = function(groupID, returnID)
	{
		if(typeof(returnID)==='undefined') returnID = true;
		var group = new Array();
		for (var shapeID in this._shapeContainersByID) {
			var container = this._shapeContainersByID[shapeID];
			if (container._content.groupID == groupID) {
				if (returnID)
					group.push(shapeID);
				else
					group.push(container);
			}
		}
		return group;
	}
	
	p.beginGroupSelection = function(p_evt)
	{
		trace("WBCanvas.beginGroupSelection");
		if (p_evt.target.name == null || p_evt.target.name != "_back") {
			return;
		}
		var _this = p_evt.target.parent;
		var newSelection;
		var selChange;
		newSelection = new Array();
		selChange = new wb.WBSelectionChange(newSelection);
		_this._commandMgr.addCommand(selChange);
		/*
		if (stage) {
			if (stage.hasEventListener(MouseEvent.MOUSE_UP)) {
				if(_selectionRect) {
					_selectionRect.graphics.clear();
					PopUpManager.removePopUp(_selectionRect);
					_selectionRect = null;
				}
				stage.removeEventListener(MouseEvent.MOUSE_UP, endGroupSelection);
			}
			//DS: Modificati
			stage.addEventListener(MouseEvent.MOUSE_UP, endGroupSelection, false, 0, true);
			stage.addEventListener(MouseEvent.MOUSE_MOVE, trackSelection, false, 0, true);
		}
		cursorManager.setCursor(_crosshairsCursor);
		*/
		if (_this.hasEventListener("pressup")) {
			if(_this._selectionRect) {
				_this._selectionRect.graphics.clear();
				_this.removeChild(_this._selectionRect);
				_this._selectionRect = null;
			}
			_this.removeEventListener("pressup", _this.endGroupSelection);
		}
		//DS: Modificati
		_this.addEventListener("pressup", _this.endGroupSelection, false);
		_this.addEventListener("pressmove", _this.trackSelection, false);
		
		_this._selectionRect = new createjs.Shape();
		_this.addChild(_this._selectionRect);
		_this._selectionRect.x = _this._selectionRect.y = 0;
		_this._selectionOrigin = new Point(p_evt.stageX, p_evt.stageY);
		
						
							//PC
		//TODO					_this.updateShapeToolbarProperties();
		
	}
	
	p.trackSelection = function(p_evt)
	{
	//TODO
		var _this = p_evt.currentTarget;
		var g = _this._selectionRect.graphics;
		g.clear();
		_this._selectionRect.alpha = 0.6;
		g.setStrokeStyle(1,"round").beginStroke("#3a3a6a");
		//g.beginFill("#ffffff");
		//g.lineStyle(1, 0x3a3a6a, 0.6, true);
		//g.beginGradientFill("linear", [0x6a6a9a, 0x595989], [0.2, 0.2], [0, 255]);
		g.drawRect(Math.min(_this._selectionOrigin.x, p_evt.stageX), Math.min(_this._selectionOrigin.y, p_evt.stageY),
					Math.abs(p_evt.stageX-_this._selectionOrigin.x), Math.abs(p_evt.stageY-_this._selectionOrigin.y));
		_this._selectionRect.setBounds(Math.min(_this._selectionOrigin.x, p_evt.stageX), Math.min(_this._selectionOrigin.y, p_evt.stageY),
					Math.abs(p_evt.stageX-_this._selectionOrigin.x), Math.abs(p_evt.stageY-_this._selectionOrigin.y));
		stage.update();
	}
	
	p.endGroupSelection = function(p_evt)
	{
		trace("WBCanvas.endGroupSelection");
		var _this = p_evt.currentTarget;
		if (_this._selectionRect == null) {
			trace("WBCanvas.endGroupSelection --> ERR _selectionRect = null");
			return;
		}
		
		//cursorManager.removeAllCursors();
		//if(stage){
			_this.removeEventListener("pressup", _this.endGroupSelection);
			_this.removeEventListener("pressmove", _this.trackSelection);
		//}
		var newSelection = new Array();
		var selectionBounds = _this._selectionRect.getBounds(_this);
		if (selectionBounds) {
			var pt = _this.localToGlobal(selectionBounds.x, selectionBounds.y);
			var originPt = _this._selectionRect.parent.globalToLocal(pt.x, pt.y);
			pt = _this.localToGlobal(selectionBounds.x+selectionBounds.width, selectionBounds.y+selectionBounds.height);
			var lowerRightPt = _this._selectionRect.parent.globalToLocal(pt.x, pt.y);
			var leftX = Math.round(originPt.x);
			var rightX = Math.round(lowerRightPt.x);
			var topY = Math.round(originPt.y);
			var botY = Math.round(lowerRightPt.y);

			var l = _this.getNumChildren();
			for (var i=0; i<l; i++) {
				var kid = _this.getChildAt(i);
				if (kid instanceof wb.WBShapeContainer && kid._content && kid._content.hitTestObject(_this._selectionRect)) {
					// ok, there's some overlap. Scan the borders of the selection
					var intersectsEdge = false;					
					var j;
					// unfortunately, we're forced to scan using hitTestPoint.. sampling every 3 pixels 
					// assume the right edge is most likely to hit the shape. 					
					for (j=topY; j<=botY; j+=3) {
						if (kid._content.hitTest(rightX, j)) {
							intersectsEdge = true;
							break;
						}
					}
					if (intersectsEdge) {
						// no need to keep looking at _this shape
						continue;
					}
					// next, assume the bottom edge is most likely
					for (j=leftX; j<=rightX; j+=3) {
						if (kid._content.hitTest(j, botY)) {
							intersectsEdge = true;
							break;
						}
					}
					if (intersectsEdge) {
						// no need to keep looking at _this shape
						continue;
					}
					// next, left edge
					for (j=topY; j<=botY; j+=3) {
						if (kid._content.hitTest(leftX, j)) {
							intersectsEdge = true;
							break;
						}
					}
					if (intersectsEdge) {
						// no need to keep looking at _this shape
						continue;
					}
					// last, top edge
					for (j=leftX; j<=rightX; j+=3) {
						if (kid._content.hitTest(j, topY)) {
							intersectsEdge = true;
							break;
						}
					}
					if (intersectsEdge) {
						// no need to keep looking at _this shape
						continue;
					}
					_this._invDontMoveShape = true;
					newSelection.push(kid._content.shapeID);
					// wow, we found a shape legitimately in the selection. 
					// TODO : nigel - we need to eliminate possible false positives (wait until someone complains)
				}
			}
			if (_this._selectionGroup.length!=0 || newSelection.length!=0) {
				var selChange = new wb.WBSelectionChange(newSelection);
				_this._commandMgr.addCommand(selChange);
			}
		}
		//setFocus();
		_this._selectionRect.graphics.clear();
		_this._selectionRect.setBounds(0, 0, 0, 0);
		_this.removeChild(_this._selectionRect);
		_this._selectionRect = null;
		stage.update();
	}

	p.groupMove = function(p_evt)
	{
		var _this = p_evt.target.canvas;
		var l = _this._selectionGroup.length;
		for (var i=0; i<l; i++) {
			var kid = _this._shapeContainersByID[_this._selectionGroup[i]];
			var details = _this._selectionGroupDetails[i];
			var tmpX = details.x*_this._groupSelectionHandles.shapeWidth();
			var tmpY = details.y*_this._groupSelectionHandles.shapeHeight();
			var pt = _this._groupSelectionHandles.localToGlobal(tmpX, tmpY);
			var localPt = _this.globalToLocal(pt.x, pt.y);
			kid.move(localPt.x-kid.get_width()/2, localPt.y-kid.get_height()/2);
		}
		//setFocus();
		stage.update();
	}

	p.groupRotation = function(p_evt)
	{
		var _this = p_evt.target.canvas;
		var l = _this._selectionGroup.length;
		for (var i=0; i<l; i++) {
			var kid = _this._shapeContainersByID[_this._selectionGroup[i]];
			var details = _this._selectionGroupDetails[i];
			var tmpX = details.x*_this._groupSelectionHandles.shapeWidth();
			var tmpY = details.y*_this._groupSelectionHandles.shapeHeight();
			var pt = _this._groupSelectionHandles.localToGlobal(tmpX, tmpY);
			var localPt = _this.globalToLocal(pt.x, pt.y);
//			if (kid.rotation>0) {
//				trace("****");
//			}
			kid.set_rotation(_this.normalizeRotation(details.rotation + _this._groupSelectionHandles.rotation));
//			kid.move(localPt.x-kid.get_width()/2, localPt.y-kid.get_height()/2);
//PIERO: se e' un solo kid allora funziona
			kid.move(_this._groupSelectionHandles.x, _this._groupSelectionHandles.y);
			kid.validateNow();
		}
		//setFocus();
	}
	
	p.groupResize = function(p_evt)
	{
		trace("WbCanvas.groupResize");
		var _this = p_evt.target.canvas;
		var l = _this._selectionGroup.length;
		for (var i=0; i<l; i++) {
			var kid = _this._shapeContainersByID[_this._selectionGroup[i]];
			var details = _this._selectionGroupDetails[i];
			var tmpX = details.x*_this._groupSelectionHandles.shapeWidth();
			var tmpY = details.y*_this._groupSelectionHandles.shapeHeight();
			
			var localPt;
			if (p_evt.sizingDirection=="SIZING_WIDTH") {
				if ((details.rotation>45 && details.rotation<135) || (details.rotation>-135 && details.rotation<-45)) {
					// the axes are lined up such that when sizing with, we should size shapeHeight
					kid.height = details.width*_this._groupSelectionHandles.shapeWidth();
				} else {
					kid.width = details.width*_this._groupSelectionHandles.shapeWidth();
				}
			} else if (p_evt.sizingDirection=="SIZING_HEIGHT") {
				if ((details.rotation>45 && details.rotation<135) || (details.rotation>-135 && details.rotation<-45)) {
					kid.width = details.height*_this._groupSelectionHandles.shapeHeight();
				} else {
					kid.height = details.height*_this._groupSelectionHandles.shapeHeight();
				}
			} else {
				if ((details.rotation>45 && details.rotation<135) || (details.rotation>-135 && details.rotation<-45)) {
					kid.width = details.height*_this._groupSelectionHandles.shapeHeight();
					kid.height = details.width*_this._groupSelectionHandles.shapeWidth();
				} else {
					kid.width = details.width*_this._groupSelectionHandles.shapeWidth();
					kid.height = details.height*_this._groupSelectionHandles.shapeHeight();
				}
				
			}
			var pt = _this._groupSelectionHandles.localToGlobal(tmpX, tmpY);
			localPt = _this.globalToLocal(pt.x, pt.y);
			kid.validateNow();
			kid.move(localPt.x-kid.get_width()/2,localPt.y-kid.get_height()/2);
		}
		//setFocus();
	}
	
	p.commitPositionSizeRotation = function(p_evt)
	{
		trace("WBCanvas.commitPositionSizeRotation");
		var _this = p_evt.target.canvas;
		var l = _this._selectionGroup.length;
		var selectedDescs = new Array();
		for (var i=0; i<l; i++) {
			var kid = _this._shapeContainersByID[_this._selectionGroup[i]];
//			if (kid is wb.WBLinkContainer) {
				// per i link
//			} else {
				// per altre shape
				var shapeDesc = _this._model.getShapeDescriptor(kid._content.shapeID).clone();
				if (shapeDesc.x!=kid.get_x() || shapeDesc.y!=kid.get_y() || shapeDesc.width!=kid.shapeWidth()
					 || shapeDesc.height!=kid.shapeHeight() || shapeDesc.rotation!=kid.rotation) {
					shapeDesc.x = kid.get_x();
					shapeDesc.y = kid.get_y();
					shapeDesc.width = kid.shapeWidth();
					shapeDesc.height = kid.shapeHeight();
					shapeDesc.rotation = kid.rotation;
					selectedDescs.push(shapeDesc);
				}
//			}
		}
		if (selectedDescs.length>0) {
			_this._commandMgr.addCommand(new wb.WBShapeContainersChange(selectedDescs));
		}
	}
	
	/**
	 * Delete all selected shapes.
	 */
	p.removeSelectedShapes = function()
	{
		/*if (!_groupSelectionHandles) {
			// no op
			return;
		}
		// delete all selected items
		_groupSelectionHandles.clearAllEvents();
		*/
		var selectedDescriptors = new Array();
		var i = 0;
		while (i<this._selectionGroup.length) {
			var kid = this._shapeContainersByID[this._selectionGroup[i]];		//selectedDescriptors.push(this._model.getShapeDescriptor(kid._content.shapeID));
			this.removeFromSelection(kid._content.shapeID);
			this._model.removeShape(kid._content.shapeID);
		}
		/*
		_commandMgr.removeRecentCommands(WBSelectionChange);
		_commandMgr.addCommand(new WBRemoveShapes(selectedDescriptors));
		cursorManager.removeAllCursors();
		*/
	}
	
	p.removeAllShapes = function()
	{
		this._model.removeAllShapes();
	}
		
	/**
	 * Registers the factory class for creating the shape.
	 */
	p.registerFactory = function(p_factory)
	{
		var factoryID = p_factory.factoryID(); //flash.utils.getQualifiedClassName(p_factory);
		this._registeredFactories[factoryID] = p_factory;
	}
	
	p.getFactoryID = function(p_factory)
	{
		for (var i in this._registeredFactories) {
			if (this._registeredFactories[i]==p_factory) {
				return i;
			}
		}
		return null;
	}
	
	/**
	 * Cerca un factory name (es. "WBTextShapeFactory") tra le _registeredFactories e ne restituisce l'ID completo
	 * @private
	 */
	p.getFactoryIDByName = function(n_factory)
	{
		for (var i in this._registeredFactories) {
			if (i.indexOf(n_factory)!=-1) {
				return i;
			}
		}
		return null;
	}
	
	/**
	 * Restituisce una factory precedentemente registrata  
	 * @param factoryID
	 * @return 
	 * 
	 */
	p.getFactory = function(factoryID)
	{
		var factory = this._registeredFactories[factoryID];
		return factory;
	}
	
	p.listFactory = function()
	{
		for (var i in this._registeredFactories) {
			trace(i);
		}
	}
	
	p.invalidateProperties = function()
	{
		this.commitProperties();
	}
	
	p.commitProperties = function()
	{
		trace("WBCanvas.commitProperties");
		this._drawingSurface.visible = !this._enableSelection && this._drawingSurfaceVisible; 
		
		if (this._invEnableSelection) {
			this._drawingSurface.visible = !this._enableSelection && this._drawingSurfaceVisible;
			if (this._enableSelection) {
				trace("	>enableSelection");
				this.addEventListener("mousedown", this.beginGroupSelection, false);
			} else {
				trace("	>draw");
				if (this.get_selectedShapeIDs().length>0) {
					this.set_selectedShapeIDs([]);
				}
				this.removeEventListener("mousedown", this.beginGroupSelection, false);
				this.removeEventListener("pressup", this.endGroupSelection, false);
			}
		}
		
		if (this._invSelectionChange) {
			this._invSelectionChange = false;
			
			/* TODO if (_currentShapeToolBar && !((_currentShapeToolBar is WBTextToolBar) && _tmpHitSurface!=null) && !_shapeFactory) {
				removeToolBar();
			}*/

			for (var s=this._selectionGroup.length-1; s>=0; s--) {
				if (this._shapeContainersByID[this._selectionGroup[s]]==null) {
					var t = true;
					this._selectionGroup.splice(s, 1);
				}
			}

			if (this._selectionGroup.length>0) 
			{
				//trace(">>commitProperties: _selectionGroup="+this._selectionGroup.length);
				if (!this._groupSelectionHandles) {
					this._groupSelectionHandles = new wb.WBDragHandles();
					this._groupSelectionHandles.canvas = this;
					this._groupSelectionHandles.kid = null;
					this._groupSelectionHandles.addEventListener("POSITION_CHANGE", this.groupMove, false);
					this._groupSelectionHandles.addEventListener("ROTATION_CHANGE", this.groupRotation, false);
					this._groupSelectionHandles.addEventListener("SIZE_CHANGE", this.groupResize, false);
					this._groupSelectionHandles.addEventListener("POSITION_SIZE_ROTATE_END", this.commitPositionSizeRotation, false);
					//this._groupSelectionHandles.addEventListener("SHAPE_ROLL_OVER", this.shapeRollOver, false);
					
					/*if (this.selectionHandlesContainer==null) {
						PopUpManager.addPopUp(_groupSelectionHandles, this);
					} else {
						this.selectionHandlesContainer.addChild(_groupSelectionHandles);
					}*/
					this.addChild(this._groupSelectionHandles);
				}

				var minPt;
				var maxPt;
				var kid;
				if (this._selectionGroup.length==1)
				{
					// fit to the one shape
					kid = this._shapeContainersByID[this._selectionGroup[0]];
					if (kid._content) {
						kid._content.validateNow();
					}
					kid.validateNow();
					var p = this.localToGlobal(kid.get_shapeX(), kid.get_shapeY());
					minPt = this._groupSelectionHandles.parent.globalToLocal(p.x, p.y);
					p = this.localToGlobal(kid.get_shapeX()+kid.shapeWidth(), kid.get_shapeY()+kid.shapeHeight());
					maxPt = this._groupSelectionHandles.parent.globalToLocal(p.x, p.y);
					
					// Piero - pro shape roll out ed altri utilizzi
					this._groupSelectionHandles.kid = kid;
					
					// abilita/disabilita gli handles in base alla shape
					if (kid.movable == false) {
						this._groupSelectionHandles.set_handlesEnabled(false);
						this._groupSelectionHandles.moveEnabled = false;
					}else{
						this._groupSelectionHandles.set_handlesEnabled(true);
						this._groupSelectionHandles.moveEnabled = true;
					}
					// se Link, Box o Text allora porta in primo piano purche' non faccia parte di un group
					if (kid._content.isEditable && (kid._content instanceof wb.WBBaseTextShape || kid._content instanceof wb.WBTextShape) && !kid._content.groupID) {
						this.shapeBringToFrontLocal(kid._content.shapeID);
						this._groupSelectionHandles.handleEditType = wb.WBDragHandles.HANDLE_EDIT_TEXT;
					} else if (kid._content.isEditable && (kid._content instanceof wb.WBLineShape)) {
						this._groupSelectionHandles.handleEditType = wb.WBDragHandles.HANDLE_EDIT_POINTS;
					} else {
						this._groupSelectionHandles.handleEditType = "";
					}
					this._groupSelectionHandles.resizable = kid.resizable;
					this._groupSelectionHandles.width = maxPt.x-minPt.x;
					this._groupSelectionHandles.height = maxPt.y-minPt.y;
					this._groupSelectionHandles.moveShape(minPt.x, minPt.y);
					this._groupSelectionHandles.rotation = kid.rotation;
					this._groupSelectionHandles.doubleClickEnabled = true;
					this._groupSelectionHandles.addEventListener("dblclick", this.shapeDoubleClick, false);
					
					//trace(">>commitProperties: x,y="+minPt.x+", "+minPt.y+"	w,h="+(maxPt.x-minPt.x)+", "+(maxPt.y-minPt.y));
					/*if (this._drawingSurfaceVisible) {
						if (kid._content is WBTextShape || kid._content is WBBoxShape || kid._content is WBLinkShape)
							_groupSelectionHandles.toolTip = _lm.getString("DOPPIO_CLIC_TESTO");
						else
							_groupSelectionHandles.toolTip = _lm.getString("DOPPIO_CLIC_FRONT");
					}*/
					this._groupSelectionHandles.addEventListener("BEGIN_EDIT_SHAPE", this.editSelectedShape, false);

					/* TODO TODO
					this._currentShapeToolBar = kid._content.shapeFactory.get_toolBar();
					if (this._currentShapeToolBar) {
						this._currentShapeToolBar.addEventListener("shapePropertyChange", this.onToolBarChange, false);
						this._currentShapeToolBar.set_propertyData(kid._content.get_propertyData());
						this.addToolBar();
					}*/
					var tb = kid._content.shapeFactory.get_toolBar();
					if (this._currentShapeToolBar && tb!=null) {
						this._currentShapeToolBar.removeEventListener("shapePropertyChange", this.onToolBarChange);
						this._currentShapeToolBar.set_propertyData(tb.get_propertyData());
						this._currentShapeToolBar.set_propertyData(kid._content.get_propertyData());
						this._currentShapeToolBar.addEventListener("shapePropertyChange", this.onToolBarChange, false);
					}
					
					this._groupSelectionHandles.validateNow();
					
					// permette di iniziare subito un move al prossimo "mousedown"
					this._groupSelectionHandles.moveRollOver();
					
					stage.update();
					
				} else {
					//Qui se la selezione comprende più oggetti
					
					this._groupSelectionHandles.kid = null;
					//this._groupSelectionHandles.toolTip = _lm.getString("Shift-Click");
					this._groupSelectionHandles.doubleClickEnabled = false;
					this._groupSelectionHandles.removeEventListener("dblclick", this.shapeDoubleClick);
					this._groupSelectionHandles.rotation = 0;
					// recalculate the bounds of selection
					var minX = Number.POSITIVE_INFINITY;
					var minY = Number.POSITIVE_INFINITY;
					var maxX = 0;
					var maxY = 0;

					var l = this._selectionGroup.length;
					
					var uguali = true;
					var tipo = "";
					var isGroup;
					var groupID = this._shapeContainersByID[this._selectionGroup[0]]._content.groupID;
					if (groupID) isGroup = true; else isGroup = false;
					
					//DS: Qui la parte per toolbar modifiche selezione oggetti
					//Le parti commentate sono state commentate per permettere di modificare oggetti di tipo diverso
					for (var i=0; i<l; i++) {
						kid = this._shapeContainersByID[this._selectionGroup[i]];
						if (tipo == "") {
							tipo = kid._content.shapeFactory.factoryID();							
						} else {
							if (tipo != kid._content.shapeFactory.factoryID()) {
								uguali = false;
							}
						}
						if (isGroup && kid._content.groupID) {
							if (kid._content.groupID != groupID) isGroup = false;
						} else {
							isGroup = false;
						}
						
						minX = Math.min(minX, kid.get_x());
						minY = Math.min(minY, kid.get_y());
						maxX = Math.max(maxX, kid.get_x()+kid.get_width());
						maxY = Math.max(maxY, kid.get_y()+kid.get_height());
					}
					p = this.localToGlobal(minX, minY);
					minPt = this._groupSelectionHandles.parent.globalToLocal(p.x, p.y);
					p = this.localToGlobal(maxX, maxY);
					maxPt = this._groupSelectionHandles.parent.globalToLocal(p.x, p.y);
					this._groupSelectionHandles.moveShape(minPt.x, minPt.y);
					this._groupSelectionHandles.width = maxPt.x-minPt.x;
					this._groupSelectionHandles.height = maxPt.y-minPt.y;
					
					if (uguali) {
						// crea una nuova istanza della factory da cui ricavare la toolbar
						/* TODO
						var factoryDefinition:Class = getDefinitionByName(getFactoryID(kid._content.shapeFactory)) as Class;
						this._currentShapeToolBar = new factoryDefinition().toolBar;
						*/
						var tb = kid._content.shapeFactory.get_toolBar();
					} else {
						// quando la selezione contempla oggetti di tipo diverso apre una property toolbar generale
						var tb = new wb.WBSimpleShapeFactory().get_toolBar();
					}
					if (isGroup) {
						//this._groupSelectionHandles.toolTip = _lm.getString("groupSel");
						this._groupSelectionHandles.isGroup = true;
					} else {
						this._groupSelectionHandles.isGroup = false;
					}
					/* TODO TODO
					if (this._currentShapeToolBar) 
					{
						this._currentShapeToolBar.addEventListener("shapePropertyChange", onToolBarChange, false);
						this.addToolBar();
						this.updateShapeToolbarProperties();
					}
					*/
					if (this._currentShapeToolBar) {
						this._currentShapeToolBar.removeEventListener("shapePropertyChange", this.onToolBarChange);
						this._currentShapeToolBar.set_propertyData(tb.get_propertyData());
						this._currentShapeToolBar.addEventListener("shapePropertyChange", this.onToolBarChange, false);
					}
				}
				this._groupSelectionHandles.set_handlesVisible(true);
				//cursorManager.removeAllCursors();
				/*if (isModifierDown) {
					_groupSelectionHandles.mouseBlocking = false;
				}*/
				if (!this._invDontMoveShape) {
					this._groupSelectionHandles.beginMouseTracking();
				} else {
					this._invDontMoveShape = false;
				}
				this._groupSelectionHandles.validateNow();
				this.normalizeGroupSelection();

			} else {
				this.disposeGroupSelection();
			}
			this.dispatchEvent("selectionChange");
			
		}
		
		if (this._invNewShapeFactory) {
			this._invNewShapeFactory = false;
			if (this._shapeFactory) {
				/*if (this._currentShapeToolBar) {
					this.removeToolBar();
				}*/
				var tb = this._shapeFactory.get_toolBar();
				if (this._currentShapeToolBar) {
					this._currentShapeToolBar.removeEventListener("shapePropertyChange", this.onToolBarChange);
					this._currentShapeToolBar.set_propertyData(tb.get_propertyData());
					this._currentShapeToolBar.addEventListener("shapePropertyChange", this.onToolBarChange, false);
				}
				/*if (this._currentShapeToolBar) {
					this.addToolBar();
				}*/
			} else if (this._currentShapeToolBar) {
				//this.removeToolBar();
			}
		}
				
		stage.update();
	}

	/**
	 * Undo whiteboard command. 
	 */
	p.undo = function()
	{
		this._commandMgr.undo();
	}
	
	/**
	 * Redo whiteboard command. 
	 */
	p.redo = function()
	{
		this._commandMgr.redo();
	}
	
	p.get_selectedShapeIDs = function()
	{
		return this._selectionGroup;
	}
	
	p.set_selectedShapeIDs = function(_list)
	{
		this._selectionGroup = _list;
		this._invSelectionChange = true;
		this._invDontMoveShape = true;
		this.invalidateProperties();
	}
	
	/**
	 * Edit selected shape.
	 */
	p.editSelectedShape = function(p_evt)
	{
		var _this = p_evt.target.canvas;
		if (!_this._groupSelectionHandles) {
			// no op
			return;
		}
		// una sola Shape selezionata
		if (_this._selectionGroup.length == 1) {
			trace("WBCanvas.editSelectedShape: "+_this._selectionGroup[0]);
			var kid = _this._shapeContainersByID[_this._selectionGroup[0]];
			if (kid._content.isEditable) {
				
//				try {
					/*if (kid._content instanceof WBBoxShape || kid._content is WBLinkShape || kid._content is WBTextShape || kid._content is WBBaseTextShape) {
						if (_this._currentShapeToolBar) {
							//_this.removeToolBar();
						}
						var toolBar = kid._content.focusTextEditor();
						if (_this.popupPropertiesToolBar) {
							var pt:Point = new Point(Math.round((width-toolBar.width)/2), height-toolBar.height);
							pt = toolBar.parent.globalToLocal(localToGlobal(pt));
							toolBar.move(pt.x, pt.y);			
						}
					} else {*/
						_this._groupSelectionHandles.clearAllEvents();
						_this.removeFromSelection(kid._content.shapeID);
						//_this._commandMgr.removeRecentCommands(wb.WBSelectionChange);
						//cursorManager.removeAllCursors();
						
						// toglie listener per selezione sul container (finche' non termina edit e rientra in shapePropertyChange)
						kid.removeEventListener("mousedown", kid._listenerMouseDn);
						kid._content.beginEditing();
					//}
//				} catch (e) {
//					trace("error editing: "+e.message);
//				}
				
			}
		}
	}
		
	/**
	 * Copy all selected shapes.
	 */
	p.copySelectedShapes = function()
	{
		if (this._selectionGroup.length==0) {
			// no op
			return;
		}
		// copy all selected items
		//_groupSelectionHandles.clearAllEvents();
		var selectedDescriptors = new Array();
		for (var i = 0; i<this._selectionGroup.length; i++) {
			var kid = this._shapeContainersByID[this._selectionGroup[i]];
			var sDesc = this._model.getShapeDescriptor(kid._content.shapeID);
			selectedDescriptors.push(sDesc);
		}
		// TODO e CHECK this._commandMgr.removeRecentCommands(WBSelectionChange);
		this._commandMgr.addCommand(new wb.WBCopyShapes(selectedDescriptors, this._currentShapeToolBar));
		//cursorManager.removeAllCursors();
	}
	

	/**
	 * Paste all shapes in clipboard.
	 */
	p.pasteShapes = function()
	{
		var pasteCmd;
		var shapesFromClip = this._model.getShapesFromClip();
		if (shapesFromClip != null && shapesFromClip.length>0) {
			// c'e' un copia locale pending
			pasteCmd = new wb.WBPasteShapes(shapesFromClip);
			this._commandMgr.addCommand(pasteCmd);
		} else {
			// controlla se c'e' qualcosa nella clipboard di sistema
		/*	if (Clipboard.generalClipboard.hasFormat(ClipboardFormats.TEXT_FORMAT)) {
				dispatchEvent(new Event(Event.PASTE));
			}*/
		}
		if (pasteCmd != null) {
			// seleziona le shapes appena incollate
			var newSelection;
			var selChange;			
			newSelection = pasteCmd.getPastedShapesID();
			selChange = new wb.WBSelectionChange(newSelection);
			this._commandMgr.addCommand(selChange);
			this._invDontMoveShape = true;
			// TODO this.validateNow();
			//setFocus();
		}
	}
	
	p.pasteFormatToSelectedShapes = function()
	{
		var propData = this._model.clipboardPropData;
		if (propData) {
			this._groupSelectionHandles.clearAllEvents();
			var selectedDescriptors = new Array();
			for (var i = 0; i<this._selectionGroup.length; i++) {
				var sDesc = this._model.getShapeDescriptor(this._selectionGroup[i]);
				sDesc.propertyData = propData;
				selectedDescriptors.push(sDesc);
			}
			this._commandMgr.addCommand(new wb.WBShapesPropertyChange(selectedDescriptors));
			this._invSelectionChange = true;
			this._invDontMoveShape = true;
			this.invalidateProperties();
		}
	}
	
	p.trasformDescToLineDesc = function(shape)
	{
		// converte Vector in Array nel caso Marker
		var defData = shape.definitionData;
		// crea nuovo descriptor di tipo LineFactory
		var newShape = new wb.WBShapeDescriptor();
		newShape.factoryID = "WBLineShapeFactory";
		newShape.x = shape.x;
		newShape.y = shape.y;
		newShape.width = shape.width;
		newShape.height = shape.height;
		newShape.propertyData = shape.propertyData;
		newShape.propertyData.dashed = false;
		newShape.userID = shape.userID;
		newShape.definitionData = {points: defData.points, shapeType: wb.WBLineShape.CURVE, closedPolygon: false};
		return newShape;
	}
	
	p.normalizeGroupSelection = function()
	{
		// store the center point, width, height, and rotation, relative to the group handles
		this._selectionGroupDetails = new Array();
		var l = this._selectionGroup.length;
		for (var i=0; i<l; i++) {
			var kid = this._shapeContainersByID[this._selectionGroup[i]];
			var relativeRotation = this.normalizeRotation(kid.rotation - this._groupSelectionHandles.rotation);
			var pt = this.localToGlobal(kid.get_x() + kid.get_width()/2, kid.get_y()+kid.get_height()/2);
			var kidCenter = this._groupSelectionHandles.globalToLocal(pt.x, pt.y);
			var relativeCenterX = kidCenter.x/this._groupSelectionHandles.shapeWidth();
			var relativeCenterY = kidCenter.y/this._groupSelectionHandles.shapeHeight();
			var relativeWidth;
			var relativeHeight;
			if ((relativeRotation>45 && relativeRotation<135) || (relativeRotation>-135 && relativeRotation<-45)) {
				relativeWidth = kid.shapeHeight()/this._groupSelectionHandles.shapeWidth();
				relativeHeight = kid.shapeWidth()/this._groupSelectionHandles.shapeHeight();
			} else {
				relativeWidth = kid.shapeWidth()/this._groupSelectionHandles.shapeWidth();
				relativeHeight = kid.shapeHeight()/this._groupSelectionHandles.shapeHeight();
			}
			this._selectionGroupDetails.push({x:relativeCenterX, y:relativeCenterY, width:relativeWidth, height:relativeHeight, rotation:relativeRotation});
		}
	}
	
	p.disposeGroupSelection = function()
	{
		if (this._groupSelectionHandles) {
			//this._groupSelectionHandles.clearAllEvents();
			
			this.removeChild(this._groupSelectionHandles);
			
			this._groupSelectionHandles.removeEventListener("POSITION_CHANGE", this.groupMove);
			this._groupSelectionHandles.removeEventListener("ROTATION_CHANGE", this.groupRotation);
			this._groupSelectionHandles.removeEventListener("SIZE_CHANGE", this.groupResize);
			this._groupSelectionHandles.removeEventListener("dblclick", this.shapeDoubleClick);
			this._groupSelectionHandles.removeEventListener("POSITION_SIZE_ROTATE_END", this.commitPositionSizeRotation);
			/*this._groupSelectionHandles.removeEventListener("SHAPE_ROLL_OVER", this.shapeRollOver);
			*/
			this._groupSelectionHandles = null;
		}
	}
	
	p.normalizeRotation = function(p_val)
	{
		if (p_val>=360) {
			return this.normalizeRotation(p_val-360);
		} else if (p_val<=-360) {
			return this.normalizeRotation(p_val+360); 
		} else if (p_val<-180) {
			return p_val+360;
		} else if (p_val>180) {
			return p_val-360;
		} else {
			return p_val;
		}
	}
		
	wb.WBCanvas = WBCanvas;
}());
