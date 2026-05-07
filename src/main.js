import GameScene from "./scenes/BaseRoomScene.js";
import Room1Scene from "./scenes/Room1Scene.js";
import Room2Scene from "./scenes/Room2Scene.js";
import Room3Scene from "./scenes/Room3Scene.js";
import Room4Scene from "./scenes/Room4Scene.js";
import Room5Scene from "./scenes/Room5Scene.js";

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
    scene: [Room1Scene, Room2Scene, Room3Scene, Room4Scene, Room5Scene]
};

new Phaser.Game(config);