"use strict";


/* =====================================================
   ELEMENTOS
===================================================== */

const gameArea =
    document.getElementById("game");

const player =
    document.getElementById("player");

const enemiesContainer =
    document.getElementById("enemies");

const beam =
    document.getElementById("beam");

const particles =
    document.getElementById("particles");

const healthBar =
    document.getElementById("healthBar");

const energyBar =
    document.getElementById("energyBar");

const levelText =
    document.getElementById("level");

const scoreText =
    document.getElementById("score");

const comboText =
    document.getElementById("combo");

const waveText =
    document.getElementById("wave");

const enemyCountText =
    document.getElementById("enemyCount");

const message =
    document.getElementById("message");

const comboDisplay =
    document.getElementById("comboText");

const gameOver =
    document.getElementById("gameOver");

const victory =
    document.getElementById("victory");

const finalScore =
    document.getElementById("finalScore");

const victoryScore =
    document.getElementById("victoryScore");


/* =====================================================
   BOTÕES
===================================================== */

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");

const attackButton =
    document.getElementById("attackButton");

const beamButton =
    document.getElementById("beamButton");

const restartButton =
    document.getElementById("restartButton");

const nextLevelButton =
    document.getElementById("nextLevelButton");


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const MAX_LEVEL = 10;

const PLAYER_WIDTH = 80;

const ENEMY_WIDTH = 70;


/* =====================================================
   ESTADO
===================================================== */

const state = {

    level: 1,

    score: 0,

    combo: 0,

    health: 100,

    energy: 100,

    playerX: 80,

    enemies: [],

    enemyId: 0,

    running: true,

    attackCooldown: false,

    beamCooldown: false,

    comboTimer: 0,

    lastTime: performance.now()

};


/* =====================================================
   UTILITÁRIOS
===================================================== */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


function random(
    min,
    max
) {

    return Math.random() *
        (max - min) +
        min;

}


/* =====================================================
   MENSAGEM
===================================================== */

function showMessage(text) {

    message.textContent =
        text;

}


/* =====================================================
   ATUALIZAR HUD
===================================================== */

function updateHUD() {

    healthBar.style.width =
        `${state.health}%`;

    energyBar.style.width =
        `${state.energy}%`;

    levelText.textContent =
        state.level;

    scoreText.textContent =
        state.score;

    comboText.textContent =
        state.combo;

    waveText.textContent =
        state.level;

    const alive =
        state.enemies.filter(
            enemy =>
                enemy.alive
        ).length;

    enemyCountText.textContent =
        alive;

}


/* =====================================================
   POSIÇÃO DO PLAYER
===================================================== */

function playerCenter() {

    return (
        state.playerX +
        PLAYER_WIDTH / 2
    );

}


/* =====================================================
   POSIÇÃO DO INIMIGO
===================================================== */

function enemyCenter(enemy) {

    return (
        enemy.x +
        ENEMY_WIDTH / 2
    );

}


/* =====================================================
   CRIAR PARTICULAS
===================================================== */

function createParticles(
    x,
    y,
    color = "#5bc8ff"
) {

    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );

        particle.className =
            "particle";

        particle.style.background =
            color;

        particle.style.left =
            `${x}px`;

        particle.style.top =
            `${y}px`;

        particle.style.setProperty(
            "--x",
            `${random(-90, 90)}px`
        );

        particle.style.setProperty(
            "--y",
            `${random(-90, 30)}px`
        );

        particles.appendChild(
            particle
        );


        setTimeout(
            () => {

                particle.remove();

            },
            650
        );

    }

}


/* =====================================================
   COMBO
===================================================== */

function increaseCombo() {

    state.combo++;

    state.comboTimer =
        2.5;


    if (
        state.combo >= 2
    ) {

        comboDisplay.textContent =
            `${state.combo} COMBO!`;

        comboDisplay.classList.remove(
            "show"
        );


        void comboDisplay.offsetWidth;


        comboDisplay.classList.add(
            "show"
        );

    }

}


/* =====================================================
   RESET COMBO
===================================================== */

function resetCombo() {

    state.combo =
        0;

}


/* =====================================================
   CRIAR INIMIGOS
===================================================== */

function createEnemies() {

    enemiesContainer.innerHTML =
        "";

    state.enemies = [];


    /*
        O número de inimigos aumenta
        conforme o nível.
    */

    const amount =
        Math.min(
            3 + state.level,
            12
        );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        createEnemy(i);

    }


    updateHUD();

}


/* =====================================================
   CRIAR UM INIMIGO
===================================================== */

function createEnemy(index) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "enemy";


    /*
        Evita que os inimigos
        apareçam exatamente
        em cima uns dos outros.
    */

    const startX =
        Math.max(
            300,
            gameArea.clientWidth -
            120 -
            index * 80
        );


    const maxHealth =
        100 +
        (state.level - 1) *
        25;


    const enemy = {

        id:
            state.enemyId++,

        x:
            clamp(
                startX,
                260,
                gameArea.clientWidth -
                80
            ),

        health:
            maxHealth,

        maxHealth:
            maxHealth,

        speed:
            18 +
            state.level * 3,

        attackTimer:
            random(
                1,
                2.5
            ),

        alive:
            true,

        element:
            element

    };


    element.innerHTML = `

        <div class="enemy-health">

            <div
                class="enemy-health-value">
            </div>

        </div>

        <div class="skeleton-head">

            <span
                class="skeleton-eye left">
            </span>

            <span
                class="skeleton-eye right">
            </span>

            <span
                class="skeleton-mouth">
            </span>

        </div>

        <div class="skeleton-body"></div>

        <div
            class="skeleton-arm left">
        </div>

        <div
            class="skeleton-arm right">
        </div>

        <div
            class="skeleton-leg left">
        </div>

        <div
            class="skeleton-leg right">
        </div>

    `;


    element.style.left =
        `${enemy.x}px`;


    enemiesContainer.appendChild(
        element
    );


    state.enemies.push(
        enemy
    );

}


/* =====================================================
   VIDA DO INIMIGO
===================================================== */

function updateEnemyHealth(enemy) {

    const bar =
        enemy.element.querySelector(
            ".enemy-health-value"
        );


    const percentage =
        (
            enemy.health /
            enemy.maxHealth
        ) * 100;


    bar.style.width =
        `${clamp(
            percentage,
            0,
            100
        )}%`;

}


/* =====================================================
   INIMIGO MAIS PRÓXIMO
===================================================== */

function closestEnemy() {

    const alive =
        state.enemies.filter(
            enemy =>
                enemy.alive
        );


    if (
        alive.length === 0
    ) {

        return null;

    }


    let closest =
        alive[0];

    let distance =
        Math.abs(
            playerCenter() -
            enemyCenter(closest)
        );


    for (
        let i = 1;
        i < alive.length;
        i++
    ) {

        const enemy =
            alive[i];

        const currentDistance =
            Math.abs(
                playerCenter() -
                enemyCenter(enemy)
            );


        if (
            currentDistance <
            distance
        ) {

            distance =
                currentDistance;

            closest =
                enemy;

        }

    }


    return closest;

}


/* =====================================================
   ATAQUE NORMAL
===================================================== */

function normalAttack() {

    if (
        !state.running ||
        state.attackCooldown
    ) {

        return;

    }


    state.attackCooldown =
        true;


    player.classList.add(
        "attacking"
    );


    showMessage(
        "👊 ATAQUE!"
    );


    const target =
        closestEnemy();


    if (target) {

        const distance =
            Math.abs(
                playerCenter() -
                enemyCenter(target)
            );


        if (
            distance <= 145
        ) {

            const damage =
                22 +
                state.level * 4 +
                state.combo * 3;


            damageEnemy(
                target,
                damage
            );

        }

    }


    setTimeout(
        () => {

            player.classList.remove(
                "attacking"
            );

        },
        180
    );


    setTimeout(
        () => {

            state.attackCooldown =
                false;

        },
        350
    );

}


/* =====================================================
   KAMEHAMEHA
===================================================== */

function kamehameha() {

    if (
        !state.running ||
        state.beamCooldown
    ) {

        return;

    }


    const cost =
        35;


    if (
        state.energy <
        cost
    ) {

        showMessage(
            "⚠️ ENERGIA INSUFICIENTE!"
        );

        return;

    }


    state.energy -=
        cost;


    state.beamCooldown =
        true;


    showMessage(
        "⚡ KAMEHAMEHAAAAAA!"
    );


    beam.classList.remove(
        "hidden"
    );


    beam.style.left =
        `${state.playerX + 65}px`;


    /*
        O Kamehameha causa dano
        em vários inimigos.
    */

    const damage =
        70 +
        state.level * 12;


    state.enemies.forEach(
        enemy => {

            if (
                !enemy.alive
            ) {

                return;

            }


            const distance =
                enemyCenter(enemy) -
                playerCenter();


            if (
                distance > -50 &&
                distance < 620
            ) {

                damageEnemy(
                    enemy,
                    damage
                );

            }

        }
    );


    createParticles(
        state.playerX + 100,
        gameArea.clientHeight - 180,
        "#69d5ff"
    );


    updateHUD();


    setTimeout(
        () => {

            beam.classList.add(
                "hidden"
            );

        },
        450
    );


    setTimeout(
        () => {

            state.beamCooldown =
                false;

        },
        1200
    );

}


/* =====================================================
   DANO
===================================================== */

function damageEnemy(
    enemy,
    damage
) {

    if (
        !enemy ||
        !enemy.alive
    ) {

        return;

    }


    enemy.health -=
        damage;


    enemy.element.classList.add(
        "damaged"
    );


    setTimeout(
        () => {

            enemy.element.classList.remove(
                "damaged"
            );

        },
        180
    );


    createParticles(
        enemy.x + 35,
        gameArea.clientHeight - 180,
        "#ffdc55"
    );


    updateEnemyHealth(
        enemy
    );


    if (
        enemy.health <= 0
    ) {

        killEnemy(
            enemy
        );

    }


    updateHUD();

}


/* =====================================================
   MATAR INIMIGO
===================================================== */

function killEnemy(enemy) {

    if (
        !enemy.alive
    ) {

        return;

    }


    enemy.alive =
        false;


    enemy.element.classList.add(
        "dead"
    );


    increaseCombo();


    const points =
        100 *
        state.level *
        Math.max(
            state.combo,
            1
        );


    state.score +=
        points;


    /*
        Recupera um pouco de energia.
    */

    state.energy =
        clamp(
            state.energy + 12,
            0,
            100
        );


    createParticles(
        enemy.x + 35,
        gameArea.clientHeight - 160,
        "#ffffff"
    );


    updateHUD();


    setTimeout(
        () => {

            if (
                enemy.element.parentNode
            ) {

                enemy.element.remove();

            }

        },
        500
    );


    checkVictory();

}


/* =====================================================
   MOVIMENTO DO PLAYER
===================================================== */

function movePlayer(
    direction
) {

    if (
        !state.running
    ) {

        return;

    }


    const movement =
        45;


    state.playerX +=
        direction *
        movement;


    state.playerX =
        clamp(
            state.playerX,
            10,
            gameArea.clientWidth -
            PLAYER_WIDTH -
            10
        );


    player.style.left =
        `${state.playerX}px`;

}


/* =====================================================
   IA DOS INIMIGOS
===================================================== */

function updateEnemies(
    delta
) {

    if (
        !state.running
    ) {

        return;

    }


    state.enemies.forEach(
        enemy => {

            if (
                !enemy.alive
            ) {

                return;

            }


            const difference =
                playerCenter() -
                enemyCenter(enemy);


            const distance =
                Math.abs(
                    difference
                );


            /*
                Aproxima o inimigo.
            */

            if (
                distance > 90
            ) {

                const direction =
                    difference > 0
                        ? 1
                        : -1;


                enemy.x +=
                    direction *
                    enemy.speed *
                    delta;

            } else {

                enemy.attackTimer -=
                    delta;


                if (
                    enemy.attackTimer <= 0
                ) {

                    enemyAttack(
                        enemy
                    );


                    enemy.attackTimer =
                        random(
                            1.2,
                            2.5
                        );

                }

            }


            enemy.x =
                clamp(
                    enemy.x,
                    0,
                    gameArea.clientWidth -
                    ENEMY_WIDTH
                );


            enemy.element.style.left =
                `${enemy.x}px`;

        }
    );

}


/* =====================================================
   ATAQUE DO INIMIGO
===================================================== */

function enemyAttack(enemy) {

    if (
        !state.running
    ) {

        return;

    }


    const damage =
        4 +
        state.level;


    state.health -=
        damage;


    state.health =
        clamp(
            state.health,
            0,
            100
        );


    player.classList.add(
        "hit"
    );


    setTimeout(
        () => {

            player.classList.remove(
                "hit"
            );

        },
        250
    );


    createParticles(
        state.playerX + 40,
        gameArea.clientHeight - 170,
        "#ff4444"
    );


    resetCombo();


    showMessage(
        `💀 Você sofreu ${damage} de dano!`
    );


    updateHUD();


    if (
        state.health <= 0
    ) {

        endGame();

    }

}


/* =====================================================
   ENERGIA
===================================================== */

function regenerateEnergy(
    delta
) {

    if (
        !state.running
    ) {

        return;

    }


    state.energy +=
        5 * delta;


    state.energy =
        clamp(
            state.energy,
            0,
            100
        );


    updateHUD();

}


/* =====================================================
   COMBO TIMER
===================================================== */

function updateCombo(
    delta
) {

    if (
        state.combo <= 0
    ) {

        return;

    }


    state.comboTimer -=
        delta;


    if (
        state.comboTimer <= 0
    ) {

        resetCombo();

        updateHUD();

    }

}


/* =====================================================
   VITÓRIA
===================================================== */

function checkVictory() {

    const alive =
        state.enemies.filter(
            enemy =>
                enemy.alive
        );


    if (
        alive.length === 0
    ) {

        setTimeout(
            () => {

                if (
                    state.running
                ) {

                    showVictory();

                }

            },
            600
        );

    }

}


function showVictory() {

    state.running =
        false;


    victoryScore.textContent =
        state.score;


    victory.classList.remove(
        "hidden"
    );


    showMessage(
        "🏆 VITÓRIA!"
    );

}


/* =====================================================
   PRÓXIMO NÍVEL
===================================================== */

function nextLevel() {

    if (
        state.level >=
        MAX_LEVEL
    ) {

        showMessage(
            "🏆 VOCÊ CHEGOU AO NÍVEL MÁXIMO!"
        );

        return;

    }


    state.level++;

    state.health =
        100;

    state.energy =
        100;

    state.combo =
        0;

    state.playerX =
        80;

    state.running =
        true;


    player.style.left =
        `${state.playerX}px`;


    victory.classList.add(
        "hidden"
    );


    createEnemies();

    updateHUD();


    showMessage(
        `⚡ NÍVEL ${state.level}!`
    );

}


/* =====================================================
   GAME OVER
===================================================== */

function endGame() {

    state.running =
        false;


    finalScore.textContent =
        state.score;


    gameOver.classList.remove(
        "hidden"
    );


    showMessage(
        "💀 DERROTA!"
    );

}


/* =====================================================
   REINICIAR
===================================================== */

function restartGame() {

    state.level =
        1;

    state.score =
        0;

    state.combo =
        0;

    state.health =
        100;

    state.energy =
        100;

    state.playerX =
        80;

    state.enemyId =
        0;

    state.running =
        true;

    state.attackCooldown =
        false;

    state.beamCooldown =
        false;


    player.style.left =
        `${state.playerX}px`;


    gameOver.classList.add(
        "hidden"
    );

    victory.classList.add(
        "hidden"
    );


    createEnemies();

    updateHUD();


    showMessage(
        "🥋 PREPARE-SE!"
    );

}


/* =====================================================
   TECLADO
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === " " ||
            key === "arrowleft" ||
            key === "arrowright"
        ) {

            event.preventDefault();

        }


        if (
            key === "a" ||
            key === "arrowleft"
        ) {

            movePlayer(-1);

        }


        if (
            key === "d" ||
            key === "arrowright"
        ) {

            movePlayer(1);

        }


        if (
            key === " "
        ) {

            normalAttack();

        }


        if (
            key === "k"
        ) {

            kamehameha();

        }

    }
);


/* =====================================================
   BOTÕES
===================================================== */

leftButton.addEventListener(
    "click",
    () => movePlayer(-1)
);


rightButton.addEventListener(
    "click",
    () => movePlayer(1)
);


attackButton.addEventListener(
    "click",
    normalAttack
);


beamButton.addEventListener(
    "click",
    kamehameha
);


restartButton.addEventListener(
    "click",
    restartGame
);


nextLevelButton.addEventListener(
    "click",
    nextLevel
);


/* =====================================================
   LOOP DO JOGO
===================================================== */

function gameLoop(time) {

    let delta =
        (
            time -
            state.lastTime
        ) / 1000;


    /*
        Impede que o jogo fique
        muito rápido depois de
        uma pausa.
    */

    delta =
        Math.min(
            delta,
            .05
        );


    state.lastTime =
        time;


    updateEnemies(
        delta
    );


    regenerateEnergy(
        delta
    );


    updateCombo(
        delta
    );


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

function initialize() {

    createEnemies();

    updateHUD();


    player.style.left =
        `${state.playerX}px`;


    showMessage(
        "🥋 Derrote os esqueletinhos!"
    );


    state.lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


initialize();
