export default class Bullet {
    constructor(scene, x, y) {
        this.scene = scene;
        // Creamos un rectángulo base, el tamaño lo ajustaremos después
        this.sprite = scene.add.rectangle(x, y, 6, 6, 0xffff00);
        scene.physics.add.existing(this.sprite);
        
        this.lifespan = 2000;
        this.damage = 1;
    }

    // Esta función la llama el WeaponSystem justo después de crear la bala
    fire(targetX, targetY, speed, damage, isRocket = false) {
        this.damage = damage;
        
        if (isRocket) {
            this.sprite.setSize(20, 20); // Más grande
            this.sprite.setFillStyle(0xffaa00); // Naranja
        }

        this.scene.physics.moveTo(this.sprite, targetX, targetY, speed);
    }

    update(time, delta) {
        this.lifespan -= delta;
        if (this.lifespan <= 0) this.destroy();
    }

    destroy() {
        if (this.sprite) this.sprite.destroy();
    }
}
