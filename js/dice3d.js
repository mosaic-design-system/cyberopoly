// 3D Dice using Three.js and Cannon.js

class Dice3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.dice = [];
        this.container = null;
        this.isInitialized = false;
        this.isRolling = false;
    }

    initialize() {
        try {
            this.container = document.getElementById('dice-box');
            if (!this.container) {
                console.error("Dice container not found");
                return false;
            }

            // Create Three.js scene
            this.scene = new THREE.Scene();
            this.scene.background = null; // Transparent

            // Setup camera
            const width = this.container.clientWidth || 900;
            const height = this.container.clientHeight || 900;
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.set(0, 15, 20);
            this.camera.lookAt(0, 0, 0);

            // Setup renderer with transparency
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: true
            });
            this.renderer.setSize(width, height);
            this.renderer.setClearColor(0x000000, 0); // Transparent
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.container.appendChild(this.renderer.domElement);

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 5);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);

            // Setup physics world
            this.world = new CANNON.World();
            this.world.gravity.set(0, -30, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            this.world.solver.iterations = 10;

            // Create floor (invisible)
            const floorBody = new CANNON.Body({
                mass: 0,
                shape: new CANNON.Plane()
            });
            floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            this.world.addBody(floorBody);

            // Create walls
            this.createWalls();

            this.isInitialized = true;
            console.log("3D Dice initialized successfully!");
            return true;

        } catch (error) {
            console.error("Failed to initialize 3D dice:", error);
            this.isInitialized = false;
            return false;
        }
    }

    createWalls() {
        const wallMaterial = new CANNON.Material();

        // Back wall
        const backWall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: wallMaterial
        });
        backWall.position.set(0, 0, -10);
        this.world.addBody(backWall);

        // Front wall
        const frontWall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: wallMaterial
        });
        frontWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
        frontWall.position.set(0, 0, 10);
        this.world.addBody(frontWall);

        // Left wall
        const leftWall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: wallMaterial
        });
        leftWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        leftWall.position.set(-10, 0, 0);
        this.world.addBody(leftWall);

        // Right wall
        const rightWall = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: wallMaterial
        });
        rightWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        rightWall.position.set(10, 0, 0);
        this.world.addBody(rightWall);
    }

    createDie(position, rotation) {
        // Create visual die (Three.js)
        const geometry = new THREE.BoxGeometry(2, 2, 2);

        // Create cyberpunk-themed material
        const material = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            emissive: 0x00ff41,
            emissiveIntensity: 0.2,
            shininess: 100,
            specular: 0x00ff41
        });

        const dieMesh = new THREE.Mesh(geometry, material);
        dieMesh.castShadow = true;
        dieMesh.receiveShadow = true;

        // Add edge geometry for cyberpunk look
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff41, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        dieMesh.add(wireframe);

        // Add dots (pips) to die faces
        this.addDiePips(dieMesh);

        this.scene.add(dieMesh);

        // Create physics body (Cannon.js)
        const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        const dieBody = new CANNON.Body({
            mass: 1,
            shape: shape,
            material: new CANNON.Material()
        });

        dieBody.position.copy(position);
        dieBody.quaternion.copy(rotation);

        // Add random angular velocity for spinning
        dieBody.angularVelocity.set(
            Math.random() * 20 - 10,
            Math.random() * 20 - 10,
            Math.random() * 20 - 10
        );

        this.world.addBody(dieBody);

        return { mesh: dieMesh, body: dieBody };
    }

    addDiePips(dieMesh) {
        const pipGeometry = new THREE.CircleGeometry(0.15, 16);
        const pipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff41 });

        const pipConfigs = [
            // Face 1: center
            { face: 0, positions: [[0, 0, 1.01]] },
            // Face 2: diagonal
            { face: 1, positions: [[-0.4, 0.4, 1.01], [0.4, -0.4, 1.01]] },
            // Face 3: diagonal with center
            { face: 2, positions: [[-0.4, 0.4, 1.01], [0, 0, 1.01], [0.4, -0.4, 1.01]] },
            // Face 4: square corners
            { face: 3, positions: [[-0.4, 0.4, 1.01], [0.4, 0.4, 1.01], [-0.4, -0.4, 1.01], [0.4, -0.4, 1.01]] },
            // Face 5: square with center
            { face: 4, positions: [[-0.4, 0.4, 1.01], [0.4, 0.4, 1.01], [0, 0, 1.01], [-0.4, -0.4, 1.01], [0.4, -0.4, 1.01]] },
            // Face 6: two columns of three
            { face: 5, positions: [[-0.4, 0.5, 1.01], [-0.4, 0, 1.01], [-0.4, -0.5, 1.01], [0.4, 0.5, 1.01], [0.4, 0, 1.01], [0.4, -0.5, 1.01]] }
        ];

        // Note: This is simplified - proper implementation would place pips on all 6 faces with correct rotations
        // For now, we'll just identify the result by the top face orientation
    }

    async roll() {
        if (!this.isInitialized || this.isRolling) {
            return null;
        }

        this.isRolling = true;

        // Clear previous dice
        this.clear();

        // Create two dice with random positions and throws
        const die1 = this.createDie(
            new CANNON.Vec3(-2, 8, 0),
            new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 1, 0), Math.random() * Math.PI)
        );

        const die2 = this.createDie(
            new CANNON.Vec3(2, 8, 0),
            new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 1), Math.random() * Math.PI)
        );

        // Add throwing force
        die1.body.velocity.set(
            (Math.random() - 0.5) * 10,
            -2,
            (Math.random() - 0.5) * 5
        );

        die2.body.velocity.set(
            (Math.random() - 0.5) * 10,
            -2,
            (Math.random() - 0.5) * 5
        );

        this.dice = [die1, die2];

        // Animate
        return new Promise((resolve) => {
            const animate = () => {
                if (!this.isRolling) return;

                requestAnimationFrame(animate);

                // Update physics
                this.world.step(1 / 60);

                // Update visual positions from physics
                this.dice.forEach(die => {
                    die.mesh.position.copy(die.body.position);
                    die.mesh.quaternion.copy(die.body.quaternion);
                });

                // Render
                this.renderer.render(this.scene, this.camera);
            };

            animate();

            // Wait for dice to settle (3 seconds)
            setTimeout(() => {
                // Calculate results based on top face
                const result1 = this.getDieValue(this.dice[0].body.quaternion);
                const result2 = this.getDieValue(this.dice[1].body.quaternion);

                resolve({
                    die1: result1,
                    die2: result2,
                    total: result1 + result2
                });
            }, 3000);
        });
    }

    getDieValue(quaternion) {
        // Convert quaternion to euler angles to determine which face is up
        const euler = new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
        );

        // Determine which face is pointing up based on rotation
        // This is a simplified calculation
        const faces = [
            { axis: new THREE.Vector3(0, 1, 0), value: 1 },
            { axis: new THREE.Vector3(0, -1, 0), value: 6 },
            { axis: new THREE.Vector3(1, 0, 0), value: 3 },
            { axis: new THREE.Vector3(-1, 0, 0), value: 4 },
            { axis: new THREE.Vector3(0, 0, 1), value: 2 },
            { axis: new THREE.Vector3(0, 0, -1), value: 5 }
        ];

        const upVector = new THREE.Vector3(0, 1, 0);
        upVector.applyEuler(euler);

        let maxDot = -1;
        let value = 1;

        faces.forEach(face => {
            const dot = upVector.dot(face.axis);
            if (dot > maxDot) {
                maxDot = dot;
                value = face.value;
            }
        });

        return value;
    }

    clear() {
        // Remove dice meshes
        this.dice.forEach(die => {
            this.scene.remove(die.mesh);
            die.mesh.geometry.dispose();
            die.mesh.material.dispose();
            this.world.removeBody(die.body);
        });
        this.dice = [];
        this.isRolling = false;
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }
}

// Create global instance
window.dice3D = new Dice3D();
