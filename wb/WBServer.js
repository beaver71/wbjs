// namespace:
this.wb = this.wb||{};


/**
 * 
 * Singleton per l'interazione con FMS
 * 
 */	
(function() {

	// constructor
	var WBServer = function() {
		this.initialize();
	}
	var p = WBServer.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	p._model;
	
	WBServer.instance;		

	/**
	 * Return singleton instance of WbServer 
	 */
	WBServer.getInstance = function()
	{
		if ( wb.WBServer.instance == null )
			// lazy initialization
			wb.WBServer.instance = new wb.WBServer();
		return wb.WBServer.instance;
	}
	
	p.setModel = function(model)
	{
		this._model = model;
	}
	
	p.actionLoadLesson = function(allShapes)
	{
		// imposta currentPage
		this._model._currentPage = 0;
		
		var n = allShapes.length; 
		for (var _shape in allShapes) {
			var desc = new wb.WBShapeDescriptor();
			desc.readValueObject(allShapes[_shape]);
			this._model.createAddShape(desc);
		}
		
		// aggiorna shapeIDcount in funzione delle shapes presenti nella lezione caricata
		this._model.updateShapeIDcount();
	}
	
	
	p.saveLessonLocal = function(filename) {
		var json = JSON.stringify(this._model._shapes, null, 4);
		this.saveFileLocal(json, filename);
	}

	p.loadLessonLocal = function(file, callback) {
		//this.loadFileLocal(file, callback);
		var _this = this;
		this.loadFileLocal(file, function(result){
			_this.actionLoadLesson(result);
		});
	}
	
	p.saveFileLocal = function(data, filename) {
		var aFileParts = [data];
		var oMyBlob = new Blob(aFileParts, {type : 'text/plain'}); // the blob
		saveAs(oMyBlob, filename);
	}

	p.loadFileLocal = function(file, callback) {
		var reader = new FileReader();
		var data;
		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) { 
				JsonObj = e.target.result
				data = JSON.parse(JsonObj);
				callback(data);
			};
		})(file);

		// Read in JSON as a data URL.
		reader.readAsText(file, 'UTF-8');
	}

	
	wb.WBServer = WBServer;
}());
