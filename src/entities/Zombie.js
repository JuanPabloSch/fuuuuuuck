export default class Zombie {
    constructor(scene, x, y, type = "normal") {
        this.scene = scene;
        this.type = type;
        this.canHit = true;

        // 1. ASIGNACIÓN DE TEXTURA (Corregido para incluir al worm)
        let textureKey = "zombie_normal";
        if (this.type === "fast") textureKey = "zombie_fast";
        if (this.type === "tank") textureKey = "zombie_tank";
        if (this.type === "crawler") textureKey = "zombie_crawler"; 
        if (this.type === "worm") textureKey = "zombie_worm"; // <--- AGREGADO AQUÍ

        // 2. CREACIÓN DEL SPRITE
        this.sprite = scene.physics.add.sprite(x, y, textureKey, 0);
        
        // 3. CONFIGURACIÓN FÍSICA INICIAL
        this.sprite.setTint(this.getColor());

        // Hitbox inicial genérica
        this.sprite.body.setSize(60, 60);
        this.sprite.body.setOffset(54, 180);

        this.setStats();
    }
    
    setStats() {
        switch (this.type) {
            case "worm":
                this.speed = 180;
                this.hp = 1;
                this.sprite.setScale(0.35); // Lo subimos para que se vea bien grande
                this.sprite.body.setSize(100, 40); 
                this.sprite.body.setOffset(40, 100); 
                break;

            case "crawler":
                this.speed = 170;   
                this.hp = 2;         
                this.sprite.setScale(0.35); 
                this.sprite.body.setSize(100, 60); 
                this.sprite.body.setOffset(50, 210); 
                break;

            case "fast":
                this.speed = 120;
                this.hp = 1;
                this.sprite.setScale(0.30);
                break;

            case "tank":
                this.speed = 40;
                this.hp = 5;
                this.sprite.setScale(0.40); 
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
            case "crawler": return 0xaaffaa; 
            case "worm": return 0xffaaaa; // Un tono rosado/carnoso
            default: return 0xffffff;
        }
    }

    update(player) {
        if (!this.sprite || !this.sprite.body || !player || !player.sprite) return;

        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );
        
        this.sprite.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        const deg = Phaser.Math.RadToDeg(angle);
        if (deg > -45 && deg <= 45) this.sprite.setFrame(3);
        else if (deg > 45 && deg <= 135) this.sprite.setFrame(0);
        else if (deg <= -45 && deg > -135) this.sprite.setFrame(1);
        else this.sprite.setFrame(2);

        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );

        if (dist < 55 && this.canHit) {
            this.canHit = false;
            player.takeDamage(10); 
            player.applyKnockback(this.sprite.x, this.sprite.y, 150);
            this.scene.time.delayedCall(1200, () => this.canHit = true);
        }
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite.active) this.sprite.setTint(this.getColor());
        });
    }

    destroy() {
        this.sprite.destroy();
    }
}
