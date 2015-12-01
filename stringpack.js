var ALPH_S = 33, ALPH_L = 94,
	STR_1S = 33, STR_1E = 47,
	STR_2S = 58, STR_2E = 64, STR_2O = 15,
	STR_3S = 91, STR_3E = 94, STR_3O = 22,
	INT_1S = 48, INT_1E = 57,
	INT_2S = 65, INT_2E = 90, INT_2O = 10,
	FLT3 = 95, FLT6 = 96,
	ARR_S = 97, ARR_E = 104,
	MAP_S = 105, MAP_E = 112,
	SPL_S = 113, SPL_E = 120,
	STR = 124, INT = 123, FLT = 125,
	ARR = 121, MAP = 122, SPL = 126,

	NULL = 33, FALSE = 34, TRUE = 35,
	INFN = 36, INFP = 37, NAN = 38,
	UNDEF = 39, FUNC = 40,
	SPL1_S = 41, SPL1_E = 126, SPL1_O = 8,

	UINT1_R = 31, UINT_LS = [2, 3, 5],
	INT1_R = 11, INT_LS = [2, 3, 5, 7],
	INT_MX = INT1_R * Math.pow(ALPH_L, 6) - 1,
	FLT_B = 370, FLT_LS = [2, 5, 8];

module.exports = function StringPack () {

function decode(string) {
	var i = 0;

	function digit() {
		return string.charCodeAt(i++) - ALPH_S;
	}

	function int() {
		var val = digit(),
			sign = val % 2 ? -1 : 1,
			last = i + INT_LS[(val = Math.floor(val / 2)) % 4] - 1;

		val = Math.floor(val / 4);

		while (i < last) {
			val = val * ALPH_L + digit();
		}

		return sign * val;
	}

	function uint() {
		var val = digit(),
			last = i + UINT_LS[val % 3] - 1;

		val = Math.floor(val / 3);

		while (i < last) {
			val = val * ALPH_L + digit();
		}

		return val;
	}

	function flt() {
		var exp1 = digit(), exp2 = digit(),
			sign = exp2 % 2 ? -1 : 1,
			man = (exp2 = Math.floor(exp2 / 2)) % 2,
			last = i + FLT_LS[exp1 % 3] - 1,

		exp1 = Math.floor(exp1 / 3);
		exp2 = Math.floor(exp2 / 2);

		while (i < last) {
			man = man * ALPH_L + digit();
		}
		return sign * parseFloat(man + "E" + (exp1 * 23 + exp2 - FLT_B));
//		should be sign * man * Math.pow(10, exp1 * 23 + exp2 - FLT_B);
//		but Math.pow(10, -x) sometimes rounds incorrectly while 1e-x doesn't.
	}

	function spl(index) {

	}

	function next () {
		var arr, map, len, j;
		code = string.charCodeAt(i++);

		if (code >= INT_1S && code <= INT_1E) {
			return code - INT_1S;
		} else if (code >= INT_2S && code <= INT_2E) {
			return code - INT_2S + INT_2O;
		} else if (code >= STR_1S && code <= STR_1E) {
			return string.substring(i, i += (code - STR_1S));
		} else if (code >= STR_2S && code <= STR_2E) {
			return string.substring(i, i += (code - STR_2S + STR_2O));
		} else if (code >= STR_3S && code <= STR_3E) {
			return string.substring(i, i += (code - STR_3S + STR_3O));
		} else if (code >= SPL_S && code <= SPL_E) {
			var cls = classes[code - SPL_S], args = [];
			for (var j = 0; j < cls.length; j++) { args.push(next()); }
			return cls.build.apply(null, args);
		} else if (code >= ARR_S && code <= ARR_E) {
			arr = []; len = code - ARR_S;
			for (j = 0; j < len; j++) { arr.push(next()); }
			return arr;
		} else if (code >= MAP_S && code <= MAP_E) {
			map = {}; len = code - MAP_S;
			for (j = 0; j < len; j++) { map[next()] = next(); }
			return map;
		} else {
			switch(code) {
				case FLT3: case FLT6:
				 	return int() * (code === FLT3 ? 1E-3 : 1E-6);
				case INT:
					return int();
				case FLT:
				   	return flt();
				case STR:
					len = uint();
					return string.substring(i, i += len);
				case ARR:
					arr = []; len = uint();
					for (j = 0; j < len; j++) { arr.push(next()); }
				   	return arr;
				case MAP:
					map = {}, len = uint();
					for (j = 0; j < len; j++) { map[next()] = next(); }
					return map;
				case SPL:
					code = string.charCodeAt(i++);
					switch(code) {
						case UNDEF: return undefined;
						case NULL: return null;
						case TRUE: return true;
						case FALSE: return false;
						case INFP: return +Infinity;
						case INFN: return -Infinity;
						case NAN: return NaN;
						default: return spl(code - SPL1_S);
					}
			}
		}
	}

	return next();
}

function encode (object) {
	var prefix, len, i;

	function digit(code) {
		return String.fromCharCode(ALPH_S + code)
	}

	function code(code) {
		return String.fromCharCode(code);
	}

	function int(val, carry, snaps) {
		var str = "", size = 0;
		while (val >= carry || str.length < snaps[size] - 1) {
			str = digit(val % ALPH_L) + str;
			val = Math.floor(val / ALPH_L);
			if (str.length > snaps[size] - 1) { size++; }
		}
		return [val, size, str];
	}

	function uint(val) {
		var ret = int(val, UINT1_R, UINT_LS);
		return digit(ret[0] * 3 + ret[1]) + ret[2];
	}

	function num(val) {
		var sign, str, dec, exp, ret;

		if (val < 0 || val === 0 && 1 / val < 0) {
			sign = 1;
			val = -val;
		} else {
			sign = 0;
		}

		str = val.toExponential().split("e");
		exp = parseInt(str[1]);
		dec = Math.max(0, str[0].length - 2);
		val *= Math.pow(10, dec - exp);
		exp -= dec;

		if (exp > 2 || exp < -6 || val * Math.pow(10, exp) > INT_MX) {
			ret = int(val, 2, FLT_LS);
			exp += FLT_B;
			return code(FLT) +
				digit(Math.floor(exp / 23) * 3 + ret[1]) +
			 	digit((exp % 23) * 4 + ret[0] * 2 + sign) +
				ret[2];
		} else if (exp < -3) {
			ret = int(val * Math.pow(10, exp + 6), INT1_R, INT_LS);
			return code(FLT6) +
			 	digit(ret[0] * 8 + ret[1] * 2 + sign) +
				ret[2];
		} else if (exp < 0) {
			ret = int(val * Math.pow(10, exp + 3), INT1_R, INT_LS);
			return code(FLT3) +
			 	digit(ret[0] * 8 + ret[1] * 2 + sign) +
				ret[2];
		} else {
			ret = int(val * Math.pow(10, exp), INT1_R, INT_LS);
			return code(INT) +
			 	digit(ret[0] * 8 + ret[1] * 2 + sign) +
				ret[2];
		}
	}

	if (typeof object === "undefined") {
		return code(SPL) + code(UNDEF);
	} if (typeof object === "boolean") {
		return code(SPL) + code(object ? TRUE : FALSE);
	} else if (typeof object === "number") {
		if (isNaN(object)) { return code(SPL) + code(NAN); }
		if (object === -Infinity) { return code(SPL) + code(INFN); }
		if (object === +Infinity) { return code(SPL) + code(INFP); }
		if (object > 0 && object % 1 === 0) {
			if (object <= INT_1E - INT_1S) {
				return code(INT_1S + object);
			} else if (object - INT_2O < INT_2E - INT_2S) {
				return code(INT_2S + (object - INT_2O));
			}
		}
		return num(object);
	} else if (typeof object === "string") {
		if (object.length <= STR_1E - STR_1S) {
			prefix = code(STR_1S + object.length);
		} else if (object.length - STR_2O < STR_2E - STR_2S) {
			prefix = code(STR_2S + (object.length - STR_2O));
		} else if (object.length - STR_3O < STR_3E - STR_3S) {
			prefix = code(STR_3S + (object.length - STR_3O));
		} else {
			prefix = code(STR) + uint(object.length);
		}
		return prefix + object;
	} else if (typeof object === "object") {
		if (object === null) {
			return code(SPL) + code(NULL);
		}

		if (Array.isArray(object)) {
			len = object.length;
			if (len < ARR_E - ARR_S) {
				prefix = code(ARR_S + len);
			} else {
				prefix = code(ARR) + uint(len);
			}

			for (i = 0; i < len; i++) {
				prefix += encode(object[i]);
			}

			return prefix;
		}

		if (typeof object.toSPack === "function") {
		}

		len = Object.keys(object).length;
		if (len < MAP_E - MAP_S) {
			prefix = code(MAP_S + len);
		} else {
			prefix = code(MAP) + uint(len);
		}

		for (i in object) { if (object.hasOwnProperty(i)) {
			prefix += encode(i) + encode(object[i]);
		} }

		return prefix;
	}
}

return { encode: encode, decode: decode };

};
