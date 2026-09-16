const texts = [
    "Quite a downpour... Nothing will get done until it clears. Let this be a lesson to those who yesterday said, \"I'll do it tomorrow.\"",
    "There's a reason you separate military and the police. One fights the enemies of the state, the other serves and protects the people. When the military becomes both, then the enemies of the state tend to become the people.",
    "When diplomacy fails, there's only one alternative: violence. Force must be applied without apology. It's the Starfleet way."
];

let currentText = '';
let currentIndex = 0;
let startTime = null;
let timeLeft = 60;
let timer = null;
let isActive = false;
let errors = 0;
let totalChars = 0;

const textContent = document.getElementById('textContent');
const typingInput = document.getElementById('typingInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const charactersElement = document.getElementById('characters');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const timerElement = document.getElementById('timer');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const resultsModal = document.getElementById('resultsModal');

function loadNewText(){
    currentText = texts[Math.floor(Math.random() * texts.length)];
    displayText();
}

function displayText(){
    textContent.innerHTML = currentText
        .split('')
        .map((char, index) =>
            `<span class="char pending" data-index="${index}">${char}</span>`
        ).join('');
}

function startTest() {
    isActive = true;
    startTime = Date.now();
    typingInput.disabled = false;
    typingInput.placeholder = "Start typing...";
    typingInput.focus();
    autoGrowTextarea();
    startBtn.style.display = 'none';
    progressText.textContent = 'Test in progress...';
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerElement.querySelector('span').textContent = timeLeft;

        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function handleInput(e) {
    if (!isActive) return;

    const inputValue = e.target.value;
    currentIndex = inputValue.length;

    updateDisplay(inputValue);
    updateStats();
    updateProgress();
    autoGrowTextarea();

    if (((currentIndex >= currentText.length && (currentText.slice(-2) === typingInput.value.slice(-2))) || (currentIndex >= currentText.length + 20))) {
        endTest();
    }
}

function updateDisplay(inputValue) {
    const chars = document.querySelectorAll('.char');
    errors = 0;
    totalChars = currentIndex;

    chars.forEach((char, index) => {
        char.className = 'char';

        if (index < inputValue.length) {
            if(inputValue[index] === currentText[index]) {
                char.classList.add('correct');
            } else {
                char.classList.add('incorrect');
                errors++;
            }
        } else if (index === inputValue.length && index < currentText.length) {
            char.classList.add('current');
        } else {
            char.classList.add('pending');
        }
    })
}

function updateStats() {
    const timeElapsed = Math.max((Date.now() - startTime) / 1000 / 60, 1/60);
    const grossWPM = (currentIndex / 5) / timeElapsed;
    const netWPM = Math.max(0, Math.round(grossWPM - (errors / timeElapsed)));
    const accuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;

    wpmElement.textContent = isFinite(netWPM) ? netWPM : 0;
    accuracyElement.textContent = accuracy;
    charactersElement.textContent = totalChars;
}

function updateProgress() {
    const progress = (currentIndex / currentText.length) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
    if (progress >= 100) {
        progressText.textContent = 'Complete!';
    } else {
        progressText.textContent = `${Math.round(progress)}% complete`;
    }
}

function endTest() {
    isActive = false;
    typingInput.disabled = true;
    clearInterval(timer);

    updateStats()
    showResults();
}

function showResults() {
    const finalWpm = wpmElement.textContent;
    const finalAccuracy = accuracyElement.textContent;
    const finalCharacters = charactersElement.textContent;

    document.getElementById('finalWpm').textContent = finalWpm;
    document.getElementById('finalAccuracy').textContent = finalAccuracy;
    document.getElementById('finalCharacters').textContent = finalCharacters;

    resultsModal.classList.add('show');
}

function resetTest() {
    isActive = false;
    currentIndex = 0;
    errors = 0;
    totalChars = 0;
    timeLeft = 60;
    startTime = null;
    
    clearInterval(timer);

    typingInput.value = '';
    typingInput.disabled = true;
    typingInput.placeholder = 'Click start to begin typing...';
    typingInput.style.height = 'auto';
    startBtn.style.display = 'inline-flex';
    timerElement.querySelector('span').textContent = '60';
    progressText.textContent = 'Ready to Start';

    wpmElement.textContent = '0';
    accuracyElement.textContent = 100;
    charactersElement.textContent = 0;
    progressFill.style.width = '0%';

    loadNewText();
    resultsModal.classList.remove('show');
}

function closeResults() {
    resultsModal.classList.remove('show');
    resetTest();
}

function autoGrowTextarea() {
    typingInput.style.height = 'auto';
    typingInput.style.height = `${Math.min(typingInput.scrollHeight, 220)}px`;
}

typingInput.addEventListener('input', (e) => {
    handleInput(e);
    autoGrowTextarea();
});

startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);
typingInput.addEventListener('input', handleInput);
typingInput.addEventListener('paste', (e) => e.preventDefault());
tryAgainBtn.addEventListener('click', closeResults);

document.addEventListener('DOMContentLoaded', () => {
    loadNewText();
})