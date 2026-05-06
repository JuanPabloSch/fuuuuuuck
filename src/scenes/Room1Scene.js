import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";

export default class Room1Scene extends BaseRoomScene {

    constructor() {
        super("Room1Scene");
    }

    create() {

        this.createBase(400, 300);

        // 🚪 puerta a Room2
        this.doorLeft = this.add.rectangle(20, 300, 10, 60, 0x00ff00);

        this.physics.add.existing(this.doorLeft, true);

        this.physics.add.overlap(
            this.player.sprite,
            this.doorLeft,
            () => {
                this.saveState();
                this.scene.start("Room2Scene");
            }
        );

        // 🧟 spawn
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {

        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);

        const zombie = new Zombie(this, x, y, "normal");
        this.zombies.push(zombie);
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}