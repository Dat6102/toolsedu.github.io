var elt = document.getElementById('calculator');

var calculator = Desmos.GraphingCalculator(elt);

calculator.setExpression({ id: 'parabola', latex: 'y=x^2' });

function resizeCalculator() {
  elt.style.width = (window.innerWidth - 20) + "px";
  elt.style.height = (window.innerHeight - 20) + "px";
  calculator.resize();
}

resizeCalculator();

window.addEventListener("resize", resizeCalculator);

// https://github.com/Dat6102/totenh.github.io

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('iconCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    const icons = [];
    const iconCount = 50; 
    const iconList = ['➕','➖','➗','📏','📐','0️⃣','1️⃣','3️⃣','5️⃣','6️⃣','✖️','❌','🧮'];

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Icon {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100; 
            this.size = Math.random() * 30 + 20; 
            this.speed = Math.random() * 1 + 0.5; 
            this.char = iconList[Math.floor(Math.random() * iconList.length)];
        }

        update() {
            this.y -= this.speed;
            if (this.y < -50) { 
                this.reset();
            }
        }

        draw() {
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, this.x, this.y);
        }
    }

    function setupIcons() {
        for (let i = 0; i < iconCount; i++) {
            icons.push(new Icon());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        icons.forEach(icon => {
            icon.update();
            icon.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupIcons();
    animate();
});