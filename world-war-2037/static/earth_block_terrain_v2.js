
import * as THREE from "./vendor/three.module.js";

export function createEarthBlockTerrain(scene) {
    const group = new THREE.Group();

    const SIZE = 100;
    const BLOCK = 100;
    const TOTAL = SIZE * SIZE;
    const LAND_COUNT = 6300;
    const WATER_COUNT = 3700;

    const centers = [
        [0, 0],
        [-0.38, -0.25],
        [0.35, -0.30],
        [-0.30, 0.38],
        [0.36, 0.38]
    ];

    const cells = [];

    for (let x = 0; x < SIZE; x++) {
        for (let z = 0; z < SIZE; z++) {
            const nx = (x - 49.5) / 99;
            const nz = (z - 49.5) / 99;

            let score = Infinity;

            for (const c of centers) {
                const dx = (nx - c[0]) * 1.0;
                const dz = (nz - c[1]) * 1.0;
                const d = Math.sqrt(dx * dx + dz * dz);

                if (d < score) score = d;
            }

            score +=
                Math.sin(x * 0.17) * 0.035 +
                Math.cos(z * 0.13) * 0.035 +
                Math.sin((x + z) * 0.09) * 0.025;

            cells.push({ x, z, score });
        }
    }

    cells.sort((a, b) => a.score - b.score);

    const landGeometry = new THREE.BoxGeometry(
        BLOCK, 4, BLOCK
    );

    const waterGeometry = new THREE.BoxGeometry(
        BLOCK, 4, BLOCK
    );

    const landMaterial = new THREE.MeshStandardMaterial({
        color: 0x657b45,
        roughness: 1
    });

    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x176fa5,
        roughness: 0.25,
        metalness: 0.15
    });

    const land = new THREE.InstancedMesh(
        landGeometry, landMaterial, LAND_COUNT
    );

    const water = new THREE.InstancedMesh(
        waterGeometry, waterMaterial, WATER_COUNT
    );

    const dummy = new THREE.Object3D();

    for (let i = 0; i < TOTAL; i++) {
        const cell = cells[i];

        const px = (cell.x - 49.5) * BLOCK;
        const pz = (cell.z - 49.5) * BLOCK;

        if (i < LAND_COUNT) {
            const height =
                Math.sin(cell.x * 0.12) * 1.2 +
                Math.cos(cell.z * 0.10) * 1.2;

            dummy.position.set(px, height - 2, pz);
            dummy.updateMatrix();
            land.setMatrixAt(i, dummy.matrix);
        } else {
            const index = i - LAND_COUNT;

            dummy.position.set(px, -2, pz);
            dummy.updateMatrix();
            water.setMatrixAt(index, dummy.matrix);
        }
    }

    land.instanceMatrix.needsUpdate = true;
    water.instanceMatrix.needsUpdate = true;

    land.receiveShadow = true;
    water.receiveShadow = true;

    group.add(land);
    group.add(water);

    scene.add(group);

    console.log("EARTH TERRAIN V2 CONNECTED");
    console.log("Total:", TOTAL);
    console.log("Land:", LAND_COUNT);
    console.log("Water:", WATER_COUNT);

    return group;
}
