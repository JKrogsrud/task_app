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

class Player_Animate {
    constructor(name, start_score, end_score, start_pos, end_pos) {
        this.name = name;
        this.start_score = start_score;
        this.end_score = end_score;
        this.start_pos = start_pos;
        this.end_pos = end_pos;

        this.total_movement = 20 * (this.end_pos - this.start_pos);

    };

    draw(progress) {
        // progress is from 0 to 1
        console.log(this.name);
        console.log(this.total_movement);
        return this.total_movement * progress + 'rem';
    };
};

class Score_Animate {
    constructor(players) {
        this.players = players;
    };

    draw_info(progress) {
        let all_movement = [];
        this.players.forEach((player) => {
            all_movement.push({'name': player.name, 'draw': player.draw(progress)});
        });
        return all_movement;
    };

};

// Helper function for animation
function animate({timing, draw, duration}) {

  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timing(timeFraction);

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    };

  });
};

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

    const score_container = document.createElement('div');
    score_container.classList.add('score_animation_container');

    let sorted_players_prev = [];
    for (var player in prev_scores) {
        sorted_players_prev.push([player, prev_scores[player]]);
    };

    sorted_players_prev.sort(function(a,b) {
        return a[1] - b[1];
    });

    let sorted_players_new = [];
    for (var player in new_scores) {
        sorted_players_new.push([player, prev_scores[player]]);
    };

    sorted_players_new.sort(function(a,b) {
        return a[1] - b[1];
    });

//    Both containers are now sorted as arrays [[name, score], ... ]

    for (let i = 0; i < sorted_players_prev.length; i++) {

        const player_div = document.createElement('div');
        const player_name = sorted_players_prev[i][0]
        player_div.classList.add('player');
        player_div.setAttribute('id', player_name);

        let player_image_location = sessionStorage.getItem(player_name);
        var player_image = document.createElement('img');
        player_image.src = './static/assets/images/' + player_image_location;

        var current_score = document.createElement('p');
        current_score.classList.add('current_score');
        // prev_scores is an object
        current_score.textContent = prev_scores[player_name];

        // Show scores
        player_div.appendChild(player_image);
        player_div.appendChild(current_score);

        score_container.appendChild(player_div);
    };

    body.appendChild(score_container);

    // The let's get it done way to follow:
    // I want an object for animation for each player
    // {name, start_score, end_score, start_pos, end_pos}
    // start and end _pos are the relative location
    let all_player_animates = [];

    for (let i = 0; i < sorted_players_prev.length; i++) {
        // sorted_players_prev[i][0] is the name
        const player_name = sorted_players_prev[i][0]
        const start_score = prev_scores[player_name];
        const end_score = new_scores[player_name];
        const start_pos = i;
        var end_pos = -1;
        // Loop through the sorted_players_new to find the new positions
        for (let j = 0; j < sorted_players_new.length; j++) {
            if (sorted_players_new[j][0] == player_name) {
                end_pos = j;
            };
        };

        const player_animate = new Player_Animate(player_name, start_score, end_score, start_pos, end_pos);
        all_player_animates.push(player_animate);
    };


    const score_animate = new Score_Animate(all_player_animates);

//    // now we animate
//    animate({
//        duration: 10000,
//        timing: function(timeFraction) {
//            return timeFraction;
//        },
//        draw: function(progress) {
//            let draw_info = score_animate.draw_info(progress);
//
//            draw_info.forEach((player_info) => {
//                let player_id = player_info['name'];
//                let player_movement = player_info['draw'];
//
//                let player_div = document.getElementById(player_id);
//
//                player_div.style.left = player_movement;
//
//            });
//        }
//    });
    // test animation

    for (let i= 0; i < 10; i++){
        console.log(typeof(i));
        let progress = i / 10;
        console.log(progress);
        next_frame = score_animate.draw_info(progress);
        console.log(next_frame);
        // This should be a number of pairs {name, draw_distance}
        next_frame.forEach((player_info) => {
            player_id = player_info['name'];
            player_movement = player_info['draw'];

            const player_div = document.getElementById(player_id);

            player_div.style.left = player_movement;

        })
    };

});