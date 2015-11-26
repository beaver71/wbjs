// namespace:
this.wb = this.wb||{};


(function() {

	// constructor
	var WBShapeDescriptor = function() {
		
	}
	var p = WBShapeDescriptor.prototype = {};

	/**
	 * Factory class defining which type or class of shape
	 */
	p.factoryID;
	/**
	 * Definition date for this shape
	 */
	p.definitionData;
	/**
	 * Unique Shape Id
	 */
	p.shapeID;
	/**
	 * X-coordinate
	 */
	p.x;
	/**
	 * Y-coordinate
	 */
	p.y;
	/**
	 *  Width of this shape
	 */
	p.width;
	/**
	 * Height of this shape
	 */
	p.height;
	/**
	 * Rotation of shape , default is 0
	 */
	p.rotation=0;
	/**
	 * Property data for this shape
	 */
	p.propertyData;
	/**
	 * User ID
	 */		
	p.userID = "";
	/**
	 * Group Id (eventuale)
	 */
	p.groupID;
	

	p.clone = function()
	{
		var retObj = new wb.WBShapeDescriptor();
		retObj.factoryID = this.factoryID;
		retObj.definitionData = this.copyObject(this.definitionData);
		retObj.shapeID = this.shapeID;
		retObj.x = this.x;
		retObj.y = this.y;
		retObj.width = this.width;
		retObj.height = this.height;
		retObj.rotation = this.rotation;
		retObj.propertyData = this.copyObject(this.propertyData);
		retObj.userID = this.userID;
		retObj.groupID = this.groupID;
		return retObj;
	}

	p.createValueObject = function()
	{
		var retObj = {};
		retObj.factoryID = this.factoryID;
		retObj.definitionData = this.definitionData;
		retObj.shapeID = this.shapeID;
		retObj.x = this.x;
		retObj.y = this.y;
		retObj.width = this.width;
		retObj.height = this.height;
		retObj.rotation = this.rotation;
		retObj.propertyData = this.propertyData;
		retObj.userID = this.userID;
		retObj.groupID = this.groupID;
		return retObj;
	}

	p.readValueObject = function(p_vo)
	{
		if (p_vo.factoryID) {
			this.factoryID = p_vo.factoryID;
		}
		if (p_vo.definitionData) {
			this.definitionData = p_vo.definitionData;
		}
		if (p_vo.shapeID) {
			this.shapeID = p_vo.shapeID;
		}
		if (p_vo.x) {
			this.x = p_vo.x;
		}
		if (p_vo.y) {
			this.y = p_vo.y;
		}
		if (p_vo.width) {
			this.width = p_vo.width;
		}
		if (p_vo.height) {
			this.height = p_vo.height;
		}
		if (p_vo.rotation) {
			this.rotation = p_vo.rotation;
		}
		if (p_vo.propertyData) {
			this.propertyData = p_vo.propertyData;
		}
		if (p_vo.userID) {
			this.userID = p_vo.userID;
		}
		if (p_vo.groupID) {
			this.groupID = p_vo.groupID;
		}
	}
	
	p.compareShapeAttributes = function(p_shapeDescriptor)
	{
		if (p_shapeDescriptor.shapeID && p_shapeDescriptor.shapeID != this.shapeID) {
			return true;
		}
		if (p_shapeDescriptor.x && p_shapeDescriptor.x != this.x) {
			return true;
		}
		if (p_shapeDescriptor.y && p_shapeDescriptor.y != this.y) {
			return true;
		}
		if (p_shapeDescriptor.width && p_shapeDescriptor.width != this.width) {
			return true;
		}
		if (p_shapeDescriptor.height && p_shapeDescriptor.height != this.height) {
			return true;
		}
		if (p_shapeDescriptor.rotation && p_shapeDescriptor.rotation != this.rotation) {
			return true;
		}
		if (p_shapeDescriptor.userID && p_shapeDescriptor.userID != this.userID) {
			return true;
		}		
		if (p_shapeDescriptor.groupID && p_shapeDescriptor.groupID != this.groupID) {
			return true;
		}		
		return false;
	}
	
	p.copyObject = function(obj)
	{
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
	
	
	wb.WBShapeDescriptor = WBShapeDescriptor;
}());