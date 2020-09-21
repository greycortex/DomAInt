GREYCORTEX Research DomAIn Models

This folder contains multiple models trained using TensorFlow in Pyhon. 
They should be named according to the preprocessing and (NN) method used.

Each sub-folder should contain:

- JSON model (model-bigrams44-GRU.json)
- JSON dictionary (list of bigrams bigrams.json)
- Python script how the model was created (4M-bigrams44-LSTM.py)
- (optionally) CSV containg the input data (whatever_data.csv)
- (optionally) Python binary model.
- CSV of some selected results for testing in the form:

  domain; badness (ground truth); badness (); feature vector [22,44,55, ...]

---
DomAIn is a free extension made by GREYCORTEX Research. 

Copyright (C) 2020 GreyCortex s.r.o.

Authors: P3, Marina
