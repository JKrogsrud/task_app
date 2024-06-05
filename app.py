from flask import Flask, render_template
from flask_socketio import SocketIO, join_room

app = Flask(__name__)

# app.config['SECRET_KEY'] = ???
# app.config['DEBUG'] = True

socketio = SocketIO(app)

connections = 0

# @app.route("/test1")
# def test1():
#     return render_template('test1.html')
#
# @app.route("/test2")
# def test2():
#     return render_template('test2.html')

@app.route("/control")
def control():
    return render_template('control.html')

@app.route("/display")
def control():
    return render_template('display.html')

# For all connections:
@socketio.on('connected')
def handle_connection(connection_type):
    print('Connection received: ' + str(connection_type))
    if connection_type == 'display':
        join_room('display')
        socketio.emit('display connected', to='controller')
    elif connection_type == 'controller':
        join_room('controller')

@socketio.on('message_to_display')
def message_to_display(message):
    print('Message to relay to display: ' + message)
    socketio.emit('relayed_message', (message), to='display')

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)