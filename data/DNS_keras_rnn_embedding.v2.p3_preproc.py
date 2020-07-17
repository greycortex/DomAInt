#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Aug 14 14:50:13 2018

@author: marina
"""

import tensorflow as tf
import pandas as pd
#import numpy as np
import re
from sklearn.model_selection import train_test_split
#from sklearn.feature_extraction.text import TfidfVectorizer
#
from keras.preprocessing.sequence import pad_sequences
#
#from keras.models import Sequential
#from keras.layers import Embedding
#from keras.layers import Dense, LSTM#, Dropout

import sklearn.metrics as ms

#from keras.utils import to_categorical


##path = '/home/marina/py_progs/Domains/rawdata/'
#with open('/home/marina/py_progs/Domains/DomAIn-mine/new_rawdata/p3_test.csv') as file:
#    for line in file:
#        line = line.rstrip('\n')
   
data = pd.read_csv('/home/marina/py_progs/Domains/DomAIn-mine/new_rawdata/200k_merged_marked_magestic1M_300kblacklist_600kDGA.csv', header=None)
	#'merged_marked_top1m_ETI.blacklist.uniq-uR.csv', header = None)
#data1 = data[data.loc[:, 0].str.contains('xn--') == False]

#data_list = data[0].map(lambda x: x.split(' '))
#list_of_lists = data_list.to_list()
#list_flat = [x for y in list_of_lists for x in y]
#
#list_uniq = list(set(list_flat))


X = data.loc[:, 0]
y = data.loc[:, 1]

def replace0(input_string):
    return re.sub('\d', '0', input_string)
   
def replaceRU(input_string):
    return re.sub(r'[^\x00-\x7F]','?', input_string)

X0 = X.map(lambda x: replace0(x))
X_ascii = X0.map(lambda x: replaceRU(x))
X_low = X_ascii.map(lambda x: x.lower())
    
def findBigrams(input_string):
    bigram_list = []
    for i in range(0, (len(input_string)-1), 2):
        bigram_list.append(input_string[i] + input_string[i+1])
# we need integers for embedding layer    
#    bigram_int = []
#    for item in bigram_list:
#        bigram_int.append(bigrams_vocab[item])
    return bigram_list

def bigrams2int(bigram_list):
    bigram_int = []
    for item in bigram_list:
        bigram_int.append(bigrams_vocab[item])
    return bigram_int


X_bi = X_low.map(lambda x: findBigrams(x))

X_list_bi = X_bi.tolist()
flat = [x for y in X_list_bi for x in y]
uniq_bi = list(set(flat))

enum = list(enumerate(uniq_bi))
bigrams_vocab = dict((y, x) for x, y in enum)

X_int = X_bi.map(lambda x: bigrams2int(x))
len_seq = X_int.map(lambda x: len(x))


### The sequences have different lengths and Keras prefers inputs to be vectorized 
### and all inputs to have the same length. So, we use padding:
max_length = 20 # mean(len_seq) is 8.3... max(len_seq)
X_padded = pad_sequences(X_int, maxlen=max_length, padding='post')
#
y_arr = y.values


X_train, X_test, y_train, y_test = train_test_split(X_padded, y_arr, test_size=0.25)

# Create model
#INPUT = len(vectorizer.vocabulary_)
#model = Sequential()
### Embedding(vocab_size, vector_dim, input_length=1, name='embedding')
input_size = len(bigrams_vocab) + 1

embedding_layer = tf.keras.layers.Embedding(input_size, 128, input_length=max_length)

#embedded_vectors = embedding_layer(X_train)
#tf.io.write_file('bigrams_tensors.tsv', embedded_vectors, name=None)



model = tf.keras.Sequential([
    embedding_layer,
    tf.keras.layers.LSTM(128),
    tf.keras.layers.Dense(1, activation='sigmoid')])
#plot_model(model, to_file='model_plot.png', show_shapes=True, show_layer_names=True)

model.compile(optimizer='rmsprop', loss='binary_crossentropy')

# training
BATCH = 100
model.fit(X_train, y_train, epochs=10, batch_size=BATCH)

# prediction
y_predict = model.predict_classes(X_test)
y_predict_prob = model.predict(X_test)

print (ms.classification_report(y_test, y_predict))
print (ms.confusion_matrix(y_test, y_predict))

# save model:
#import time
#saved_model_path = "/tmp/saved_models{}".format(int(time.time()))

## for Tensorflow2.0 use:
#tf.saved_model.save(model, saved_model_path)

# for tensorflow 1.x use this:
#tf.contrib.saved_model.save_keras_model(model, saved_model_path)

### convert saved model into tensorflowjs format. out is json
#!tensorflowjs_converter \
#	--input_format=keras_saved_model \
#	/tmp/saved_models/<timestamp> \
#	/tmp/linear #output directory where jsom will be saved

