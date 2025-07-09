/**
 * Main JavaScript file for portfolio website
 * Includes basic functionality and enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Automatically update copyright year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Project card interaction enhancements
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });

        card.addEventListener('click', function() {
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });

    // Console greeting
    console.log('%c👋 Halo! Selamat datang di portfolio saya.', 
               'color: #3498db; font-size: 14px; font-weight: bold;');
    console.log('%c🔍 Lihat proyek-proyek terbaru saya di atas!', 
               'color: #2ecc71; font-size: 12px;');
});