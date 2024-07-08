from flask import Flask, render_template, redirect
from flask_socketio import SocketIO, join_room
import shelve
from dotenv import load_dotenv, dotenv_values

app = Flask(__name__)

socketio = SocketIO(app)
class Player:
    def __init__(self, name, img):
        self.name = name
        self.img = img

class Scores:
    def __init__(self, players: list[Player]):
        self.players = players
        self.score_history = [{player: 0 for player in self.players}]

    def update(self, delta_scores: dict[str:int]):
        current_scores = self.score_history[-1]
        for player, delta_score in delta_scores.items():
            new_scores = current_scores.copy()
            new_scores[player] += delta_score
        self.score_history.append(new_scores)

    def get_score_history(self) -> list[dict[str:int]]:
        return self.score_history

    def get_scores_at(self, round_num: int):
        return self.score_history[round_num]


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
        # to update control with recent scores
        if 'scores' in d.keys():
            scores = d['scores']
            recent_scores = scores.get_scores_at(-1)
            # Send scores to control
            socketio.emit('scores', recent_scores, to='controller')
        # First load, so load the players
        else:
            # setup the players
            scores = Scores(list(players.keys()))
            d['scores'] = scores

            recent_scores = scores.get_scores_at(-1)
            # send scores to control
            socketio.emit('scores', recent_scores, to='controller')
        d.close()
    else:
        print('Unknown connection')

# Control commands
@socketio.on('connect_display')
def connect_display():
    pass

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

# Control -> Display
@socketio.on('display_scores')
def display_scores(scores):
    pass
    # get current scores from local storage
    # update the scores history
    # send the last two scores to display for an animation

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)
