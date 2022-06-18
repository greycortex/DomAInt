/* 
 * GREYCORTEX Research domAIn
 * Train network in node.js.
 * See https://github.com/cazala/synaptic/wiki/Trainer
 * 
 * Copyright (c) GREYCORTEX Research 2019
 * Author: p3
 */

var synaptic = require('./synaptic');

// create the network
const {Architect, Trainer} = synaptic;

var myNetwork = new Architect.Perceptron(2, 3, 1)
var trainer = new Trainer(myNetwork)

var trainingSet = [
    {
        input: [0, 0],
        output: [0]
    },
    {
        input: [0, 1],
        output: [1]
    },
    {
        input: [1, 0],
        output: [1]
    },
    {
        input: [1, 1],
        output: [0]
    },
]

// trainer.train(trainingSet);
trainer.train(trainingSet, {
    rate: .1,
    iterations: 20000,
    error: .005,
    shuffle: true,
    log: 1000,
    cost: Trainer.cost.MSE // CROSS_ENTROPY
});