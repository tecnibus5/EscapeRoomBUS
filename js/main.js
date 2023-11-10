// Carga de ficheros

async function load_scenes() {
    return fetch('../config/cfg.json')
    .then((response) => {
        if (!response.ok) {
            return null;
        } else {
            return response.json();
        }
    })
    .then((json) => {
        if (json == null) {
            return null;
        } else {
            return json;
        }
    })
}

async function load_texts() {
    return fetch('../assets/txt/textos.txt')
    .then((response) => {
        if (!response.ok) {
            return null;
        } else {
            return response.text();
        }
    })
    .then((text) => {
        if (text == null) {
            return null;
        } else {
            return text.split("\n");
        }
    })
}

function load_initial_scene(scenes) {
    let initial_scene = scenes.find(s => s.tipo === "INICIAL");
    return initial_scene;
}

function check_valid_action(action,scene) {
    const actionsArray = Object.keys(scene.acciones);
    if (is_auto_scene(scene) || actionsArray.includes(action)) {
        return true;
    }
    return false;
}

function get_next_scene(scene,action) {
    if (is_auto_scene(scene)) {
        return scene.acciones[""];
    }
    return scene.acciones[action];
}

function is_auto_scene(scene) {
    const actionsArray = Object.keys(scene.acciones);
    if (actionsArray.length === 1 && actionsArray[0] === "") {
        return true;
    }
}

async function load_game() {
    const scenes_json = await load_scenes();
    const texts = await load_texts();
    
    if (scenes_json == null || texts == null) {
        alert("No se han encontrado los archivos de juego en el servidor");
        return 0;
    }

    const cover = scenes_json['portada'];
    const scenes = scenes_json['escenas'];

    let inicioDiv = document.getElementById('inicio-juego');
    let inicioText = document.getElementById('inicio-texto');

    // Add cover image, text and start button
    inicioText.insertAdjacentHTML('afterbegin',`<h2 class="cover-text cover-subtitle">Elige tu propia aventura</h1>`);
    inicioText.insertAdjacentHTML('afterbegin',`<h1 class="cover-text cover-title">${cover['titulo']}</h1>`);
    inicioDiv.insertAdjacentHTML('afterbegin',`<div class="div-cover-img"><img src="${cover['img']}" alt="Portada" class="cover-img"></div>`);

}

document.addEventListener('DOMContentLoaded',load_game)

async function main() {
    document.getElementById('boton-bonito-wrapper').remove();

    let gameInput = document.getElementById('game-input');
    let gameScreen = document.getElementById('game');
    let currentScene = load_initial_scene(scenes);

    gameInput.addEventListener('keyup', function(e) {
        if(e.key === 'Enter') {
            handle_user_input(e.target.value);
            e.target.value = '';
        }
    })

    render_text(currentScene)

    function render_text(scene) {
        for(line of scene.textos) {
            gameScreen.insertAdjacentHTML('beforeend',`<div class="text-style game-text">${texts[line-1]}</div>`);
        }
    }

    function handle_user_input(input) {
        let action = input.trim().toUpperCase();
        if (check_valid_action(action,currentScene)) {
            let nextScene = get_next_scene(currentScene,action);
            currentScene = scenes.find(s => s.id === nextScene);
            gameScreen.innerHTML = '';
            gameScreen.scrollTo(0,0);
            render_text(currentScene,texts);
            if (currentScene.tipo === "FINAL") {
                gameInput.disabled = true;
            }
        } else {
            gameScreen.insertAdjacentHTML('beforeend',`<span class="text-style">${currentScene.error}</span>`)
        }
    }

}