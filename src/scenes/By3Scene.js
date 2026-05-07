import BaseRoomScene from "./BaseRoomScene.js";
import Zombie from "../entities/Zombie.js";
import PlayerState from "../state/PlayerState.js";

export default class By3Scene extends BaseRoomScene {

    constructor() {
        super("By3Scene");
    }

    preload() {
        // Cargamos el fondo del último tramo del pasillo
        this.load.image("background_by3", "src/background/bg_by3.png");
    }

    create(data = {}) {
        // 1. FONDO
        this.add.image(400, 300, "background_by3").setDisplaySize(800, 600);

        // 2. SPAWN Y BASE
        const x = data.spawnX ?? 400;
        const y = data.spawnY ?? 300;
        this.createBase(x, y);

        this.player.hp = PlayerState.hp;
        
        // --- SEGURO DE ENTRADA ---
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // --- PUERTAS ---

        // 🚪 ABAJO: Volver a by2
        this.doorDown = this.add.rectangle(400, 580, 100, 15, 0x5555ff, 0.5);
        this.physics.add.existing(this.doorDown, true);
        this.physics.add.overlap(this.player.sprite, this.doorDown, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            this.player.sprite.body.enable = false;
            this.saveState();
            
            this.scene.start("By2Scene", { 
                spawnX: 400, 
                spawnY: 150 
            });
        });

        // 🚪 ÁNGULO SUPERIOR DERECHO: ¡ZONA DE ESCAPE!
        // Posición x: 730 (cerca del borde derecho), y: 40 (cerca del techo)
        this.doorEscape = this.add.rectangle(730, 40, 120, 40, 0xffff00, 0.8); 
        this.physics.add.existing(this.doorEscape, true);

        this.physics.add.overlap(this.player.sprite, this.doorEscape, () => {
            if (!this.canChangeRoom) return;
            this.canChangeRoom = false;
            
            // Inhabilitamos el cuerpo para evitar que se dispare dos veces
            this.player.sprite.body.enable = false;
            
            this.saveState();
            
            // Vamos a la escena final
            // Según tu mapa, apareces abajo a la izquierda en la EscapeScene
            this.scene.start("EscapeScene", { 
                spawnX: 100, 
                spawnY: 500 
            });
        });


                // --- PAREDES DE LA BY3 (Codo hacia el Escape) ---

        // 1. PARED IZQUIERDA (EXTRA ANCHA - Te empuja hacia la derecha)
        // x:150, w:300 -> Ocupa desde el borde 0 hasta el 300
        this.createWall(150, 300, 300, 600);

        // 2. PARED DERECHA (MENOS ANCHA)
        // x:760, w:80 -> Un bloque estándar para cerrar el lado derecho
        // Pero dejamos libre la parte de ARRIBA (y de 0 a 200) para la salida
        this.createWall(760, 400, 80, 400); 

        // 3. PARED SUPERIOR (NORMAL)
        // x:450, w:300 -> Bloquea el techo desde la pared izq hasta casi el final
        this.createWall(450, 30, 300, 60);
        // El hueco queda en el ángulo superior derecho (entre x:600 y x:800)

        // 4. PARED INFERIOR (Abierta abajo para venir de BY2)
        // Solo necesitamos cerrar el pedacito que queda a la derecha del pasillo central
        this.createWall(600, 570, 400, 60);
        // El hueco de entrada desde abajo queda alineado con el pasillo de BY2 (x:400 aprox)


        // 🧟 SPAWNER (Último esfuerzo antes del escape)
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => this.spawnZombie()
        });
    }

    spawnZombie() {
        const x = Phaser.Math.Between(150, 650);
        const y = Phaser.Math.Between(100, 500);
        // Aquí podrías meter más tanques para que el escape sea difícil
        const type = Phaser.Math.RND.pick(["tank", "fast", "normal"]);
        const zombie = new Zombie(this, x, y, type);
        this.zombies.add(zombie.sprite);
        zombie.sprite.ref = zombie;
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
