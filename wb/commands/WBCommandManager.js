// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBCommandManager = function(p_canvas) {
		this.initialize();
	  	this._canvas = p_canvas;
		this.reset();
	}
	var p = WBCommandManager.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher
	
	p._currentCommandIdx = -1;
	p._commandStack;
	p._canvas;
	p._cmdID = 0;

		
	/**
	 * 
	 * @param p_command
	 * @param do_execute	messo a false solo dal metodo wbCanvas.onShapeCreate() che nella nuova versione evita l'esecuzione del comando, ma lo inserisce nella coda per consentire l'UNDO
	 * 
	 */
	p.addCommand = function(p_command, do_execute)
	{
		if(typeof(do_execute)==='undefined') do_execute = true;
		this._currentCommandIdx++;
		this._cmdID++;
		if (this._currentCommandIdx<this._commandStack.length) {
			// clear these commands
			this._commandStack.splice(this._currentCommandIdx, this._commandStack.length-this._currentCommandIdx);
		}
		p_command.canvas = this._canvas;
		p_command.cmdID = this._cmdID;
		this._commandStack.push(p_command);
		if (do_execute) {
			p_command.execute();
		}
	}
		
	p.removeRecentCommands = function(p_commandType)
	{
	// CHECK
		var l = this._commandStack.length;
		for (var i=l-1; i>=0; i--) {
			if (this._commandStack[i].cmdID = p_commandType.cmdID) {
				this._commandStack.splice(i, 1);
				this._currentCommandIdx--;
			} else {
				break;
			}
		} 
	}
		
	p.undo = function()
	{
		if (this._currentCommandIdx>=0) {
			this._commandStack[this._currentCommandIdx].unexecute();
			this._currentCommandIdx--;
		}
	}
		
	p.redo = function()
	{
		if (this._currentCommandIdx<this._commandStack.length-1) {
			this._currentCommandIdx++;
			this._commandStack[this._currentCommandIdx].execute();
		}
	}
		
	p.reset = function()
	{
		this._commandStack = new Array();
		this._currentCommandIdx = -1;
	}
		
	wb.WBCommandManager = WBCommandManager;
}());