
var socket = io();

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
    };
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
};

socket.on('connect', function() {
    socket.emit('connected', 'controller');
});

// Setup scores, full_episodes and clips
socket.on('setup', function(setup_bundle) {

    // Sanity Check
    console.log('received bundle');
    console.log(setup_bundle);

    // Let's build the score interface from the 'setup' portion
    let players = Object.keys(setup_bundle['scores']);
    let scores = setup_bundle['scores'];
    players.forEach((player) => {
        // Grab the img and current score
        let img = scores[player]['image'];
        let score = scores[player]['current_score'];

        // create a new div to hold everything
        const player_score_div = document.createElement("div");
        player_score_div.id = player;
        player_score_div.class = 'player_score';

        // add an image
        var image = document.createElement('img');
        image.src = './static/assets/images/' + img;
        // console.log(image.src);

        new_div.appendChild(image);

        // Next we create buttons that will specifically affect this player
        const button_span = document.createElement("span");
        button_span.class = 'score_adjustment_buttons';

        const negative_button = document.createElement("button");
        negative_button.class = 'negative_button';

        const positive_button = document.createElement("button");
        positive_button.class = 'positive_button';

        const score_display = document.createElement("p");
        score_display.class = 'score_display';


        // Now locate the scores div and append this
        var player_scores_div = document.getElementById('player_scores');
        player_scores_div.appendChild(player_score_div);
    });
});

// Update local scores
socket.on('scores', function(recent_scores) {
    set_local_scores(recent_scores);
});
