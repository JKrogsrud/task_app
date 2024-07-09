import Player from './player.js'

var socket = io()

socket.on('connect', function() {
    socket.emit('connected', 'controller');
});

// Setup scores, full_episodes and clips
socket.on('setup', function(setup_bundle) {
    console.log('received bundle');
    console.log(setup_bundle);
});

socket.on('scores', set_local_scores(recent_scores));

function toggle_view(toggle_to) {
    console.log("Changing View: " + toggle_to);

    var scores_div = document.getElementById('scores');
    var fulltasks_div = document.getElementById('full_tasks');
    var clips_div = document.getElementById('clips');

    if (toggle_to == 'scores') {
        scores_div.hidden = false;
        fulltasks_div.hidden = true;
        clips_div.hidden = true;
    } else if (toggle_to == 'fulltasks') {
        scores_div.hidden = true;
        fulltasks_div.hidden = false;
        clips_div.hidden = true;
    } else if (toggle_to == 'clips') {
        scores_div.hidden = true;
        fulltasks_div.hidden = true;
        clips_div.hidden = false;
    } else {
        console.log('well that is not expected');
    }
};

function open_display() {
    window.open('display');
};

// Set the current scores, reset the delta_scores to 0
function set_local_scores(scores) {
    console.log('setting local scores, resetting deltas');
    // Scores should look something like Scores[Player:score]
};

// Changes scores only on current page
// By setting the
function update_local_scores(scores) {
    console.log('Updating Scores...');
};

// Send scores to be displayed
function send_scores() {
    console.log('Sending Scores');
    socket.emit('display_scores', scores);
}
