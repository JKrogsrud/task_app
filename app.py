from flask import Flask, render_template, redirect
from flask_socketio import SocketIO, join_room
import shelve
from dotenv import load_dotenv, dotenv_values, set_key

app = Flask(__name__)

socketio = SocketIO(app)
class Player:
    def __init__(self, name, img):
        self.name = name
        self.img = img
        self.current_score = 0

    def get_player_info(self):
        return {'name': self.name, 'img': self.img, 'score': self.current_score}

    def update_score(self, new_score):
        self.current_score = new_score

    def __eq__(self, name):
        if name == self.name:
            return True
        else:
            return False


class Scores:
    def __init__(self, players: list[Player]):
        self.players = players
        self.score_history = [{player.name: 0 for player in self.players}]

    def update(self, new_scores: list[dict[str:str,str:str]]):
        # This accepts a list [dict('player':player, 'current_score':str(current_score))]
        new_score_listing = {}
        for player_entry in new_scores:
            player_name = player_entry['player']
            player_score = int(player_entry['current_score'])
            new_score_listing[player_name] = player_score

            # Update Player object with current score
            self.players[self.players.index(player_name)].update_score(player_score)
        self.score_history.append(new_score_listing)


    def get_score_history(self) -> list[dict[str:int]]:
        return self.score_history

    def get_scores_at(self, round_num: int):
        return self.score_history[round_num]

    def get_current_score(self):
        return self.get_scores_at(-1)

    def get_dict(self):
        # this should return an output friendly to send to front end
        # first make it as a dictionary and we will convert
        score_bundle = {player.name:
                            {'image': player.img, 'current_score': player.current_score}
                        for player in self.players}
        return score_bundle

# Update Environment
def update_env(env_path, line_id, key_to_set, value_to_set):
    # my environment looks like
    if env_path == 'fulltask.env':
        # first load the environment that we need to change to get
        env_file = dotenv_values(env_path)
        line_to_change = env_file[line_id]

        task_name, vid_id, img_loc, contestant_tuple, description, note_tuple = line_to_change.split("^^")

        match key_to_set:
            case 'task_name':
                task_name = value_to_set
            case 'vid_id':
                vid_id = value_to_set
            case 'img_loc':
                img_loc = value_to_set
            case 'contestant_tuple':
                contestant_tuple = value_to_set
            case 'description':
                # primary reason for this function but left a lot of room
                description = value_to_set
            case 'note_tuple':
                note_tuple = value_to_set
            case _:
                print('No such key exists. try one of the following keys:')
                keys = ['task_name', 'vid_id', 'img_loc', 'contestant_tuple', 'description', 'note_tuple']
                print(keys)

        # we rebuild the string here
        rebuilt_str = task_name + '^^' + vid_id + '^^' + img_loc + '^^' + contestant_tuple + '^^' + description + '^^' + note_tuple
        set_key(env_path, key_to_set=line_id, value_to_set=rebuilt_str)

    elif env_path == 'clip_info.env':
        # first load the environment that we need to change to get
        env_file = dotenv_values(env_path)
        line_to_change = env_file[line_id]

        name, still, loc, description, info = line_to_change.split("^^")
        match key_to_set:
            case 'name':
                name = value_to_set
            case 'still':
                still = value_to_set
            case 'loc':
                loc = value_to_set
            case 'description':
                # primary reason for this function but left a lot of room
                description = value_to_set
            case 'info':
                info = value_to_set
            case _:
                print('No such key exists. try one of the following keys:')

        # we rebuild the string here
        rebuilt_str = name + '^^' + still + '^^' + loc + '^^' + description + '^^' + info
        set_key(env_path, key_to_set=line_id, value_to_set=rebuilt_str)

    elif env_path == 'player_info.env':
        pass
    else:
        print('Incorrect path stated. No .env file known by that name.')


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

        # Create the setup bundle
        ## score_display: send player info with player image locations
        d = shelve.open('scores')
        scores = d['scores']

        setup_bundle = {'scores': scores.get_dict(), 'fulltasks': 'tmp', 'clips': 'tmp'}
        socketio.emit('setup', setup_bundle, to='display')

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

        # Setup the clips
        env_clips = dotenv_values('clip_info.env')
        clips = []
        for clip in env_clips:
            clip_name, clip_still, clip_loc, clip_description, clip_info = env_clips[clip].split("^^")
            clips.append({'name': clip_name,
                          'still': clip_still,
                          'loc': clip_loc,
                          'description': clip_description,
                          'info': clip_info})

        # Setup for fulltasks
        env_fulltasks = dotenv_values('fulltask.env')
        fulltasks = []
        for task in env_fulltasks:
            task_name, vid_id, img_loc, contestant_tuple, description, note_tuple = env_fulltasks[task].split("^^")

            fulltasks.append({'task_name': task_name,
                              'vid_id': vid_id,
                              'img_loc': img_loc,
                              'contestant_tuple': contestant_tuple,
                              'description': description,
                              'note_tuple': note_tuple
                              })

        setup_bundle = {'scores': scores.get_dict(), 'fulltasks': fulltasks, 'clips': clips}
        socketio.emit('setup', setup_bundle, to='controller')

    else:
        print('Unknown connection')

# Control commands

@socketio.on('reset')
def reset():
    # This should reset all scores saved on shelf
    d = shelve.open('scores')

    del d['scores']

    # Return all score data to original setting
    # TODO: cleaner would have been to have player info and scores seperate here
    env_players = dotenv_values('player_info.env')
    players = []
    for player in env_players:
        player_name, player_img = env_players[player].split(", ")
        players.append(Player(player_name, player_img))

    scores = Scores(players)
    d['scores'] = scores

    d.close()

    socketio.emit('reset', to='display')

# Control -> Display
@socketio.on('display_scores')
def display_scores(scores):

    # update score history
    d = shelve.open('scores')

    score_hist = d['scores']
    score_hist.update(scores)
    d['scores'] = score_hist

    d.close()

    # send info to display to show the new score
    print("sending scores to diplay:")
    print(score_hist.get_score_history())
    socketio.emit('show_scores', score_hist.get_score_history())

@socketio.on('play_clip')
def play_clip(loc):
    socketio.emit('play_clip', loc, to='display')

@socketio.on('play_fulltask')
def play_fulltask(vid_id):
    socketio.emit('play_fulltask', vid_id, to='display')

@socketio.on('pause')
def pause_fulltask(vid_id):
    socketio.emit('pause', vid_id, to='display')

@socketio.on('update_environment')
def update_environment(update_info):
    ## update_env(env_path, line_id, key_to_set, value_to_set)
    update_env(update_info['env_path'], update_info['line_id'], update_info['key_to_set'], update_info['value_to_set'])

if __name__ == '__main__':
    # When using this do not use cmdline 'flask app run'
    socketio.run(app)
