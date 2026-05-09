import BaseRoomScene from "./BaseRoomScene.js";
import PlayerState from "../state/PlayerState.js";

export default class Room6Scene extends BaseRoomScene {
    constructor() {
        super("Room6Scene");
        this.puzzleStep = 0;
        this.sequence = [2, 1, 3]; 
        this.puzzleSolved = false;
    }

    preload() {
        this.load.image("background_room6", "src/background/bg_room6.png");
        this.load.image("icon_llave_este", "src/assets/ui/icon_llave_este.png");
        // Cargamos la palanca
        this.load.image("palanca", "src/assets/ui/palanca.png");
    }

    create(data = {}) {
        this.add.image(400, 300, "background_room6").setDisplaySize(800, 600).setTint(0x8888ff);
        this.createBase(data.spawnX ?? 700, data.spawnY ?? 300);

        this.createWall(400, 40, 800, 80);  
        this.createWall(400, 560, 800, 80); 
        this.createWall(40, 300, 80, 600);  
        this.createWall(760, 110, 80, 220); 
        this.createWall(760, 490, 80, 220); 

        // --- 🕹️ INTERRUPTORES (REEMPLAZADOS POR PALANCAS) ---
        this.switches = this.physics.add.staticGroup();
        [200, 400, 600].forEach((x, i) => {
            // Usamos el sprite de palanca en vez del rectángulo
            let sw = this.add.sprite(x, 90, "palanca").setScale(0.5).setInteractive();
            sw.id = i + 1;
            this.switches.add(sw);
            this.physics.add.overlap(this.player.sprite, sw, () => this.handleSwitch(sw));
        });

        if (!PlayerState.inventory.includes("llave_este")) {
            this.vitrina = this.add.rectangle(150, 300, 60, 60, 0xffffff, 0.2).setStrokeStyle(2, 0xffffff);
            this.item = this.physics.add.sprite(150, 300, "icon_llave_este");
            this.item.setScale(0.6).setAlpha(0.5); 
            this.item.setActive(false);
        }

        this.canChangeRoom = false;
        this.time.delayedCall(500, () => { this.canChangeRoom = true; });

        this.doorBack = this.add.rectangle(790, 300, 20, 120, 0x00ff00, 0.5);
        this.physics.add.existing(this.doorBack, true);

        this.physics.add.overlap(this.player.sprite, this.doorBack, () => {
            if (this.canChangeRoom) {
                this.canChangeRoom = false; 
                this.saveState();
                this.scene.start("Room5Scene", { spawnX: 100, spawnY: 300 });
            }
        });

        this.mostrarCartel("SALA DE SEGURIDAD: Terminales vinculados al ala este.");
    }

    handleSwitch(sw) {
        if (this.puzzleSolved || sw.isPressed) return;
        sw.isPressed = true;

        if (sw.id === this.sequence[this.puzzleStep]) {
            // ✅ IMPORTANTE: Usamos setTint para imágenes, no setFillStyle
            sw.setTint(0x00ff00); 
            this.puzzleStep++;
            if (this.puzzleStep === this.sequence.length) this.resolverPuzzle();
        } else {
            this.mostrarCartel("ERROR EN LA SECUENCIA - REINICIANDO");
            this.puzzleStep = 0;
            this.switches.getChildren().forEach(s => {
                s.clearTint(); // ✅ Limpiamos el color de la imagen
                s.isPressed = false;
            });
        }
        this.time.delayedCall(1000, () => { if(!this.puzzleSolved) sw.isPressed = false; });
    }

    resolverPuzzle() {
        this.puzzleSolved = true;
        this.mostrarCartel("VITRINA DESBLOQUEADA");
        this.cameras.main.flash(500, 0, 255, 0);
        
        // Ponemos todas las palancas en verde brillante
        this.switches.getChildren().forEach(s => s.setTint(0x00ff00));

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
