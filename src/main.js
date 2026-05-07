import GameScene from "./scenes/BaseRoomScene.js";
import Room1Scene from "./scenes/Room1Scene.js";
import Room2Scene from "./scenes/Room2Scene.js";
import Room3Scene from "./scenes/Room3Scene.js";
import Room4Scene from "./scenes/Room4Scene.js";
import Room5Scene from "./scenes/Room5Scene.js";
import UndergroundScene from './scenes/UndergroundScene.js';
import Room6Scene from "./scenes/Room6Scene.js";
import In1Scene from './scenes/In1Scene.js';
import In2Scene from './scenes/In2Scene.js';
import RTopScene from './scenes/RTopScene.js';
import Room7Scene from "./scenes/Room7Scene.js";
import Room8Scene from "./scenes/Room8Scene.js";
import Room9Scene from "./scenes/Room9Scene.js";
import U2Scene from "./scenes/U2Scene.js";
import U3Scene from "./scenes/U3Scene.js";

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
    scene: [Room1Scene, Room2Scene, Room3Scene, Room4Scene, Room5Scene, UndergroundScene, 
        Room6Scene, In1Scene, In2Scene, RTopScene, Room7Scene, Room8Scene, Room9Scene, 
        U2Scene, U3Scene]
};

new Phaser.Game(config);