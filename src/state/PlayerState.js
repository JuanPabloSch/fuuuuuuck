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

    inventory: ["llave_norte", "west_key", "llave_este", "backyard_key"],
    bossU3Dead: false, 
    room2TrapDone: false,
    bossRoom5Dead: false,
    room9PuzzleSolved: false,
    // --- 🚩 NUEVO FLAG PARA LA EMBOSCADA ---
    room7AmbushDone: false, 

    keys: {
        red: false,
        blue: false
    }
};

export default PlayerState;
