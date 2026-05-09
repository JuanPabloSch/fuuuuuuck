import PlayerState from "../state/PlayerState.js";

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super("PauseScene");
    }

    preload() {
        // --- CARGA DE IMÁGENES ---
        this.load.image("mapa", "src/assets/ui/mapa_completo.png");
        this.load.image("portrait", "src/assets/ui/portrait.png");
        
        // Armas
        this.load.image("icon_pistol", "src/assets/ui/icon_pistol.png");
        this.load.image("icon_shotgun", "src/assets/ui/icon_shotgun.png");
        this.load.image("icon_rifle", "src/assets/ui/icon_rifle.png");
        this.load.image("icon_rocket", "src/assets/ui/icon_rocket.png");

        // Llaves (Asegurate que los nombres coincidan con el inventario)
        this.load.image("icon_llave_norte", "src/assets/ui/icon_llave_norte.png");
        this.load.image("icon_west_key", "src/assets/ui/icon_west_key.png");
        this.load.image("icon_llave_este", "src/assets/ui/icon_llave_este.png");
        this.load.image("icon_backyard_key", "src/assets/ui/icon_backyard_key.png");
        this.load.image("icon_llave_moto", "src/assets/ui/icon_llave_moto.png");
    }

    create() {
        // 1. FONDO
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);

        // 2. RETRATO Y SALUD (EKG)
        this.add.image(100, 100, "portrait").setScale(1);
        const colorEKG = PlayerState.hp > 60 ? 0x00ff00 : (PlayerState.hp > 30 ? 0xffff00 : 0xff0000);
        
        let ekg = this.add.graphics();
        ekg.lineStyle(3, colorEKG, 1);
        ekg.beginPath();
        for(let i = 0; i < 12; i++) {
            ekg.lineTo(200 + (i * 15), 100 + (i % 2 === 0 ? -15 : 15));
        }
        ekg.strokePath();

        // 3. MAPA (Abajo a la izquierda)
        this.add.text(50, 220, "MAPA ESTRATÉGICO", { fontSize: '18px', fill: '#00ff00' });
        this.add.image(210, 400, "mapa").setDisplaySize(350, 250);

        // 4. ARMAMENTO (Columna Central)
        this.add.text(450, 40, "EQUIPAMIENTO", { fontSize: '18px', fill: '#00ff00' });
        let yArma = 80;
        Object.keys(PlayerState.weapons).forEach(w => {
            if (PlayerState.weapons[w]) {
                this.add.image(480, yArma, `icon_${w}`).setScale(0.6);
                let colorText = PlayerState.activeWeapon === w ? '#00ffff' : '#ffffff';
                this.add.text(520, yArma - 10, w.toUpperCase(), { fontSize: '14px', fill: colorText });
                yArma += 45;
            }
        });

        // 5. LLAVES DINÁMICAS (Columna Derecha)
        this.add.text(650, 40, "OBJETOS", { fontSize: '18px', fill: '#00ff00' });
        PlayerState.inventory.forEach((item, i) => {
            let yItem = 80 + (i * 50);
            this.add.image(680, yItem, `icon_${item}`).setScale(0.5);
            this.add.text(710, yItem - 10, item.replace(/_/g, ' ').toUpperCase(), { fontSize: '11px', fill: '#ffffff' });
        });

        // 6. EL CÓDIGO (Pie de página)
        if (PlayerState.vistoNotaEscape) {
            this.add.text(600, 540, `CÓDIGO SÓTANO:\n${PlayerState.safeCode}`, { 
                fontSize: '22px', fill: '#00ffff', align: 'center', fontWeight: 'bold' 
            }).setOrigin(0.5);
        }

        // SALIDA
        this.input.keyboard.on('keydown-ESC', () => this.resume());
        this.input.keyboard.on('keydown-P', () => this.resume());
    }

    resume() {
        this.scene.resume(this.scene.settings.data.fromScene);
        this.scene.stop();
    }
}
