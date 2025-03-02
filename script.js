document.addEventListener("DOMContentLoaded", () => {
    const clickableArea = document.getElementById("clickable-area");
    const feedback = document.getElementById("feedback");
    const gameTitle = document.getElementById("game-title");
    const roleButtons = document.querySelectorAll(".role-btn");
    const startButton = document.getElementById("start-button");
    const gameContainer = document.getElementById("game-container");

    let selectedRole = null;
    let currentField = null;
    let shortageType = null;
    let step = 1; // Track game progress

    // Positions for green circles
    const positions = [
        { x: 100, y: 115, marker: "1" },
        { x: 290, y: 115, marker: "A" },
        { x: 480, y: 115, marker: "2" },
        { x: 465, y: 290, marker: "B" },
        { x: 480, y: 465, marker: "3" },
        { x: 290, y: 465, marker: "C" },
        { x: 100, y: 465, marker: "4" },
        { x: 115, y: 290, marker: "D" },
        { x: 264, y: 315, marker: "Safe 4th Quad" },
        { x: 315, y: 265, marker: "Safe 2nd Quad" }
    ];

    // Generate circles once when the page loads
    function generateInitialCircles() {
        clickableArea.innerHTML = ""; // Clear any previous circles

        positions.forEach((pos) => {
            let circle = document.createElement("div");
            circle.classList.add("green-circle");
            circle.style.left = `${pos.x}px`;
            circle.style.top = `${pos.y}px`;
            circle.dataset.marker = pos.marker;

            circle.addEventListener("click", (event) => {
                handleSelection(event.target.dataset.marker);
            });

            clickableArea.appendChild(circle);
        });
    }

    // Role selection logic
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

    // Start/Reset button logic
    startButton.addEventListener("click", () => {
        if (selectedRole) {
            startGame();
        }
    });

    // Function to start the game while keeping the selected role
    function startGame() {
        step = 1; // Reset game step

        // Randomly set field background
        const fieldImages = ["img/fieldA.png", "img/fieldB.png"];
        currentField = fieldImages[Math.floor(Math.random() * fieldImages.length)];
        gameContainer.style.background = `url('${currentField}') no-repeat center center`;
        gameContainer.style.backgroundSize = "cover";

        // Randomly decide if DPS or Supports are short
        const shortages = ["DPS Short", "Supports Short"];
        shortageType = shortages[Math.floor(Math.random() * shortages.length)];

        gameTitle.innerText = `${shortageType} - Choose the correct spot!`;
        console.log(`Field selected: ${currentField}`);
        console.log(`Shortage Type: ${shortageType}`);

        feedback.innerText = ""; // Clear previous feedback

        // Change the Start button into a Reset button
        startButton.innerText = "Reset";
    }

    // Function to handle selections based on step
    function handleSelection(marker) {
        let correctMarkersStep1 = {};
        let correctMarkersStep2 = {};

        if (currentField === "img/fieldA.png") {
            if (shortageType === "DPS Short") {
                correctMarkersStep1 = { "MT": "Safe 4th Quad", "OT": "Safe 4th Quad", "H1": "Safe 4th Quad", "H2": "Safe 4th Quad", "M1": "D", "M2": "C", "R1": "2", "R2": "4" };
                correctMarkersStep2 = { "MT": "A", "OT": "B", "H1": "1", "H2": "3", "M1": "Safe 2nd Quad", "M2": "Safe 2nd Quad", "R1": "Safe 2nd Quad", "R2": "Safe 2nd Quad" };
            } else { // Supports Short
                correctMarkersStep1 = { "MT": "D", "OT": "C", "H1": "2", "H2": "4", "M1": "Safe 4th Quad", "M2": "Safe 4th Quad", "R1": "Safe 4th Quad", "R2": "Safe 4th Quad" };
                correctMarkersStep2 = { "MT": "Safe 2nd Quad", "OT": "Safe 2nd Quad", "H1": "Safe 2nd Quad", "H2": "Safe 2nd Quad", "M1": "A", "M2": "B", "R1": "1", "R2": "3" };
            }
        } else if (currentField === "img/fieldB.png") {
            if (shortageType === "DPS Short") {
                correctMarkersStep1 = { "MT": "Safe 2nd Quad", "OT": "Safe 2nd Quad", "H1": "Safe 2nd Quad", "H2": "Safe 2nd Quad", "M1": "A", "M2": "B", "R1": "2", "R2": "4" };
                correctMarkersStep2 = { "MT": "D", "OT": "C", "H1": "1", "H2": "3", "M1": "Safe 4th Quad", "M2": "Safe 4th Quad", "R1": "Safe 4th Quad", "R2": "Safe 4th Quad" };
            } else { // Supports Short
                correctMarkersStep1 = { "MT": "A", "OT": "B", "H1": "2", "H2": "4", "M1": "Safe 2nd Quad", "M2": "Safe 2nd Quad", "R1": "Safe 2nd Quad", "R2": "Safe 2nd Quad" };
                correctMarkersStep2 = { "MT": "Safe 4th Quad", "OT": "Safe 4th Quad", "H1": "Safe 4th Quad", "H2": "Safe 4th Quad", "M1": "D", "M2": "C", "R1": "1", "R2": "3" };
            }
        }

        if (step === 1 && correctMarkersStep1[selectedRole] === marker) {
            feedback.innerText = `✅ Correct! ${marker} was your first spot.`;
            feedback.style.color = "green";
            step = 2;
            gameTitle.innerText = "Now where do you go?";

            gameContainer.style.background = currentField === "img/fieldA.png" ? 
                "url('img/fieldA2.png') no-repeat center center" : 
                "url('img/fieldB2.png') no-repeat center center";
            gameContainer.style.backgroundSize = "cover";
        } else if (step === 2 && correctMarkersStep2[selectedRole] === marker) {
            feedback.innerText = `🎉 You Win! ${marker} was your final spot.`;
            feedback.style.color = "blue";
            gameTitle.innerText = "Congratulations! You solved the mechanic.";
        }
    }

    generateInitialCircles();
});
