/* 
 * GREYCORTEX Research domAIn
 * Train network in node.js.
 * See https://scrimba.com/casts/cast-1980
 * 
 * Copyright (c) GREYCORTEX Research 2019
 * Author: p3
 */

var synaptic = require('./synaptic.js');

// create the network
const { Layer, Network } = synaptic;

var inputLayer = new Layer(2);
var hiddenLayer = new Layer(3);
var outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

var myNetwork = new Network({
	input: inputLayer,
	hidden: [hiddenLayer],
	output: outputLayer
});

// train the network - learn XOR
var learningRate = .3;
for (var i = 0; i < 500; i++)
{
	// 0,0 => 0
	myNetwork.activate([0,0]);
	myNetwork.propagate(learningRate, [0]);

	// 0,1 => 1
	myNetwork.activate([0,1]);
	myNetwork.propagate(learningRate, [1]);

	// 1,0 => 1
	myNetwork.activate([1,0]);
	myNetwork.propagate(learningRate, [1]);

	// 1,1 => 0
	myNetwork.activate([1,1]);
	myNetwork.propagate(learningRate, [0]);
}

// test the network
console.log(myNetwork.activate([0,0])); // [0.015020775950893527]
console.log(myNetwork.activate([0,1])); // [0.9815816381088985]
console.log(myNetwork.activate([1,0])); // [0.9871822457132193]
console.log(myNetwork.activate([1,1])); // [0.012950087641929467]
