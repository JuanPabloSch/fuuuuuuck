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

        // 1. HITBOX BASE
        this.sprite.body.setSize(40, 80); 
        this.sprite.body.setOffset(30, 40); 

        // 2. APLICAR STATS (Importante antes del tween)
        this.setStats();

        // 3. EFECTO DE VIBRACIÓN NERVIOASA (Solo básicos: normal y fast)
        if (this.type === "normal" || this.type === "fast") {
            const speedVib = this.type === "fast" ? 100 : 140;
            this.idleTween = scene.tweens.add({
                targets: this.sprite,
                angle: { from: -2, to: 2 },
                scaleY: { from: this.sprite.scaleY, to: this.sprite.scaleY * 0.98 },
                duration: speedVib + Math.random() * 50,
                yoyo: true,
                loop: -1
            });
        }
    }
    
    setStats() {
        switch (this.type) {
            case "worm":
                this.speed = 180;
                this.hp = 1;
                this.sprite.setScale(0.50); 
                this.sprite.body.setSize(60, 30); 
                this.sprite.body.setOffset(20, 40); 
                break;
            case "crawler":
                this.speed = 170;   
                this.hp = 2;         
                this.sprite.setScale(0.8); 
                this.sprite.body.setSize(30, 100); 
                this.sprite.body.setOffset(40, 40); 
                break;
            case "tank":
                this.speed = 45;
                this.hp = 10;    
                this.sprite.setScale(0.8); 
                this.sprite.body.setSize(50, 100); 
                this.sprite.body.setOffset(25, 30);
                break;
            default: // normal y fast
                this.speed = this.type === "fast" ? 120 : 70;
                this.hp = this.type === "fast" ? 1 : 2;
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

        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );
        const dist = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y, 
            player.sprite.x, player.sprite.y
        );

        this.sprite.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        const deg = Phaser.Math.RadToDeg(angle);
        if (deg > -45 && deg <= 45) this.sprite.setFrame(3);      // Derecha
        else if (deg > 45 && deg <= 135) this.sprite.setFrame(0); // Abajo
        else if (deg <= -45 && deg > -135) this.sprite.setFrame(1); // Arriba
        else this.sprite.setFrame(2);                             // Izquierda

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
        this.sprite.setTint(0xff0000);

        // Sacudida por impacto
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + (Math.random() - 0.5) * 6,
            duration: 50,
            yoyo: true,
            repeat: 1
        });

        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) this.sprite.setTint(this.getColor());
        });
    }

    destroy() {
        // Importante detener el tween antes de destruir el sprite
        if (this.idleTween) {
            this.idleTween.stop();
            this.idleTween = null;
        }
        if (this.sprite) this.sprite.destroy();
    }
}
