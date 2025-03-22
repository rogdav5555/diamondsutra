// Burger menu functionality
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');

burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('.burger-menu')) {
        burgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Set initial active link
document.querySelector('nav a[href="#home"]').classList.add('active');

// Smooth scroll functionality
function smoothScrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    const headerHeight = document.querySelector('header').offsetHeight;
    const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Handle navigation clicks
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const sectionId = link.getAttribute('href');
        smoothScrollToSection(sectionId);
    });
});

// Handle scroll arrow click
document.querySelector('.scroll-indicator').addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    document.querySelector('nav a[href="#chapters"]').classList.add('active');
    smoothScrollToSection('#chapters');
});

// Create chapter buttons
function createChapterButtons() {
    const chaptersGrid = document.querySelector('.chapters-grid');
    chaptersGrid.innerHTML = ''; // Clear existing content

    chapters.forEach(chapter => {
        const chapterCard = document.createElement('div');
        chapterCard.className = 'chapter-card';
        chapterCard.innerHTML = `
            <h3>${chapter.title}</h3>
            <p>${chapter.subtitle}</p>
        `;

        chapterCard.addEventListener('click', () => {
            openModal(chapter);
        });

        chaptersGrid.appendChild(chapterCard);
    });
}

// Initialize chapter buttons
document.addEventListener('DOMContentLoaded', createChapterButtons);

// Function to fetch chapter content
async function fetchChapterContent(chapterNumber) {
    try {
        const response = await fetch(`chapters/chapter${chapterNumber}.html`);
        if (!response.ok) throw new Error('Chapter content not found');
        return await response.text();
    } catch (error) {
        return 'Chapter content is being loaded...';
    }
}

// Modal functionality
const modal = document.getElementById('chapterModal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const prevButton = document.getElementById('prevChapter');
const nextButton = document.getElementById('nextChapter');

let currentChapter = 1;
const totalChapters = 32;

function updateNavigationButtons() {
    prevButton.disabled = currentChapter <= 1;
    nextButton.disabled = currentChapter >= totalChapters;
}

function openModal(chapter) {
    currentChapter = parseInt(chapter.number);
    modalTitle.textContent = chapter.title;
    modalContent.innerHTML = '<div class="loading">Loading chapter content...</div>';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    updateNavigationButtons();

    // Fetch and display chapter content
    fetchChapterContent(currentChapter).then(content => {
        modalContent.innerHTML = content;
    });
}

async function changeChapter(direction) {
    const currentContent = modalContent.querySelector('.chapter-content');
    if (!currentContent || modalContent.querySelector('.loading')) return;

    // Add fade-out animation
    currentContent.classList.add('fade-out');

    const newChapter = direction === 'next' ? currentChapter + 1 : currentChapter - 1;
    if (newChapter < 1 || newChapter > totalChapters) return;

    currentChapter = newChapter;
    modalTitle.textContent = `Chapter ${currentChapter}`;

    // Create loading element while keeping old content
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading chapter content...';
    modalContent.appendChild(loadingDiv);

    try {
        // Wait for fade-out animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove old content
        currentContent.remove();

        const content = await fetchChapterContent(currentChapter);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const newContent = tempDiv.querySelector('.chapter-content');
        newContent.classList.add('fade-in');
        
        // Remove loading and add new content
        loadingDiv.remove();
        modalContent.appendChild(newContent);
        modalContent.scrollTop = 0;

        // Trigger reflow and start animation
        newContent.offsetHeight;
        newContent.classList.remove('fade-in');
        updateNavigationButtons();
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = 'Failed to load chapter content';
        modalContent.innerHTML = '';
        modalContent.appendChild(errorDiv);
    }
}

// Handle chapter navigation
prevButton.addEventListener('click', () => {
    if (currentChapter > 1) {
        changeChapter('prev');
    }
});

nextButton.addEventListener('click', () => {
    if (currentChapter < totalChapters) {
        changeChapter('next');
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!modal.style.display || modal.style.display === 'none') return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentChapter > 1) {
            changeChapter('prev');
        }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentChapter < totalChapters) {
            changeChapter('next');
        }
    } else if (e.key === 'Escape') {
        closeModalFunction();
    }
});

function closeModalFunction() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.onclick = closeModalFunction;
window.onclick = (event) => {
    if (event.target === modal) closeModalFunction();
};

// Handle PDF download
document.getElementById('downloadPdf').addEventListener('click', async () => {
    try {
        const response = await fetch('diamond-sutra.pdf');
        if (!response.ok) throw new Error('PDF not found');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diamond-sutra.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('The PDF is currently being prepared. Please try again later.');
    }
});

// Chapter data
const chapters = [
    { number: 1, title: "Chapter 1", subtitle: "The Assembly" },
    { number: 2, title: "Chapter 2", subtitle: "Perfect Charity" },
    { number: 3, title: "Chapter 3", subtitle: "All Beings" },
    { number: 4, title: "Chapter 4", subtitle: "Selfless Giving" },
    { number: 5, title: "Chapter 5", subtitle: "Physical Form" },
    { number: 6, title: "Chapter 6", subtitle: "True Faith" },
    { number: 7, title: "Chapter 7", subtitle: "No Attainment" },
    { number: 8, title: "Chapter 8", subtitle: "Pure Land" },
    { number: 9, title: "Chapter 9", subtitle: "Silent Wisdom" },
    { number: 10, title: "Chapter 10", subtitle: "Past Lives" },
    { number: 11, title: "Chapter 11", subtitle: "Blessing of Truth" },
    { number: 12, title: "Chapter 12", subtitle: "Respecting the Sutra" },
    { number: 13, title: "Chapter 13", subtitle: "Receiving with Faith" },
    { number: 14, title: "Chapter 14", subtitle: "Perfect Peace" },
    { number: 15, title: "Chapter 15", subtitle: "Merit of the Sutra" },
    { number: 16, title: "Chapter 16", subtitle: "Purifying Evil" },
    { number: 17, title: "Chapter 17", subtitle: "Ultimate Reality" },
    { number: 18, title: "Chapter 18", subtitle: "Buddha's Vision" },
    { number: 19, title: "Chapter 19", subtitle: "Beyond Form" },
    { number: 20, title: "Chapter 20", subtitle: "Beyond Characteristics" },
    { number: 21, title: "Chapter 21", subtitle: "No Words" },
    { number: 22, title: "Chapter 22", subtitle: "Beyond Attainment" },
    { number: 23, title: "Chapter 23", subtitle: "Pure Practice" },
    { number: 24, title: "Chapter 24", subtitle: "Merit Without Attachment" },
    { number: 25, title: "Chapter 25", subtitle: "Teaching Without Words" },
    { number: 26, title: "Chapter 26", subtitle: "Dharma Body" },
    { number: 27, title: "Chapter 27", subtitle: "Not Cut Off" },
    { number: 28, title: "Chapter 28", subtitle: "No Attachment" },
    { number: 29, title: "Chapter 29", subtitle: "Perfect Tranquility" },
    { number: 30, title: "Chapter 30", subtitle: "The Essence of Wisdom" },
    { number: 31, title: "Chapter 31", subtitle: "Neither Grasped Nor Rejected" },
    { number: 32, title: "Chapter 32", subtitle: "The End of Illusion" }
];
