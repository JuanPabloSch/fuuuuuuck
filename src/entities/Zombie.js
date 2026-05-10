export default class Zombie {
    constructor(scene, x, y, type = "normal") {
        this.scene = scene;
        this.type = type;
        this.canHit = true;

        let textureKey = "zombie_normal";
        if (this.type === "fast") textureKey = "zombie_fast";
        if (this.type === "tank") textureKey = "zombie_tank";
        if (this.type === "crawler") textureKey = "zombie_crawler"; 
        if (this.type === "worm") textureKey = "zombie_worm";

        this.sprite = scene.physics.add.sprite(x, y, textureKey, 0);
        this.sprite.setTint(this.getColor());

        // 1. HITBOX PARA TU NUEVO SPRITE (100x130)
        // La hacemos más flaca (40px) para que no choque con todo
        this.sprite.body.setSize(40, 80); 
        this.sprite.body.setOffset(30, 40); 

        this.setStats();
    }
    
    setStats() {
        switch (this.type) {
            case "worm":
                this.speed = 180;
                this.hp = 1;
                this.sprite.setScale(0.35); 
                this.sprite.body.setSize(100, 40); 
                this.sprite.body.setOffset(40, 100); 
                break;
                case "crawler":
                    this.speed = 170;   
                    this.hp = 2;         
                    this.sprite.setScale(0.6); 
                    this.sprite.body.setSize(30, 100); 
                    this.sprite.body.setOffset(40, 40); 
                    break;
                case "tank":
                this.speed = 45; // Un poquito más rápido para que no sea un postre
                this.hp = 10;    // ¡Es un tanque de verdad!
                
                // Escala 0.8 lo hace ver robusto frente al 0.6 del normal
                this.sprite.setScale(0.8); 

                // HITBOX: La hacemos ancha (50px) para que cueste esquivarlo
                this.sprite.body.setSize(50, 100); 
                this.sprite.body.setOffset(25, 30); // Centramos
                break;

            default: // normal y fast
                this.speed = this.type === "fast" ? 120 : 70;
                this.hp = this.type === "fast" ? 1 : 2;
                // SACAMOS EL SETSCALE para el normal porque tu PNG ya mide 130px de alto
                this.sprite.setScale(0.7); 
                break;
        }
    }

    getColor() {
        switch (this.type) {
            case "crawler": return 0xaaffaa; 
            case "worm": return 0xffaaaa;
            case "fast": return 0xffccaa;
            default: return 0xffffff;
        }
    }

    update(player) {
        if (!this.sprite || !this.sprite.active || !this.sprite.body || !player || !player.sprite) return;

        // --- 🎯 CÁLCULOS UNA SOLA VEZ ---
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );
        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );

        // Movimiento
        this.sprite.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        // --- 🔄 CAMBIO DE FRAME POR DIRECCIÓN ---
        const deg = Phaser.Math.RadToDeg(angle);
        if (deg > -45 && deg <= 45) this.sprite.setFrame(3);      // Derecha
        else if (deg > 45 && deg <= 135) this.sprite.setFrame(0); // Abajo
        else if (deg <= -45 && deg > -135) this.sprite.setFrame(1); // Arriba
        else this.sprite.setFrame(2);                             // Izquierda

        // --- 🥊 LÓGICA DE ATAQUE ---
        if (dist < 50 && this.canHit) {
            this.canHit = false;
            player.takeDamage(10); 
            player.applyKnockback(this.sprite.x, this.sprite.y, 150);
            this.scene.time.delayedCall(1200, () => this.canHit = true);
        }
    }

    takeDamage(dmg) {
        if (!this.sprite.active) return;
        this.hp -= dmg;
        this.sprite.setTint(0xff0000); // Rojo cuando le pegás
        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) this.sprite.setTint(this.getColor());
        });
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}
