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

socket.on('show_score_animation', function(score_bundle) {

    // Clear the display area
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    };

    console.log(score_bundle);
    // Come in as an Array[Object]
    // We only need last two entries
    let prev_scores = score_bundle[score_bundle.length - 2];
    let new_scores = score_bundle[score_bundle.length - 1];

    const score_container = document.createElement('span');
    score_container.classList.add('score_container');

    for (const player in new_scores) {
//        console.log(`${player}: ${new_scores[player]}`);
//        console.log('image:');
//        console.log(`${sessionStorage.getItem(player)}`);
        // can i just show image?

        const player_div = document.createElement('div');
        player_div.classList.add('player');

        let player_image_location = sessionStorage.getItem(player);
        var player_image = document.createElement('img');
        player_image.src = './static/assets/images/' + player_image_location;

        var current_score = document.createElement('p');
        current_score.classList.add('current_score');
        current_score.textContent = new_scores[player];

        // Show scores
        player_div.appendChild(player_image);
        player_div.appendChild(current_score);

        score_container.appendChild(player_div)
    };

    body.append(score_container);

});