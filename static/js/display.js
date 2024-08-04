var socket = io()
var body = document.body

socket.on('connect', function() {
    socket.emit('connected', 'display');
});

socket.on('setup', function(setup_bundle) {
    // We need image locations stored in local storage
    // Some sanity checking:

    console.log('Setup:');
    console.log(setup_bundle);

    // Save images to localStorage
    let scores = setup_bundle['scores'];
    player_names = Object.keys(scores);
    for (let i = 0; i < player_names.length; i++) {
        console.log(player_names[i]);
        console.log(scores[player_names[i]]);
        // We store each image under the name of the contestant other info should be fine
        // and sent in another info bundle
        //TODO: A more modern approach would be serialization to JSON
        sessionStorage.setItem(player_names[i], scores[player_names[i]].image);
    };
});

socket.on('reset', function() {
    // The only data held by display is in the textContent of current_score class
    let scores = document.getElementsByClassName('current_score');

    Array.from(scores).forEach((score) => {
        score.textContent = 0;
    });
});

// FOR SCORES
socket.on('show_scores', function(score_bundle) {

    // Clear the display area
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    };

    console.log(score_bundle);
    // Come in as an Array[Object]
    // We only need last two entries
    let new_scores = score_bundle[score_bundle.length - 1];

    const score_container = document.createElement('div');
    score_container.classList.add('score_animation_container');

    let sorted_players_new = [];
    for (var player in new_scores) {
        sorted_players_new.push([player, new_scores[player]]);
    };

    sorted_players_new.sort(function(a,b) {
        return a[1] - b[1];
    });

//    Both containers are now sorted as arrays [[name, score], ... ]

    for (let i = 0; i < sorted_players_new.length; i++) {

        const player_div = document.createElement('div');
        const player_name = sorted_players_new[i][0]
        player_div.classList.add('player');
        player_div.setAttribute('id', player_name);

        let player_image_location = sessionStorage.getItem(player_name);
        var player_image = document.createElement('img');
        player_image.src = './static/assets/images/players/' + player_image_location;

        var current_score = document.createElement('p');
        current_score.classList.add('current_score');
        // prev_scores is an object
        current_score.textContent = new_scores[player_name];

        // Show scores
        player_div.appendChild(player_image);
        player_div.appendChild(current_score);

        score_container.appendChild(player_div);
    };

    body.appendChild(score_container);
});

// CLIPS

socket.on('play_clip', function(loc) {

   // Clear the display area
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    };

    // create a new multimedia div
    let vid = document.createElement('video');
    vid.autoplay = true;
    let source = document.createElement('source');
    source.src = './static/assets/videos/clips/' + loc;
    source.type = 'video/mp4';

    vid.appendChild(source);
    body.appendChild(vid);



});