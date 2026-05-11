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
        this.load.image("palanca", "src/assets/ui/palanca.png");
        this.load.image("medikit", "src/assets/ui/medikit.png");
        super.preload();
    }

    create(data = {}) {
        this.add.image(400, 300, "background_r9").setDisplaySize(800, 600);
        this.createBase(data.spawnX ?? 100, data.spawnY ?? 180);
        this.spawnMedikit(680, 320); 
        this.autosave(); 

        // --- 0. CARGAR ESTADO GLOBAL ---
        this.puzzleSolved = PlayerState.room9PuzzleSolved;

       /// --- 1. PAREDES IZQUIERDAS AJUSTADAS ---

        // Pared Superior Izquierda: 
        // La situamos muy arriba para que solo tape la esquina.
        this.createWall(40, 60, 80, 120); 

        // Pared Inferior Izquierda:
        // La movemos para que empiece justo debajo de la puerta (180 + 50 de margen)
        // Posición Y: 415, Alto: 370 píxeles para cubrir hasta el suelo.
        this.createWall(40, 480, 80, 370); 

        // --- 3. PUERTA IZQUIERDA (Ajustada a 180) ---
        this.doorToR8 = this.add.rectangle(20, 180, 15, 120, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorToR8, true);
        this.physics.add.overlap(this.player.sprite, this.doorToR8, () => {
            this.saveState();
            this.scene.start("Room8Scene", { spawnX: 720, spawnY: 180 });
        });

                // --- 2. INTERRUPTORES (PALANCAS) ---
            this.switches = this.physics.add.staticGroup();
        [200, 400, 600].forEach((x, i) => {
            // Reemplazamos el rectangle por el sprite de palanca
            let sw = this.add.sprite(x, 85, "palanca").setScale(0.3).setInteractive();
            
            // Si ya estaba resuelto (al volver a la sala), la dejamos verde
            if (this.puzzleSolved) sw.setTint(0x00ff00);
            
            sw.id = i + 1;
            this.switches.add(sw);
            
            // Mantenemos tu colisión original
            this.physics.add.overlap(this.player.sprite, sw, () => this.handleSwitch(sw));
        });
        

        // --- 3. PUERTA IZQUIERDA (Vuelta a r8) ---
        // Cambiamos 300 por 180
        this.doorToR8 = this.add.rectangle(20, 180, 15, 100, 0x00ff00, 0.5); 
        this.physics.add.existing(this.doorToR8, true);
        this.physics.add.overlap(this.player.sprite, this.doorToR8, () => {
            this.saveState();
            // Importante: Al volver a Room8, asegúrate de que el spawnX/Y de la R8 
            // coincida con donde está esta puerta ahora.
            this.scene.start("Room8Scene", { spawnX: 720, spawnY: 180 }); 
        });

        // --- 4. ESCALERA A U2 ---
        const stairColor = this.puzzleSolved ? 0x00ffff : 0x555555;
        this.stairsU2 = this.add.rectangle(400, 340, 100, 60, stairColor, 0.8);
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
    if (this.puzzleSolved || sw.isPressed) return;
    
    sw.isPressed = true;

    if (sw.id === this.sequence[this.puzzleStep]) {
        // ✅ CAMBIADO: setTint en lugar de setFillStyle para que no crashee
        sw.setTint(0x00ff00); 
        
        this.puzzleStep++;
        if (this.puzzleStep === this.sequence.length) {
            this.resolverPuzzle();
        }
    } else {
        this.mostrarCartel("SECUENCIA INCORRECTA - REINICIANDO");
        this.puzzleStep = 0;
        
        // Limpiamos todas las palancas
        this.switches.getChildren().forEach(s => {
            s.isPressed = false;
            s.clearTint(); // ✅ CAMBIADO: clearTint en lugar de setFillStyle
        });
    }

    // Pequeño delay para que no se active 60 veces por segundo
    this.time.delayedCall(1000, () => {
        if (!this.puzzleSolved) sw.isPressed = false;
    });
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
