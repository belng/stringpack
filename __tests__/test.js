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
				population: 1434440076830
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

		console.log(val, dec);

		expect(val).toEqual(dec);
	});
});
