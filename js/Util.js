(function() {

	/**
	 * @namespace
	 * @name anx.Util
	 */
	anx.Util = {
		/**
		 * Generates a random string of the specified length.
		 * @param {number} n Desired length of random string.
		 * @return {string} A randomly generated string of lower and upper case letters.
		 */
		getRandomString: function(n){
			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			var str = "";
			for (var i=0; i<n; i++) {
				str += chars[Math.floor(Math.random()*chars.length)];
			}
			return str;
		},

		/**
		 * Ensures that 'value' is in the array 'arr'.
		 * @param {*} value The value to search for in arr.
		 * @param {array} arr The array in which to search for value.
		 */
		validateInArray: function(value, arr){
			for (var i=0; i<arr.length; i++){
				if (value===arr[i]) return true;
			}
			throw new Error(value + " is not an allowed value.");
		},

		/**
		 * Makes sure every item in properties is in obj.
		 * @param {object} obj Object in which to search for properties.
		 * @param {array} properties Properites to search for in obj.
		 * @return {boolean|Error} Returns true if all properties are in obj, or Error if it does not find all properties in obj.
		 */
		validateObjectHasProperties: function(obj, properties){
			for (var i=0; i<properties.length; i++){
				var prop_name = properties[i];
				if (typeof obj[prop_name] == 'undefined'){
					//console.log("Error coming up. Here's the full object:", obj);
					throw new Error("Object must have property called: " + prop_name);
				}
			}
			return true;
		},

		/**
		 * Makes sure every property of obj is in properties.
		 * @param {object} obj Object in which to search for properties.
		 * @param {array} properties Array of values to verify are in obj.
		 * @return {boolean|Error} Returns true if obj contains all properties, or error if obj is missing one of properties.
		 */
		validateObjectPropertiesAreIn: function(obj, properties){
			var errorMsg, propertyIsPresent;
			for (var i in obj){
				errorMsg = "Property " + i + " is not allowed on this object.";
				if (!obj.hasOwnProperty(i)){ continue; }
				if (typeof properties.indexOf !== 'undefined') {
					if (properties.indexOf(i) === -1 || typeof properties.indexOf(i) === 'undefined'){
						throw new Error(errorMsg);
					}
				} else {
					propertyIsPresent = false;
					for (var j = 0; j < properties.length; j++) {
						if (properties[j] === i) {
							propertyIsPresent = true;
							break;
						}
					}
					if (propertyIsPresent === false) {
						throw new Error(errorMsg);
					}
				}
			}
			return true;
		},

		/**
		 * Strictly compares any two items. Objects must have the same properties, arrays must have identical ordering of members.
		 * @param {*} a Thing to compare to b.
		 * @param {*} b Thing to compare to a.
		 * @return {boolean} Returns true if items are equal, false if not.
		 */
		isEqual: function(a, b) {
			// Check object identity.
			if (a === b) return true;

			// Different types?
			var atype = typeof(a);
			var btype = typeof(b);
			if (atype != btype) return false;

			// Basic equality test (watch out for coercions).
			if (a == b) return true;

			// One is falsy and the other truthy.
			if ((!a && b) || (a && !b)) return false;

			// One of them implements an isEqual()?
			if (a.isEqual) return a.isEqual(b);
			if (b.isEqual) return b.isEqual(a);

			// Check dates' integer values.
			if (a.getTime && b.getTime) return a.getTime() === b.getTime();

			// Both are NaN?
			if (a !== a && b !== b) return false;

			// If a is not an object by this point, we can't handle it.
			if (atype !== 'object') return false;

			// Check for different array lengths before comparing contents.
			if (typeof a.length!=='undefined' && (a.length !== b.length)) return false;

			// Recursive comparison of contents.
			for (var key in a) if (!(key in b) || !arguments.callee(a[key], b[key])) return false;

			return true;
		},

		/**
		 * Takes a string, returns the capitalized string.
		 * @param {string} s The string to capitalize.
		 * @return {string} The capitalized string.
		 */
		capitalize: function(s) {
			//capitalize the first character in s.
			if (typeof s === 'string'){
				return s.charAt(0).toUpperCase() + s.slice(1);
			} else {
				return;
			}
		},

		/**
		 * Checks whether the argument is null or undefined
		 * @param {*} s Thing to check for null or undefined.
		 * @return {boolean} Whether s is equal null or undefined.
		 */
		isNullorUndefined : function(s) {
			return typeof s == 'undefined' || s == null;
		},

		/**
		 * Checks whether the string is empty
		 * @param {string} s String to check.
		 * @return {boolean} Whether s is null, undefined or empty string.
		 */
		stringEmpty : function(s) {
			return typeof s == 'undefined' || s == null || s.replace(/\s/g,'') == '';
		},

		/**
		 * Delete all the members that are null or empty
		 * @param {object} obj Object from which to delet emtpy values.
		 */
		deleteEmptyMembers : function(obj) {
			for (var mem in obj) {
				if (typeof obj[mem] === 'string') {
					if (anx.Util.stringEmpty(obj[mem])) {
						delete obj[mem];
					}
				} else {
					if (anx.Util.isNullorUndefined(obj[mem])) {
						delete obj[mem];
					}
				}
			}
		},

		/**
		 * Remove the members not in the specified array
		 * @param {object} obj Object to edit.
		 * @param {array} filter_array Array of members to keep in obj. All members not in filter_array will be deleted.
		 */
		filterMembers : function(obj, filter_array) {
			for (var mem in obj) {
				if (!anx.Util.inArray(mem, filter_array)) {
					delete obj[mem];
				}
			}
		},

		/**
		 * Make a deep copy of the javascript object
		 * Note:  If there are circular references, you must use "shallow"
		 * or it will loop forever.
		 *
		 * @param {object} obj Object to clone.
		 * @param {boolean} shallow Whether or not to do a shallow copy (defaults to true)
		 * @return {object} The cloned copy of obj.
		 */
		clone : function(obj, shallow) {
			var newObj = (obj instanceof Array) ? [] : {};
			for (var i in obj) {
				if (obj[i] && typeof obj[i] === 'object' && !shallow) {
					newObj[i] = anx.Util.clone(obj[i]);
				} else {
					newObj[i] = obj[i];
				}
			} return newObj;
		},

		/**
		 * Pulls all the ids from an array of objects.
		 * @param {array} objs Objects from which to extract ids.
		 * @param {boolean} If true, will throw an error if any object is without an id.
		 * @return {array} An array of ids.
		 */
		getIds: function(objs, strict){
			var ids = [];
			for (var i=0; i<objs.length; i++){
				var obj = objs[i];
				if (!obj.hasOwnProperty("id")){
					if (strict){
						throw new Error("Object is without an 'id' property.");
					}
					continue;
				}
				ids.push(obj.id);
			}
			return ids;
		},

		/**
		 * Gets all the properties of an object.
		 * @param {object} obj The object whose properties are to be retreived.
		 * @return {array} An array of all properties in obj.
		 */
		objGetValues: function(obj){
			var vals = [];
			for (var i in obj){
				vals.push(obj[i]);
			}
			return vals;
		},

		/**
		 * Gets all the keys from an object.
		 * @param {object} obj Object from which to retrieve keys.
		 * @return {array} An array of all keys in obj.
		 */
		objGetKeys: function(obj){
			var keys = [];
			for (var i in obj){
				keys.push(i);
			}
			return keys;
		},

		/**
		 * Retrieves values from an object when given the object and a field or path to the desired value.
		 * @param {object} obj Object from which to retrieve value.
		 * @param {str} str Path to desired value in dot notation.
		 * @usage: getFieldValue({foo: {bar: "baz"}}, "foo.bar") returns "baz"
		 */
		getFieldValue: function(obj, str){
			var val;
			var stack = str.split(".");
			while (stack.length > 0){
				if (obj===null || typeof obj!=='object'){return null;}
				val = obj[stack.shift()];
				obj = val;
			}
			return val;
		},

		/**
		 * Creates a hashed object from an array of existing objects.
		 * @param {array} arr Array of objects on which to perform hash object operation.
		 * @param {string} field Path to the key that is to be hashed into the new object.
		 * @return {object} A re-constructed object containing the desired key/values from the original object array.
		 *
		 * hashObjArray([{
		 *		foo: {bar: "baz"}
		 * },{
		 *		foo: {bar: "bing"}
		 * }], "foo.bar")
		 *
		 * returns
		 *
		 * {
		 *		baz: {foo: {bar: "baz"}},
		 *		bing: {foo: {bar: "bing"}}
		 * }
		 */
		hashObjArray: function(arr, field){
			var obj = {};
			for (var i=0; i<arr.length; i++){
				obj[anx.Util.getFieldValue(arr[i], field)] = arr[i];
			}
			return obj;
		},
		/**
		 * Sorts an objects keys into alphabetical order,
		 * @param {object} o The object to be sorted
		 * @param {bool} deep sort down the prototype chain
		 * @return {object} The same object returned in sorted form
		 */
		sortObject: function(o, deep) {
			var sorted = {};
		    var key;
		    var a = [];

		    for (key in o) {
		        if (!deep || o.hasOwnProperty(key)) {
		           a.push(key);
		        }
		    }
		    a.sort();
		    for (key = 0; key < a.length; key++) {
		        sorted[a[key]] = o[a[key]];
		    }
		    return sorted;
		},

		/**
		 * @param {array} objArray Array of objects on which to perform pluck operation.
		 * @param {string} field Path to key of value that is to be plucked from each object.
		 * @return {array} An array of values plucked from the object.
		 *
		 *	pluck([{
		 *		foo: {bar: "baz"}
		 *	},{
		 *		foo: {bar: "bing"}
		 *	}], "foo.bar")
		 *
		 *	returns
		 *
		 *	["baz","bing"]
		 */
		pluck: function(objArray, field){
			var parts
			var arr = [];
			for (var i=0; i<objArray.length; i++){
				arr.push(anx.Util.getFieldValue(objArray[i], field));
			}
			return arr;
		},

		/**
		 * Removes each argument from the array
		 * @param {array} arr Array to remove values from
		 * @param {...string} var_args Vaules to be removed
		 * removeFromArray(arr, "values", "to", "remove");
		 */
		removeFromArray: function(){
			var args = Array.prototype.slice.call(arguments, 0);
			var arr = args.splice(0,1)[0];
			var to_remove = args;
			for (var i=0; i<to_remove.length; i++){
				for (var j=0; j<arr.length; j++){
					if (arr[j]===to_remove[i]){
						arr.splice(j,1);
					}
				}
			}
		},

		/**
		 * Formats a number with the desired decimal places, precision and thousands separator.
		 * @param {number} number Number to format
		 * @param {number} decimals Number of decimal places to allow in formatted number
		 * @param {boolean} allow_extended_precision Whether to allow additional significant decimal places
		 * @param {boolean} use_separator Whether to use a symbol to separate thousands
		 * @param {string} thousands_sep The symbol to use for separating numbers
		 * @return {string} A string representation of the formatted number.
		 *
		 * Based on http://phpjs.org/functions/number_format:481
		 */
		numberFormat: function(number, decimals, allow_extended_precision, use_separator, thousands_sep, decimal_mark) {
			var n = isFinite(+number) ? +number : 0,
				prec = isFinite(+decimals) ? Math.abs(decimals) : 0,
				max_decimals = 7,
				sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
				dec = decimal_mark || '.',
				s = '',
				toFixedFix = function (n, prec) {
					var k = Math.pow(10, prec);
					return '' + Math.round(n * k) / k;
				};
				if (typeof allow_extended_precision !== 'boolean'){
					allow_extended_precision = false;
				}
				if (typeof use_separator !== 'boolean'){
					use_separator = true;
				}

		    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
			var max_prec = (allow_extended_precision) ? max_decimals : prec;
			s = (max_prec ? toFixedFix(n, max_prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3 && use_separator) {
				s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}
			return s.join(dec);
		},

		numberFormatForUser: function(number, decimalPlaces, extend) {
			return this.numberFormat(number, decimalPlaces, extend, true, anxs.thousand_separator, anxs.decimal_mark);
		},

		numberFormatPercentForUser: function(number, decimalPlaces, extend) {
			decimalPlaces = decimalPlaces !== undefined ? decimalPlaces : 2;
			return this.numberFormat(number * 100, decimalPlaces, extend, true, anxs.thousands_separator, anxs.decimal_mark);
		},

		parseUserFormattedNumber: function(value) {
			if(typeof value === 'string') {
				var thousandsRegex = new RegExp('\\' + anxs.thousand_separator, 'g');
				var decimalRegex = new RegExp('\\' + anxs.decimal_mark, 'g'); // Need to add slash for escaping valid RegExp operators
				value = value.replace(thousandsRegex, '');
				value = value.replace(decimalRegex, '.');
				var parsed = parseFloat(value);
				if(!isNaN(parsed)) {
					return parsed;
				}
			}
			return value;
		},

		parseAndFormatNumber: function(value, decimalPlaces, extend) {
			value = anx.Util.parseUserFormattedNumber(value);
			return anx.Util.numberFormatForUser(value, decimalPlaces, extend);
		},

		/**
		 * Ensures number with a min/max number of decimal places with leading and trailing 0's removed.
		 * @param {number} number Number to format.
		 * @param {number} minimum_decimals The minimum number of decimal places allowed.
		 * @param {number} maximum_decimals The maximum number of decimal places allowed.
		 * @param {boolean} prepend_zero Whether to add a zero in front of decimal values.
		 * @return {string} A string representation of the formatted number.
		 *
		 * Example:  (with min = 2 and max = 5)
		 * 1.2345678 -> "1.23457"
		 * 1.1 -> "1.10"
		 * 0.0042 -> ".0042"
		 * .00000001 -> ".00"
		 * 1.400000 -> "1.40"
		 */
		decimalFormat: function(number, minimum_decimals, maximum_decimals, prepend_zero){
			if (number === null || number === undefined) { number = 0; }
			if (typeof minimum_decimals == 'undefined') minimum_decimals = 2;
			if (typeof maximum_decimals == 'undefined') maximum_decimals = 5;
			if (typeof maximum_decimals == 'undefined') prepend_zero = true;
			if (typeof number === 'string') {
				number = number * 1.0;
			}
			var trimmed = anx.Util.trimZeroes(number.toFixed(maximum_decimals), minimum_decimals);
			if (trimmed === '' || trimmed.substr(0, 1) === '.') {
				trimmed = '0' + trimmed;
			}
			return trimmed;
		},

		/**
		 * Removes trailing and leading zeroes, and ensure at least
		 * <minimum_decimals> remain after a decimal... pads with zeroes.
		 * @param {string} str Stringified number to trim zeros from.
		 * @param {number} minimum_decimals Minimum number of decimal places.
		 * @return {string} A string representation of the trimmed number.
		 */
		trimZeroes: function(str, minimum_decimals){
			str = str + "";
			if (typeof minimum_decimals=='undefined'){
				minimum_decimals = 0;
			}

			//trim all 0's after decimal
			var split = str.split(".", 2);
			if (split.length==2){
				str = split[0] + "." + split[1].replace(/[0]*$/, '');
			}
			str = str.replace(/^[0]*/, '');	//trim leading 0's
			str = str.replace(/[.]$/, '');	//trim decimal if there's nothign after it

			if (minimum_decimals){
				var getPad = function(num){
					var zeros = [];
					for (var i=0; i<num; i++) zeros.push("0");
					return zeros.join('');
				};

				split = str.split(".", 2);
				if (split.length==1){
					return str + "." + getPad(minimum_decimals);
				}
				if (split.length==2){
					var padding_amount = minimum_decimals - split[1].length;
					if (padding_amount > 0){
						return str + getPad(padding_amount);
					}
				}
			}
			return str;
		},

		/**
		 * Properly converts a form into JSON representation of keys/values
		 *
		 * @param {jQuery} $form A jQuery extended form element.
		 * @return {object} Returns a json representation of $form.
		 *
		 * Added code converts array-named elements into actual JSON arrays:
		 *
		 * <input name=something['arr']['one'] value="first">
		 * <input name=something['arr']['two'] value="second">
		 *
		 * becomes
		 * {
		 *	'something': {
		 *		'arr': {
		 *			'one': 'first',
		 *			'two': 'second'
		 *		}
		 *	 }
		 * }
		 *
		 */
		serializeJSON: function($form) {
			var o = {};
			var a = $form.serializeArray();
		    $.each(a, function() {
				var matches = null;
				var name = this.name;
				var value = this.value;

				var paths = []
				if (matches = name.match(/([^\[]*)\[([^\]]*)\](.*)/i)){
					paths.push(matches[1]);
					paths.push(matches[2]);
					name = matches[3];
					while (matches = name.match(/\[([^\]]*)\](.*)/i)){
						paths.push(matches[1]);
						name = matches[2];
					}

					var obj = o;
					for (var i=0; i<paths.length-1; i++){
						var pathName = paths[i];
						var nextPathName = paths[i+1];

						if (nextPathName==''){
							if (!(obj[pathName] instanceof Array)){
								obj[pathName] = []
							}
							obj = obj[pathName];
							break;
						}

						if (!obj[pathName]){
							obj[pathName] = {};
						}
						obj = obj[pathName];
					}
					var lastPathName = nextPathName;

					if (obj instanceof Array){
						obj.push(value);
					}else{
						obj[lastPathName] = value;
					}
				} else {
					o[name] = value;
				}
		    });
		    return o;
		},

		/**
		 * @param {*} needle Thing you are searching for in haystack
		 * @param {array} haystack The array you are searching
		 * @return {boolean} Returns true if needle is in haystack, or false if not.
		 */
		inArray: function(needle, haystack) {
			if (haystack === undefined) return false;
			var result = $.inArray(needle, haystack);
			return  (result !== -1 && typeof(result) !== 'undefined' ? true : false);
		},

		/**
		 * Gets query param string from a url.
		 * @param {string} url A url with query string params to be converted to a json object
		 * @return {object} Returns a json representation of query params.
		 */
		getParams: function(url) {
			var url = url !== undefined ? '?'+url.split('?')[1] : window.location.search,
				params = {},
				pair,
				regEx = /([^&=]+)=?([^&]*)/g,
				convertPlusToSpace = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };

			while (pair = regEx.exec(url.substring(1))) {
				params[pair[1]] = convertPlusToSpace(pair[2]);
			}

			return params;
		},

        /**
         * Converts an object to an ordered array
         * @param {Object} obj any flat object (will not deep copy)
         * @return {Array} An ordered array: [{key: val }, {key: val }]
         */
        toOrderedArray: function(obj) {
            var _arr = [];

            for (var k in obj) {
                _arr.push(obj[k])
            }

            return _arr;
        },

        /**
         * Returns an array of distinct elements.
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_hash func to create a key for uniquely identifying each element
         * @return {Array} An array of distinct elements
         */
        distinct: function(arr, fn_hash) {
            var o = {},
                i,
                l = arr.length,
                newarr = [];

            for (i = 0; i < l; i++)
                o[fn_hash(arr[i])] = arr[i];

            for (i in o)
                newarr.push(o[i]);

            return newarr;
        },

        /**
         * Determines if an array contains an element
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_iterator func used to compare elements
         * @return {Bool} Whether or not array contains an element satisfying the iterator func
         */
        contains: function(arr, fn_iterator) {
            var i, l = arr.length;

            for (i = 0; i < l; i++) {
                if (fn_iterator(arr[i])) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Removes elements from an array that satisfy iterator func
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_iterator func used to identify elements to remove
         * @return {Array} elements that were removed from the source array
         */
        remove: function(arr, fn_iterator) {
            var i, l = arr.length, temp = arr, removedarr =[];

            for (i = 0; i < l; i++) {
                if (fn_iterator(arr[i])) {
                    removedarr.push(temp.splice(i, 1));
                }
            }

            arr = temp;
            return removedarr;
        },

        /**
         * Removes first element from an array that satisfy iterator func
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_iterator func used to identify elements to remove
         * @return {Object} first element that was removed from the source array
         */
        removeFirst: function(arr, fn_iterator) {
            var i, l = arr.length, temp = arr, removedVal = null;

            for (i = 0; i < l; i++) {
                if (fn_iterator(arr[i])) {
                    removedVal = temp.splice(i, 1);
                    break;
                }
            }

            arr = temp;
            return removedVal[0];
        },

        /**
         * Finds the index of the first element from an array that satisfies iterator func
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_iterator func used to identify element
         * @return {Number} index of first element that was found from the source array
         */
        indexOfFirst: function(arr, fn_iterator) {
            var i, l = arr.length, foundObj = null;

            for (i = 0; i < l; i++) {
                if (fn_iterator(arr[i])) {
                    return i;
                }
            }

            return -1;
        },

		/**
         * Finds the first element from an array that satisfies iterator func
         * @param {Array} arr source collection of elements on which to operate
         * @param {Function} fn_iterator func used to identify element
         * @return {Object} first element that was found from the source array
         */
		findFirst: function(arr, fn_iterator) {
			var i, l = arr.length, foundObj = null;

            for (i = 0; i < l; i++) {
                if (fn_iterator(arr[i])) {
                    return arr[i];
                }
            }

            return null;
		}
	};

})();