import GameScene from "./scenes/BaseRoomScene.js";
import Room1Scene from "./scenes/Room1Scene.js";
import Room2Scene from "./scenes/Room2Scene.js";

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
    scene: [Room1Scene, Room2Scene]
};

new Phaser.Game(config);