const PlayerState = {
    hp: 100,
    maxHp: 100,

    activeWeapon: "pistol",

    ammo: {
        pistol: 10,
        shotgun: 5,
        rifle: 3
    },

    weapons: {
        pistol: true,
        shotgun: true,
        rifle: true
    },

    keys: {
        red: false,
        blue: false
    }
    
};

export default PlayerState;