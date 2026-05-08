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
        shotgun: false,
        rifle: true
    },

    // 🔑 Agregamos esta lista para las llaves que recojas
    // Aquí guardaremos strings como "llave_norte" o "llave_este"
    inventory: ["llave_norte"],

    // 🚩 Estado de misiones / trampas
    // Esto sirve para que la Room 2 sepa que ya pasaste el desafío
    room2TrapDone: false,

    keys: {
        red: false,
        blue: false
    }
};

export default PlayerState;
