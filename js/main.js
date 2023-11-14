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

    let res = Array.of(cover,scenes);

    return res;
}

document.addEventListener('DOMContentLoaded', async () => {
    let dataList = await load_game();
    let startButton = document.getElementById('btn-start-game');
    startButton.addEventListener('click',() => main(dataList));
})

function generate_action_html(action,sceneId) {
    return `<span id="${sceneId}-${action}" data-action="${action}" class="action-text">${action}</span>`;
}

function generate_action_input(sceneId) {
    return `<form action="" id="text-input-form"><input id="text-input-${sceneId}" class="game-text-input" type="text"><button type="submit" class="submit-text-input">Enviar</button></form>`;
}

async function main(dataList) {
    let scenes = dataList[1];
    document.getElementById('inicio-juego').remove();

    let inputArea = document.getElementById('action-selectors');
    let gameScreen = document.getElementById('game');
    let textScreen = document.getElementById('scene-text');
    gameScreen.classList.remove('d-none');
    let currentScene = load_initial_scene(scenes);

    render_text(currentScene);
    regenerate_actions();
    
    function render_text(scene) {
        textScreen.innerHTML = '';
        for(line of scene.textos) {
            textScreen.insertAdjacentHTML('beforeend',`<p class="text-style game-text">${line}</p>`);
        }
    }

    function handle_user_input(event) {
        let action;
        if (currentScene.tipo === "ACCIÓN" || currentScene.tipo === "INICIAL") {
            action = event.target.dataset.action;
        } else if (currentScene.tipo === "TEXTO") {
            action = event.trim().toUpperCase();
        }
        if (check_valid_action(action,currentScene)) {
            let nextScene = get_next_scene(currentScene,action);
            currentScene = scenes.find(s => s.id === nextScene);
            render_text(currentScene);
            regenerate_actions();
        } else {
            let error = document.getElementById('id-error-text');
            if (!error) {
                let inputForm = document.getElementById('text-input-form');
                inputForm.insertAdjacentHTML('beforeend',`<span id="id-error-text" class="form-error">${currentScene.error}</span>`);
            }
        }
    }

    function regenerate_actions() {
        // Si la escena es de botones
        inputArea.innerHTML = '';
        if (currentScene.tipo === "ACCIÓN" || currentScene.tipo === "INICIAL") {
            for (let action of Object.keys(currentScene.acciones)) {
                inputArea.insertAdjacentHTML('beforeend',generate_action_html(action,currentScene.id));
                let actionInput = document.getElementById(`${currentScene.id}-${action}`);
                actionInput.addEventListener('click',(event) => handle_user_input(event));
            }
        } else if (currentScene.tipo === "TEXTO") {
            inputArea.insertAdjacentHTML('beforeend', generate_action_input(currentScene.id));
            let textInputForm = document.getElementById('text-input-form');
            textInputForm.addEventListener('submit',function(e) {
                e.preventDefault();
                let innerInput = document.getElementById(`text-input-${currentScene.id}`);
                handle_user_input(innerInput.value);
            })
        }
    }

}