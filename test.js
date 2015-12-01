var assert = require("assert"),
	packer = require("./stringpack")();

it('should encode and decode', function () {
	var val = {
		zh: {
			name: "China", continent: "Asia",
			flagColors: ["red", "yellow"],
			leader: { name: "习 近平-习", title: "President", term: 137 },
			population: 1434440076830
		},
		in: {
			name: "India", continent: "", a: true, b: false, c: null,
			emptyArray: [], emptyObject: {},
			flagColors: ["orange", "white", "green"],
			leader: { name: "Narendra\nModi.", undef: undefined, title: "Prime Minister", term: 119 },
			population: 1.19E9
		},
		array: ["asdf", [3, undefined, 4]]
	},
	enc = packer.encode(val),
	dec = packer.decode(enc);

	assert.deepEqual(val, dec);
})
