export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Cargamos los fondos de las pantallas adicionales
        this.load.image("menu_bg", "src/background/menu_principal.png"); // Un fondo para tu menú
        this.load.image("controles_bg", "src/background/controles.png");
        this.load.image("creditos_bg", "src/background/creditos.png");
    }

    create() {
        // 1. Fondo del Menú
        this.add.image(400, 300, "menu_bg").setDisplaySize(800, 600);

        // --- BOTONES ---

        // BOTÓN INICIAR
        const btnIniciar = this.crearBoton(400, 400, "INICIAR JUEGO");
        btnIniciar.on("pointerdown", () => {
            this.scene.start("IntroScene"); // O la escena donde empiece tu index
        });

        // BOTÓN CONTROLES
        const btnControles = this.crearBoton(400, 460, "CONTROLES");
        btnControles.on("pointerdown", () => {
            this.mostrarPantallaAdicional("controles_bg");
        });

        // BOTÓN CRÉDITOS
        const btnCreditos = this.crearBoton(400, 570, "CRÉDITOS");
        btnCreditos.on("pointerdown", () => {
            this.mostrarPantallaAdicional("creditos_bg");
        });
    }

    // Función auxiliar para crear botones de texto interactivos
    crearBoton(x, y, texto) {
        const boton = this.add.text(x, y, texto, {
            fontSize: "32px",
            fill: "#ffffff",
            backgroundColor: "#00000088",
            padding: { x: 20, y: 10 }
            
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // Efecto visual al pasar el mouse
        boton.on("pointerover", () => boton.setStyle({ fill: "#ff0000" }));
        boton.on("pointerout", () => boton.setStyle({ fill: "#ffffff" }));

        return boton;
    }

    // Función para mostrar las imágenes de Controles o Créditos
    mostrarPantallaAdicional(keyImagen) {
        const pantalla = this.add.image(400, 300, keyImagen).setDisplaySize(800, 600).setDepth(100);
        
        // Texto para volver
        const btnVolver = this.add.text(400, 575, "VOLVER AL MENÚ", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#00000088",
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(101)
        .setInteractive({ useHandCursor: true });

        btnVolver.on("pointerdown", () => {
            pantalla.destroy();
            btnVolver.destroy();
        });
    }
}