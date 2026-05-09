import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class Room6Scene extends BaseRoomScene {
    constructor() {
        super("Room6Scene");
        this.puzzleStep = 0;
        this.sequence = [2, 1, 3]; // Secuencia: Central, Izquierdo, Derecho
        this.puzzleSolved = false;
    }

    preload() {
        this.load.image("background_room6", "src/background/bg_room6.png");
        this.load.image("icon_llave_este", "src/assets/ui/icon_llave_este.png");
    }

    create(data = {}) {
        // 1. Fondo (Tono azulado)
        this.add.image(400, 300, "background_room6").setDisplaySize(800, 600).setTint(0x8888ff);
        
        // Apareces a la derecha porque venís de la Room 5 (que está al este de esta sala)
        this.createBase(data.spawnX ?? 700, data.spawnY ?? 300);

        // 2. PAREDES PERIMETRALES
        this.createWall(400, 40, 800, 80);  // Norte
        this.createWall(400, 560, 800, 80); // Sur
        this.createWall(40, 300, 80, 600);  // Izquierda (Cerrada)
        this.createWall(760, 110, 80, 220); // Derecha arriba
        this.createWall(760, 490, 80, 220); // Derecha abajo

        // 3. INTERRUPTORES (En la pared norte)
        this.switches = this.physics.add.staticGroup();
        [200, 400, 600].forEach((x, i) => {
            let sw = this.add.rectangle(x, 90, 40, 40, 0x555555).setInteractive();
            sw.id = i + 1;
            this.switches.add(sw);
            this.physics.add.overlap(this.player.sprite, sw, () => this.handleSwitch(sw));
        });

        // 4. EL PICKUP (Ahora cerca de la pared IZQUIERDA)
        if (!PlayerState.inventory.includes("llave_este")) {
            // Vitrina en el lado izquierdo (x: 150)
            this.vitrina = this.add.rectangle(150, 300, 60, 60, 0xffffff, 0.2).setStrokeStyle(2, 0xffffff);
            
            this.item = this.physics.add.sprite(150, 300, "icon_llave_este");
            this.item.setScale(0.6).setAlpha(0.5); 
            this.item.setActive(false);
        }

        // --- DENTRO DEL CREATE DE Room6Scene.js ---

        // 1. Aseguramos que el cambio de sala esté habilitado
        this.canChangeRoom = false;
        this.time.delayedCall(500, () => {
            this.canChangeRoom = true;
        });

        // 2. PUERTA A LA DERECHA (Regreso a Room 5)
        // La movimos un poquito más a la derecha (790) y la hicimos más ancha para que sea fácil de tocar
        this.doorBack = this.add.rectangle(790, 300, 20, 120, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorBack, true);

        this.physics.add.overlap(this.player.sprite, this.doorBack, () => {
            // Si el seguro está activo y el puzzle (opcional) permite pasar
            if (this.canChangeRoom) {
                this.canChangeRoom = false; // Bloqueamos para que no se dispare mil veces
                this.saveState();
                
                // Volvemos a la Room 5 apareciendo a la IZQUIERDA de esa sala
                this.scene.start("Room5Scene", { spawnX: 100, spawnY: 300 });
            }
        });


        this.mostrarCartel("SALA DE SEGURIDAD: Terminales vinculados al ala este.");
    }

    handleSwitch(sw) {
        if (this.puzzleSolved || sw.isPressed) return;
        sw.isPressed = true;

        if (sw.id === this.sequence[this.puzzleStep]) {
            sw.setFillStyle(0x00ff00);
            this.puzzleStep++;
            if (this.puzzleStep === this.sequence.length) this.resolverPuzzle();
        } else {
            this.mostrarCartel("ERROR EN LA SECUENCIA - REINICIANDO");
            this.puzzleStep = 0;
            this.switches.getChildren().forEach(s => {
                s.setFillStyle(0x555555);
                s.isPressed = false;
            });
        }
        this.time.delayedCall(1000, () => { if(!this.puzzleSolved) sw.isPressed = false; });
    }

    resolverPuzzle() {
        this.puzzleSolved = true;
        this.mostrarCartel("VITRINA DESBLOQUEADA");
        this.cameras.main.flash(500, 0, 255, 0);
        if (this.vitrina) this.vitrina.destroy();
        
        this.item.setAlpha(1);
        this.item.setActive(true);
        
        this.physics.add.overlap(this.player.sprite, this.item, () => {
            PlayerState.inventory.push("llave_este");
            this.mostrarCartel("HAS OBTENIDO: LLAVE ALA ESTE");
            this.item.destroy();
        });
    }

    update(time, delta) {
        this.updateBase(time, delta);
    }
}
