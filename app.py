from flask import Flask, render_template, redirect
from flask_socketio import SocketIO, join_room
import shelve
from dotenv import load_dotenv, dotenv_values

app = Flask(__name__)

socketio = SocketIO(app)

class Scores:
    def __init__(self, players: list[str]):
        self.players = players
        self.scores = {player:0 for player in self.players}

    def update(self, delta_scores: dict[str:int]):
        for player, delta_score in delta_scores.items():
            self.scores[player] += delta_score
    def get(self) -> dict[str:int]:
        return self.scores

@app.route("/")
def index():
    return redirect('/control')

@app.route("/control")
def control():
    return render_template('control.html')

@app.route("/display")
def display():
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

        #load players.env - should load pictures and names
        players = dotenv_values("players.env")

        # create Scores object to store scores
        # shelve it for later
        d = shelve.open('scores')
        # check if scores exists already on the shelf
        if 'scores' in d.keys():
            pass
        else:
            scores = Scores(list(players.keys()))
            d['scores'] = scores
        d.close()
    else:
        print('Unknown connection')

# Control commands

@socketio.on('goto_scores')
def goto_scores():
    print('opening score view')
    # Not working here, maybe we just do this front end only
    # by hiding the scores view and unhiding it when the button
    # is clicked

@socketio.on('goto_fulltasks')
def goto_fulltasks():
    print('opening full task view')
    # render_template(controls, data={state='fulltask view'})

@socketio.on('goto_clips')
def goto_scores():
    print('opening clip view')
    # render_template(controls, data={state='clip view'})

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)
