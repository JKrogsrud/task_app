export default class Player {
    name;
    image;
    score;
    constructor(playerName, playerImage, playerScore) {
        this.name = playerName;
        this.image = playerImage;

        if (playerScore === undefined) {
            this.score = 0;
        }
        else {
            this.score = playerScore;
        };
    }

    update(score_delta) {
        this.score += score_delta;
    }
};