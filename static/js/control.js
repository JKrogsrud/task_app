
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
    } else if (toggle_to == 'full_tasks') {
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

// SETUP WHOLE PAGE
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
        image.src = './static/assets/images/players/' + img;
        // console.log(image.src);

        player_score_div.appendChild(image);

        // Next we create buttons that will specifically affect this player
        const button_span = document.createElement("div");
        button_span.classList.add("score_adjustment_buttons");

        const negative_button = document.createElement("button");
        negative_button.classList.add("negative_button");
        negative_button.textContent= '-'

        const positive_button = document.createElement("button");
        positive_button.classList.add('positive_button');
        positive_button.textContent = '+'

        const score_display = document.createElement("div");
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

        // Append score pieces to their div
        score_display.appendChild(current_score);
        score_display.appendChild(score_delta);

        // Append the buttons and displays to their div
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

    function makeEditable(element_to_be_editable, env_path, vid_id, key_to_set) {
        // Mouse over color change
        element_to_be_editable.addEventListener("mouseenter", (event) => {
            event.target.style.color = 'white';
        }, false);
        // Mouse leave color change
        element_to_be_editable.addEventListener("mouseleave", (event) => {
            event.target.style.color = ''; // Taken over by CSS
        }, false);

        // When clicked
        element_to_be_editable.addEventListener("click", () => {
            element_to_be_editable.hidden = true;

            // Container
            form_and_buttons = document.createElement('div');

            // create input field and button
            input_field = document.createElement('textarea');
            input_field.classList.add('edit');
            input_field.value = element_to_be_editable.textContent;

            // create two buttons
            // btn 1 commits changes done
            commit_btn = document.createElement('button');
            commit_btn.classList.add('commit');
            commit_btn.textContent = 'Commit';
            commit_btn.addEventListener('click', () => {
                // Change the task_name_p
                element_to_be_editable.textContent = input_field.value;
                element_to_be_editable.hidden = false;

                // Better way to pull this info?
                update_info = {'env_path': env_path, 'line_id': vid_id, 'key_to_set': key_to_set, 'value_to_set': input_field.value}
                socket.emit('update_environment', update_info);

                // remove field and buttons
                form_and_buttons.parentNode.removeChild(form_and_buttons);
            });

            // btn 2 cancels all changes
            cancel_btn = document.createElement('button');
            cancel_btn.classList.add('cancel');
            cancel_btn.textContent = 'Cancel';
            cancel_btn.addEventListener('click', () => {
                task_name_p.hidden = false;
                form_and_buttons.parentNode.removeChild(form_and_buttons);
            });

            btn_div = document.createElement('div');
            btn_div.classList.add('buttons');

            btn_div.appendChild(commit_btn);
            btn_div.appendChild(cancel_btn);

            form_and_buttons.appendChild(input_field);
            form_and_buttons.appendChild(btn_div);

            element_to_be_editable.parentNode.appendChild(form_and_buttons);
        });
    };

    // CLIPS
    clips = setup_bundle['clips'];

    var clips_container = document.getElementById('clips');

    clips.forEach((clip) => {
        // Pull the info so its readable
        let name = clip['name'];
        let still = clip['still'];
        let loc = clip['loc'];
        let description = clip['description'];
        let info = clip['info'];

        const clip_div = document.createElement("div");
        clip_div.id = name;
        clip_div.classList.add("clip");

        // add image_still
        const image_container_div = document.createElement('div');
        image_container_div.classList.add("image_container");
        var clip_image = document.createElement('img');
        clip_image.src = './static/assets/images/clips/' + still;

        image_container_div.appendChild(clip_image);

        // Add name of clip
        const name_div = document.createElement("div");
        name_div.classList.add("name");
        name_div.textContent = name;

        const name_div_container = document.createElement("div");
        name_div_container.appendChild(name_div);

        makeEditable(name_div, 'clip_info.env', loc, 'name');

        // Description
        const description_div = document.createElement("p");
        description_div.classList.add("description");
        description_div.textContent = description;

        const description_div_container = document.createElement("div");
        description_div_container.appendChild(description_div);

        makeEditable(description_div, 'clip_info.env', loc, 'description');

        // Info
        const info_div = document.createElement("p");
        info_div.classList.add("info");
        info_div.textContent = info;

        const info_div_container = document.createElement("div");
        info_div_container.appendChild(info_div);

        makeEditable(info_div, 'clip_info.env', loc, 'info');

        clip_div.appendChild(image_container_div);
        clip_div.appendChild(name_div_container);
        clip_div.appendChild(description_div_container);
        clip_div.appendChild(info_div_container);

        // Add event listeners for clicking image to start video
        image_container_div.addEventListener("click", function() {
            // what video do we play?
            socket.emit('play_clip', loc);
        });

        clips_container.appendChild(clip_div);
    });

    console.log("clips page setup");

    // FULLTASKS
    var fulltasks_div = document.getElementById('full_tasks');
    fulltasks = setup_bundle['fulltasks']

    fulltasks.forEach((task) => {
        // organize info so it's readable
        let task_name = task['task_name'];
        let vid_id = task['vid_id'];
        let img_loc = task['img_loc'];
        let contestant_array = task['contestant_tuple'].split(',');

        let description = task['description'];

        let note_array = task['note_tuple'].split(',');

        // create a div for the new video
        const task_div = document.createElement('div');
        task_div.classList.add('task');
        task_div.id = vid_id;

        // image_container, image, play/pause buttons
        const image_container = document.createElement('div');
        image_container.classList.add('image_container');

        // within container we put the image
        const image  = document.createElement('img');
        image.src = './static/assets/images/full_tasks/' + img_loc;
        image.classList.add('task_image');
        image_container.appendChild(image);

        // play / pause button
        // Unlike the name suggest this is still just a image
        const play_button = document.createElement('img');
        play_button.classList.add('play_button');
        play_button.src = './static/assets/images/full_tasks/play_button.png';

        image_container.appendChild(play_button);

        // We will make and overlay a pause button but keep it hidden
        const pause_button = document.createElement('img');
        pause_button.classList.add('pause_button');
        pause_button.src = './static/assets/images/full_tasks/pause_button.png';
        pause_button.hidden = true;

        // Add event listeners to both that switches visibility and emits video controls
        play_button.addEventListener("click", () => {
            // Switch visibility
            play_button.hidden = true;
            // emit message to backend
            socket.emit('play_fulltask', vid_id);
            // Switch visibility to pause
            pause_button.hidden = false;
        });

        pause_button.addEventListener("click", () => {
            // Switch visibility
            pause_button.hidden = true;
            // emit message to backend
            socket.emit('pause', vid_id);
            // Switch visibility to pause
            play_button.hidden = false;
        });

        image_container.appendChild(play_button);
        image_container.appendChild(pause_button);

        // Add imagine container to the fulltasks_div
        task_div.appendChild(image_container);

        // Task Name
        const task_name_p = document.createElement('p');
        // Container <- needed for placing the editable fields in same space
        const task_name_p_container = document.createElement('div');
        task_name_p_container.appendChild(task_name_p)

        task_name_p.classList.add("task_name");
        task_name_p.textContent = task_name;

        task_div.appendChild(task_name_p_container);

        makeEditable(task_name_p, 'fulltask.env', vid_id, 'task_name');

        // Contestants in clip
        // This should be a comma separated list
        let contestant_text = '';
        for (var i = 0; i < contestant_array.length; i++) {
            contestant_text = contestant_text + contestant_array[i] + ', ';
        };

        // remove the last comma
        contestant_text = contestant_text.slice(0, -2);

        const contestant_p = document.createElement('p');
        contestant_p.classList.add('contestants');
        contestant_p.textContent = contestant_text;

        task_div.appendChild(contestant_p);

        // Description
        const description_div = document.createElement('p');
        description_div.classList.add('description');
        description_div.textContent = description;

        const description_div_container = document.createElement('div');
        description_div_container.appendChild(description_div);

        task_div.appendChild(description_div_container);

        makeEditable(description_div, 'fulltask.env', vid_id, 'description');

        // Add Notes
        let bulleted_notes = document.createElement('ul');
        bulleted_notes.classList.add('all_notes');
        for (var i = 0; i < note_array.length; i++) {
            // Each note will be part of a bulleted list
            let note_text = note_array[i];
            const note_li = document.createElement('li');
            note_li.textContent = note_text;
            bulleted_notes.appendChild(note_li);
        };

        task_div.appendChild(bulleted_notes);

        fulltasks_div.appendChild(task_div);

    });

});

// Update local scores
socket.on('scores', function(recent_scores) {
    set_local_scores(recent_scores);
});
