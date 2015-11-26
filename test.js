var _canvas;
var _server;
var _propToolbar;
var target;

function init() {
	trace("init");
	
	$( "#cmdSelect" ).button({
		text: false, icons: { primary: "btn-icon-select"}});
	$( "#cmdMarker" ).button({
		text: false, icons: { primary: "btn-icon-marker"}});
	$( "#cmdArrow" ).button({
		text: false, icons: { primary: "btn-icon-arrow"}});
	$( "#cmdSimple" ).button({
		text: false,icons: { primary: "btn-icon-simple"}});
	$( "#cmdLine" ).button({
		text: false,icons: { primary: "btn-icon-line"}});
	$( "#cmdPoly" ).button({
		text: false,icons: { primary: "btn-icon-polygon"}});
	$( "#cmdCurveLine" ).button({
		text: false,icons: { primary: "btn-icon-curveline"}});
	$( "#cmdDel" ).button({
		text: false, icons: { primary: "btn-icon-delete"}});
	$( "#cmdDelAll" ).button({
		text: false, icons: { primary: "btn-icon-delete_all"}});
	$( "#cmdUndo" ).button({
		text: false, icons: { primary: "btn-icon-undo"}});
	$( "#cmdRedo" ).button({
		text: false, icons: { primary: "btn-icon-redo"}});
	$( "#cmdCopy" ).button({
		text: false, icons: { primary: "btn-icon-copy"}});
	$( "#cmdCut" ).button({
		text: false, icons: { primary: "btn-icon-cut"}});
	$( "#cmdPaste" ).button({
		text: false, icons: { primary: "btn-icon-paste"}});
	$( "#cmdFront" ).button({
		text: false, icons: { primary: "btn-icon-front"}});
	$( "#cmdBack" ).button({
		text: false, icons: { primary: "btn-icon-back"}});
	$( "#cmdImage" ).button({
		text: false, icons: { primary: "btn-icon-img"}});
	$( "#cmdText" ).button({
		text: false, icons: { primary: "btn-icon-text"}});

	$( "#cmdSave" ).button({
		text: true, icons: { primary: "btn-icon-save"}});
	$( "#cmdOpen" ).button({
		text: true, icons: { primary: "btn-icon-open"}});
		
		
	$("#shapeType").change(function(e) {
		if (_canvas._shapeFactory &&  _canvas._shapeFactory.factoryID()=="WBSimpleShapeFactory") {
			var s = document.getElementById("shapeType");
			_canvas._shapeFactory.set_shapeData(s.value);
		}
	});
	
	stage = getStage("demoCanvas");
	if (createjs.Touch.isSupported()) {
		trace("createjs.Touch.isSupported");
		createjs.Touch.enable(stage);
	}
	stage.id = "my_stage";
	stage.enableMouseOver(10);
	
	_canvas = new wb.WBCanvas(stage);
	_canvas.registerFactory(new wb.WBSimpleShapeFactory());
	_canvas.registerFactory(new wb.WBMarkerShapeFactory());
	_canvas.registerFactory(new wb.WBArrowShapeFactory());
	_canvas.registerFactory(new wb.WBLineShapeFactory());
	_canvas.registerFactory(new wb.WBImageShapeFactory());
	_canvas.registerFactory(new wb.WBTextShapeFactory());
	stage.addChild(_canvas);
	_canvas.setUserID("pippo");
	
	_canvas.setBounds(0, 0, stage.canvas.width, stage.canvas.height);
	var b = _canvas.getBounds();
	//trace("_canvas: w="+b.width+" h="+b.height);
	
	_canvas.enableShapeSelection(true);
	
	wb.Menu._canvas = _canvas;
	
	_server = wb.WBServer.getInstance();
	_server.setModel(_canvas._model);
	
	_propToolbar = new wb.WBPropertiesToolBar();
	var props = {};
	props.alpha = 100;
	props.lineColor = 0x0000FF;
	props.primaryColor = 0xFFFF66;
	_propToolbar.set_propertyData(props);
	_propToolbar._fillColorPicker = $("#fillColorPicker");
	_propToolbar._strokeColorPicker = $("#lineColorPicker");
	_propToolbar._thicknessCombo = $( "#spinnerThick" );
	_propToolbar._alphaCombo = $( "#comboAlpha" );
	_propToolbar._dashedCheck = $( "#checkDashed" );
	_propToolbar.createControls();
	_propToolbar.canvas = _canvas;
	
	_canvas._currentShapeToolBar = _propToolbar;
	
	var s = document.getElementById("shapeType");
	s.innerHTML = "<option>"+wb.WBSimpleShape.ELLIPSE+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.RECTANGLE+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.ROUNDED_RECTANGLE+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.TRIANGLE+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.TRIANGLE_RECT+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.CIRCLE+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.STAR+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.PENTA+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.HEXA+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.RHOMB+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.EXPLO20+"</option>";
	s.innerHTML += "<option>"+wb.WBSimpleShape.CLOUD+"</option>";
	
	$("#chkTrace").prop('checked', traceEnabled);
}

function btnSimple_click() {
	trace("btnSimple_click");
	/*_canvas._shapeFactory = new wb.WBSimpleShapeFactory();
	var s = document.getElementById("shapeType");
	_canvas._shapeFactory.set_shapeData(s.value);
	_canvas.enableDraw(true);*/
	
	target = {};
	target.data = {};
	target.data.shapeFactory = new wb.WBSimpleShapeFactory();
	var s = document.getElementById("shapeType");
	target.data.shapeData = s.value;
	processClicked(target);
}

function btnMarker_click() {
	trace("btnMarker_click");
	target = {};
	target.data = {};
	target.data.shapeFactory = new wb.WBMarkerShapeFactory();
	var s = document.getElementById("shapeType");
	target.data.shapeData = null;
	processClicked(target);
}

function btnArrow_click() {
	trace("btnArrow_click");
	target = {};
	target.data = {};
	target.data.shapeFactory = new wb.WBArrowShapeFactory();
	target.data.shapeData = wb.WBArrowShapeFactory.ARROW_HEAD;
	processClicked(target);
}

function btnLine_click() {
	line(wb.WBLineShapeFactory.OPEN_POLYGON);
}
function btnCurveLine_click() {
	line(wb.WBLineShapeFactory.OPEN_CURVE);
}
function btnPoly_click() {
	line(wb.WBLineShapeFactory.CLOSED_POLYGON);
}

function line(data) {
	target = {};
	target.data = {};
	target.data.shapeFactory = new wb.WBLineShapeFactory();
	target.data.shapeData = data;
	processClicked(target);
}

function btnImage_click() {
	trace("btnImage_click()");
	/*target = {};
	target.data = {};
	target.data.shapeFactory = new wb.WBImageShapeFactory();
	processClicked(target);*/
	var shapeDesc = new wb.WBShapeDescriptor();
	shapeDesc.x = 200;
	shapeDesc.y = 100;
	shapeDesc.width = 200;
	shapeDesc.height = 300;
	shapeDesc.factoryID = "WBImageShapeFactory";
	shapeDesc.definitionData = {
		shapeType: "",
		imageUrl: "toro_seduto.jpg",
		contentID: -2,
		info: null};
	shapeDesc.propertyData = {
		lineThickness: 1,
		lineColor: 0x0000FF,
		alpha: 1,
		dashed: false};
	_canvas._model.createAddShape(shapeDesc);
}

function btnText_click() {
	trace("btnText_click()");
	/*var txt = new wb.TextArea();
	txt.addToStage(_canvas, 100, 150);
	txt.set_HtmlText("prova di testo</br><b>bold</b>");
	txt.setActualSize(200, 50);
	txt.setStyle("borderColor", 0xFF0000);
	txt.setStyle("fillColor", 0xAAAAAA);
	txt.setStyle("backgroundAlpha", 0.5);
	txt.setEditable(true);*/
	var shapeDesc = new wb.WBShapeDescriptor();
	shapeDesc.x = 400;
	shapeDesc.y = 150;
	shapeDesc.width = 200;
	shapeDesc.height = 60;
	shapeDesc.factoryID = "WBTextShapeFactory";
	shapeDesc.definitionData = {
		info: null};
	shapeDesc.propertyData = {
		htmlText: "prova di testo</br><b>bold</b>",
		lineThickness: 1,
		lineColor: 0x0000FF,
		alpha: 1,
		dashed: false};
	_canvas._model.createAddShape(shapeDesc);
}

function btnSelect_click() {
	trace("btnSelect_click");
	target = {};
	target.data = {};
	target.data.shapeFactory = null;
	processClicked(target);
	_canvas.enableShapeSelection(true);
}

function btnDel_click() {
	trace("btnDel_click");
	_canvas.removeSelectedShapes();
}

function btnDelAll_click() {
	trace("btnDelAll_click");
	_canvas.removeAllShapes();
}

function btnUndo_click() {
	_canvas.undo();
}

function btnRedo_click() {
	_canvas.redo();
}

function btnCopy_click() {
	_canvas.copySelectedShapes();
}

function btnCut_click() {
	//_canvas.redo();
}

function btnPaste_click() {
	_canvas.pasteShapes();
}

function btnFront_click() {
	var sel = _canvas.get_selectedShapeIDs();
	if (sel.length==1)
		_canvas.shapeBringToFrontLocal(sel[0]);
}

function btnBack_click() {
	var sel = _canvas.get_selectedShapeIDs();
	if (sel.length==1)
	_canvas.shapeSendToBackLocal(sel[0]);
}

function chkTrace_click() {
	traceEnabled = $("#chkTrace").prop('checked');
}

function btnSave_click() {
	saveLesson(true);
}

function btnOpen_click() {
	loadLesson(true);
}


function processClicked(target)
{
	var enable = (target.data.shapeFactory==null);
	_canvas.enableShapeSelection(enable);
	var factory = target.data.shapeFactory;
	if (target.data.shapeData) {
		factory.set_shapeData(target.data.shapeData);
	}
	_canvas.set_currentShapeFactory(factory);
}

function loadLesson(local) {
	if (local==true) {
		// load from local file
		$("#fileSaveField").hide();
		$("#fileOpenField").show();
		$( "#FileLocal" ).val("");
		$("#openLocDialog").dialog({
			width: 500, 
			//height: 710, 
			title: "Load lesson from file",
			modal: false,
			open: function () {
				
			},
			buttons: [
				{ text: "Undo", click: function() { $(this).dialog("close"); } } ,
				{ text: "Load", click: function() { 
					var files = $( "#FileLocal" )[0].files;
					_server.loadLessonLocal(files[0], loadLesson_result);
					$(this).dialog("close");
				} } 
			]
		});//end dialog
	}
}

function saveLesson(local) {
	if (local==true) {
		$("#fileSaveField").show();
		$("#fileOpenField").hide();
		$( "#FileLocal2" ).val("lesson_"+new Date().getTime()+".json");
		$("#openLocDialog").dialog({
			width: 500, 
			//height: 710, 
			title: "Save lesson to file",
			modal: false,
			open: function () {
				
			},
			buttons: [
				{ text: "Undo", click: function() { $(this).dialog("close"); } } ,
				{ text: "Save", click: function() { 
					var fileName = $( "#FileLocal2" ).val();
					_server.saveLessonLocal(fileName);
					$(this).dialog("close");
				} } 
			]
		});//end dialog
	}
}

function loadLesson_result(data) {
	trace("loadLesson_result");
	trace(data);
}