import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room9Scene extends BaseRoomScene {
    constructor() {
        super("Room9Scene");
        this.puzzleStep = 0;
        this.sequence = [2, 1, 3]; // Secuencia para activar
        this.puzzleSolved = false;
    }

    preload() {
        this.load.image("background_r9", "src/background/bg_r9.png");
        this.load.spritesheet("zombie_crawler", "src/assets/sucker.png", { frameWidth: 199, frameHeight: 282 });
    }

    create(data = {}) {
        this.add.image(400, 300, "background_r9").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 100, data.spawnY ?? 300);

        // --- 0. CARGAR ESTADO GLOBAL ---
        this.puzzleSolved = PlayerState.room9PuzzleSolved;

        // --- 1. PAREDES (Diseño de C/U invertida) ---
        this.createWall(400, 40, 800, 80); // Superior
        this.createWall(400, 560, 800, 80); // Inferior
        this.createWall(760, 300, 80, 600); // Derecha sólida
        this.createWall(40, 110, 80, 220); // Izq arriba
        this.createWall(40, 490, 80, 220); // Izq abajo

        this.createWall(400, 230, 180, 40); // Techo de la U
        this.createWall(310, 300, 40, 150); // Pared Izquierda de la U
        this.createWall(490, 300, 40, 150); // Pared Derecha de la U

        // --- 2. INTERRUPTORES ---
        this.switches = this.physics.add.staticGroup();
        [200, 400, 600].forEach((x, i) => {
            // Si ya está resuelto, los pintamos de verde
            const color = this.puzzleSolved ? 0x00ff00 : 0x555555;
            let sw = this.add.rectangle(x, 85, 40, 40, color).setInteractive();
            sw.id = i + 1;
            this.switches.add(sw);
            this.physics.add.overlap(this.player.sprite, sw, () => this.handleSwitch(sw));
        });

        // --- 3. PUERTA IZQUIERDA (Vuelta a r8) ---
        this.doorToR8 = this.add.rectangle(20, 300, 15, 100, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorToR8, true);
        this.physics.add.overlap(this.player.sprite, this.doorToR8, () => {
            this.saveState();
            this.scene.start("Room8Scene", { spawnX: 720, spawnY: 300 });
        });

        // --- 4. ESCALERA A U2 ---
        const stairColor = this.puzzleSolved ? 0x00ffff : 0x555555;
        this.stairsU2 = this.add.rectangle(400, 290, 60, 40, stairColor, 0.8);
        this.physics.add.existing(this.stairsU2, true);
        this.physics.add.overlap(this.player.sprite, this.stairsU2, () => {
            if (this.puzzleSolved) {
                this.saveState();
                this.scene.start("U2Scene", { spawnX: 400, spawnY: 100 });
            } else {
                this.mostrarCartel("La escalera está bloqueada por un cierre hidráulico.");
            }
        });

        // Si no está resuelto, mostrar cartel de inicio; si sí, activar horda
        if (!this.puzzleSolved) {
            this.mostrarCartel("Terminal de seguridad activa.");
        } else {
            this.activarHorda();
        }
    }

    handleSwitch(sw) {
        if (sw.isPressed || this.puzzleSolved) return;
        sw.isPressed = true;

        if (sw.id === this.sequence[this.puzzleStep]) {
            sw.setFillStyle(0x00ff00);
            this.puzzleStep++;
            if (this.puzzleStep === this.sequence.length) this.resolverPuzzle();
        } else {
            this.mostrarCartel("Secuencia incorrecta. Reiniciando terminal...");
            this.puzzleStep = 0;
            this.switches.getChildren().forEach(s => { s.setFillStyle(0x555555); s.isPressed = false; });
        }
        this.time.delayedCall(1000, () => { sw.isPressed = false; });
    }

    resolverPuzzle() {
        this.puzzleSolved = true;
        PlayerState.room9PuzzleSolved = true; // Guardamos en el estado global
        this.mostrarCartel("¡Cierre hidráulico abierto!");
        this.stairsU2.setFillStyle(0x00ffff);
        this.activarHorda();
    }

    activarHorda() {
        if (this.hordaEvent) return;
        this.hordaEvent = this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                if (this.zombies.children.entries.length < 5) {
                    const z = new Zombie(this, Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), "crawler");
                    this.zombies.add(z.sprite);
                    z.sprite.ref = z;
                }
            }
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
