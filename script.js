const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const participantsInput = document.getElementById('participants');
const participantCount = document.getElementById('participantCount');
const winnerModal = document.getElementById('winnerModal');
const cardPack = document.getElementById('cardPack');
const revealedCard = document.getElementById('revealedCard');
const speedInput = document.getElementById('speed');

let names = [];
let startAngle = 0;
let arc = 0;
let isSpinning = false;

const colors = ["#dc0a2d", "#3d7dca", "#ffcb05", "#47a049", "#9b59b6", "#f39c12"];

// --- AJUSTE RESPONSIVE FORZADO ---
function resizeCanvas() {
    // Buscamos el ancho del contenedor padre
    const parent = canvas.parentElement;
    const size = Math.min(parent.offsetWidth, 500); 
    
    if (size > 0) {
        canvas.width = size;
        canvas.height = size;
        draw();
    }
}

// Escuchar cambios de tamaño y rotación de móvil
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

function updateWheel() {
    names = participantsInput.value.split('\n').filter(n => n.trim() !== "");
    participantCount.innerText = names.length;
    draw();
}

function draw() {
    const list = names.length > 0 ? names : ["AÑADE NOMBRES"];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = (canvas.width / 2) - 15;
    const textRadius = outerRadius * 0.7;
    
    arc = Math.PI / (list.length / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;

    list.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, angle, angle + arc, false);
        ctx.arc(centerX, centerY, 30, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX + Math.cos(angle + arc / 2) * textRadius, 
                      centerY + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        
        ctx.fillStyle = "white";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        
        const fontSize = Math.max(12, outerRadius / 12);
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        const txt = name.length > 12 ? name.substring(0, 10) + ".." : name;
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, 0);
        ctx.restore();
    });
}

function spin() {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    spinBtn.disabled = true;

    const force = parseInt(speedInput.value); 
    let velocity = (force / 100) + (Math.random() * 0.1); 
    const friction = 0.985 + (Math.random() * 0.005); 

    function animate() {
        if (velocity < 0.001) { 
            isSpinning = false;
            spinBtn.disabled = false;
            determineWinner();
            return;
        }
        velocity *= friction;
        startAngle += velocity;
        draw();
        requestAnimationFrame(animate);
    }
    animate();
}

function determineWinner() {
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

// --- INICIALIZACIÓN SEGURA ---
document.addEventListener('DOMContentLoaded', () => {
    updateWheel();
    setTimeout(resizeCanvas, 300); // Dar tiempo al navegador móvil
});

participantsInput.addEventListener('input', updateWheel);
spinBtn.addEventListener('click', spin);