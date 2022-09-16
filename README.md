# Realtime Flask Model (Webcam)  

![coverimg](/docs/realtime-flask.gif)   

This repository demonstrates **deploying a real-time image-to-image translation model** via [Flask](https://flask.palletsprojects.com/en/2.2.x/) and [SocketIO](https://socket.io/docs/v4/).

## How it Works  

We're using Flask-SocketIO since it provides bi-directional communications between the web client and the model. We take inputs from the webcam via web clients, and send them to the model deployed on the flask server. The model processes the frames and returns them to the web client.  

## Requirements

We provided a Gaussian blur model for basic pipeline demonstration, and a pix2stylegan3 model, which is based on StyleGAN3 and requires more computing power.

### GaussianBlur model only:  

```python
bidict==0.22.0  
click==8.1.3
Flask==2.2.0
Flask-SocketIO==5.2.0
h11==0.13.0
importlib-metadata==4.12.0
itsdangerous==2.1.2
Jinja2==3.1.2
MarkupSafe==2.1.1
python-engineio==4.3.3
python-socketio==5.7.1
typing_extensions==4.3.0
Werkzeug==2.2.1
wsproto==1.1.0
zipp==3.8.1
```

### Additional requirements for the pix2stylegan3
The same as [StyleGAN3](https://github.com/NVlabs/stylegan3#requirements)  

## Limitations  
It doesn't handle multiple clients.

## Quickstart  
Download the [trained model](#) and place it in `saved_models` folder.  
```python
cd realtime-flask-model  
python app.py
```
