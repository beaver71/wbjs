// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var Menu = function() {
		this.initialize();
	}
	var p = Menu.prototype = new createjs.EventDispatcher(); // inherit from EventDispatcher

	Menu.ICON_GROUP = "group";
	Menu.ICON_UNGROUP = "ungroup";
	Menu.ICON_ELLIPSE = "ellipse";
	Menu.ICON_RECTANGLE = "rect";
	Menu.ICON_RHOMB = "rhomb";
	Menu.ICON_TRIANGLE = "triang";
	Menu.ICON_STAR = "star";
	Menu.ICON_PENTA = "penta";
	Menu.ICON_HEXA = "hexa";
	Menu.ICON_ROUNDED_RECTANGLE = "round";
	Menu.ICON_TRIANGLE_RECT = "triang2";
	Menu.ICON_CIRCLE = "circle";
	Menu.ICON_EXPLO20 = "explo";
	Menu.ICON_CLOUD = "cloud";
	Menu.ICON_TOFRONT = "front";
	Menu.ICON_TOBACK = "back";
	Menu.ICON_COPY = "copy";
	Menu.ICON_CUT = "cut";
	Menu.ICON_PASTE = "paste";
	Menu.ICON_PASTE_FORMAT = "pastef";
	Menu.ICON_DEL = "delete";
	Menu.ICON_POLYGON = "closeline";
	Menu.ICON_OPENLINE = "openline";
	Menu.ICON_MIRROR = "mirror";
	Menu.ICON_FLIP = "flip";
	Menu.ICON_CURVELINE = "tocurve";
	Menu.ICON_SHAPELINE = "toline";
	
	
	Menu.shapeMap = {1:wb.WBSimpleShape.ELLIPSE, 2:wb.WBSimpleShape.RECTANGLE, 3:wb.WBSimpleShape.RHOMB, 4:wb.WBSimpleShape.TRIANGLE, 5:wb.WBSimpleShape.STAR, 6:wb.WBSimpleShape.PENTA, 7:wb.WBSimpleShape.HEXA, 8:wb.WBSimpleShape.ROUNDED_RECTANGLE, 9:wb.WBSimpleShape.TRIANGLE_RECT, 10:wb.WBSimpleShape.CIRCLE, 11:wb.WBSimpleShape.EXPLO20, 12:wb.WBSimpleShape.CLOUD};
	
	
	Menu._canvas;

	// initialize
	p.EventDispatcher_initialize = p.initialize;
	p.initialize = function(stage) {
		this.EventDispatcher_initialize();
	}	
	
	/**
	 * Crea e apre un contextMenu
	 * @param _items	map delle voci di menu
	 * @param _callback	funzione chiamata su selezione di un menu
	 * @param _stageX	coordinata X all'interno dello stage
	 * @param _stageY	coordinata Y all'interno dello stage
	 */
	Menu.createContextMenu = function(_items, _callback, _stageX, _stageY)
	{
		// selector del div contenente il canvas/stage
		var sel = "#"+$(stage.canvas).parent().attr("id");
		
		$.contextMenu( 'destroy', sel );
		
		$.contextMenu({
			selector: sel, 
			trigger: 'none',
			callback: _callback,
			items: _items
		});
		// da coordinate stage a coordinate della window
		var x = stage.canvas.offsetLeft + _stageX;
		var y = stage.canvas.offsetTop + _stageY;
		
		$(sel).contextMenu({x: x, y: y});
	}
	
	
	Menu.getMenu = function(_menuType, shape)
	{
		var dpMenu;
		switch(_menuType)
		{
			case 1: // link
			{
				break;
			}
			case 2: // box
			{
				break;
			}
			case 3: // selezione di shapes non raggruppate
			{
				dpMenu = {
					group:{name:"Group", icon: wb.Menu.ICON_GROUP, cmd: "group"},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
				break;
			}
			case 4: // selezione di shapes raggruppate
			{
				dpMenu = {
					ungroup:{name:"UnGroup", icon: wb.Menu.ICON_UNGROUP, cmd: "ungroup"},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
				break;
			}
			case 5: // shape singola
			{
				dpMenu = {
					OrdineShape: {						
						name: "Ordine", 
						items: {
							tofront:{name:"ToFront", icon: wb.Menu.ICON_TOFRONT, cmd: "tofront"},
							toback:{name:"ToBack", icon: wb.Menu.ICON_TOBACK, cmd: "toback"}
						}
					},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
				if (shape instanceof wb.WBTextShape) delete dpMenu.pasteformat;
				break;
			}
			case 6: // line shape
			{
				dpMenu = {
					tocurve:{name:"TrasfCurva", icon: wb.Menu.ICON_CURVELINE, cmd: "tocurve"},
					toline:{name:"TrasfLinea", icon: wb.Menu.ICON_SHAPELINE, cmd: "toline"},
					closeline:{name:"ChiudiLinea", icon: wb.Menu.ICON_POLYGON, cmd: "closeline"},
					openline:{name:"ApriPoligono", icon: wb.Menu.ICON_OPENLINE, cmd: "openline"},
					mirror:{name:"Mirror", icon: wb.Menu.ICON_MIRROR, cmd: "mirror"},
					flip:{name:"Flip", icon: wb.Menu.ICON_FLIP, cmd: "flip"},
					OrdineShape: {						
						name: "Ordine", 
						items: {
							tofront:{name:"ToFront", icon: wb.Menu.ICON_TOFRONT, cmd: "tofront"},
							toback:{name:"ToBack", icon: wb.Menu.ICON_TOBACK, cmd: "toback"}
						}
					},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
				if (shape._closedPolygon == null || shape._closedPolygon == false)
					delete dpMenu.openline;
				else
					delete dpMenu.closeline;
				if (shape._shapeType == null || shape._shapeType == wb.WBLineShape.LINE)
					delete dpMenu.toline;
				else
					delete dpMenu.tocurve;
				break;
			}
			case 7: // simple shape
			{
				dpMenu = {
					TipoShape: {
						name: "Tipo", 
						items: {
							shape_1:{name:"Ellisse", icon: wb.Menu.ICON_ELLIPSE, type: "", selected: false, tag: wb.WBSimpleShape.ELLIPSE},
							shape_2:{name:"Rettangolo", icon: wb.Menu.ICON_RECTANGLE, type: "", selected: true, tag: wb.WBSimpleShape.RECTANGLE},
							shape_3:{name:"Rombo", icon: wb.Menu.ICON_RHOMB, type: "", selected: false, tag: wb.WBSimpleShape.RHOMB},
							shape_4:{name:"Triangolo", icon: wb.Menu.ICON_TRIANGLE, type: "", selected: false, tag: wb.WBSimpleShape.TRIANGLE},
							shape_5:{name:"Stella", icon: wb.Menu.ICON_STAR, type: "", selected: false, tag: wb.WBSimpleShape.STAR},
							shape_6:{name:"Pentagono", icon: wb.Menu.ICON_PENTA, type: "", selected: false, tag: wb.WBSimpleShape.PENTA},
							shape_7:{name:"Esagono", icon: wb.Menu.ICON_HEXA, type: "", selected: false, tag: wb.WBSimpleShape.HEXA},							
							shape_8:{name:"RettArr", icon: wb.Menu.ICON_ROUNDED_RECTANGLE, type: "", selected: false, tag: wb.WBSimpleShape.ROUNDED_RECTANGLE},
							shape_9:{name:"TriRett", icon: wb.Menu.ICON_TRIANGLE_RECT, type: "", selected: false, tag: wb.WBSimpleShape.TRIANGLE_RECT},
							shape_10:{name:"Cerchio", icon: wb.Menu.ICON_CIRCLE, type: "", selected: false, tag: wb.WBSimpleShape.CIRCLE},
							shape_11:{name:"Explo20", icon: wb.Menu.ICON_EXPLO20, type: "", selected: false, tag: wb.WBSimpleShape.EXPLO20},
							shape_12:{name:"Nuvola", icon: wb.Menu.ICON_CLOUD, type: "", selected: false, tag: wb.WBSimpleShape.CLOUD},
						}
					},
					OrdineShape: {						
						name: "Ordine", 
						items: {
							tofront:{name:"ToFront", icon: wb.Menu.ICON_TOFRONT, cmd: "tofront"},
							toback:{name:"ToBack", icon: wb.Menu.ICON_TOBACK, cmd: "toback"}
						}
					},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
			//	setTag(dpMenu[0].children, shape.definitionData.shapeType);
				
				break;
			}
			case 8: // image shape singola
			{
				dpMenu = {
				//	{},	// 0) ToLibrary
				//	{},	// 1) InfoImage
				//	{},	// 2) ToBoxContainer
					OrdineShape: {						
						name: "Ordine", 
						items: {
							tofront:{name:"ToFront", icon: wb.Menu.ICON_TOFRONT, cmd: "tofront"},
							toback:{name:"ToBack", icon: wb.Menu.ICON_TOBACK, cmd: "toback"}
						}
					},
					"sep1": "---------",
					copy:{name:"Copia", icon: wb.Menu.ICON_COPY, cmd: "copy"},
					cut:{name:"Taglia", icon: wb.Menu.ICON_CUT, cmd: "cut"},
					paste:{name:"Incolla", icon: wb.Menu.ICON_PASTE, cmd: "paste"},
					pasteformat:{name:"IncollaFormato", icon: wb.Menu.ICON_PASTE_FORMAT, cmd: "pasteformat"},
					del:{name:"Canc", icon: wb.Menu.ICON_DEL, cmd: "del"}
				};
				/*
				if (shape.definitionData.containerType == null || shape.definitionData.containerType == wb.WBShapeBase.CONTAINER_DEFAULT)
					dpMenu[2] = {name:"ToBoxContainer", icon: _tobox, cmd: "tobox"};
				else
					dpMenu[2] = {name:"ToDefaultContainer", icon: _todef, cmd: "todefault"};
				if (shape.definitionData.contentID == null || shape.definitionData.contentID == -2) {
					dpMenu[0] = {name:"ToLibrary", icon: _library, cmd: "tolibrary"};
					dpMenu[1] = {name:"InfoImage", icon: _info, cmd: "infoimage"};
				} else if (shape.definitionData.contentID != null && shape.definitionData.contentID == -1) {
					dpMenu[0] = {name:"InfoImage", icon: _info, cmd: "infoimage"};
					dpMenu.splice(1, 1);
				} else {
					dpMenu[0] = {name:"InfoImage", icon: _info, cmd: "infoimage"};
					dpMenu.splice(1, 1);
				}*/
				break;
			}					
			default:
			{
				dpMenu = null;
				break;
			}
		}
		return dpMenu;
	}

		Menu.onMenuItemClick = function(key, _shape)
		{
			trace("onMenuItemClick="+key);
			if (key.indexOf('shape_') != -1) {
				var n = Number(key.replace('shape_', ''));
				var tag = wb.Menu.shapeMap[n];
				// modifica tipo box, link o simple shape
				/*var def;
				if (_shape is WBLinkShape) {
					(_shape as WBLinkShape).setShapeType(item.tag);
				} else if (_shape is WBBoxShape) {
					(_shape as WBBoxShape).setShapeType(item.tag);
					_owner.height = _shape.height;	// potrebbe essere stato modificato (es. se si cambia in CIRCLE)
				} else if (_shape is WBSimpleShape) {
					(_shape as WBSimpleShape).setShapeType(item.tag);
					_owner.height = _shape.height;	// potrebbe essere stato modificato (es. se si cambia in CIRCLE, STAR...)
				}*/
				if (_shape instanceof wb.WBSimpleShape) {
					_shape.setShapeType(tag);
					//_owner.height = _shape.height;	// potrebbe essere stato modificato (es. se si cambia in CIRCLE, STAR...)
				}
				
			} else {
				// comandi		
				switch(key)
				{
					case "del":
					{
						Menu._canvas.removeSelectedShapes();
						break;
					}
					case "copy":
					{
						Menu._canvas.copySelectedShapes();
						break;
					}
					case "cut":
					{
						Menu._canvas.copySelectedShapes();
						Menu._canvas.removeSelectedShapes();
						break;
					}
					case "paste":
					{
						Menu._canvas.pasteShapes();
						break;
					}	
					case "pasteformat":
					{
						Menu._canvas.pasteFormatToSelectedShapes();
						break;
					}	
					case "group":
					{
						Menu._canvas.groupSelectedShapes();
						break;
					}
					case "ungroup":
					{
						Menu._canvas.ungroupSelectedShapes();
						break;
					}
					case "mirror":
					{
						if (_shape instanceof wb.WBLineShape)
							_shape.mirror();
						break;
					}
					case "flip":
					{
						if (_shape instanceof wb.WBLineShape)
							_shape.flip();
						break;
					}
					case "unlink":
					{
						if (_shape instanceof wb.WBLinkShape)
							_shape.unlink();
						break;
					}
					case "tofront":
					{
						Menu._canvas.selectedShapeBringToFront(_shape.shapeID);
						break;
					}
					case "toback":
					{
						Menu._canvas.selectedShapeSendToBack(_shape.shapeID);
						break;
					}
					case "closeline":
					{
						if (_shape._closedPolygon == false)
							_shape.setShapeType(null, true);
						break;
					}
					case "openline":
					{
						if (_shape._closedPolygon == true)
							_shape.setShapeType(null, false);
						break;
					}
					case "toline":
					{
						_shape.setShapeType(wb.WBLineShape.LINE, _shape._closedPolygon);
						break;
					}
					case "tocurve":
					{
						_shape.setShapeType(wb.WBLineShape.CURVE, _shape._closedPolygon);
						break;
					}
					case "tobox":
					{
						break;
					}
					case "todefault":
					{
						break;
					}
					case "tolibrary":
					{
						break;
					}
					case "infoimage":
					{
						break;
					}
						
						
				}
			}
		}
	
	
	wb.Menu = Menu;
}());