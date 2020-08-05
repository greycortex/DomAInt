#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Aug 14 14:50:13 2018

@author: marina
"""

import tensorflow as tf
import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from keras.preprocessing.sequence import pad_sequences
import json
import sklearn.metrics as ms
from matplotlib import pyplot as plt


PATH = '../data/'
# Load data (list of domains with labels) from csv file   
data = pd.read_csv(PATH + 'samples-nn1-bs2_uniq.csv')
	#'merged_marked_top1m_ETI.blacklist.uniq-uR.csv', header = None)

PATH2 = '../data/'
### load bigram vocabulary
bigrams_vocab2 = {}
with open(PATH2 + 'bigram_vocabulary2.json') as json_file: 
    bigrams_vocab2 = json.load(json_file)
    
    
# X is input data, string with domain
X = data['domain']
# y is label: 0 - benign, 1 - mailicious
y = data['rep']

y0 = y.map(lambda x: float((x + 1)/2))

X_low = X.map(lambda x: x.lower())

### all domains should be decoded in human-readable format
def urlDecode(url1):
     try:
          r = url1.encode('utf-8')
          res = r.decode('idna')
     except:
          print ("Can't process domain: ", url1)
          res = ''
     return res
 
### to reduce trainig vocabulary, replace all digits with 0, all non-acsii characters with '?'

def replaceChar(input_string):
    d0 = re.sub('\d', '0', input_string)
    return re.sub(r'[^\.\-0-9a-z]','?', d0)
   
#def replaceRU(input_string):
#    #return re.sub(r'[^\x00-\x7F]','?', input_string)
#    return re.sub(r'[^\.\-0-9a-z]','?', input_string)

#X_decoded = X_low.map(lambda x: urlDecode(x))
#X_ascii = X0.map(lambda x: replaceRU(x))
X0 = X_low.map(lambda x: replaceChar(x))
    
def findBigrams(input_string):
    bigram_list = []
    for i in range(0, (len(input_string)-1), 1):
        bigram_list.append(input_string[i] + input_string[i+1])
    return bigram_list

# we need integers for embedding layer 
def bigrams2int(bigram_list):
    bigram_int = []
    for item in bigram_list:
         if item in bigrams_vocab2.keys():
              bigram_int.append(bigrams_vocab2[item])
         else:
              bigram_int.append(int(1))               
    return bigram_int

# fit models
def fit_model(model, epochs, batch):
    #early_stop = keras.callbacks.EarlyStopping(monitor = 'val_loss', patience = 3)
    history = model.fit(X_train, y_train, epochs=epochs ,  
                        validation_split=0.2, batch_size=batch, 
                        shuffle = False) #, callbacks = [early_stop])
    return history

# Plot train loss and validation loss
def plot_loss (history):
    plt.figure(figsize = (10, 6))
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.ylabel('Loss')
    plt.xlabel('epoch')
    plt.legend(['Train loss', 'Validation loss'], loc='upper right')

X_bi = X0.map(lambda x: findBigrams(x))
X_int = X_bi.map(lambda x: bigrams2int(x))
len_seq = X_int.map(lambda x: len(x))

### The sequences have different lengths and Keras prefers inputs to be vectorized 
### and all inputs to have the same length. So, we use padding:
max_length = int(round(len_seq.mean() + 3*len_seq.std()))
X_padded = pad_sequences(X_int, maxlen=max_length, padding='post')

y_arr = y0.values

X_train, X_test, y_train, y_test = train_test_split(X_padded, y_arr, test_size=0.25)

### using mask_zero=True in embedding layer allow flexible input length 
### Create model
### input size =  length of vocabulary + OOV + padding
input_size = len(bigrams_vocab2) + 2

embedding_layer = tf.keras.layers.Embedding(input_size, 64, input_length=max_length, mask_zero=True)

#embedded_vectors = embedding_layer(X_train)
#tf.io.write_file('bigrams_tensors.tsv', embedded_vectors, name=None)

### models
model_lstm32_rmsprop = tf.keras.Sequential([
    embedding_layer,
    tf.keras.layers.LSTM(32),
    tf.keras.layers.Dense(1, activation='sigmoid')])
#plot_model(model, to_file='model_plot.png', show_shapes=True, show_layer_names=True)
model_lstm32_rmsprop.compile(optimizer='rmsprop', loss='mse')

model_lstm32_adadelta = tf.keras.Sequential([
    embedding_layer,
    tf.keras.layers.LSTM(32, dropout=0.2),
    tf.keras.layers.Dense(1, activation='sigmoid')])
model_lstm32_adadelta.compile(optimizer='Adadelta', loss='mse')

model_gru32_rmsprop = tf.keras.Sequential([
    embedding_layer,
    tf.keras.layers.GRU(32),
    tf.keras.layers.Dense(1, activation='sigmoid')])
model_gru32_rmsprop.compile(optimizer='rmsprop', loss='mse')

# training
#history_lstm32_rmsprop = fit_model(model_lstm32_rmsprop, epochs=10, batch=100)
#plot_loss (history_lstm32_rmsprop)

history_lstm32_adadelta = fit_model(model_lstm32_adadelta, epochs=10, batch=100)
plot_loss (history_lstm32_adadelta)

history_gru32_rmsprop = fit_model(model_gru32_rmsprop, epochs=10, batch=100)
plot_loss (history_gru32_rmsprop)

# prediction
#y_predict = model.predict_classes(X_test)
#y_predict_lstm32_rmsprop = model_lstm32_rmsprop.predict(X_test)
y_predict_lstm32_adadelta = model_lstm32_adadelta.predict(X_test)
y_predict_gru32_rmsprop = model_gru32_rmsprop.predict(X_test)
## estimate results
#labels = pd.Series(y_test)
#y_pred1 = y_predict_prob.reshape(903722)
#prediction = pd.Series(y_pred1)
#
#est = pd.concat([labels, prediction], axis=1)
#
#est.columns = ['labels', 'prediction']
#est['delta'] = abs(est['labels'] - est['prediction'])
#
test_mse = ms.mean_squared_error(y_test, y_predict_gru32_rmsprop)
test_rmse = np.sqrt(test_mse)
test_mae = ms.mean_absolute_error(y_test, y_predict_gru32_rmsprop)

print('test MSE: ', test_mse)
print('test RMSE: ', test_rmse)
print('test MAE: ', test_mae)
#print (ms.classification_report(y_test, y_predict))
#print (ms.confusion_matrix(y_test, y_predict))

## save model:
#import time
#saved_model_path = "/tmp/saved_models{}".format(int(time.time()))
#
## for Tensorflow2.0 use:
#tf.saved_model.save(model, saved_model_path)

# for tensorflow 1.x use this:
#tf.contrib.saved_model.save_keras_model(model, saved_model_path)

## convert saved model into tensorflowjs format. out is json
#!tensorflowjs_converter \
#	--input_format=keras_saved_model \
#	/tmp/saved_models/<timestamp> \
#	/tmp/linear #output directory where jsom will be saved

