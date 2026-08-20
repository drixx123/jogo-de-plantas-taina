"use strict";

/* =========================================================
   VEDITA BATTLE
   Jogo de batalha usando JavaScript puro.
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const gameArea =
    document.getElementById("gameArea");

const playerElement =
    document.getElementById("player");

const enemiesElement =
    document.getElementById("enemies");

const projectileElement =
    document.getElementById("projectile");

const playerHealthElement =
    document.getElementById("playerHealth");

const playerEnergyElement =
    document.getElementById("playerEnergy");

const levelElement =
    document.getElementById("level");

const scoreElement =
    document.getElementById("score");

const enemyCounterElement =
    document.getElementById("enemyCounter");

const waveElement =
    document.getElementById("wave");

const messageElement =
    document.getElementById("message");

const gameOverElement =
    document.getElementById("gameOver");

const victoryElement =
    document.getElementById("victory");

const finalScoreElement =
    document.getElementById("finalScore");

const victoryScoreElement =
    document.getElementById("victoryScore");

const restartButton =
    document.getElementById("restartButton");

const nextLevelButton =
    document.getElementById("nextLevelButton");

const attackButton =
    document.getElementById("attackButton");

const kamehamehaButton =
    document.getElementById("kamehamehaButton");

const moveLeftButton =
    document.getElementById("moveLeft");

const moveRightButton =
    document.getElementById("moveRight");


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const MAX_LEVEL = 10;

const GAME_WIDTH = 1100;

const PLAYER_WIDTH = 75;

const ENEMY_WIDTH = 65;


/* =========================================================
   ESTADO DO JOGO
========================================================= */

let game = {

    level: 1,

    score: 0,

    playerHealth: 100,

    playerEnergy: 100,

    playerX: 100,

    enemies: [],

    enemyId: 0,

    running: true,

    attackCooldown: false,

    kamehamehaCooldown: false,

    lastTime: performance.now()

};


/* =========================================================
   UTILITÁRIOS
========================================================= */

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


function showMessage(text) {

    messageElement.textContent =
        text;

}


/* =========================================================
   CRIAR INIMIGOS
========================================================= */

function createEnemies() {

    enemiesElement.innerHTML = "";

    game.enemies = [];

    /*
        Mais inimigos conforme o nível.
    */

    const enemyCount =
        Math.min(
            3 + game.level,
            10
        );


    for (
        let i = 0;
        i < enemyCount;
        i++
    ) {

        createEnemy(i);

    }


    updateEnemyCounter();

}


/* =========================================================
   CRIAR UM INIMIGO
========================================================= */

function createEnemy(index) {

    const enemyElement =
        document.createElement("div");

    enemyElement.className =
        "enemy";


    /*
        Posição inicial.
    */

    const startX =
        gameArea.clientWidth -
        120 -
        (index * 80);


    const enemy = {

        id:
            game.enemyId++,

        x:
            clamp(
                startX,
                300,
                gameArea.clientWidth - 90
            ),

        health:
            100 +
            ((game.level - 1) * 20),

        maxHealth:
            100 +
            ((game.level - 1) * 20),

        speed:
            20 +
            (game.level * 4),

        attackTimer:
            random(
                1000,
                2500
            ),

        element:
            enemyElement,

        alive:
            true

    };


    /*
        HTML do esqueleto.
    */

    enemyElement.innerHTML = `

        <div class="enemy-health">

            <div
                class="enemy-health-value"
            ></div>

        </div>

        <div class="skeleton-head">

            <div
                class="skeleton-eye left"
            ></div>

            <div
                class="skeleton-eye right"
            ></div>

            <div
                class="skeleton-mouth"
            ></div>

        </div>

        <div class="skeleton-body"></div>

        <div
            class="skeleton-arm left"
        ></div>

        <div
            class="skeleton-arm right"
        ></div>

        <div
            class="skeleton-leg left"
        ></div>

        <div
            class="skeleton-leg right"
        ></div>

    `;


    enemyElement.style.left =
        `${enemy.x}px`;


    enemiesElement.appendChild(
        enemyElement
    );


    game.enemies.push(
        enemy
    );

}


/* =========================================================
   ATUALIZAR CONTADOR
========================================================= */

function updateEnemyCounter() {

    const alive =
        game.enemies.filter(
            enemy => enemy.alive
        ).length;


    enemyCounterElement.textContent =
        `INIMIGOS: ${alive}`;

}


/* =========================================================
   ATUALIZAR VIDA DO INIMIGO
========================================================= */

function updateEnemyHealth(enemy) {

    const healthElement =
        enemy.element.querySelector(
            ".enemy-health-value"
        );


    if (!healthElement) {

        return;

    }


    const percentage =
        (
            enemy.health /
            enemy.maxHealth
        ) * 100;


    healthElement.style.width =
        `${clamp(
            percentage,
            0,
            100
        )}%`;

}


/* =========================================================
   ATAQUE NORMAL
========================================================= */

function normalAttack() {

    if (!game.running) {

        return;

    }


    if (game.attackCooldown) {

        return;

    }


    game.attackCooldown =
        true;


    playerElement.classList.add(
        "attacking"
    );


    showMessage(
        "👊 ATAQUE!"
    );


    /*
        Dano.
    */

    const damage =
        25 +
        (game.level * 3);


    /*
        Procura inimigo mais próximo.
    */

    const target =
        getClosestEnemy();


    if (target) {

        const distance =
            Math.abs(
                getPlayerCenter() -
                getEnemyCenter(target)
            );


        /*
            Ataque corpo a corpo.
        */

        if (distance <= 150) {

            damageEnemy(
                target,
                damage
            );

        }

    }


    setTimeout(
        function () {

            playerElement.classList.remove(
                "attacking"
            );

        },
        200
    );


    setTimeout(
        function () {

            game.attackCooldown =
                false;

        },
        450
    );

}


/* =========================================================
   KAMEHAMEHA
========================================================= */

function useKamehameha() {

    if (!game.running) {

        return;

    }


    if (game.kamehamehaCooldown) {

        showMessage(
            "⚡ O Kamehameha ainda está carregando!"
        );

        return;

    }


    /*
        Custo de energia.
    */

    const energyCost =
        35;


    if (
        game.playerEnergy <
        energyCost
    ) {

        showMessage(
            "❌ Energia insuficiente!"
        );

        return;

    }


    game.playerEnergy -=
        energyCost;


    game.kamehamehaCooldown =
        true;


    showMessage(
        "⚡ KAMEHAMEHAAAAAA!"
    );


    /*
        Mostra o raio.
    */

    projectileElement.classList.remove(
        "hidden"
    );


    projectileElement.style.left =
        `${game.playerX + 55}px`;


    /*
        Dano em área.
    */

    const damage =
        70 +
        (game.level * 10);


    game.enemies.forEach(
        function (enemy) {

            if (!enemy.alive) {

                return;

            }


            const distance =
                Math.abs(
                    getPlayerCenter() -
                    getEnemyCenter(enemy)
                );


            /*
                O Kamehameha atinge
                uma distância maior.
            */

            if (distance <= 500) {

                damageEnemy(
                    enemy,
                    damage
                );

            }

        }
    );


    /*
        Remove o raio.
    */

    setTimeout(
        function () {

            projectileElement.classList.add(
                "hidden"
            );

        },
        350
    );


    /*
        Cooldown.
    */

    setTimeout(
        function () {

            game.kamehamehaCooldown =
                false;

        },
        1000
    );

}


/* =========================================================
   DANIFICAR INIMIGO
========================================================= */

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


    updateEnemyHealth(
        enemy
    );


    /*
        Se morreu.
    */

    if (
        enemy.health <= 0
    ) {

        killEnemy(
            enemy
        );

    }

}


/* =========================================================
   MATAR INIMIGO
========================================================= */

function killEnemy(enemy) {

    if (!enemy.alive) {

        return;

    }


    enemy.alive =
        false;


    enemy.element.classList.add(
        "dead"
    );


    /*
        Pontos.
    */

    game.score +=
        100 *
        game.level;


    /*
        Recupera energia.
    */

    game.playerEnergy =
        clamp(
            game.playerEnergy + 15,
            0,
            100
        );


    updateScore();

    updateEnemyCounter();


    setTimeout(
        function () {

            if (
                enemy.element &&
                enemy.element.parentNode
            ) {

                enemy.element.remove();

            }

        },
        450
    );


    /*
        Verifica vitória.
    */

    checkVictory();

}


/* =========================================================
   INIMIGO MAIS PRÓXIMO
========================================================= */

function getClosestEnemy() {

    const aliveEnemies =
        game.enemies.filter(
            enemy => enemy.alive
        );


    if (
        aliveEnemies.length === 0
    ) {

        return null;

    }


    let closest =
        aliveEnemies[0];


    let closestDistance =
        Math.abs(
            game.playerX -
            closest.x
        );


    for (
        let i = 1;
        i < aliveEnemies.length;
        i++
    ) {

        const enemy =
            aliveEnemies[i];


        const distance =
            Math.abs(
                game.playerX -
                enemy.x
            );


        if (
            distance <
            closestDistance
        ) {

            closest =
                enemy;

            closestDistance =
                distance;

        }

    }


    return closest;

}


/* =========================================================
   POSIÇÕES
========================================================= */

function getPlayerCenter() {

    return (
        game.playerX +
        PLAYER_WIDTH / 2
    );

}


function getEnemyCenter(enemy) {

    return (
        enemy.x +
        ENEMY_WIDTH / 2
    );

}


/* =========================================================
   MOVER JOGADOR
========================================================= */

function movePlayer(direction) {

    if (!game.running) {

        return;

    }


    const width =
        gameArea.clientWidth;


    const amount =
        45;


    game.playerX +=
        direction *
        amount;


    /*
        Limites.
    */

    game.playerX =
        clamp(
            game.playerX,
            10,
            width -
            PLAYER_WIDTH -
            10
        );


    playerElement.style.left =
        `${game.playerX}px`;

}


/* =========================================================
   IA DOS INIMIGOS
========================================================= */

function updateEnemies(deltaTime) {

    if (!game.running) {

        return;

    }


    game.enemies.forEach(
        function (enemy) {

            if (!enemy.alive) {

                return;

            }


            const distance =
                getPlayerCenter() -
                getEnemyCenter(enemy);


            /*
                Aproxima o inimigo.
            */

            if (
                Math.abs(distance)
                > 90
            ) {

                if (
                    distance < 0
                ) {

                    enemy.x -=
                        enemy.speed *
                        deltaTime;

                } else {

                    enemy.x +=
                        enemy.speed *
                        deltaTime;

                }

            } else {

                /*
                    Ataque do inimigo.
                */

                enemy.attackTimer -=
                    deltaTime *
                    1000;


                if (
                    enemy.attackTimer <= 0
                ) {

                    enemyAttack(
                        enemy
                    );


                    enemy.attackTimer =
                        random(
                            1200,
                            2500
                        );

                }

            }


            /*
                Limites.
            */

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


/* =========================================================
   ATAQUE DOS ESQUELETOS
========================================================= */

function enemyAttack(enemy) {

    if (!game.running) {

        return;

    }


    const damage =
        5 +
        game.level;


    game.playerHealth -=
        damage;


    game.playerHealth =
        clamp(
            game.playerHealth,
            0,
            100
        );


    playerElement.classList.add(
        "hit"
    );


    setTimeout(
        function () {

            playerElement.classList.remove(
                "hit"
            );

        },
        250
    );


    showMessage(
        `💀 O esqueleto atacou! -${damage} HP`
    );


    updateHealth();


    if (
        game.playerHealth <= 0
    ) {

        endGame();

    }

}


/* =========================================================
   REGENERAR ENERGIA
========================================================= */

function regenerateEnergy(deltaTime) {

    if (!game.running) {

        return;

    }


    game.playerEnergy +=
        5 *
        deltaTime;


    game.playerEnergy =
        clamp(
            game.playerEnergy,
            0,
            100
        );


    updateEnergy();

}


/* =========================================================
   INTERFACE
========================================================= */

function updateHealth() {

    playerHealthElement.style.width =
        `${game.playerHealth}%`;

}


function updateEnergy() {

    playerEnergyElement.style.width =
        `${game.playerEnergy}%`;

}


function updateScore() {

    scoreElement.textContent =
        game.score;

}


function updateLevel() {

    levelElement.textContent =
        game.level;

    waveElement.textContent =
        `ONDA ${game.level}`;

}


/* =========================================================
   VERIFICAR VITÓRIA
========================================================= */

function checkVictory() {

    const alive =
        game.enemies.filter(
            enemy => enemy.alive
        ).length;


    if (
        alive === 0
    ) {

        setTimeout(
            function () {

                if (game.running) {

                    showVictory();

                }

            },
            500
        );

    }

}


/* =========================================================
   VITÓRIA
========================================================= */

function showVictory() {

    game.running =
        false;


    victoryScoreElement.textContent =
        game.score;


    victoryElement.classList.remove(
        "hidden"
    );


    showMessage(
        "🏆 VITÓRIA!"
    );

}


/* =========================================================
   PRÓXIMO NÍVEL
========================================================= */

function nextLevel() {

    if (
        game.level >=
        MAX_LEVEL
    ) {

        showMessage(
            "🏆 Você chegou ao nível máximo!"
        );

        return;

    }


    game.level++;


    game.playerHealth =
        100;


    game.playerEnergy =
        100;


    game.running =
        true;


    victoryElement.classList.add(
        "hidden"
    );


    updateLevel();

    updateHealth();

    updateEnergy();


    createEnemies();


    showMessage(
        `⚡ NÍVEL ${game.level}! Prepare-se!`
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    game.running =
        false;


    finalScoreElement.textContent =
        game.score;


    gameOverElement.classList.remove(
        "hidden"
    );


    showMessage(
        "💀 DERROTA!"
    );

}


/* =========================================================
   REINICIAR
========================================================= */

function restartGame() {

    game.level = 1;

    game.score = 0;

    game.playerHealth = 100;

    game.playerEnergy = 100;

    game.playerX = 100;

    game.enemyId = 0;

    game.running = true;

    game.attackCooldown = false;

    game.kamehamehaCooldown = false;


    playerElement.style.left =
        `${game.playerX}px`;


    gameOverElement.classList.add(
        "hidden"
    );


    victoryElement.classList.add(
        "hidden"
    );


    updateLevel();

    updateScore();

    updateHealth();

    updateEnergy();


    createEnemies();


    showMessage(
        "🥋 Prepare-se! Os esqueletinhos estão chegando!"
    );

}


/* =========================================================
   CONTROLES DE TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key =
            event.key.toLowerCase();


        /*
            Evita o navegador
            rolar a página com espaço.
        */

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

            useKamehameha();

        }

    }
);


/* =========================================================
   CONTROLES DE BOTÕES
========================================================= */

moveLeftButton.addEventListener(
    "click",
    function () {

        movePlayer(-1);

    }
);


moveRightButton.addEventListener(
    "click",
    function () {

        movePlayer(1);

    }
);


attackButton.addEventListener(
    "click",
    function () {

        normalAttack();

    }
);


kamehamehaButton.addEventListener(
    "click",
    function () {

        useKamehameha();

    }
);


restartButton.addEventListener(
    "click",
    function () {

        restartGame();

    }
);


nextLevelButton.addEventListener(
    "click",
    function () {

        nextLevel();

    }
);


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function gameLoop(currentTime) {

    /*
        Delta time em segundos.
    */

    let deltaTime =
        (
            currentTime -
            game.lastTime
        ) / 1000;


    /*
        Evita valores enormes
        caso a aba fique parada.
    */

    deltaTime =
        Math.min(
            deltaTime,
            0.05
        );


    game.lastTime =
        currentTime;


    updateEnemies(
        deltaTime
    );


    regenerateEnergy(
        deltaTime
    );


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function initializeGame() {

    playerElement.style.left =
        `${game.playerX}px`;


    updateHealth();

    updateEnergy();

    updateScore();

    updateLevel();


    createEnemies();


    showMessage(
        "🥋 Derrote os esqueletinhos! Use K para lançar o Kamehameha!"
    );


    game.lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


initializeGame();
