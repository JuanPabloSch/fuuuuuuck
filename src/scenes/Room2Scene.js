import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room2Scene extends BaseRoomScene {

    constructor() {
        super("Room2Scene");
    }

    create() {

        this.createBase(400, 300);

        // 💾 restaurar estado
        this.player.hp = PlayerState.hp;

        // 🚪 volver a Room1
        this.doorRight = this.add.rectangle(780, 300, 10, 60, 0xff0000);

        this.physics.add.existing(this.doorRight, true);

        this.physics.add.overlap(
            this.player.sprite,
            this.doorRight,
            () => {
                this.saveState();
                this.scene.start("Room1Scene");
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