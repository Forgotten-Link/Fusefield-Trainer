document.addEventListener("DOMContentLoaded", () => {
    const clickableArea = document.getElementById("clickable-area");
    const feedback = document.getElementById("feedback");
    const kaboomMessage = document.createElement("p"); // Create kaboom message element
    kaboomMessage.id = "kaboom-message";
    feedback.after(kaboomMessage); // Place it right after the feedback
    const gameTitle = document.getElementById("game-title");
    const roleButtons = document.querySelectorAll(".role-btn");
    const startButton = document.getElementById("start-button");

    let selectedRole = null;
    let shortageType;
    let shortRoles, longRoles;
    let ropeMap = {};

    // **Positions for circles (clockwise from A)**
    const labeledPositions = [
        { x: 290, y: 160, marker: "A" },
        { x: 380, y: 200, marker: "2" },
        { x: 420, y: 285, marker: "B" },
        { x: 380, y: 370, marker: "3" },
        { x: 290, y: 410, marker: "C" },
        { x: 200, y: 370, marker: "4" },
        { x: 160, y: 285, marker: "D" },
        { x: 200, y: 200, marker: "1" }
    ];

    // **Role selection logic**
    roleButtons.forEach(button => {
        button.addEventListener("click", () => {
            roleButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            selectedRole = button.dataset.role;
            gameTitle.innerText = `You selected: ${selectedRole}`;
            startButton.classList.add("enabled");
            startButton.disabled = false;
            startButton.style.cursor = "pointer";
        });
    });

    // **Start/Reset button logic**
    startButton.addEventListener("click", () => {
        if (selectedRole) {
            startGame();
        }
    });

    // **Function to start/reset the game**
    function startGame() {
        feedback.innerText = "";
        kaboomMessage.innerText = ""; // Clear kaboom message on reset
        ropeMap = {};

        // **Randomly decide if DPS or Supports are short**
        const shortages = ["DPS Short", "Supports Short"];
        shortageType = shortages[Math.floor(Math.random() * shortages.length)];

        let longType = shortageType === "DPS Short" ? "Supports Long" : "DPS Long";
        gameTitle.innerText = `${shortageType} - ${longType} - Click your fuse.`;

        // **Assign correct role orders**
        if (shortageType === "DPS Short") {
            shortRoles = ["M1", "M2", "R1", "R2"];
            longRoles = ["MT", "OT", "H1", "H2"];
        } else {
            shortRoles = ["MT", "OT", "H1", "H2"];
            longRoles = ["M1", "M2", "R1", "R2"];
        }

        clickableArea.innerHTML = ""; // Clear previous elements
        generateYellowRopes();
        generateCircles();
        generateCenterRedCircle();

        startButton.innerText = "Reset";
    }

    // **Function to generate ropes**
    function generateYellowRopes() {
        const centerX = 295;
        const centerY = 260;
        const allAngles = [0, 45, 90, 135, 180, 225, 270, 315];
        const circleLabels = {
            0: "A", 45: "2", 90: "B", 135: "3",
            180: "C", 225: "4", 270: "D", 315: "1"
        };

        let availableAngles = [...allAngles];
        let shortRopePositions = [];
        let longRopePositions = [];

        function getRandomAngle() {
            const randomIndex = Math.floor(Math.random() * availableAngles.length);
            return availableAngles.splice(randomIndex, 1)[0];
        }

        for (let i = 0; i < 4; i++) {
            let angle = getRandomAngle();
            let pos = circleLabels[angle];
            shortRopePositions.push(pos);
            ropeMap[pos] = "short";
            createRopeElement(pos, "short", centerX, centerY, angle);
        }

        for (let i = 0; i < 4; i++) {
            let angle = getRandomAngle();
            let pos = circleLabels[angle];
            longRopePositions.push(pos);
            ropeMap[pos] = "long";
            createRopeElement(pos, "long", centerX, centerY, angle);
        }

        assignRolesToRopes(shortRopePositions, shortRoles, "short");
        assignRolesToRopes(longRopePositions, longRoles, "long");
    }

    // **Function to create rope elements**
    function createRopeElement(position, type, centerX, centerY, angle) {
        let rope = document.createElement("div");
        rope.classList.add("yellow-rope", `${type}-rope`);
        rope.style.left = `${centerX}px`;
        rope.style.top = type === "long" ? `${centerY - 35}px` : `${centerY}px`;
        rope.style.transform = `rotate(${angle}deg) translateY(${type === "long" ? "-160px" : "-128px"})`;
        clickableArea.appendChild(rope);
    }

    // **Function to assign roles to ropes**
    function assignRolesToRopes(ropePositions, roleOrder, type) {
        let sortedRopes = ropePositions.sort((a, b) => 
            labeledPositions.findIndex(p => p.marker === a) - labeledPositions.findIndex(p => p.marker === b)
        );

        sortedRopes.forEach((pos, index) => {
            if (index < roleOrder.length) {
                ropeMap[`${type}RoleMap`] = ropeMap[`${type}RoleMap`] || {};
                ropeMap[`${type}RoleMap`][pos] = roleOrder[index];
            }
        });
    }

    // **Function to generate green circles and handle game logic**
    function generateCircles() {
        labeledPositions.forEach((pos) => {
            let circle = document.createElement("div");
            circle.classList.add("green-circle");
            circle.style.left = `${pos.x}px`;
            circle.style.top = `${pos.y}px`;
            circle.dataset.marker = pos.marker;

            circle.addEventListener("click", () => {
                let ropeStatus = ropeMap[pos.marker] || "safe";
                let expectedRole = ropeMap.shortRoleMap?.[pos.marker] || ropeMap.longRoleMap?.[pos.marker] || null;

                if (!expectedRole) {
                    feedback.innerText = `❌ Wrong! ${selectedRole}, this is not a valid selection.`;
                    feedback.style.color = "red";
                    kaboomMessage.innerText = ""; // Clear kaboom message on incorrect
                } else if (selectedRole === expectedRole) {
                    feedback.innerText = `✅ Correct! ${selectedRole} clicked ${pos.marker}, a ${ropeStatus} rope.`;
                    feedback.style.color = "green";
                    
                    // **Add Kaboom Order message based on shortage type**
                    kaboomMessage.innerText = (shortageType === "DPS Short") 
                        ? "💥 Kaboom order is M1 M2 R1 R2 then MT OT H1 H2 \nWait for the 2 second vuln to fall and heal up before the next boom\n\n Hit Reset to go again"
                        : "💥 Kaboom order is MT OT H1 H2 then M1 M2 R1 R2 \nWait for the 2 second vuln to fall and heal up before the next boom\n\n Hit Reset to go again";

                } else {
                    feedback.innerText = `❌ Wrong! ${selectedRole}, Everyone is probably dead now.`;
                    feedback.style.color = "red";
                    kaboomMessage.innerText = ""; // Clear kaboom message on incorrect
                }
            });

            clickableArea.appendChild(circle);
        });
    }

    function generateCenterRedCircle() {
        let redCircle = document.createElement("div");
        redCircle.classList.add("red-circle");
        redCircle.style.left = "285px";
        redCircle.style.top = "285px";
        clickableArea.appendChild(redCircle);
    }
});
