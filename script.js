document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const message = form.querySelector('textarea[name="message"]');
    const status = form.querySelector('.form-status');

    let valid = true;
    status.textContent = '';
    [name, email, message].forEach(input => {
      if (input && !input.value.trim()) {
        valid = false;
        input.classList.add('invalid');
      } else if (input) {
        input.classList.remove('invalid');
      }
    });

    if (!valid) {
      status.textContent = 'Please complete the required fields.';
      status.classList.add('error');
      status.setAttribute('role','alert');
      return;
    }

    // Simulate submission success
    status.textContent = 'Inquiry submitted successfully!';
    status.classList.remove('error');
    status.classList.add('success');
    status.setAttribute('role','status');

    form.reset();
    setTimeout(() => {
      status.textContent = '';
      status.classList.remove('success');
    }, 3500);
  });
});

// Mobile hamburger menu toggle + keyboard & aria support
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle("show");
  });

  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hamburger.click();
    }
  });
}

// Fade-in sections on scroll
const fades = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

fades.forEach(el => observer.observe(el));
