function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random properties
                const size = Math.random() * 4 + 1;
                const posX = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = Math.random() * 10 + 5;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}%`;
                particle.style.bottom = `-${size}px`;
                particle.style.animation = `floatParticle ${duration}s linear ${delay}s infinite`;
                particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`;
                
                particlesContainer.appendChild(particle);
            }
        }

        // Create shooting stars
        function createShootingStars() {
            const starsContainer = document.getElementById('shootingStars');
            
            setInterval(() => {
                const star = document.createElement('div');
                star.className = 'shooting-star';
                
                // Random position
                star.style.top = `${Math.random() * 50}%`;
                star.style.left = `${Math.random() * 50}%`;
                star.style.animationDuration = `${Math.random() * 2 + 1}s`;
                
                starsContainer.appendChild(star);
                
                // Remove after animation
                setTimeout(() => {
                    star.remove();
                }, 3000);
            }, 2000);
        }

        // Typewriter effect
        function initTypewriter() {
            const phrases = [
                "Share your thoughts...",
                "Connect with souls...",
                "Broadcast your dreams...",
                "Spread the love...",
                "✨ Make some noise ✨"
            ];
            
            let phraseIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            const typewriterElement = document.getElementById('typewriter');
            
            function type() {
                const currentPhrase = phrases[phraseIndex];
                
                if (isDeleting) {
                    typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                }
                
                if (!isDeleting && charIndex === currentPhrase.length) {
                    isDeleting = true;
                    setTimeout(type, 2000);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(type, 500);
                } else {
                    setTimeout(type, isDeleting ? 50 : 100);
                }
            }
            
            type();
        }

        // Character counter
        const nameInput = document.getElementById('nameInput');
        const charCounter = document.getElementById('charCounter');
        
        nameInput.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/20`;
            
            // Update counter color based on length
            if (length > 15) {
                charCounter.classList.add('warning');
                charCounter.classList.remove('danger');
            } else if (length > 18) {
                charCounter.classList.add('danger');
                charCounter.classList.remove('warning');
            } else {
                charCounter.classList.remove('warning', 'danger');
            }
        });

        // Toast notification
        function showToast(message, icon = '✨') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            toastMessage.textContent = message;
            document.querySelector('.toast-icon').textContent = icon;
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Main send button functionality
        const sendBtn = document.getElementById('sendBtn');
        
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const name = nameInput.value.trim();
            
            // Validation
            if (name === '') {
                showToast('Please enter your name!', '⚠️');
                nameInput.focus();
                
                // Shake animation
                nameInput.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    nameInput.style.animation = '';
                }, 500);
                return;
            }
            
            if (name.length < 2) {
                showToast('Name must be at least 2 characters!', '📏');
                nameInput.focus();
                return;
            }
            
            // Success - show loading state
            this.disabled = true;
            const buttonContent = this.querySelector('.button-content');
            const originalContent = buttonContent.innerHTML;
            buttonContent.innerHTML = '<span class="loading-spinner"></span><span>Launching...</span>';
            
            // Show success toast
            showToast(`Welcome, ${name}! 🌟 Preparing your broadcast...`, '🚀');
            
            // Simulate loading (in real app, you'd redirect to broadcast room)
            setTimeout(() => {
                // Reset button (in real app, you'd redirect)
                this.disabled = false;
                buttonContent.innerHTML = originalContent;
                
                // Success animation

                showToast(`✨ Ready to broadcast, ${name}! ✨`, '🎉');
                window.location.href = `/broadcast/${name}`
                
                // You can uncomment this line to actually redirect
                // window.location.href = `/broadcast/${encodeURIComponent(name)}`;
                
                // For demo, clear input
                nameInput.value = '';
                charCounter.textContent = '0/20';
            }, 2000);
        });

        // Enter key support
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });

        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);

        // Initialize all animations
        createParticles();
        createShootingStars();
        initTypewriter();

        // Add focus effect on page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                nameInput.focus();
            }, 1000);
        });

        // Random welcome toasts
        const welcomeMessages = [
            { message: "Ready to broadcast your voice?", icon: "📡" },
            { message: "The universe is listening...", icon: "🌌" },
            { message: "Share your story with the world", icon: "📖" },
            { message: "Let your voice be heard!", icon: "🎤" },
            { message: "Spread the love! ✨", icon: "💫" }
        ];

        setInterval(() => {
            if (Math.random() > 0.7 && !sendBtn.disabled) {
                const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
                showToast(randomMsg.message, randomMsg.icon);
            }
        }, 8000);

        // Parallax effect on mouse move
        document.addEventListener('mousemove', (e) => {
            const card = document.querySelector('.glass-card');
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            
            card.style.transform = `translate(${x}px, ${y}px)`;
        });

        // Reset card position on mouse leave
        document.addEventListener('mouseleave', () => {
            const card = document.querySelector('.glass-card');
            card.style.transform = 'translate(0, 0)';
        })
        