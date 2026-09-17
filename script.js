const texts = [
    "Quite a downpour... Nothing will get done until it clears. Let this be a lesson to those who yesterday said, \"I'll do it tomorrow.\"",
    "There's a reason you separate military and the police. One fights the enemies of the state, the other serves and protects the people. When the military becomes both, then the enemies of the state tend to become the people.",
    "When diplomacy fails, there's only one alternative: violence. Force must be applied without apology. It's the Starfleet way."
];

let currentText = '';
let currentIndex = 0;
let startTime = null;
let timer = null;
let isActive = false;
let errors = 0;
let totalChars = 0;

const textContent = document.getElementById('textContent');
const typingInput = document.getElementById('typingInput');
const resetBtn = document.getElementById('resetBtn');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const charactersElement = document.getElementById('characters');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
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
    if (isActive) return;

    isActive = true;
    startTime = Date.now();
    typingInput.disabled = false;
    typingInput.placeholder = "Start typing...";
    typingInput.focus();
    autoGrowTextarea();
    progressText.textContent = 'Test in progress...';
    
    clearInterval(timer);
    timer = setInterval(() => {
        if (!isActive) return;
        updateStats();
    }, 1000);
}

function handleInput(e) {
    if (e.target.value.length == 1) {
        e.target.value = e.target.value.trimStart();
    }

    if (!isActive && e.target.value.length > 0) {
        startTest();
    }

    if (!isActive) return;

    const inputValue = e.target.value;
    currentIndex = inputValue.length;

    updateDisplay(inputValue);
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

    // ensure stats are updated and stop the periodic timer
    updateStats();
    clearInterval(timer);
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
    startTime = null;
    
    clearInterval(timer);
    resetStenokeys();

    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.placeholder = 'Start typing to begin...';
    typingInput.style.height = 'auto';
    progressText.textContent = 'Ready to Start';

    wpmElement.textContent = '0';
    accuracyElement.textContent = 100;
    charactersElement.textContent = 0;
    progressFill.style.width = '0%';

    loadNewText();
    resultsModal.classList.remove('show');
    typingInput.focus();
}

function closeResults() {
    resultsModal.classList.remove('show');
    resetTest();
}

function autoGrowTextarea() {
    typingInput.style.height = 'auto';
    typingInput.style.height = `${Math.min(typingInput.scrollHeight, 220)}px`;
}

resetBtn.addEventListener('click', resetTest);
typingInput.addEventListener('input', handleInput);
typingInput.addEventListener('paste', (e) => e.preventDefault());
tryAgainBtn.addEventListener('click', closeResults);

// Connects to server.py which makes websocket in Plover to get strokes
const ws = new WebSocket("ws://localhost:8086/websocket");

const leftStenoKeys = {
    '#': document.querySelector('[data-stroke="#"]'),
    'S': document.querySelector('[data-stroke="S"]'), 
    'T': document.querySelector('[data-stroke="T"]'), 
    'K': document.querySelector('[data-stroke="K"]'), 
    'P': document.querySelector('[data-stroke="P"]'), 
    'W': document.querySelector('[data-stroke="W"]'), 
    'H': document.querySelector('[data-stroke="H"]'), 
    'R': document.querySelector('[data-stroke="R"]'),
};

const vowelAsteriskStenoKeys = {
    'A': document.querySelector('[data-stroke="A"]'), 
    'O': document.querySelector('[data-stroke="O"]'), 
    '*': document.querySelector('[data-stroke="*"]'), 
    'E': document.querySelector('[data-stroke="E"]'), 
    'U': document.querySelector('[data-stroke="U"]')
};

const rightStenoKeys = {
    'F': document.querySelector('[data-stroke="-F"]'), 
    'R': document.querySelector('[data-stroke="-R"]'), 
    'P': document.querySelector('[data-stroke="-P"]'), 
    'B': document.querySelector('[data-stroke="-B"]'), 
    'L': document.querySelector('[data-stroke="-L"]'), 
    'G': document.querySelector('[data-stroke="-G"]'), 
    'T': document.querySelector('[data-stroke="-T"]'), 
    'S': document.querySelector('[data-stroke="-S"]'), 
    'D': document.querySelector('[data-stroke="-D"]'), 
    'Z': document.querySelector('[data-stroke="-Z"]')
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    let stroke = "";

    if (data.rtfcre) {
        resetStenokeys();
        stroke = data.rtfcre;
        let individualKeys = Array.from(stroke);
        
        // console.log(individualKeys);
        activateKeys(individualKeys);
    }

    // console.log(event.data);
    // if (data.rtfcre) {
    //     console.log("Steno stroke:", data.rtfcre);
    // }
};

function activateKeys(individualKeys) {
    let leftKeysExist = true;
    let vowelKeysExist = true;

    for (const char of individualKeys) {
        if (char === '-') {
            leftKeysExist = false;
            vowelKeysExist = false;
            continue;
        }

        if (leftKeysExist && char in leftStenoKeys) {
            leftStenoKeys[char].classList.add('active');
        } else if (vowelKeysExist && char in vowelAsteriskStenoKeys) {
            leftKeysExist = false;
            vowelAsteriskStenoKeys[char].classList.add("active");
        } else if(char in rightStenoKeys) {
            vowelKeysExist = false;
            rightStenoKeys[char].classList.add("active");
        }
    }
}

function resetStenokeys() {
    document.querySelectorAll('.steno-key').forEach(k => {
        k.classList.remove('active');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadNewText();
    typingInput.disabled = false;
    typingInput.placeholder = 'Start typing to begin...';
    typingInput.focus();
});