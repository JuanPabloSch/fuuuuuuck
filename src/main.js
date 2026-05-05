import GameScene from "./scenes/GameScene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#1a1a1a",
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [GameScene]
};

new Phaser.Game(config);