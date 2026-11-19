
// WORLD WAR 2037 - MARS ENVIRONMENT MODULE

export function createMarsEnvironment(THREE, scene) {

  const marsWorld = new THREE.Group();
  marsWorld.position.set(0, 0, -620);
  scene.add(marsWorld);

  // Mars lighting
  const hemi = new THREE.HemisphereLight(
    0xffc5a0, 0x54251b, 1.5
  );
  marsWorld.add(hemi);

  const sun = new THREE.DirectionalLight(0xffbd91, 2.2);
  sun.position.set(150, 250, 100);
  marsWorld.add(sun);

  // Large red terrain
  const groundGeo = new THREE.PlaneGeometry(
    1200, 1200, 100, 100
  );

  const positions = groundGeo.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getY(i);

    const height =
      Math.sin(x * 0.025) * 2.5 +
      Math.cos(z * 0.035) * 2 +
      Math.sin((x + z) * 0.018) * 3;

    positions.setZ(i, height);
  }

  groundGeo.computeVertexNormals();

  const ground = new THREE.Mesh(
    groundGeo,
    new THREE.MeshStandardMaterial({
      color: 0x9b3926,
      roughness: 1
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  marsWorld.add(ground);

  // Rocks
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x633023,
    roughness: 1
  });

  const rockGeometry = new THREE.DodecahedronGeometry(1, 1);

  for (let i = 0; i < 75; i++) {
    const radius = 1.5 + Math.random() * 4;

    const rock = new THREE.Mesh(rockGeometry, rockMaterial);

    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 520;

    rock.position.set(
      Math.cos(angle) * distance,
      radius * 0.35,
      Math.sin(angle) * distance
    );

    rock.scale.set(
      radius * (1 + Math.random()),
      radius * (0.5 + Math.random()),
      radius * (1 + Math.random())
    );

    rock.rotation.set(
      Math.random(),
      Math.random(),
      Math.random()
    );

    rock.castShadow = true;
    marsWorld.add(rock);
  }

  // Distant hills
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: 0x713c32,
    roughness: 1
  });

  const hillGeometry = new THREE.SphereGeometry(1, 20, 14);

  for (let i = 0; i < 18; i++) {
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);

    const angle = i / 18 * Math.PI * 2;
    const distance = 430 + Math.random() * 100;

    hill.position.set(
      Math.cos(angle) * distance,
      5,
      Math.sin(angle) * distance
    );

    hill.scale.set(
      65 + Math.random() * 40,
      25 + Math.random() * 25,
      50 + Math.random() * 35
    );

    marsWorld.add(hill);
  }

  // Fixed open exit door and frame
  const frame = new THREE.Group();
  scene.add(frame);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x24394b,
    metalness: 0.82,
    roughness: 0.3
  });

  const blue = new THREE.MeshStandardMaterial({
    color: 0x16cfff,
    emissive: 0x087fff,
    emissiveIntensity: 1.3
  });

  function part(parent, w, h, d, x, y, z, mat) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Door frame
  part(frame, .55, 8, .65, -2.5, 4, -22, metal);
  part(frame, .55, 8, .65,  2.5, 4, -22, metal);
  part(frame, 5.5, .65, .65, 0, 7.65, -22, metal);

  // Blue light strips
  part(frame, .12, 7, .08, -2.2, 4, -22.35, blue);
  part(frame, .12, 7, .08,  2.2, 4, -22.35, blue);

  // Door leaf fixed in open position
  part(frame, .22, 7, 4.5, -2.85, 3.9, -24.1, metal);

  const lamp = new THREE.PointLight(0x16cfff, 4, 12);
  lamp.position.set(0, 5.5, -24);
  frame.add(lamp);

  return {
    world: marsWorld,
    fog: new THREE.Fog(0xb96b50, 150, 1100)
  };
}
