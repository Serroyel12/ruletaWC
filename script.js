const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const participantsInput = document.getElementById('participants');
const participantCount = document.getElementById('participantCount');
const winnerModal = document.getElementById('winnerModal');
const cardPack = document.getElementById('cardPack');
const revealedCard = document.getElementById('revealedCard');
const speedInput = document.getElementById('speed'); // El slider de fuerza

let names = [];
let startAngle = 0;
let arc = 0;
let isSpinning = false;

// Paleta de colores vibrantes
const colors = ["#dc0a2d", "#3d7dca", "#ffcb05", "#47a049", "#9b59b6", "#f39c12"];

function updateWheel() {
    names = participantsInput.value.split('\n').filter(n => n.trim() !== "");
    participantCount.innerText = names.length;
    draw();
}

function draw() {
    const list = names.length > 0 ? names : ["AÑADE NOMBRES"];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    arc = Math.PI / (list.length / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    list.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, 240, angle, angle + arc, false);
        ctx.arc(centerX, centerY, 30, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX + Math.cos(angle + arc / 2) * 170, centerY + Math.sin(angle + arc / 2) * 170);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.fillStyle = "white";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.font = "bold 16px sans-serif";
        const txt = name.length > 15 ? name.substring(0, 12) + ".." : name;
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, 0);
        ctx.restore();
    });
}

function spin() {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    spinBtn.disabled = true;

    // --- LÓGICA DE FUERZA MEJORADA ---
    // Obtenemos el valor del slider (20 a 70)
    const force = parseInt(speedInput.value); 
    
    // La velocidad inicial depende directamente de la fuerza (convertida a radianes/frame)
    let velocity = (force / 100) + (Math.random() * 0.1); 
    
    // El rozamiento (fricción): cuanto más pequeño, más tiempo tarda en parar
    // Usamos un valor constante para que la sensación de "frenado" sea natural
    const friction = 0.985 + (Math.random() * 0.005); 

    function animate() {
        if (velocity < 0.001) { // Cuando la velocidad es casi cero, paramos
            isSpinning = false;
            spinBtn.disabled = false;
            determineWinner();
            return;
        }

        velocity *= friction; // Aplicamos fricción en cada frame
        startAngle += velocity; // Movemos la ruleta
        
        draw();
        requestAnimationFrame(animate);
    }
    
    animate();
}

function determineWinner() {
    // Calculamos el ángulo final para saber quién está bajo la flecha (flecha en -90 grados/arriba)
    const degrees = (startAngle * 180 / Math.PI) + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - (degrees % 360)) / arcd) % names.length;
    const winner = names[index >= 0 ? index : 0];
    
    showWinnerModal(winner);
}

function showWinnerModal(name) {
    winnerModal.style.display = 'flex';
    cardPack.style.display = 'flex';
    revealedCard.style.display = 'none';
    document.getElementById('winnerName').innerText = name.toUpperCase();

    cardPack.onclick = () => {
        cardPack.classList.add('ripping');
        setTimeout(() => {
            cardPack.style.display = 'none';
            cardPack.classList.remove('ripping');
            revealedCard.style.display = 'flex';
        }, 600);
    };
}

function closeModal() {
    winnerModal.style.display = 'none';
}

// Listeners
participantsInput.addEventListener('input', updateWheel);
spinBtn.addEventListener('click', spin);

// Inicializar
updateWheel();