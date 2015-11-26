// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBPasteShapes = function(p_descriptorsToAdd) {
		this.initialize();
		this._descriptorsToAdd = new Array();
		var l = p_descriptorsToAdd.length;
		for (var i=0; i<l; i++) {
			//*** piero dic01: fondamentale il clone()
			var desc = p_descriptorsToAdd[i].clone();
			this._descriptorsToAdd.push(desc);
		}
	}
	var p = WBPasteShapes.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p.canvas;
	p.DX = 30;
	p.DY = 30;
	p._descriptorsToAdd;
	p._nrPaste = 0;

	p.unexecute = function()
	{
		// _nrPaste e' conservato da model
		_nrPaste = this.canvas._model.getNrPaste();
		if (_nrPaste>0) this._nrPaste--;
		this.canvas._model.setNrPaste(this._nrPaste);
		
		var l = this._descriptorsToAdd.length;
		for (var i=0; i<l; i++) {
			this.canvas._model.removeShape(this._descriptorsToAdd[i].shapeID);
		}
	}
	
	p.execute = function()
	{
		trace("WBPasteShapes.execute");
		this._nrPaste = this.canvas._model.getNrPaste();
		this._nrPaste++;
		this.canvas._model.setNrPaste(this._nrPaste);
		var p_descriptorsToAdd = new Array();
		var p_descLinksToAdd = new Array();
		var newShapeIDs = {};
		var l = this._descriptorsToAdd.length;
		// aggiorna i descriptor di tutte le shapes e, tranne WbLink, effettua il paste
		for (var i=0; i<l; i++) {
			var desc = this._descriptorsToAdd[i];
			// mantiene associazione tra vecchio shapeID (shape da copiare) e nuovo shapeID (shape incollata)
			newShapeIDs[desc.shapeID] = this.canvas._model.newShapeID();
			desc.shapeID = newShapeIDs[desc.shapeID]; 
			desc.groupID = "";	// perde eventuale raggruppamento
			desc.x += this.DX*Math.min(this._nrPaste,10);
			desc.y += this.DY*Math.min(this._nrPaste,10);
			// se si tratta di WbLink inserisce il desc in una pending list che verra' processata alla fine
			// altrimenti esegue normalmente il paste
			// CHECK
			if (desc.factoryID == "WBLinkShapeFactory") {
				p_descLinksToAdd.push(desc);
			} else {
				this.canvas._model.pasteShape(desc);
			}
		}
		// esegue paste delle eventuali shapes WbLink nella pending list
		// previo update di linkStart e linkEnd
		l = p_descLinksToAdd.length;
		for (var i=0; i<l; i++) {
			var desc = p_descLinksToAdd[i];
			// aggiorna linkEnd/linkStart con nuovi shapeID (se occorre)
			var p_data = desc.definitionData;
			if (p_data.linkStart != null && p_data.linkStart.shapeID != null && newShapeIDs.hasOwnProperty(p_data.linkStart.shapeID)) { 
				p_data.linkStart.shapeID = newShapeIDs[p_data.linkStart.shapeID];
			} else {
				p_data.linkStart = null;
			}
			if (p_data.linkEnd != null &&  p_data.linkEnd.shapeID != null && newShapeIDs.hasOwnProperty(p_data.linkEnd.shapeID)) {
				p_data.linkEnd.shapeID = newShapeIDs[p_data.linkEnd.shapeID];
			} else {
				p_data.linkEnd = null;
			}
			this.canvas._model.pasteShape(desc);
		}			
	}
	
	p.getPastedShapes = function()
	{
		return _descriptorsToAdd; 
	}		

	p.getPastedShapesID = function()
	{
		var returnArray = new Array();
		var l = this._descriptorsToAdd.length;
		for (var i=0; i<l; i++) {
			returnArray.push(this._descriptorsToAdd[i].shapeID);
		}
		return returnArray;
	}
		
	wb.WBPasteShapes = WBPasteShapes;
}());
