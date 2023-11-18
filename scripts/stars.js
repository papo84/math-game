var maxParticleCount = 85;
var particleSpeed = 0.5;
var startStars;
var stopStars;
var toggleStars;
var removeStars;

(function() {
    startStars = startStarsInner;
    stopStars = stopStarsInner;
    toggleStars = toggleStarsInner;
    removeStars = removeStarsInner;

    var colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
    var streamingStars = false;
    var animationTimer = null;
    var particles = [];
    var waveAngle = 0;

    function resetParticle(particle, width, height) {
        particle.color = colors[(Math.random() * colors.length) | 0];
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 10 + 5;
        particle.tilt = Math.random() * 10 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = 0;
        return particle;
    }
    

    function startStarsInner() {
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

        streamingStars = true;

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

    function stopStarsInner() {
        streamingStars = false;
    }

    function removeStarsInner() {
        stopStars();
        particles = [];
    }

    function toggleStarsInner() {
        if (streamingStars)
            stopStarsInner();
        else
            startStarsInner();
    }

    function drawParticles(context) {
        var particle;
        var x;
    
        for (var i = 0; i < particles.length; i++) {
            particle = particles[i];
            context.save();
            context.beginPath();
            context.translate(particle.x + particle.tilt, particle.y);
            context.rotate(particle.tiltAngle);
    
            // Draw a star shape
            context.moveTo(0, -particle.diameter / 2);
            context.lineTo(0, particle.diameter / 2);
            context.moveTo(-particle.diameter / 4, -particle.diameter / 4);
            context.lineTo(particle.diameter / 4, particle.diameter / 4);
            context.moveTo(-particle.diameter / 4, particle.diameter / 4);
            context.lineTo(particle.diameter / 4, -particle.diameter / 4);
            context.moveTo(-particle.diameter / 2, 0);
            context.lineTo(particle.diameter / 2, 0);
    
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

            if (!streamingStars && particle.y < -15)
                particle.y = height + 100;
            else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(waveAngle);
                particle.y += (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }

            if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                if (streamingStars && particles.length <= maxParticleCount)
                    resetParticle(particle, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
})();
