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

function resize() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    draw();
}

function updateWheel() {
    names = participantsInput.value.split('\n').filter(n => n.trim() !== "");
    participantCount.innerText = names.length;
    draw();
}

function draw() {
    const list = names.length > 0 ? names : ["LISTA VACÍA"];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (canvas.width / 2) - 10;
    arc = Math.PI / (list.length / 2);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    list.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.arc(centerX, centerY, 20, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX + Math.cos(angle + arc / 2) * (radius * 0.7), 
                      centerY + Math.sin(angle + arc / 2) * (radius * 0.7));
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(10, radius/10)}px sans-serif`;
        const txt = name.length > 10 ? name.substring(0, 8) + ".." : name;
        ctx.fillText(txt, -ctx.measureText(txt).width / 2, 0);
        ctx.restore();
    });
}

function spin() {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    spinBtn.disabled = true;

    let velocity = (parseInt(speedInput.value) / 100) + (Math.random() * 0.1);
    const friction = 0.985;

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
    
    document.getElementById('winnerName').innerText = winner.toUpperCase();
    
    // Resetear vistas del modal
    winnerModal.style.display = 'flex';
    cardPack.style.display = 'flex';
    cardPack.classList.remove('ripping');
    revealedCard.style.display = 'none';
}

// Lógica de apertura épica
cardPack.onclick = function() {
    cardPack.classList.add('ripping');
    setTimeout(() => {
        cardPack.style.display = 'none';
        revealedCard.style.display = 'flex';
    }, 600);
};

function closeModal() { 
    winnerModal.style.display = 'none'; 
}

window.addEventListener('resize', resize);
participantsInput.addEventListener('input', updateWheel);
spinBtn.addEventListener('click', spin);

// Inicio retardado para asegurar que el ancho del móvil sea correcto
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(resize, 300);
});