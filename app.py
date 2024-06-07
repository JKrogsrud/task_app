from flask import Flask, render_template
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
        scores = Scores(list(players.keys()))
        d['scores'] = scores
        d.close()

        # Check if a display is attached, if not open a new display window
        # if there is a display attached we will have a button to open a new one
        # TODO Implement display check this


# @socketio.on('update scores'):
# def update_scores(new_scores):
#     pass

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)
