
from sys import stdout
# from makeup_artist import Makeup_artist
import logging

from flask import Flask, render_template, Response
from flask_socketio import SocketIO, emit

# from threading import Lock
import os
from processor import Processor
from processor import MyModel
from utils import base64_to_pil_image, pil_image_to_base64
from base64 import b64encode

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

async_mode = None
app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(stdout))
app.config['SECRET_KEY'] = os.urandom(24).hex()
app.config['DEBUG'] = True
socketio = SocketIO(app)
processor = Processor(MyModel())

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')


@socketio.on('image_in', namespace='/test')
def test_message(input):
    input = input.split(",")[1]
    processor.enqueue_input(input)
    #########
    image_data = "data:image/jpeg;base64," + str(processor.get_frame(), "utf-8")
    emit('image_back', {'image_data': image_data}, namespace='/test')


@socketio.on('connect', namespace='/test')
def test_connect():
    app.logger.info("client connected")

if __name__ == '__main__':
    socketio.run(app,port=80)
