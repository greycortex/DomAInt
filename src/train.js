/*
 * GREYCORTEX Research domAIn
 * Performs training and evaluation of models in node.js.
 * 
 * 
 * Copyright (C) 2019 GreyCortex s.r.o.
 * @author p3
 */

// include neural network
const SYNAPTIC = require('../src/synaptic/synaptic');
const {Neuron, Layer, Network, Trainer, Architect} = SYNAPTIC;



function sparse(vect) {
    var obj = {};
    
    for (var i = 0; i < vect.length; i++) {
        if (vect[i] > 0) obj[i.toString()] = vect[i];
    }
    
    return obj;
}


/** 
 * The magic fun
 * 
 * @param trainingSet = [ {id: "example.com", input: [0,0],output: [0]}, ... ]
 * @param trRate = 0.1                  // .1 - .2
 * @param trIterations = 20000          // 100000
 * @param nnStates = bigrams.length*2   // https://datascience.stackexchange.com/a/31345
 * @param trError = 0.05                // .005
 * @param trCostFun = Trainer.cost.MSE  // MSE (default or) CROSS_ENTROPY
 * @param nnCrossValidate = null        // this would be nice, but...
 * @param trShuffle = true              // null
 * @param trLog = 10                    // 100
 * 
 * @return network
 */
function train(trainSet,
        trRate = 0.01, trIterations = 10000, nnStates = null, 
        trError = 0.05, trCostFun = Trainer.cost.MSE, // MSE | CROSS_ENTROPY
        nnCrossValidate = null, trShuffle = true, trLog = null) { //100

    var sample0 = trainSet[0];
    if (nnStates == null) nnStates = sample0["input"].length * 2; //*2
    if (trLog == null) trLog = trIterations/100;

    // var network = new Architect.Perceptron(sample0["input"].length, sample0["input"].length/**2*/, 1);
    var inputLayer = new Layer(sample0["input"].length);
    inputLayer.set({
        squash: Neuron.squash.TANH, // squashing functions: LOGISTIC, TANH, IDENTITY, HLIM, RELU
        bias: 0
    })
    var hiddenLayer = new Layer(nnStates); 
    hiddenLayer.set({
        squash: Neuron.squash.TANH, // RELU, TANH
        bias: 0
    })
    var outputLayer = new Layer(1);
    outputLayer.set({
        squash: Neuron.squash.TANH,
        bias: 0
    })

    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    var network = new Network({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });

    // manual training...
//    for (var s = 0; s < trainSet.length; s++) {
//        // parseFloat may be necessary: https://github.com/cazala/synaptic/issues/291
//        var input    = trainSet[s].input;
//        var expected = trainSet[s].output;
//
//        var output = network.activate(input);
//        // if (s < 10) FS.writeFileSync("model/output-"+ s +"-act.json", JSON.stringify(network, null, 2), "utf8");
//        network.propagate(trRate, expected);
//        // if (s < 10) FS.writeFileSync("model/output-"+ s +"-pro.json", JSON.stringify(network, null, 2), "utf8");
//        
//        console.log("sample: "+ s +" expected: "+ expected +" output: "+ output + " input:"+ JSON.stringify(sparse(input)));
//        // errorSum += costFunction(target, output);
//    }
    
    // train-magic
    // trainer.train(trainingSet);    
    var trainer = new Trainer(network);
    var train = trainer.train(trainSet, {
        crossValidate: nnCrossValidate,
        rate: trRate,
        error: trError,
        iterations: trIterations,
        cost: trCostFun, // Trainer.cost.MSE | CROSS_ENTROPY
        shuffle: trShuffle,
        log: trLog
    });
    console.log("train: " + JSON.stringify(train, null, 2));

    var test = trainer.test(trainSet);
    console.log("test: " + JSON.stringify(test, null, 2));

    return network;
}


/** 
 * Soft class from interval [0..1]
 * 
 * @param x
 * @return class 0 (<.2 xx.334), null, 1 (>.8 xx.666)
 */
function prd(x) {
    if (x < 0.2) return 0;
    else if (x > 0.8) return 1;
    else return null;
}

/** 
 * Hard class from interval [0..1]
 * 
 * @param x
 * @return class 0 (<.5), null, 1 (>.5)
 */
function cls(x) {
    if (x < 0.5) return 0;
    else if (x > 0.5) return 1;
    else return null;
}


/** 
 * Not really magic fun...
 * 
 * @param testSet = [ {input: [0,0],output: [0]}, ... ]
 * @param nnStates = bigrams.length*2   // https://datascience.stackexchange.com/a/31345
 * 
 * @return evalSet
 */
function eval(testSet, network) {
    // trainingSet = [ {id: "example.com", pred: [0], exp: [0]}, ... ]
    const evalSet = [];    

    // samples = testSet.length
    var sqrSum = 0;
    var absSum = 0;
    var negSum = 0;
    var posSum = 0;
    
    var negCnt = 0;
    var posCnt = 0;
    var negPred = 0;
    var posPred = 0;
    var binary = [[0,0],[0,0]];
    
    // manual testing...
    for (var s = 0; s < testSet.length; s++) {
        // parseFloat may be necessary: https://github.com/cazala/synaptic/issues/291
        var exp = testSet[s].output[0];

        var pred = network.activate(testSet[s].input)[0];
        // if (s < 10) FS.writeFileSync("model/output-"+ s +"-act.json", JSON.stringify(network, null, 2), "utf8");
        
        sqrSum += (exp-pred)*(exp-pred);
        absSum += Math.abs(exp-pred);
        
        if (pred <= exp) negSum += exp-pred;
        else posSum += exp-pred;
        
        var binExp = cls(exp);
        var binPred = cls(pred);
        if (binExp != null) {
            (binExp < 0.5) ? negCnt++ : posCnt++;
            
            // we can hardly asses nulls...
            if (binPred != null) binary[binExp][binPred] += 1;
        }
        if (binPred != null) {
            (binPred < 0.5) ? negPred++ : posPred++;
        }
    
        // errorSum += costFunction(target, output);
        const sample = {"id": testSet[s].id, "pred": [pred], "exp": [exp]};
        evalSet.push(sample);    
    }
    
    console.log("Eval results ===================================");
    console.log("MSE: "+ sqrSum/testSet.length);
    console.log("MAE: "+ absSum/testSet.length);
    console.log("N-Sum: "+ negSum/testSet.length);
    console.log("P-Sum: "+ posSum/testSet.length);
    console.log("------------------------------------------------")
    console.log("GT\\Pred\t 0\t1\tSum\tRecall");
    console.log("0\t "+ binary[0][0] +"\t"+ binary[0][1] +"\t"+ negCnt +"\t"+ (binary[0][0]/negCnt).toFixed(2));
    console.log("1\t "+ binary[1][0] +"\t"+ binary[1][1] +"\t"+ posCnt +"\t"+ (binary[1][1]/posCnt).toFixed(2));
    console.log("Sum\t "+ negPred +"\t"+ posPred +"\t"+ testSet.length);
    console.log("================================================")
    return evalSet;
}

/**
 * Test this TRAIN by running:
 * $> node train.js test
 */
function unitTest() {
    console.log();
    console.log("TRAIN test ...");

    // training XOR test
    var testSet = [
        {input: [0, 0], output: [0]},
        {input: [0, 1], output: [1]},
        {input: [1, 0], output: [1]},
        {input: [1, 1], output: [0]},
    ];
    
    console.log("trainMagic(testSet);");
    var network = train(testSet); // , 0.01, 100000
    console.log("network: " + JSON.stringify(network));
    console.log();
    var evalSet = eval(testSet, network);
    console.log("eval: " + JSON.stringify(evalSet));
    console.log();
    
    console.log("... TRAIN test passed!");
}

// pseudo-main for unit testing
if (process && process.argv.includes("test")) unitTest();

/** 
 * The public interface of TRAIN counterpart. 
 */
module.exports = {
    version: "2019.3.0",
    train,
    eval,
    unitTest
};
