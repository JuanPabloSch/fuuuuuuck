import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class Room2Scene extends BaseRoomScene {
    constructor() {
        super("Room2Scene");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_key").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 400, data.spawnY ?? 300);
        this.canChangeRoom = PlayerState.room2TrapDone; 
        this.physics.add.collider(this.zombies, this.zombies);
        this.player.hp = PlayerState.hp;

        // --- PAREDES (Mantenemos tus medidas) ---
        this.createWall(80, 80, 160, 160); this.createWall(720, 80, 160, 160);
        this.createWall(80, 520, 160, 160); this.createWall(720, 520, 160, 160);
        this.createWall(40, 300, 80, 600);
        this.createWall(400, 560, 800, 80);
        this.createWall(220, 40, 120, 80); this.createWall(580, 40, 120, 80); 
        this.createWall(760, 190, 80, 100); this.createWall(760, 410, 80, 100);

        // --- LÓGICA DE LA TRAMPA ---
        this.canChangeRoom = PlayerState.room2TrapDone; // Si ya se hizo, se puede salir

        // 🔘 BOTÓN (Solo si la trampa NO se hizo)
        if (!PlayerState.room2TrapDone) {
            // Un cuadrado pequeño en la pared izquierda
            this.btnAction = this.add.rectangle(120, 300, 30, 30, 0xffff00);
            this.physics.add.existing(this.btnAction, true);
            
            this.trapActive = false;

            this.physics.add.overlap(this.player.sprite, this.btnAction, () => {
                if (this.trapActive) return;
                this.trapActive = true;
                this.startTrap();
                this.btnAction.destroy(); // Desaparece al tocarlo
            });
        }

        // --- PUERTAS ---
        this.doorRight = this.add.rectangle(780, 300, 10, 100, PlayerState.room2TrapDone ? 0x00ff00 : 0xff0000);
        this.physics.add.existing(this.doorRight, true);
        this.physics.add.overlap(this.player.sprite, this.doorRight, () => {
            if (!this.canChangeRoom) return this.mostrarCartel("Puertas selladas por seguridad");
            this.canChangeRoom = false;
            this.saveState();
            this.scene.start("Room1Scene", { spawnX: 100, spawnY: 300 });
        });

                // --- PUERTA HACIA ROOM 3 (PATIO) ---
        this.doorUp = this.add.rectangle(370, 20, 80, 10, PlayerState.room2TrapDone ? 0x00ff00 : 0xff0000);
        this.physics.add.existing(this.doorUp, true);
        
        this.physics.add.overlap(this.player.sprite, this.doorUp, () => {
            // Verificamos si la trampa terminó y si no estamos ya cambiando de sala
            if (!this.canChangeRoom) {
                return this.mostrarCartel("Puertas selladas por seguridad");
            }
            
            this.canChangeRoom = false; // Bloqueamos para evitar doble ejecución
            this.saveState();
            
            // Cambiamos a Room3Scene y aparecemos lejos de la puerta de abajo
            this.scene.start("Room3Scene", { spawnX: 400, spawnY: 500 });
        });

    }

        startTrap() {
        // 1. Crear el cartel de LOCKDOWN
        const lockdownText = this.add.text(400, 250, "LOCKDOWN", {
            fontSize: "64px",
            fill: "#ff0000",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(1000);

        // Hacer que el cartel parpadee
        this.tweens.add({
            targets: lockdownText,
            alpha: 0.2,
            duration: 500,
            yoyo: true,
            loop: -1
        });

        // 2. Crear el contador de segundos
        let timeLeft = 2;
        const timerText = this.add.text(400, 320, timeLeft, {
            fontSize: "48px",
            fill: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1000);

        // 3. Evento que resta cada segundo
        const countdownEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timeLeft--;
                timerText.setText(timeLeft);

                if (timeLeft <= 0) {
                    countdownEvent.remove();
                    lockdownText.destroy();
                    timerText.destroy();
                    
                    // Mostramos un mensaje rápido de éxito
                    const clearText = this.add.text(400, 300, "SYSTEM RESTORED", {
                        fontSize: "40px",
                        fill: "#00ff00"
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => clearText.destroy());

                    // Lógica original para abrir puertas
                    PlayerState.room2TrapDone = true;
                    this.canChangeRoom = true;
                    this.doorRight.setFillStyle(0x00ff00);
                    this.doorUp.setFillStyle(0x00ff00);
                    this.zombieTimer.remove();
                }
            },
            loop: true
        });

        // 4. Spawner masivo (lo que ya tenías)
        this.zombieTimer = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.spawnZombie("normal") 
        });
    }


    spawnZombie(type = "normal") {
        // No spawnear si la trampa no está activa y no se ha hecho
        if (!this.trapActive && !PlayerState.room2TrapDone) return;

        let x, y;
        // Aparecen desde los bordes para que no te caigan encima
        if (Phaser.Math.Between(0, 1) === 0) {
            x = Phaser.Math.RND.pick([100, 700]);
            y = Phaser.Math.Between(100, 500);
        } else {
            x = Phaser.Math.Between(100, 700);
            y = Phaser.Math.RND.pick([100, 500]);
        }

        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
