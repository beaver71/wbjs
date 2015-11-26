// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var GraphicsUtils = function() {
	  this.initialize();
	}
	var p = GraphicsUtils.prototype = new createjs.Graphics(); // inherit from Graphics

	// initialize
	p.Graphics_initialize = p.initialize;
	p.initialize = function() {
		this.Graphics_initialize();
		//...
	}
	
	/* public static methods */
	
	/**
	 * Calculates the point along the linear line at the given "time" t (between 0 and 1).
	 * Formula came from
	 * http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Linear_B.C3.A9zier_curves
	 * @param t the position along the line [0, 1]
	 * @param start the starting point
	 * @param end the end point
	 */
	GraphicsUtils.getLinearValue = function(t, start, end) {
		t = Math.max(Math.min(t, 1), 0);
		var x = start.x + (t * (end.x - start.x));
		var y = start.y + (t * (end.y - start.y));
		return new Point(x, y);	
	}
				
	/**
	 * Calculates the point along the quadratic curve at the given "time" t (between 0 and 1).
	 * Formula came from
	 * http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Linear_B.C3.A9zier_curves
	 * @param t the position along the line [0, 1]
	 * @param start the starting point
	 * @param cp the control point
	 * @param end the end point
	 */
	GraphicsUtils.getQuadraticValue = function(t, start, cp, end) {
		t = Math.max(Math.min(t, 1), 0);
		var tp = 1 - t;
		var t2 = t * t;
		var tp2 = tp * tp;
		var x = (tp2*start.x) + (2*tp*t*cp.x) + (t2*end.x);
		var y = (tp2*start.y) + (2*tp*t*cp.y) + (t2*end.y);
		return new Point(x, y);	
	}
	
	/**
	 * Calculates the point along the cubic curve at the given "time" t (between 0 and 1).
	 * Formula came from
	 * http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Linear_B.C3.A9zier_curves
	 * It is also very similar to the fl.motion.BezierSegment.getValue() function.
	 * @param start the starting point
	 * @param cp1 the first control point
	 * @param cp2 the second control point
	 * @param end the end point
	 */
	GraphicsUtils.getCubicValue = function(t, start, cp1, cp2, end) {
		t = Math.max(Math.min(t, 1), 0);
		var tp = 1 - t;
		var t2 = t * t;
		var t3 = t2 * t;
		var tp2 = tp * tp;
		var tp3 = tp2 * tp;
		var x = (tp3*start.x) + (3*tp2*t*cp1.x) + (3*tp*t2*cp2.x) + (t3*end.x);
		var y = (tp3*start.y) + (3*tp2*t*cp1.y) + (3*tp*t2*cp2.y) + (t3*end.y);
		return new Point(x, y);
	}
	
	/**
	 * Draws a circle position around the center point at the given radius.
	 * The line defaults to a solid line, but can also be a dashed line.
	 * If dashed is false then the Graphics.drawCircle() function is used.
	 * @param center the center of the circle
	 * @param radius the radius of the circle
	 * @param dashed if true then the line will be dashed
	 * @param dashLength the length of the dash (only applies if dashed is true)
	 * @param segments the number of segments to divide the circle into,
	 *  more segments means a smoother line.  Only used for dashed lines.
	 */
	GraphicsUtils.drawCircle = function(g, center, radius, 
				dashed, dashLength, segments) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		if(typeof(segments)==='undefined') segments = 360;
		
		if (dashed) {
			const twoPI = 2 * Math.PI;
			var circumference = twoPI * radius;
			if (circumference <= dashLength) {
				g.drawCircle(center.x, center.y, radius);
			} else {
				var angleStep = twoPI / segments;	// in radians
				var angle = 0;
				var x = center.x + Math.cos(angle) * radius;
				var y = center.y + Math.sin(angle) * radius;
				g.moveTo(x, y);

				var distance;
				var dashNum;
				for (angle = angleStep; angle < twoPI; angle += angleStep) {
					x = center.x + Math.cos(angle) * radius;
					y = center.y + Math.sin(angle) * radius;
					distance = angle * radius;
					dashNum = Math.floor((distance / dashLength) % 2); 
					// determine whether to draw the dashed line or move ahead
					if (dashNum == 0) {
						// approximate the circle with a line (step size is small)
						g.lineTo(x, y);
					} else {
						g.moveTo(x, y);
					}
				}
			}
		} else {
			g.drawCircle(center.x, center.y, radius);
		}
	}
	
	/**
	 * Draws an arc around the center point at the given radius, going from the 
	 * start angle to the end angle.  Both angles must be between 0 and 360.
	 * The arc defaults to a solid line, but can also be a dashed line.
	 * @param center the center of the arc
	 * @param radius the radius of the arc
	 * @param dashed if true then the arc will be dashed
	 * @param dashLength the length of the dash (only applies if dashed is true)
	 * @param segments the number of segments to divide the arc into,
	 *  more segments means a smoother arc.
	 */
	GraphicsUtils.drawArc = function(g, center, radius, startAngle, endAngle, dashed, dashLength, segments) {
		if(typeof(startAngle)==='undefined') startAngle = 0;
		if(typeof(endAngle)==='undefined') endAngle = 90;
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		if(typeof(segments)==='undefined') segments = 360;
				
		if ((startAngle < 0) || (startAngle > 360) || 
			(endAngle < 0) || (endAngle > 360) || (startAngle == endAngle)) {
			trace("Invalid angles, must be between 0 and 360")
			return;
		}
		
		const twoPI = 2 * Math.PI;
		var angleDiff = (endAngle - startAngle);
		if (angleDiff < 0) {
			angleDiff += 360;
		}
		// convert to radians
		angleDiff = angleDiff * twoPI / 360;
		var angleStep = angleDiff / segments;	// in radians
		var startAngleRadians = startAngle * twoPI / 360;
		var angle = startAngleRadians;
		var maxAngle = angle + angleDiff;
		// Move to the start of the arc
		var x = center.x + Math.cos(angle) * radius;
		var y = center.y + Math.sin(angle) * radius;
		g.moveTo(x, y);

		var distance = 0;
		var dashNum;
		for (angle = startAngleRadians + angleStep; angle < maxAngle; angle += angleStep) {
			x = center.x + Math.cos(angle) * radius;
			y = center.y + Math.sin(angle) * radius;
			if (dashed) {
				distance = (angle - startAngleRadians) * radius;
				dashNum = Math.floor((distance / dashLength) % 2); 
				// determine whether to draw the dashed line or move ahead
				if (dashNum == 0) {
					// approximate the circle with a line (step size is small)
					g.lineTo(x, y);
				} else {
					g.moveTo(x, y);
				}
			} else {
				g.lineTo(x, y);
			}
		}
	}
	
	/**
	 * Draws a straight line between the starting and ending points.  
	 * The line defaults to a solid line, but can also be a dashed line.
	 * If dashed is false then the Graphics.lineTo() function is used.
	 * @param start the starting point
	 * @param end the end point
	 * @param dashed if true then the line will be dashed
	 * @param dashLength the length of the dash (only applies if dashed is true)
	 */
	GraphicsUtils.drawLine = function(g, start, end, dashed, dashLength) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		
		g.moveTo(start.x, start.y);
		if (dashed) {
			// the distance between the two points
			var total = Point.distance(start, end);
			// divide the distance into segments
			if (total <= dashLength) {
				// just draw a solid line since the dashes won't show up
				g.lineTo(end.x, end.y);
			} else {
				// divide the line into segments of length dashLength 
				var step = dashLength / total;
				var dashOn = false;
				var p;
				for (var t = step; t <= 1; t += step) {
					p = wb.GraphicsUtils.getLinearValue(t, start, end);
					dashOn = !dashOn;
					if (dashOn) {
						g.lineTo(p.x, p.y);
					} else {
						g.moveTo(p.x, p.y);
					}
				}
				// finish the line if necessary
				dashOn = !dashOn;
				if (dashOn && !end.equals(p)) {
					g.lineTo(end.x, end.y);
				}
			}
		} else {
			// use the built-in lineTo function
			g.lineTo(end.x, end.y);
		}
	}
	
	/**
	 * Draws a quadratic curved line between the starting and ending points.  
	 * The line defaults to a solid line, but can also be a dashed line.
	 * If dashed is false then the Graphics.curveTo() function is used.
	 * @param start the starting point
	 * @param cp the control point
	 * @param end the end point
	 * @param dashed if true then the line will be dashed
	 * @param dashLength the length of the dash (only applies if dashed is true)
	 * @param segments the number of segments to divide the curve into,
	 *  more segments means smoother line.  Only used for dashed lines. 
	 */
	GraphicsUtils.drawQuadCurve = function(g, start, cp, end, dashed, dashLength, segments) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		if(typeof(segments)==='undefined') segments = 360;
		
		g.moveTo(start.x, start.y);

		if (dashed) {
			// draw portions of the curve
			var step = 1 / segments;
			var dist = 0;	// approx distance from the start
			var dashNum;  
			var last = start;
			var p;
			for (var t = step; t <= 1; t += step) {
				// calculates the next point on the quadratic curve
				p = wb.GraphicsUtils.getQuadraticValue(t, start, cp, end);
				// keep track of the total distance from start along the curve
				dist += Point.distance(p, last);
				dashNum = Math.floor((dist / dashLength) % 2); 
				// determine whether to draw the dashed line or move ahead
				if (dashNum == 0) {
					// approximate the curve with a line (step size is small)
					g.lineTo(p.x, p.y);
				} else {
					g.moveTo(p.x, p.y);
				}
				last = p;
			}
		} else {
			// use the build-in quadractic curve function
			g.curveTo(cp.x, cp.y, end.x, end.y);
		}
	}
			
	/**
	 * Draws an approximation of a cubic curved line between the starting and ending points.
	 * The curve is actually drawn using very small straight lines to approximate the curve.  
	 * The line defaults to a solid line, but can also be a dashed line.
	 * @param start the starting point
	 * @param cp1 the first control point
	 * @param cp2 the second control point
	 * @param end the end point
	 * @param dashed if true then the line will be dashed
	 * @param dashLength the length of the dash
	 * @param segments the number of segments to divide the curve into,
	 *  more segments means smoother line. 
	 */
	GraphicsUtils.drawCubicCurve = function(g, start, cp1, cp2, end, dashed, dashLength, segments) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		if(typeof(segments)==='undefined') segments = 200;
		
		// move to the starting point
		g.moveTo(start.x, start.y);
		
		var step = 1 / segments;
		var dist = 0;	// approx distance from the start
		var seg;
		var last = start;
		var p;
		// this loop draws each segment of the curve
		for (var t = step; t <= 1; t += step) { 
			p = wb.GraphicsUtils.getCubicValue(t, start, cp1, cp2, end);
			if (dashed) {
				dist += Point.distance(p, last);
				seg = Math.floor((dist / dashLength) % 2); 
				if (seg == 0) {
					g.lineTo(p.x, p.y);
				} else {
					g.moveTo(p.x, p.y);
				}
				last = p;
			} else {
				g.lineTo(p.x, p.y);
			}
		} 
		
		// As a final step, make sure the curve ends on the second anchor
		if (!dashed) {
			g.lineTo(end.x, end.y);
		}
	}
	
	/**
	 * Draws an outset border with the given width, height, thickness, and alpha.
	 * The highlight and shadow colors are derived from the given color.
	 */
	GraphicsUtils.drawOutsetBorder = function(g, w, h, color, thickness, alpha) {
		if(typeof(color)==='undefined') color = 0x0;
		if(typeof(thickness)==='undefined') thickness = 1;
		if(typeof(alpha)==='undefined') alpha = 1;
		
		var c = color;
		var t = Math.max(0, thickness);
		var a = Math.min(1, alpha);
		if ((t > 0) && (a > 0)) {
			for (var i = 0; i < t; i++) {
				//g.lineStyle(1, getHighlightInnerColor(c), a);
				g.setStrokeStyle(1).beginStroke(numToHex(getHighlightInnerColor(c)));
				g.moveTo(i, i);
				g.lineTo(i, h-1-i);
				g.moveTo(i+1, i);
				g.lineTo(w-1-i, i);
		
				//g.lineStyle(1, getShadowInnerColor(c), a);
				g.setStrokeStyle(1).beginStroke(numToHex(getShadowInnerColor(c)));
				g.moveTo(i, h-1-i);
				g.lineTo(w-i, h-1-i);
				g.moveTo(w-1-i, i);
				g.lineTo(w-1-i, h-1-i);
			}				
		}						
	}
	
	/**
	 * Draws an inset border with the given width, height, thickness, and alpha.
	 * The highlight and shadow colors are derived from the given color.
	 */
	GraphicsUtils.drawInsetBorder = function(g, w, h, color, thickness, alpha) {
		if(typeof(color)==='undefined') color = 0x0;
		if(typeof(thickness)==='undefined') thickness = 1;
		if(typeof(alpha)==='undefined') alpha = 1;
		
		var c = color;
		var t = Math.max(0, thickness);
		var a = Math.min(1, alpha);
		if ((t > 0) && (a > 0)) {
			for (var i = 0; i < t; i++) {
				//g.lineStyle(1, getShadowInnerColor(c), a);
				g.setStrokeStyle(1).beginStroke(numToHex(getShadowInnerColor(c)));
				g.moveTo(i, i);
				g.lineTo(i, h-i);
				g.moveTo(i+1, i);
				g.lineTo(w-i, i);
		
				//g.lineStyle(1, getHighlightInnerColor(c), a);
				g.setStrokeStyle(1).beginStroke(numToHex(getHighlightInnerColor(c)));
				g.moveTo(i+1, h-1-i);
				g.lineTo(w-i, h-1-i);
				g.moveTo(w-1-i, i+1);
				g.lineTo(w-1-i, h-1-i);
			}
		}						
	}
	
	// TODO check
	
	GraphicsUtils.getHighlightOuterColor = function(c)   {
		return ColorUtils.brighter(ColorUtils.brighter(c));
	}

	GraphicsUtils.getHighlightInnerColor = function(c)   {
		return ColorUtils.brighter(c);
	}

	GraphicsUtils.getShadowInnerColor = function(c)   {
		return ColorUtils.darker(c);
	}

	GraphicsUtils.getShadowOuterColor = function(c)   {
		return ColorUtils.darker(ColorUtils.darker(c));
	}
	
	/**
	 * Draws a rectangle at the given x, y, width, and height coordinates.
	 * You can also specify the corner radii for the rectangle.  If the cornerRadii contains a single
	 * Number then that radius is doubled and used as the ellipse width and height to make rounded corners.
	 * If the cornerRadii has two numbers then those numbers are doubled and used as the ellipse width/height.
	 * If the cornerRadii has four numbers then those are used as the four corner radii.
	 * Otherwise a rectangle is drawn with no corner radius.
	 */
	GraphicsUtils.drawRect = function(g, x, y, w, h, cornerRadii) {
		if(typeof(cornerRadii)==='undefined') cornerRadii = null;
		
		var noCorner = (cornerRadii == null) || (cornerRadii.length == 0);
		var drawn = false;
		if (!noCorner) {
			if (cornerRadii.length == 1) {
				var diam = 2 * Number(cornerRadii[0]);
				if (!isNaN(diam) && (diam > 0)) {
					g.drawRoundRect(x, y, w, h, diam, diam);
					drawn = true;
				}
			} else if (cornerRadii.length == 2) {
				var ellipseW = 2 * Number(cornerRadii[0]);
				var ellipseH = 2 * Number(cornerRadii[1]);
				if (!isNaN(ellipseW) && !isNaN(ellipseH)) {
					g.drawRoundRect(x, y, w, h, ellipseW, ellipseH);
					drawn = true;
				}
			} else if (cornerRadii.length == 4) {
				var tl = cornerRadii[0];
				var tr = cornerRadii[1];
				var bl = cornerRadii[2];
				var br = cornerRadii[3];
				if (!isNaN(tl) && !isNaN(tr) && !isNaN(bl) && !isNaN(br)) {
					g.drawRoundRectComplex(x, y, w, h, tl, tr, bl, br);
					drawn = true;
				}
			}
		}
		if (!drawn) {
			g.drawRect(x, y, w, h);
		}
	}
	
	// TODO Check
	
	/**
	 * Creates a BitmapData that is used to renderer a horizontal or vertical dotted line.
	 * If the vertical parameter is true, then it creates a rectangle bitmap that is 
	 * twice as long as it is wide (lineThickness).  Otherwise it creates a rectangle
	 * that is twice as wide as it is long.
	 * The first half of the rectangle is filled with the line color (and alpha value),
	 * then second half is transparent.
	 */
	GraphicsUtils.createDottedLineBitmap = function(lineColor, lineAlpha, lineThickness, vertical) {
		if(typeof(vertical)==='undefined') vertical = true;
		
		var w = (vertical ? lineThickness : 2 * lineThickness);
		var h = (vertical ? 2 * lineThickness : lineThickness);
		var color32 = ColorUtils.combineColorAndAlpha(lineColor, lineAlpha);
		var dottedLine = new BitmapData(w, h, true);
		// create a dotted bitmap
		for (var i = 0; i < lineThickness; i++) {
			for (var j = 0; j < lineThickness; j++) {
				dottedLine.setPixel32(i, j, color32);
			}
		}
		return dottedLine;
	}
	
	/**
	 * Begins filling using the Graphics object.
	 * If more than one color is specified in the array, then a gradient fill is used.
	 */
	GraphicsUtils.beginFill = function(g, w, h, colors, alphas, gradientType, gradientRotation, spreadMethod) {
		if(typeof(alphas)==='undefined') alphas = null;
		if(typeof(gradientType)==='undefined') gradientType = "linear";
		if(typeof(gradientRotation)==='undefined') gradientRotation = Math.PI/2;
		if(typeof(spreadMethod)==='undefined') spreadMethod = "pad";
				
		if ((colors == null) || (colors.length == 0)) {
			colors = [ 0xffffff ];
		}
		if ((alphas == null) || (alphas.length == 0)) {
			alphas = [ 1 ];
		}
		var alpha = alphas[0];
					
		if (colors.length > 1) {
			if (alphas.length < colors.length) {
				alphas = getAlphas(colors.length, alpha);
			}
			var ratios = getRatios(colors.length);
			var matrix = new Matrix();
			matrix.createGradientBox(w, h, gradientRotation, 0, 0);
			g.beginGradientFill(gradientType, colors, alphas, ratios, matrix, spreadMethod);
		} else {
			var color = colors[0];
			g.beginFill(color, alpha);
		}
	} 
	
	/** 
	 * Returns an array of length count all with the alpha value given.
	 * The alpha value should be between 0 and 1. 
	 */
	GraphicsUtils.getAlphas = function(count, alpha) {
		if(typeof(alpha)==='undefined') alpha = 1;
	
		var array = new Array();
		for (var i = 0; i < count; i++) {
			array[i] = alpha;
		}
		return array;
	}
	
	/** 
	 * Returns an array of numbers starting at 0 and ending at 255.
	 * If count is 2: [0, 255] is returned.
	 * If count is 3: [0, 127.5, 255] is returned, etc. 
	 */
	GraphicsUtils.getRatios = function(count) {
		var array = new Array();
		array[0] = 0;
		if (count >= 2) {
			if (count > 2) {
				var unit = (255 / (count - 1));
				for (var i = 1; i < count - 1; i++) {
					array[i] = (i * unit);
				}
			}
			array[count - 1] = 0xff;
		}
		return array;
	}
	
	/**
	 * Disegna un ellisse, eventualmente dashed.
	 * @param xc x coord of the center of the circle
	 * @param yc y coord of the center of the circle
	 * @param rx radius x
	 * @param ry radius y
	 * @param dashed if true then the line will be dashed
	 * @param dashLength the length of the dash (only applies if dashed is true)
	 * @author Piero 2013
	 */
	GraphicsUtils.drawEllipse = function(g, xc, yc, rx, ry, dashed, dashLength) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
	
		var x;
		var y1, y2;
		
		var dist = 0;	// approx distance from the start
		var dashNum;  
		var last;
		var p;
		
		g.moveTo(xc - rx, yc);
		last = new Point(-xc, 0);
		for(x = -rx; x <= rx; x++)
		{
			p = new Point(x, ry * Math.sqrt(1-x*x/(rx*rx)));
			
			// keep track of the total distance from start along the curve
			dist += Point.distance(p, last);
			dashNum = Math.floor((dist / dashLength) % 2); 
			// determine whether to draw the dashed line or move ahead
			if (dashNum == 0 || ! dashed) {
				// approximate the curve with a line (step size is small)
				g.lineTo(xc + p.x, yc + p.y);
			} else {
				g.moveTo(xc + p.x, yc + p.y);
			}
			last = p;
		}
		
		for(x = rx; x >= -rx; x--)
		{
			p = new Point(x, -ry * Math.sqrt(1-x*x/(rx*rx)));
			
			// keep track of the total distance from start along the curve
			dist += Point.distance(p, last);
			dashNum = Math.floor((dist / dashLength) % 2); 
			// determine whether to draw the dashed line or move ahead
			if (dashNum == 0 || ! dashed) {
				// approximate the curve with a line (step size is small)
				g.lineTo(xc + p.x, yc + p.y);
			} else {
				g.moveTo(xc + p.x, yc + p.y);
			}
			last = p;
		}
		g.lineTo(xc - rx, yc);
	}
	
	
	/**
	 * Disegna un arco di ellisse.
	 * @param center center of the ellipse
	 * @param rx radius x
	 * @param ry radius y
	 * @param startAngle 
	 * @param endAngle
	 * @author Piero 2013
	 */
	GraphicsUtils.drawArcEllipse = function(g, center, rx, ry, startAngle, endAngle) {
		if(typeof(startAngle)==='undefined') startAngle = 0;
		if(typeof(endAngle)==='undefined') endAngle = 90;
	
		if ((startAngle < 0) || (startAngle > 360) || 
			(endAngle < 0) || (endAngle > 360) || (startAngle == endAngle)) {
			trace("Invalid angles, must be between 0 and 360")
			return null;
		}
		
		var segments = Math.min(360, (rx+ry)/2);
		const twoPI = 2 * Math.PI;
		var angleDiff = (endAngle - startAngle);
		if (angleDiff < 0) {
			angleDiff += 360;
		}
		// convert to radians
		angleDiff = angleDiff * twoPI / 360;
		var angleStep = angleDiff / segments;	// in radians
		var startAngleRadians = startAngle * twoPI / 360;
		var angle = startAngleRadians;
		var maxAngle = angle + angleDiff;
		// Move to the start of the arc
		var x = center.x + Math.cos(angle) * rx;
		var y = center.y + Math.sin(angle) * ry;
		g.moveTo(x, y);
		var start = new Point(x, y);
		
		for (angle = startAngleRadians + angleStep; angle < maxAngle; angle += angleStep) {
			x = center.x + Math.cos(angle) * rx;
			y = center.y + Math.sin(angle) * ry;
			g.lineTo(x, y);
		}
		return {start: start, end: new Point(x, y)};
	}
	
	/**
	 * Disegna una nuvola.
	 * @param x,y coordinate angolo alto sx
	 * @param width,height dimensioni
	 * @author Piero 2013
	 */
	GraphicsUtils.drawCloud = function(g, x, y, width, height, color, thickness, fillColor) {
		if(typeof(thickness)==='undefined') thickness = 1;
		if(typeof(fillColor)==='undefined') fillColor = -1;
	
		var stepWidth = width / 28;
		var stepHeight = height / 16;
		if (fillColor >= 0) {
			//g.lineStyle(1, fillColor, 1);
			g.setStrokeStyle(0).beginStroke(numToHex(fillColor));
			
			g.beginFill(numToHex(fillColor), 1);
			// upper
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 8, y + stepHeight * 5, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 13, y + stepHeight * 4, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 17, y + stepHeight * 4, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 21, y + stepHeight * 5, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			// left
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 4, y + stepHeight * 5, stepWidth * 3, stepHeight * 2);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 3, y + stepHeight * 9, stepWidth * 3, stepHeight * 2.5);g.beginFill(numToHex(fillColor), 1);
			// right
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 24, y + stepHeight * 5, stepWidth * 3, stepHeight * 2);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 25, y + stepHeight * 9, stepWidth * 3, stepHeight * 2.5);g.beginFill(numToHex(fillColor), 1);
			// lower
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 8, y + stepHeight * 11, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 13, y + stepHeight * 12, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 17, y + stepHeight * 12, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			wb.GraphicsUtils.drawEllipse(g, x + stepWidth * 21, y + stepHeight * 11, stepWidth * 4, stepHeight * 4);g.beginFill(numToHex(fillColor), 1);
			g.drawEllipse(x + width/4, y + height/4, width/2, height/2);
			g.endFill();
		}
		
		// outline
		//g.lineStyle(thickness, color, 1);
		g.setStrokeStyle(thickness).beginStroke(numToHex(color));
		// upper
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 8, y + stepHeight * 5), stepWidth * 4, stepHeight * 4, 200, 300);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 13, y + stepHeight * 4), stepWidth * 4, stepHeight * 4, 200, 300);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 17, y + stepHeight * 4), stepWidth * 4, stepHeight * 4, 220, 315);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 21, y + stepHeight * 5), stepWidth * 4, stepHeight * 4, 220, 330);
		// left
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 4, y + stepHeight * 5), stepWidth * 3, stepHeight * 2, 90, 282);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 3, y + stepHeight * 9), stepWidth * 3, stepHeight * 2.5, 70, 260);
		// right
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 24, y + stepHeight * 5), stepWidth * 3, stepHeight * 2, 270, 55);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 25, y + stepHeight * 9), stepWidth * 3, stepHeight * 2.5, 270, 95);
		// lower
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 8, y + stepHeight * 11), stepWidth * 4, stepHeight * 4, 60, 180);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 13, y + stepHeight * 12), stepWidth * 4, stepHeight * 4, 60, 160);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 17, y + stepHeight * 12), stepWidth * 4, stepHeight * 4, 45, 150);
		wb.GraphicsUtils.drawArcEllipse(g, new Point(x + stepWidth * 21, y + stepHeight * 11), stepWidth * 4, stepHeight * 4, 0, 140);
	}
	
	/**
	 * Disegna una curva per punti.
	 * @param g
	 * @param pts
	 * @param thickness
	 * @param color
	 * @param alpha
	 * @author Piero 2013 
	 */
	GraphicsUtils.drawCurve = function(g, pts, thickness, color, alpha, dashed, dashLength, drawStraightLines) {
		if(typeof(thickness)==='undefined') thickness = 2;
		if(typeof(color)==='undefined') color = 0x66FFFF;
		if(typeof(alpha)==='undefined') alpha = 1;
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		if(typeof(drawStraightLines)==='undefined') drawStraightLines = false;
		
		var prevMidpt = null;
		var l = pts.length;
		g.moveTo(pts[0].x, pts[0].y);
		for (var i=1;i<l;i++) {
			var pt1 = new Point(pts[i-1].x, pts[i-1].y);
			var pt2 = new Point(pts[i].x, pts[i].y);
			var midpt = new Point(pt1.x+(pt2.x-pt1.x)/2, pt1.y+(pt2.y-pt1.y)/2);
			if (drawStraightLines) {
				// draw the straight lines:
				//g.lineStyle(0, 0xBBBBBB, 0.6);
				g.setStrokeStyle(0).beginStroke(numToHex(0xBBBBBB));
				g.moveTo(pt1.x, pt1.y);
				g.lineTo(pt2.x, pt2.y);
			}
			// draw the curves:
			//g.lineStyle(thickness, color, alpha);
			g.setStrokeStyle(thickness).beginStroke(numToHex(color));
			if (prevMidpt) {
				if (dashed || drawStraightLines)
					wb.GraphicsUtils.drawQuadCurve(g, prevMidpt, pt1, midpt, dashed, dashLength);
				else {
					g.moveTo(prevMidpt.x, prevMidpt.y);
					g.curveTo(pt1.x, pt1.y, midpt.x, midpt.y);
				}
			} else {
				// draw start segment:
				if (dashed || drawStraightLines)
					wb.GraphicsUtils.drawLine(g, pt1, midpt, dashed, dashLength);
				else {
					g.moveTo(pt1.x, pt1.y);
					g.lineTo(midpt.x, midpt.y);
				}
			}
			prevMidpt = midpt;
		}
		// draw end segment:
		if (dashed || drawStraightLines)
			wb.GraphicsUtils.drawLine(g, midpt, pt2, dashed, dashLength);
		else {
			g.lineTo(pt2.x, pt2.y);
		}
	}
	
	
	/**
	 * Disegna una stella regolare, eventualmente di forma ellissoidale (radiusX!=radiusY).
	 * @param g
	 * @param x	coordinate vertice alto/sx
	 * @param y	coordinate vertice alto/sx
	 * @param radiusX	raggio orizzontale
	 * @param n
	 * @param innerRadiusFactor	fattore raggio interno/raggio esterno
	 * @param radiusY	raggio verticale
	 * @param dashed
	 * @param dashLength
	 * @author Piero 2013
	 */
	GraphicsUtils.drawStar = function(g, x, y, radiusX, n, innerRadiusFactor, radiusY, dashed, dashLength) {
		if(typeof(n)==='undefined') n = 5;
		if(typeof(innerRadiusFactor)==='undefined') innerRadiusFactor = 0.382;
		if(typeof(radiusY)==='undefined') radiusY = -1;
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
		
		if (radiusY == -1) radiusY = radiusX;
		var lastPt;
		var centerX = x + radiusX;
		var centerY = y + radiusY;
		g.moveTo(centerX, centerY - radiusY);
		lastPt = new Point(centerX, centerY - radiusY);
		for (var i = 1; i <= n*2; i++)
		{
			var inter = i % 2;
			var factor = (inter) ? innerRadiusFactor : 1;
			
			var a = -Math.PI / 2 + i * Math.PI / n;
			var p = new Point(Math.cos(a)*radiusX*factor, Math.sin(a)*radiusY*factor);
			if (! dashed)
				g.lineTo(centerX + p.x, centerY + p.y);
			else {
				wb.GraphicsUtils.drawLine(g, lastPt, new Point(centerX + p.x, centerY + p.y), dashed, dashLength);
				lastPt = new Point(centerX + p.x, centerY + p.y);
			}
		}		
	}
	
	/**
	 * Disegna un poligono regolare.
	 * @param g
	 * @param radius	raggio
	 * @param segments	numero lati
	 * @param x	coordinate vertice alto/sx
	 * @param y	coordinate vertice alto/sx
	 * @param rotating	rotazione dei lati
	 * @param dashed
	 * @param dashLength
	 * @author Piero 2013
	 */
	GraphicsUtils.drawPolygon = function(g, radius, segments, x, y, rotating, dashed, dashLength) {
		if(typeof(dashed)==='undefined') dashed = false;
		if(typeof(dashLength)==='undefined') dashLength = 10;
	
		radians = function(n)
		{
			return (Math.PI/180*n);
		}
		
		var centerX = x + radius;
		var centerY = y + radius;
		var x0, y0;
		var id = 0;
		var ratio = 360/segments;
		var top = centerY - radius;
		var lastPt = new Point(centerX, y);
		for (var i = rotating; i <= 360 + rotating; i += ratio)
		{
			var xx = centerX + Math.sin(radians(i))*radius;
			var yy = top + (radius - Math.cos(radians(i))*radius);
			if (id>=1) {
				var p = new Point(xx, yy);
				if (id==1) {
					g.moveTo(xx, yy);
					x0 = xx; y0 = yy;
				}
				if (! dashed)
					g.lineTo(xx, yy);
				else {
					if (lastPt) wb.GraphicsUtils.drawLine(g, lastPt, p, dashed, dashLength);
					lastPt = new Point(p.x, p.y);
				}
			}
			id++;
		}
		// segmento finale
		if (! dashed)
			g.lineTo(x0, y0);
		else {
			wb.GraphicsUtils.drawLine(g, new Point(p.x, p.y), new Point(x0, y0), dashed, dashLength);
		}
	}

	wb.GraphicsUtils = GraphicsUtils;
}());