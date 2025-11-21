// Fade-in sections when scrolling
const revealElements = document.querySelectorAll('.animate-reveal');
const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  revealElements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;
    if (boxTop < triggerBottom) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transition = 'all 0.6s ease-out';
    }
  });
};
window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // run once on load

// Hover effect for product cards
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'scale(1.03)';
    card.style.transition = 'transform 0.3s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'scale(1)';
  });
});

// Extra splash animation (text slide-in)
const splashTitle = document.querySelector('#splash h1');
if (splashTitle) {
  splashTitle.style.opacity = 0;
  splashTitle.style.transform = 'translateY(20px)';
  setTimeout(() => {
    splashTitle.style.transition = 'all 0.8s ease';
    splashTitle.style.opacity = 1;
    splashTitle.style.transform = 'translateY(0)';
  }, 300);
}
