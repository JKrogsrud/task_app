var socket = io()

socket.on('connect', function() {
    socket.emit('connected', 'controller');
});

function goto_scores() {
    console.log("Go to scores");
    create_scores();
    socket.emit('goto_scores');
};

function goto_fulltasks() {
    console.log("Go to fulltasks");
    socket.emit('goto_fulltasks');
};

function goto_clips() {
    console.log("Go to clips");
    socket.emit('goto_clips');
};

function create_scores() {
    console.log("Creating scores screen");
    var scores = document.getElementById("scores");
    scores.hidden = false;
}