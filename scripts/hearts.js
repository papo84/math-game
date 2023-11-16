var maxParticleCount = 85;
var particleSpeed = 0.5;
var startHearts;
var stopHearts;
var toggleHearts;
var removeHearts;

(function() {
    startHearts = startHeartsInner;
    stopHearts = stopHeartsInner;
    toggleHearts = toggleHeartsInner;
    removeHearts = removeHeartsInner;

    var colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
    var streamingHearts = false;
    var animationTimer = null;
    var particles = [];
    var waveAngle = 0;

    function resetParticle(particle, width, height) {
        particle.color = colors[(Math.random() * colors.length) | 0];
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 25 + 5;
        particle.tilt = Math.random() * 15 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = 0;
        return particle;
    }
    

    function startHeartsInner() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        window.requestAnimFrame = (function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                return window.setTimeout(callback, 16.6666667);
            };
        })();

        var canvas = document.getElementById("confettiCanvas");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var context = canvas.getContext("2d");

        while (particles.length < maxParticleCount)
            particles.push(resetParticle({}, width, height));

        streamingHearts = true;

        if (animationTimer === null) {
            (function runAnimation() {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);

                if (particles.length === 0)
                    animationTimer = null;
                else {
                    updateParticles();
                    drawParticles(context);
                    animationTimer = requestAnimFrame(runAnimation);
                }
            })();
        }
    }

    function stopHeartsInner() {
        streamingHearts = false;
    }

    function removeHeartsInner() {
        stopHearts();
        particles = [];
    }

    function toggleHeartsInner() {
        if (streamingHearts)
            stopHeartsInner();
        else
            startHeartsInner();
    }

    function drawParticles(context) {
        var particle;
    
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            context.save();
            context.beginPath();
            context.translate(particle.x + particle.tilt, particle.y);
            context.rotate(particle.tiltAngle);
    
            // Draw a wider and bigger heart shape
            context.moveTo(0, -particle.diameter / 2);
            context.quadraticCurveTo(particle.diameter / 2, -particle.diameter, 0, -particle.diameter / 1.25);
            context.quadraticCurveTo(-particle.diameter / 2, -particle.diameter, 0, -particle.diameter / 2);
    
            context.fillStyle = particle.color;  // Use fillStyle instead of strokeStyle
            context.fill();  // Use fill() instead of stroke()
    
            context.lineWidth = 2;
            context.strokeStyle = particle.color;
            context.stroke();
            context.closePath();
            context.restore();
        }
    }
    
    function updateParticles() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var particle;
        waveAngle += 0.01;

        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];

            if (!streamingHearts && particle.y < -15)
                particle.y = height + 100;
            else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(waveAngle);
                particle.y += (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }

            if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                if (streamingHearts && particles.length <= maxParticleCount)
                    resetParticle(particle, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
})();
