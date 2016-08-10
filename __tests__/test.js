jest.dontMock("../stringpack");



function Example (name, age) {
	this.name = name;
	expect(arguments.length).toEqual(1);
	this.age = age;
}

Example.prototype.packArguments = function () {
	return [this.name];
}

var assert = require("assert"),
	packer = require("../stringpack")([1, 2 , 3, 4, 5, 6, 7, 8, 9, Example]);

describe("x", function () {
	it('should encode and decode', function () {
		var val = {
			zh: {
				name: "China", region: "East Asia",
				flagColors: ["red", "yellow"],
				leader: { name: "习近平", title: "President", term: 2 },
				population: 1434.440076830
			},
			in: {
				name: "India", region: "South Asia",
				flagColors: ["orange", "white", "green"],
				leader: { name: "N Modi", title: "Prime Minister", term: 4 },
				population: Infinity
			},
			array: ["asdf", [3, undefined, 4]],
			negZero: -0, posZero: +0,
			emptyArray: [],
			emptyObject: {},
			object: new Example("John Doe")
		},
		enc = packer.encode(val),
		dec = packer.decode(enc);

		console.log(enc);

		expect(val).toEqual(dec);
	});

	it('Encoding a plain object while there are classes defined should be safely decoded', function() {
		var object = {
		    "type":"change",
		    "message": {
		        "entities": {
		            "c70d25dd-19aa-40d7-ae9b-a945ed496d8f":{
		                "counts":{},
		                "id":"c70d25dd-19aa-40d7-ae9b-a945ed496d8f",
		                "type":3,
		                "updateTime":1458113715131,
		                "score":28.008164740390658,
		                "body": "have a nice day",
		                "createTime":1458112138791,
		                "creator":"harish",
		                "deleteTime":null,
		                "meta":null,
		                "name": "hi there",
		                "parents": ["cae578ba-e1a1-4a3e-917c-dd2f4011f882"],
		                "tags":null,
		                "updater":null
		            }
		        }
		    }
		}
		var c = packer.encode(object);
		console.log(c);
		var clone = packer.decode(c);

		expect(object).toEqual(clone);
	});

	it('Floats', function () {
		var val = 1434.4400768307567845678367486656,
			enc = packer.encode(val),
			dec = packer.decode(enc);

		console.log(val, enc, dec);
		assert.equal(val, dec);
	});

	it('double precision numbers', function() {
		var x = [
			20813887440.6441,
			20808064564.8441,
			1463041978295,
			20819995305.6091
		];


		var str = packer.encode(x);
		var ob = packer.decode(str);

		assert.equal(x, ob);
	});
});
