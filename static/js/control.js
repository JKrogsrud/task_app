
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

// Send scores to be displayed
function send_scores() {
    // Acquire the current scores

    var scores = new Array();

    const current_scores = document.querySelectorAll(".current_score");

    current_scores.forEach((score) => {
        // grab actual score
        let current_score = score.textContent;

        // Find the player
        let player_id = score.closest(".player_score").id;

        // Add the player id and score to scores
        console.log(player_id);
        console.log(current_score);
        scores.push({"player" : player_id, "current_score" : current_score});
    });

    // Emit them to the backend
    console.log('Sending Scores');
    socket.emit('display_scores', scores);

    // Update score_deltas to 0
    const score_deltas = document.querySelectorAll(".score_delta");
    score_deltas.forEach((delta) => {
        // set at 0
        delta.textContent = 0;
    });
};

// This should emit the signal to backend to reset the scores
function reset_scores() {
    console.log('Resetting scores');
    let current_scores = document.getElementsByClassName('current_score');

    Array.from(current_scores).forEach((score) => {
       score.textContent = 0;
    });

    let score_deltas = document.getElementsByClassName('score_delta');

    Array.from(score_deltas).forEach((delta) => {
       delta.textContent = 0;
    });

    socket.emit('reset')
}

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
        player_score_div.classList.add("player_score");

        // add an image
        var image = document.createElement('img');
        image.src = './static/assets/images/' + img;
        // console.log(image.src);

        player_score_div.appendChild(image);

        // Next we create buttons that will specifically affect this player
        const button_span = document.createElement("span");
        button_span.classList.add("score_adjustment_buttons");

        const negative_button = document.createElement("button");
        negative_button.classList.add("negative_button");
        negative_button.textContent= '-'

        const positive_button = document.createElement("button");
        positive_button.classList.add = 'positive_button';
        positive_button.textContent = '+'

        const score_display = document.createElement("span");
        score_display.classList.add("score_display");

        const current_score = document.createElement("p");
        current_score.classList.add("current_score");
        current_score.textContent = score;

        const score_delta = document.createElement("p");
        score_delta.classList.add("score_delta");
        score_delta.textContent = 0;

        // Add some event listeners to these buttons
        negative_button.addEventListener("click", function() {
           current_score.textContent -= 1;
           score_delta.textContent -= 1;
        });

        // Add some event listeners to these buttons
        positive_button.addEventListener("click", function() {
           current_score.textContent = parseInt(current_score.textContent) + 1;
           score_delta.textContent = parseInt(score_delta.textContent) + 1;
        });

        // Append score pieces to their span
        score_display.appendChild(current_score);
        score_display.appendChild(score_delta);

        // Append the buttons and displays to their span
        button_span.appendChild(negative_button);
        button_span.appendChild(score_display);
        button_span.appendChild(positive_button);

        // Append the buttons to the player_scores_div
        player_score_div.appendChild(button_span);

        // Now locate the scores div and append this
        var player_scores_div = document.getElementById('player_scores');
        player_scores_div.appendChild(player_score_div);
    });

    console.log("Scores page setup");
});

// Update local scores
socket.on('scores', function(recent_scores) {
    set_local_scores(recent_scores);
});
