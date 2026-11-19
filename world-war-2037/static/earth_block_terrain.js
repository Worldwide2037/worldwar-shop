
// WORLD WAR 2037
// EARTH BLOCK TERRAIN V1

function createEarthBlockTerrain(scene) {
    const group = new THREE.Group();

    const blockSize = 100;
    const gridSize = 40;

    const geometry = new THREE.BoxGeometry(
        blockSize, 30, blockSize
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x657b45,
        roughness: 1
    });

    const blocks = new THREE.InstancedMesh(
        geometry,
        material,
        gridSize * gridSize
    );

    const dummy = new THREE.Object3D();
    let index = 0;

    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            const height =
                Math.sin(x * 0.35) * 12 +
                Math.cos(z * 0.28) * 10;

            dummy.position.set(
                (x - gridSize / 2) * blockSize,
                height,
                (z - gridSize / 2) * blockSize
            );

            dummy.updateMatrix();
            blocks.setMatrixAt(index++, dummy.matrix);
        }
    }

    blocks.instanceMatrix.needsUpdate = true;
    group.add(blocks);
    scene.add(group);

    return group;
}
