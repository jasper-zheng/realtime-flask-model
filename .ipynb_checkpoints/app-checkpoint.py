import os
from sys import stdout
import logging

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

from processor import Processor
from model import Pipeline

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

async_mode = None
app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(stdout))
app.config['SECRET_KEY'] = os.urandom(24).hex()
app.config['DEBUG'] = True
socketio = SocketIO(app)

processor = Processor(Pipeline(3,3,kernel_size=5))

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')


@socketio.on('input_frame', namespace='/demo')
def process_frame(input):
    input = input.split(",")[1]
    processor.enqueue_input(input)
    image_data = "data:image/jpeg;base64," + str(processor.get_frame(), "utf-8")
    emit('processed_frame', {'image_data': image_data}, namespace='/demo')


@socketio.on('connect', namespace='/demo')
def test_connection():
    app.logger.info("client connected")

if __name__ == '__main__':
    
    socketio.run(app,port=5000)
    
    