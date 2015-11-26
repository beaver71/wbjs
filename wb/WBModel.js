// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBModel = function() {
		this.initialize();
	}
	var p = WBModel.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p._canvas;
	
	p._shapes;
	p._shapeIDCount = 0;
	p._addedShapes;
	p._uniqueID;
	p._currentPage = 0;
	p._clipboardShapes = new Array();
	p._nrPaste = 0;	
	p._clipboardPropData;
	p._groupIDCount = 0;
	
	p.userID;				// ATTENZIONE: deve avere lo stesso valore di author.id
	p._pages;			// array delle pagine: ogni item e' di tipo WbPage
	p._wbClient = null;		// riferimento all'istanza WhiteBoardClient a cui appartiene
	p._server;				// riferimento al WbServer singleton
	/*p._caller;		vedi _canvas		// riferimento al componente chiamante*/
	p._notSaved = false;	// flag modifiche non ancora salvate

	// initialize
	p.EventDispatcher_initialize = p.initialize;
	p.initialize = function(stage) {
		this.EventDispatcher_initialize();
		this._shapes = {};
		this._addedShapes = {};
	}	

	/**
	 * Create a Shape
	 */
	p.createShape = function(p_shape)
	{
		trace("wbModel.createShape");
		if (p_shape.shapeID == null) {
			var idTemp = this.userID + "_" + String(this._shapeIDCount++); 
			p_shape.shapeID = idTemp;
		}
		p_shape.userID = this.userID;
		var shapeDesc = this.getShapeDescriptor(p_shape.shapeID);
		if (shapeDesc) {
			logging("	>ATTENZIONE! shapeID ESISTE GIA'");
			return;
		}
		this._shapes[p_shape.shapeID] = p_shape;
		var evt = new wb.Event("MODEL_SHAPE_CREATE");
		evt.shapeID = p_shape.shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeCreate(evt);
	}
	
	/**
	 * Create and Add a Shape
	 */
	p.createAddShape = function(p_shape)
	{
		logging("wbModel.createShape_1: "+p_shape.shapeID);
		if (p_shape.shapeID == null) {
			var idTemp = this.userID + "_" + String(this._shapeIDCount++); 
			p_shape.shapeID = idTemp;
		}
		p_shape.userID = this.userID;
		var shapeDesc = this.getShapeDescriptor(p_shape.shapeID);
		if (shapeDesc) {
			logging("	>ATTENZIONE! shapeID ESISTE GIA'");
			return;
		}
		this._shapes[p_shape.shapeID] = p_shape;
		
		logging("wbModel.addShape_2: "+p_shape.shapeID);
		this._addedShapes[p_shape.shapeID] = true;
		
		// propaga evento CREATE	
		var evt = new wb.Event("MODEL_SHAPE_CREATE");
		evt.shapeID = p_shape.shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeCreate(evt);
		
		// propaga evento ADD		
		var evt = new wb.Event("MODEL_SHAPE_ADD");
		evt.shapeID = p_shape.shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeAdd(evt);
		
		// clone della p_shape pro invio a fms			
		var p_shape_clone = p_shape.clone();
		
		// propaga ordine
		/*var order = new Object();
		order.orderType = WBOrder.ADD_SHAPE;
		order.shapeDesc = p_shape_clone;
		order.userID = this.userID;
		order.p_shapeID = p_shape.shapeID;
		this.addOrder(order);	*/
	}

	/**
	 * Crea una shape aggiornando l'ID del descrittore (usato da Paste)
	 */
	p.pasteShape = function(p_shape)
	{
		this.createAddShape(p_shape);
	}
	
	/**
	 * Crea un nuovo ID a partire da uno gia' esistente (usato da Paste)
	 */
	p.newShapeID = function(oldID)
	{
		if(typeof(oldID)==='undefined') oldID = null;
		var idTemp;
		var userID = this.userID;
		if (oldID!=null) {
			userID = oldID.split("_")[0];
			idTemp = this.userID + "_" + String(this._shapeIDCount++); 
		}else{
			idTemp = this.userID + "_" + String(this._shapeIDCount++); 
		}
		return idTemp;
	}
	
	/**
	 * Add a shape to the canvas
	 */
	p.addShape = function(p_shape)
	{
		trace("addShape");
		var shapeDesc = this.getShapeDescriptor(p_shape.shapeID);
		if (shapeDesc) {
			shapeDesc.groupID = p_shape.groupID;
			shapeDesc.x = p_shape.x;
			shapeDesc.y = p_shape.y;
			shapeDesc.width = p_shape.width;
			shapeDesc.height = p_shape.height;
			shapeDesc.rotation = p_shape.rotation;
			this._shapes[p_shape.shapeID] = shapeDesc;
		} else {
			this._shapes[p_shape.shapeID] = p_shape;
		}
		this._addedShapes[p_shape.shapeID] = true;
					
		var evt = new wb.Event("MODEL_SHAPE_ADD");
		evt.shapeID = p_shape.shapeID;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeAdd(evt);
		
		/*// propaga ordine (points sono Array)
		var order:Object = new Object();
		order.orderType = WBOrder.ADD_SHAPE;
		order.shapeDesc = p_shape;
		order.userID = this.userID;
		order.p_shapeID = p_shape.shapeID;
		this.addOrder(order);	*/
	}
	
	/**
	 * Change layout of shape i.e. change x,y ,width,height or rotation of a shape defined by the shape ID
	 */
	p.moveSizeRotateShape = function(p_shapeID, p_x, p_y, p_w, p_h, p_rotation, p_isLocal)
	{
		if(typeof(p_isLocal)==='undefined') p_isLocal = false;
		
		trace("moveSizeRotateShape");
		var shapeDesc = this.getShapeDescriptor(p_shapeID).clone();
		shapeDesc.x = p_x;
		shapeDesc.y = p_y;
		shapeDesc.width = p_w;
		shapeDesc.height = p_h;
		shapeDesc.rotation = p_rotation;
		this._shapes[p_shapeID] = shapeDesc;
					
		var evt = new wb.Event("MODEL_SHAPE_POSITION_SIZE_ROTATION_CHANGE");
		evt.shapeID = p_shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapePositionSizeRotate(evt);
	}
	

	/**
	 * Bring to front a shape
	 */
	p.bringToFrontShape = function(p_shapeID, p_isLocal)
	{
		if(typeof(p_isLocal)==='undefined') p_isLocal = false;
		
		trace("wbModel.bringToFrontShape: "+p_shapeID);
		try{
			var shapeDesc = this.getShapeDescriptor(p_shapeID).clone();
		}catch(e)
		{
			trace("	>ERR "+e.message);
			return;
		}
		
		var evt = new wb.Event("MODEL_SHAPE_BRINGTOFRONT");
		evt.shapeID = p_shapeID;
		evt.isLocalChange = false;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeBringToFront(evt);
		/*var order:Object = new Object();
		order.orderType = WBOrder.BRINGTOFRONT_SHAPE;
		order.p_shapeID = p_shapeID;
		order.p_isLocal = p_isLocal;
		order.type = "front";
		order.userID = this.userID;
		this.addOrder(order);					*/
	}
	
	/**
	 * Send to back a shape
	 */
	p.sendToBackShape = function(p_shapeID, p_isLocal)
	{
		if(typeof(p_isLocal)==='undefined') p_isLocal = false;
		
		trace("wbModel.sendToBackShape: "+p_shapeID);
		try{
			var shapeDesc = this.getShapeDescriptor(p_shapeID).clone();
		}catch(e)
		{
			trace("	>ERR "+e.message);
			return;
		}
		
		var evt = new wb.Event("MODEL_SHAPE_SENDTOBACK");
		evt.shapeID = p_shapeID;
		evt.isLocalChange = false;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeSendToBack(evt);
		/*var order:Object = new Object();
		order.orderType = WBOrder.BRINGTOFRONT_SHAPE;
		order.p_shapeID = p_shapeID;
		order.p_isLocal = p_isLocal;
		order.type = "back";
		order.userID = this.userID;
		this.addOrder(order);*/
	}
	
	/**
	 * Change the property data of a shape
	 */
	p.changeShapeProperties = function(p_shapeID, p_properties)
	{
		trace("changeShapeProperties");
		var shapeDesc = this.getShapeDescriptor(p_shapeID).clone();
		shapeDesc.propertyData = p_properties;
		this._shapes[p_shapeID] = shapeDesc;
		
		var evt = new wb.Event("MODEL_SHAPE_PROPERTIES_CHANGE");
		evt.shapeID = p_shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapePropertiesChange(evt);
	}
	
	/**
	 * Change shape
	 */
	p.changeShape = function(p_shapeID, p_newShapeDescriptor)
	{
		trace("wbModel.changeShape: "+p_shapeID);
		try{
			this._shapes[p_shapeID] = p_newShapeDescriptor;
		}catch(e)
		{
			trace("	>ERR "+e.message);
			return;
		}
		
		var evt = new wb.Event("MODEL_SHAPE_CHANGE");
		evt.shapeID = p_shapeID;
		evt.isLocalChange = true;
		/*this.dispatchEvent(evt);*/
		this._canvas.onShapeChange(evt);
		/*
		var order:Object = new Object();
		order.orderType = WBOrder.CHANGE_SHAPE;
		order.p_shapeID = p_shapeID;
		order.userID = this.userID;
		order.shapeDesc = p_newShapeDescriptor;
		this.addOrder(order);					*/
	}
	
	p.changeShapeGroup = function(p_shapeID, p_groupID)
	{
		logging("wbModel.changeShapeGroup: "+p_shapeID+" in "+p_groupID);
		try{
			this._shapes[p_shapeID].groupID = p_groupID;
		}catch(e)
		{
			logging("	>ERR "+e.message);
			return;
		}
		
		var evt = new wb.Event("MODEL_SHAPE_CHANGE");
		evt.info = "group";	// usato in wbCanvas.onShapeChange() per discriminare SHAPE_CHANGE_GROUP
		evt.shapeID = p_shapeID;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeChange(evt);
		/*
		var order:Object = new Object();
		order.orderType = WBOrder.CHANGE_SHAPE_GROUP;
		order.p_shapeID = p_shapeID;
		order.userID = this.userID;
		order.p_groupID = p_groupID;
		this.addOrder(order);*/
	}
	
	p.modifyShapeDescriptor = function(p_shapeID, p_newShapeDescriptor)
	{
		trace("modifyShapeDescriptor");
		var shapeDesc = this.getShapeDescriptor(p_shapeID);
		var mutatedShapeDescriptor = shapeDesc.clone();
		mutatedShapeDescriptor.readValueObject(p_newShapeDescriptor);
		if(shapeDesc.compareShapeAttributes(mutatedShapeDescriptor)) {
			this.moveSizeRotateShape(shapeDesc.shapeID, mutatedShapeDescriptor.x, mutatedShapeDescriptor.y, mutatedShapeDescriptor.width, mutatedShapeDescriptor.height, mutatedShapeDescriptor.rotation, true);
		}

		for (var i in mutatedShapeDescriptor.propertyData) {
			if (shapeDesc.propertyData.hasOwnProperty(i)) {
				if (shapeDesc.propertyData[i] != mutatedShapeDescriptor.propertyData[i]) {
					this.changeShapeProperties(shapeDesc.shapeID, mutatedShapeDescriptor.propertyData);
					break;
				}
			}
		}

	}
	
	/**
	 * remove an existing shape given by the shape id
	 */
	p.removeShape = function(p_shapeID, log, tweenOnRemove)
	{
		if(typeof(log)==='undefined') log = true;
		if(typeof(tweenOnRemove)==='undefined') tweenOnRemove = true;
	
		trace("removeShape");
		var shapeDesc = this.getShapeDescriptor(p_shapeID);
		delete this._shapes[p_shapeID];
		delete this._addedShapes[p_shapeID];
		
		var evt = new wb.Event("MODEL_SHAPE_REMOVE");
		evt.shapeID = p_shapeID;
		evt.deletedShape = shapeDesc;
		evt.isLocalChange = true;
		/*dispatchEvent(evt);*/
		this._canvas.onShapeRemove(evt);
	}

	/**
	 * Returns the shape descriptor of a shape ID
	 */
	p.getShapeDescriptor = function(p_shapeID)
	{
		return this._shapes[p_shapeID];	// as WBShapeDescriptor;
	}
	
	/**
	 * Returns if the shape is added already on the canvas
	 */
	p.getIsAdded = function(p_shapeID)
	{
		return (this._addedShapes[p_shapeID]!=null);
	}
	
	/**
	 * Returns array of shape ids
	 */
	p.getShapeIDs = function()
	{
		var returnArray = new Array();
		for (var shapeID in _shapes) {
			returnArray.push(shapeID);
		}
		return returnArray;
	}
	
	/**
	 * Remove all shapes on page
	 */
	p.clearPage = function()
	{
		logging("wbModel.clearPage");
		
		this.removeAllShapes();
		/* TODO
		var order = new Object();
		order.orderType = WBOrder.CLEAR_PAGE;
		order.page = currentPage;
		order.userID = this.userID;
		this.addOrder(order);		*/			
	}
		
	/**
	 * Remove all shapes
	 */
	p.removeAllShapes = function()
	{
		for (var shapeID in this._shapes) {
			this.removeShape(shapeID);
		}
	}
	
	/**
	 * @private 
	 * donno why it is here 
	 */
	p.get_isSynchronized = function()
	{
		return true;
	}
	
	/**
	 * @private
	 * We don't need to expose this API
	 * An unique id for the model
	 */
	p.set_uniqueID = function(p_id)
	{
		this._uniqueID = p_id;
	}
	

	p.get_uniqueID = function()
	{
		return this._uniqueID;
	}
	
	
	/**
	 * Add a shape to the clipboard
	 */
	p.addShapeToClip = function(p_shape)
	{
//			trace("addShapeToClip");
		this._clipboardShapes.push(p_shape);
		this._nrPaste = 0;
	}
	
	/**
	 * Get the clipboard
	 */
	p.getShapesFromClip = function()
	{
//			trace("getShapesFromClip");
		return this._clipboardShapes;
	}		

	/**
	 * Get nr of pastes
	 */
	p.getNrPaste = function()
	{
		return this._nrPaste;
	}		

	/**
	 * Set nr of pastes
	 */
	p.setNrPaste = function(_val)
	{
		this._nrPaste = _val;
	}		
	
	/**
	 * Returns array of shape ids from clipboard
	 */
	p.getClipShapeIDs = function()
	{
		var returnArray = new Array();
		for (var shapeID in this._clipboardShapes) {
			returnArray.push(shapeID);
		}
		return returnArray;
	}		
	
	/**
	 * Reset the clipboard
	 */
	p.resetClip = function()
	{
//			trace("resetClip");
		this._clipboardShapes = new Array();
	}

	
	p.get_clipboardPropData = function()
	{
		return this._clipboardPropData;
	}
	
	/**
	 * Mette in clipboard i formati copiati per un prossimo "incolla formato" 
	 * @param value
	 * 
	 */
	p.set_clipboardPropData = function(value)
	{
		this._clipboardPropData = value;
	}
	
	/**
	 * Return current page of wb
	 */
	p.get_currentPage = function()
	{
		return this._currentPage;
	}
	
	p.set_currentPage = function(value)
	{
		this._currentPage = value;
		
		var evt = new wb.Event("MODEL_PAGE_CHANGED");
		dispatchEvent(evt);
	}
	
	
	/**
	 * Ottiene dal wbServer l'elenco completo delle shapes e calcola il valore massimo di shapeIDcount + 1
	 * 
	 */
	p.updateShapeIDcount = function()
	{	
		var maxCount = 0;
		var allShapes = this._shapes; //TODO
		if (allShapes != null) {
			var n = allShapes.length; 
			for (var _shape in allShapes) {
				maxCount = Math.max(maxCount, this.getShapeIDcount(_shape));
			}
		}
		this._shapeIDCount = maxCount + 1;
		logging("wbModel.updateShapeIDcount: "+this._shapeIDCount);
	}
	
	p.getShapeIDcount = function(shapeID)
	{
		var tmpArr = shapeID.split("_");
		if (tmpArr.length == 2) {
			return Number(tmpArr[1]);
		} else {
			return 0;
		}
	}
	
	/**
	 * Create a Group
	 */
	p.createGroupID = function()
	{
		trace("wbModel.createGroupID");
		var idTemp = this.userID + "_" + String(this._groupIDCount++); 
		return idTemp;
	}
		
	wb.WBModel = WBModel;
}());