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
        self.current_score = 0

    def get_player_info(self):
        return {'name': self.name, 'img': self.img, 'score': self.current_score}

    def update_score(self, score_delta):
        self.current_score += score_delta


class Scores:
    def __init__(self, players: list[Player]):
        self.players = players
        self.score_history = [{player.name: 0 for player in self.players}]

    def update(self, delta_scores: dict[str:int]):
        current_scores = self.score_history[-1]
        for player, delta_score in delta_scores.items():
            new_scores = current_scores.copy()
            new_scores[player] += delta_score
            player.update_score(delta_score)
        self.score_history.append(new_scores)

    def get_score_history(self) -> list[dict[str:int]]:
        return self.score_history

    def get_scores_at(self, round_num: int):
        return self.score_history[round_num]

    def get_dict(self):
        # this should return an output friendly to send to front end
        # first make it as a dictionary and we will convert
        score_bundle = {player.name:
                            {'image': player.img, 'current_score': player.current_score}
                        for player in self.players}
        return score_bundle


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

        # Either this is the first time we load the page or we have stored
        # some information on it to check
        d = shelve.open('scores')

        if len(d.keys()) == 0:
            # first load, so we have need to grab info from the environment
            # The dict received will look like: {PLAYER_1_INFO: "name, img" .. }
            env_players = dotenv_values('player_info.env')
            players = []
            for player in env_players:
                player_name, player_img = env_players[player].split(", ")
                players.append(Player(player_name, player_img))

            # create a scores object
            scores = Scores(players)
            # save it to shelf
            d['scores'] = scores
            d.close()
        else:
            # looks like we already have some info so just set that up
            scores = d['scores']

        setup_bundle = {'scores': scores.get_dict(), 'fulltasks': 'tmp', 'clips': 'tmp'}
        socketio.emit('setup', setup_bundle, to='controller')

    else:
        print('Unknown connection')

# Control commands
@socketio.on('connect_display')
def connect_display():
    pass

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
    print(scores)
    pass
    # get current scores from local storage
    # update the scores history
    # send the last two scores to display for an animation

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)
