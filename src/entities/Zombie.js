export default class Zombie {
    constructor(scene, x, y, type = "normal") {
        this.scene = scene;
        this.type = type;
        this.canHit = true;

        // 1. DEFINIMOS LA VARIABLE (Esto era lo que faltaba)
        let textureKey = "zombie_normal"; // por defecto
        if (this.type === "fast") textureKey = "zombie_fast";
        if (this.type === "tank") textureKey = "zombie_tank";

        // 2. CREAMOS EL SPRITE
        this.sprite = scene.physics.add.sprite(x, y, textureKey, 0);
        
        // 3. CONFIGURACIÓN FÍSICA
        this.sprite.setScale(0.35);
        this.sprite.setTint(this.getColor());

        // Hitbox (pies)
        this.sprite.body.setSize(60, 60);
        this.sprite.body.setOffset(54, 180);

        this.setStats();
    }
    
    setStats() {
    switch (this.type) {
        case "fast":
            this.speed = 120;
            this.hp = 1;
            this.sprite.setScale(0.30); // El fast es el más chiquito
            break;

        case "tank":
            this.speed = 40;
            this.hp = 5;
            // --- ACHICAR AL TANK ---
            // Si el normal es 0.35, probá con 0.40 o 0.45 para que sea 
            // solo un poco más grande y no una mole.
            this.sprite.setScale(0.40); 
            
            // Ajustamos el hitbox para que coincida con el nuevo tamaño
            this.sprite.body.setSize(100, 80); 
            this.sprite.body.setOffset(55, 180);
            break;

        default: // normal
            this.speed = 70;
            this.hp = 2;
            this.sprite.setScale(0.35);
            break;
    }
}

getColor() {
    switch (this.type) {
        case "fast":  return 0xffffff; // Amarillo (opcional, podés poner 0xffffff para sacarlo)
        case "tank": 
            // --- QUITAR EL ROJO ---
            // Cambiamos el rojo (0xff0000) por blanco (0xffffff). 
            // El blanco en Phaser significa "color original del dibujo".
            return 0xffffff; 
        default: 
            return 0xffffff; // Normal sin tinte
    }
}


// Asegúrate de que reciba 'player' (que es la instancia de la clase Player)
update(player) {
    // 1. Validar que el zombie y el jugador existan y tengan cuerpo físico
    if (!this.sprite || !this.sprite.body || !player || !player.sprite) return;

    // 2. Movimiento hacia el jugador
    const angle = Phaser.Math.Angle.Between(
        this.sprite.x, 
        this.sprite.y, 
        player.sprite.x, 
        player.sprite.y
    );
    
    this.sprite.setVelocity(
        Math.cos(angle) * this.speed,
        Math.sin(angle) * this.speed
    );

    // 3. Rotación de frames (Mirar al jugador)
    const deg = Phaser.Math.RadToDeg(angle);
    if (deg > -45 && deg <= 45) this.sprite.setFrame(3);      // Derecha
    else if (deg > 45 && deg <= 135) this.sprite.setFrame(0); // Abajo
    else if (deg <= -45 && deg > -135) this.sprite.setFrame(1); // Arriba
    else this.sprite.setFrame(2);                             // Izquierda

    // 4. Lógica de ataque (Distancia)
    const dist = Phaser.Math.Distance.Between(
        this.sprite.x, 
        this.sprite.y, 
        player.sprite.x, 
        player.sprite.y
    );

    if (dist < 55 && this.canHit) {
        this.canHit = false;
        
        // Aquí llamas a los métodos de la clase Player
        player.takeDamage(10); 
        player.applyKnockback(this.sprite.x, this.sprite.y, 150);

        this.scene.time.delayedCall(1200, () => {
            this.canHit = true;
        });
    }
}


    takeDamage(dmg) {
        this.hp -= dmg;
        // Flash blanco al recibir impacto
        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite.active) this.sprite.setTint(this.getColor());
        });
    }

    destroy() {
        this.sprite.destroy();
    }
}
