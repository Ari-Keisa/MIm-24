import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener('DOMContentLoaded', () => {
        const start = async() => {
                // Змінні для збереження завантажених моделей
                let kapitoshkaModel = null;
                let kirbyModel = null;

                const mindarThree = new MindARThree({
                        container: document.querySelector("#container"),
                });
                const { renderer, scene, camera } = mindarThree;
                const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
                scene.add(light);

                // Точки прив'язки: 127 - ліва щока (ЛІВОРУЧ на екрані), 356 - права щока (ПРАВОРУЧ на екрані)
                const kapitoshkaAnchor = mindarThree.addAnchor(127);
                const kirbyAnchor = mindarThree.addAnchor(356);

                const loader = new GLTFLoader();
                const onError = (name) => (e) => { console.error(`ПОМИЛКА: Не вдалося завантажити модель '${name}':`, e); };

                // Завантажуємо Капітошку (для лівої сторони)
                loader.load("./kapitoshka.glb", (gltf) => {
                        console.log("Успіх: модель 'kapitoshka.glb' завантажено.");
                        kapitoshkaModel = gltf.scene;
                        kapitoshkaModel.scale.set(0.13, 0.13, 0.13); // Зменшуємо
                        kapitoshkaModel.position.set(-0.4, -0.5, 0); // Рухаємо далі ліворуч
                        kapitoshkaAnchor.group.add(kapitoshkaModel);
                }, undefined, onError('kapitoshka.glb'));

                // Завантажуємо Кірбі (для правої сторони)
                loader.load("./kirbi.glb", (gltf) => {
                        console.log("Успіх: модель 'kirbi.glb' завантажено.");
                        kirbyModel = gltf.scene;
                        kirbyModel.scale.set(0.3, 0.3, 0.3); // Збільшуємо
                        kirbyModel.position.set(0.3, -0.5, 0); 
                        kirbyModel.rotation.set(0, Math.PI / 4, 0); // Повертаємо до глядача
                        kirbyAnchor.group.add(kirbyModel);
                }, undefined, onError('kirbi.glb'));

                // Кнопка для Капітошки (зліва)
                document.getElementById('toggleKapitoshka').addEventListener('click', () => {
                        if (!kapitoshkaModel) return;
                                if (kapitoshkaAnchor.group.children.length > 0) {
                                        kapitoshkaAnchor.group.remove(kapitoshkaModel);
                                } else {
                                        kapitoshkaAnchor.group.add(kapitoshkaModel);
                                }
                        });

                // Кнопка для Кірбі (справа)
                document.getElementById('toggleKirby').addEventListener('click', () => {
                        if (!kirbyModel) return;
                                if (kirbyAnchor.group.children.length > 0) {
                                        kirbyAnchor.group.remove(kirbyModel);
                                } else {
                                        kirbyAnchor.group.add(kirbyModel);
                                }
                        });
    
                await mindarThree.start();
                renderer.setAnimationLoop(() => {
                        renderer.render(scene, camera);
                });
        }
    start();
});