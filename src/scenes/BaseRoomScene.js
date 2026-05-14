import Player from "../entities/Player.js";
import WeaponSystem from "../entities/WeaponSystem.js";
import PlayerState from "../state/PlayerState.js";

export default class BaseRoomScene extends Phaser.Scene {

    constructor(key) {
        super(key);
    }

    preload() {
    // Esto asegura que TODAS las habitaciones carguen la mira
    this.load.image("crosshair", "src/assets/ui/crosshair.png");
    // --- CARGA DE SONIDOS ---
    this.load.audio("player_hurt", "src/assets/sfx/grunt.mp3");
    this.load.audio("player_death", "src/assets/sfx/death_scream.mp3");
    // En el preload
    this.load.audio("rain_ambient", "src/assets/sfx/rain_ambient.mp3");
    this.load.audio("thunder_sfx", "src/assets/sfx/thunder_sfx.mp3");
    this.load.audio("rain_ambient", "src/assets/sfx/rain_ambient.mp3");
    this.load.audio("pistol_shot", "src/assets/sfx/pistol_shot.mp3");
    this.load.audio("pistol_empty", "src/assets/sfx/pistol_empty.mp3");
    this.load.audio("pistol_reload", "src/assets/sfx/pistol_reload.mp3");

    // --- CARGA DE MÚSICA ---
    this.load.audio("song1", "src/assets/music/song1.mp3");
    this.load.audio("song2", "src/assets/music/song2.mp3");
    this.load.audio("bossmusic", "src/assets/music/bossmusic.mp3");
    this.load.audio("fbossmusic", "src/assets/music/fbossmusic.mp3");
    // --- NUEVOS SONIDOS ---
    // Shotgun
    this.load.audio("shotgun_shot", "src/assets/sfx/shotgun_shot.mp3");
    this.load.audio("shotgun_reload", "src/assets/sfx/shotgun_reload.mp3");

    // Rifle
    this.load.audio("rifle_shot", "src/assets/sfx/rifle_shot.mp3");
    this.load.audio("rifle_reload", "src/assets/sfx/rifle_reload.mp3");

    // Rocket Launcher
    this.load.audio("rocket_shot", "src/assets/sfx/rocket_shot.mp3");
    this.load.audio("rocket_reload", "src/assets/sfx/rocket_reload.mp3");

    // Dentro de preload() en BaseRoomScene.js
    const types = ['normal', 'fast', 'tank', 'crawler', 'worm']; // Eliminamos 'sucker', agregamos 'normal' y 'crawler'

    types.forEach(type => {
        this.load.audio(`${type}_spawn`, `src/assets/sfx/${type}_spawn.mp3`);
        this.load.audio(`${type}_die`, `src/assets/sfx/${type}_die.mp3`);
    });
    }

    // 1. AGREGA ESTO JUSTO AQUÍ: El método que Room1 necesita para no explotar
    create(data) {
        // Se queda vacío. Es el "puente" para super.create(data)
    }

updateMusic(songKey) {
    const tracks = ["song1", "song2", "bossmusic", "fbossmusic"];

    // 1. Si mandamos null o nada, paramos SOLO las canciones de la lista
    if (!songKey) {
        tracks.forEach(key => {
            let s = this.sound.get(key);
            if (s && s.isPlaying) s.stop();
        });
        return;
    }

    // 2. Buscamos la canción solicitada
    let currentSong = this.sound.get(songKey);

    // 3. Si ya está sonando, NO HACEMOS NADA (evita el reinicio molesto)
    if (currentSong && currentSong.isPlaying) {
        return;
    }

    // 4. Si es una canción nueva, paramos las otras canciones de la lista primero
    // NOTA: No usamos stopAll() para que los efectos (disparos, gritos) sigan sonando
    tracks.forEach(key => {
        let s = this.sound.get(key);
        if (s && s.isPlaying) s.stop();
    });

    // 5. Play a la nueva canción
    this.sound.play(songKey, { loop: true, volume: 0.3 });
}

    // Herramienta para crear paredes
    createWall(x, y, w, h) {
        // Usamos un color visible (0.5 de alpha) para que las veas al testear
        // Cuando estés conforme, cambia el 0.5 por 0 para que sean invisibles
        let wall = this.add.rectangle(x, y, w, h, 0xff0000, 0.5); 
        
        this.walls.add(wall); // Las agregamos al grupo estático
        return wall;
    }

    createBase(x = 400, y = 300) {
        // 🧱 Grupo de paredes (DEBE IR ANTES QUE EL PLAYER PARA LAS COLISIONES)
        this.walls = this.physics.add.staticGroup();

        // 🧍 player
        this.player = new Player(this, x, y);
        this.player.hp = PlayerState.hp;

        // 🔫 weapons
        this.weapon = new WeaponSystem(this, this.player);

        // 🔫 bullets
        this.bullets = [];

        // 🧟 zombies
        this.zombies = this.physics.add.group();

        this.input.setDefaultCursor('none');

        // Creamos la imagen de la mira
        this.crosshair = this.add.image(0, 0, "crosshair");
        this.crosshair.setDisplaySize(30, 30);
        this.crosshair.setDepth(10000); 

        // --- CONFIGURACIÓN DE COLISIONES GLOBALES ---
        // Esto hace que el player choque con todas las paredes que crees
        this.physics.add.collider(this.player.sprite, this.walls);
        
        // Esto hace que los zombies choquen con las paredes
        this.physics.add.collider(this.zombies, this.walls);
        
        // Esto hace que los zombies choquen entre ellos
        this.physics.add.collider(this.zombies, this.zombies);

        // 🎮 input (UNA SOLA VEZ)
        this.input.mouse.disableContextMenu();
        this.input.keyboard.resetKeys();
        this.input.on("pointerdown", (pointer) => {
            if (pointer.leftButtonDown()) {
                this.weapon.shoot(this.time.now, pointer);
            }
            if (pointer.rightButtonDown()) {
                this.weapon.reload();
            }
        });
        // ... dentro de createBase ...
        this.input.keyboard.resetKeys();

        // Forzar la actualización del estado de las teclas capturadas por el navegador
        this.events.on('resume', () => {
            this.input.keyboard.resetKeys();
        });

        //HUD
        this.hudWeaponText = this.add.text(16, 16, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudAmmoText = this.add.text(16, 40, "", { fontSize: "18px", fill: "#ffffff" });
        this.hudHpText = this.add.text(16, 64, "", { fontSize: "18px", fill: "#ff4444" });
        
        this.hudWeaponText.setScrollFactor(0);
        this.hudAmmoText.setScrollFactor(0);
        this.hudHpText.setScrollFactor(0);

        // Teclas de armas (usa .on solo para acciones de un solo pulso, no para movimiento)
        this.input.keyboard.on("keydown-ONE", () => this.weapon.setWeapon("pistol"));
        this.input.keyboard.on("keydown-TWO", () => this.weapon.setWeapon("shotgun"));
        this.input.keyboard.on("keydown-THREE", () => this.weapon.setWeapon("rifle"));
        this.input.keyboard.on("keydown-FOUR", () => this.weapon.setWeapon("rocket"));
        this.input.keyboard.on('keydown-P', () => {
            this.scene.pause();
            this.scene.launch('PauseScene', { fromScene: this.scene.key });
        });
        // ... al final de createBase ...

    // Detectar cuando un zombie toca al jugador
    this.physics.add.overlap(this.player.sprite, this.zombies, (playerSprite, zombieSprite) => {
        // 10 es el daño por golpe, puedes ajustarlo
        this.handleDamage(10);
});
    }

    spawnMedikit(x, y, healAmount = 30) {
    const kit = this.physics.add.sprite(x, y, "medikit");
    
    // 1. ESCALA MUY CHICA
    // Prueba con 0.1 o 0.2 (esto es el 10% o 20% del tamaño original)
    kit.setScale(0.15); 
    kit.setDepth(90);

    // 2. AJUSTE DEL TWEEN (CUIDADO AQUÍ)
    // Si usas scale: 1.2, Phaser lo vuelve a agrandar a su tamaño original.
    // Para que mantenga el tamaño chico, el tween debe basarse en el setScale de arriba.
    this.tweens.add({
        targets: kit,
        scale: 0.18, // Que crezca solo un poquito más de su escala base (0.15)
        duration: 800,
        yoyo: true,
        loop: -1
    });

    this.physics.add.overlap(this.player.sprite, kit, () => {
        this.player.hp = Math.min(100, this.player.hp + healAmount);
        PlayerState.hp = this.player.hp;
        
        this.player.sprite.setTint(0x00ff00);
        this.time.delayedCall(200, () => this.player.sprite.setTint(0xffffff));

        kit.destroy();
    });
}


updateBase(time, delta) {
    this.player.update();
    this.player.updateDirection(this.input.activePointer);

    this.zombies.getChildren().forEach(sprite => {
        sprite.ref.update(this.player, this.zombies);
    });
    this.bullets.forEach(b => b.update(time, delta));

    this.handleCollisions();
    
    this.hudHpText.setText(`HP: ${Math.floor(this.player.hp)}`);
    this.hudWeaponText.setText(`Weapon: ${this.weapon.activeWeapon}`);
    this.hudAmmoText.setText(
        this.weapon.w.reloading
            ? "Reloading..."
            : `Ammo: ${PlayerState.ammo[this.weapon.activeWeapon]}`
    );

    // Movimiento de la mira
    if (this.crosshair) {
        this.crosshair.x = this.input.activePointer.worldX;
        this.crosshair.y = this.input.activePointer.worldY;
    }

    // 💀 SI MUERE, LLAMAMOS A LA FUNCIÓN DE MUERTE (una sola vez)
    if (this.player.hp <= 0 && !this.player.isDead) {
        this.ejecutarMuerte();
    }
}

handleDamage(amount) {
    // Si ya está muerto o está en tiempo de recuperación (invulnerabilidad), salimos
    if (this.player.isDead || this.player.isHurt) return;

    this.player.hp -= amount;
    PlayerState.hp = this.player.hp;

    if (this.player.hp > 0) {
        // 🔊 REPRODUCIR GRUNT
        this.sound.play("player_hurt", { volume: 0.6 });

        // Activamos bandera de herido y efectos visuales
        this.player.isHurt = true;
        this.player.sprite.setTint(0xff0000); // Se pone rojo
        this.cameras.main.shake(200, 0.01);   // Tiembla la pantalla

        // En handleDamage(amount) cambia el 500 por 1000 (1 segundo de invulnerabilidad)
        this.time.delayedCall(1000, () => {
            this.player.isHurt = false;
            if (this.player.sprite) this.player.sprite.clearTint();
        });
    } else {
        // Si la vida es 0 o menos, ejecutamos la muerte que ya tenías
        this.ejecutarMuerte();
    }
}

ejecutarMuerte() {
    this.player.isDead = true;
    this.physics.pause();
    
    // Suena el grito de muerte
    this.sound.play("player_death", { volume: 0.8 });
    this.updateMusic(null); // Para la música ambiente

    this.player.sprite.setTint(0xff0000);
    
    // Efecto de cámara y cambio de escena
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
        // LANZAMOS LA ESCENA DE GAME OVER
        // Le pasamos la escena actual para que sepa dónde reaparecer
        this.scene.start("GameOverScene", { 
            checkpoint: PlayerState.checkpointScene || this.scene.key 
        });
    });
}
autosave() {
    // 1. Guardamos la escena y el estado físico
    PlayerState.checkpointScene = this.scene.key;
    PlayerState.hp = this.player.hp;
    
    // 2. Sincronizamos todo el inventario (asegura que no se pierdan llaves/armas)
    // Asumimos que PlayerState ya tiene las armas y llaves actuales
    this.saveState(); 

    // 3. Feedback visual con tu función
    if (this.mostrarCartel) {
        this.mostrarCartel("PUNTO DE CONTROL: PROGRESO GUARDADO");
    }

    console.log("Autosave completado en:", this.scene.key);
}

mostrarCartel(mensaje) {
    if (this.cartelContainer) this.cartelContainer.destroy();

    // 1. Estilo de la letra: más chica y con sombra para que se lea sin fondo negro
    const estiloTexto = {
        fontSize: "16px", // Letra más chica
        fill: "#ffffff",
        fontFamily: "Arial",
        align: "center",
        stroke: "#000000", // Borde negro fino para legibilidad
        strokeThickness: 3,
        shadow: { blur: 2, color: '#000000', fill: true }
    };

    const texto = this.add.text(0, 0, mensaje.toUpperCase(), estiloTexto).setOrigin(0.5);

    // 2. Posición: 550 en Y (cerca del borde inferior de los 600px de alto)
    // El 400 es el centro horizontal (X)
    this.cartelContainer = this.add.container(400, 550, [texto])
        .setScrollFactor(0)
        .setDepth(10000);

    // 3. Animación suave
    this.cartelContainer.alpha = 0;
    this.tweens.add({
        targets: this.cartelContainer,
        alpha: 1,
        duration: 300,
        yoyo: true,
        hold: 2500, // Tiempo que se queda visible
        onComplete: () => {
            if (this.cartelContainer) this.cartelContainer.destroy();
        }
    });
}

handleCollisions() {
    const zombies = this.zombies.getChildren();
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];
        
        for (let j = zombies.length - 1; j >= 0; j--) {
            const zombieSprite = zombies[j];
            const zombie = zombieSprite.ref;
            
            // Si es un Rocket (damage 50), aumentamos el radio de detección
            const detectionRadius = (bullet.damage >= 50) ? 60 : 25; 

            const dist = Phaser.Math.Distance.Between(
                bullet.sprite.x, bullet.sprite.y,
                zombie.sprite.x, zombie.sprite.y
            );

            if (dist < detectionRadius) {
            zombie.takeDamage(bullet.damage);
            
            if (bullet.damage >= 50) {
                this.cameras.main.shake(200, 0.02);
            }

            bullet.destroy();
            this.bullets.splice(i, 1);
            
            if (zombie.hp <= 0) {
                const dieKey = `${zombie.type}_die`;
                if (this.cache.audio.exists(dieKey)) {
                    this.sound.play(dieKey, { volume: 0.4 });
                }
                zombie.destroy();
                this.zombies.remove(zombieSprite);
            }
            break; // Importante para que la bala no siga chocando con otros si ya desapareció
        }
        }
    }
    
}
saveState() {
        PlayerState.hp = this.player.hp;
    }
}
