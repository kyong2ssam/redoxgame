document.addEventListener('DOMContentLoaded', () => {
    const screenIntro = document.getElementById('screen-intro');
    const screenGame = document.getElementById('screen-game');
    const screenResult = document.getElementById('screen-result');

    const infoForm = document.getElementById('info-form');
    const tempEndBtn = document.getElementById('temp-end-btn');
    const btnRestart = document.getElementById('btn-restart');
    const btnNoReaction = document.getElementById('btn-no-reaction');
    
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const resultPlayer = document.getElementById('result-player');
    const finalScoreDisplay = document.getElementById('final-score-display');

    const matLeft = document.getElementById('mat-left');
    const matRight = document.getElementById('mat-right');
    const feedbackMsg = document.getElementById('feedback-msg');
    const reactantsText = document.getElementById('reactants-text');
    const blanks = document.querySelectorAll('.reaction-formula .blank');

    // 모달 관련 요소
    const modal = document.getElementById('electron-modal');
    const btnModalClose = document.getElementById('btn-modal-close');
    const eBtns = document.querySelectorAll('.e-btn');

    let timerInterval;
    let timeLeft = 600; 
    let score = 0;
    let isReacted = false;
    let studentData = {};
    
    let currentProblem = null;
    let lastProblemIndex = -1;
    let metalSide = ''; // 현재 화면에서 금속(전자 주는 쪽)이 배치된 위치

    // ★ 여기에 구글 앱스 스크립트 웹 앱 URL을 붙여넣으세요 ★
    const sheetUrl = 'https://script.google.com/macros/s/AKfycbwt9yZmDbP-4jWD5skO85LLZcv8gGLsdsgf-XaCXq5SYUzuCGTfeK_QVatgHIEgTycVeQ/exec'; 

    // 📚 30문제 (반응함 18종 / 반응안함 12종)
    const problems = [
        // --- 반응 일어남 (금속 > 이온) ---
        { metal: 'Mg', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Cu' },
        { metal: 'Mg', ion: 'Zn²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Zn' },
        { metal: 'Mg', ion: 'Fe²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Fe' },
        { metal: 'Mg', ion: '2H⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ H₂' },
        { metal: 'Mg', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ 2Ag' },
        { metal: '2Al', ion: '3Cu²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Cu' },
        { metal: '2Al', ion: '3Zn²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Zn' },
        { metal: '2Al', ion: '3Fe²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Fe' },
        { metal: 'Al', ion: '3Ag⁺', isReact: true, eCount: 3, prod1: 'Al³⁺', prod2: '+ 3Ag' },
        { metal: 'Zn', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ Cu' },
        { metal: 'Zn', ion: 'Fe²⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ Fe' },
        { metal: 'Zn', ion: '2H⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ H₂' },
        { metal: 'Zn', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ 2Ag' },
        { metal: 'Fe', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Fe²⁺', prod2: '+ Cu' },
        { metal: 'Fe', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Fe²⁺', prod2: '+ 2Ag' },
        { metal: 'Ni', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Ni²⁺', prod2: '+ Cu' },
        { metal: 'Cu', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Cu²⁺', prod2: '+ 2Ag' },
        { metal: 'Sn', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Sn²⁺', prod2: '+ Cu' },
        // --- 반응 안 함 (금속 < 이온) ---
        { metal: 'Cu', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: '2H⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ag', ion: 'Cu²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ag', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Fe', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Fe', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Zn', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Al', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Pb', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ni', ion: 'Fe²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: 'Fe²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' }
    ];

    infoForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        studentData = {
            grade: document.getElementById('grade').value,
            classNum: document.getElementById('classNum').value,
            studentNum: document.getElementById('studentNum').value,
            name: document.getElementById('name').value
        };
        resultPlayer.textContent = `플레이어: ${studentData.name}`;
        startGame(); 
    });

    tempEndBtn.addEventListener('click', endGame);
    btnRestart.addEventListener('click', () => {
        infoForm.reset(); 
        const statusMsg = document.getElementById('save-status');
        if(statusMsg) statusMsg.remove();
        switchScreen(screenIntro); 
    });

    // --- 새로운 로직: 반응 없음 버튼 ---
    btnNoReaction.addEventListener('click', () => {
        if(isReacted) return;
        
        if(currentProblem.isReact === false) {
            // 정답 (진짜 반응 안 함)
            isReacted = true;
            score += 100;
            scoreDisplay.textContent = score;
            feedbackMsg.style.color = '#0f0';
            feedbackMsg.textContent = "정답! 이온화 경향성이 작아 반응하지 않습니다.";
            blanks[0].textContent = "반응";
            blanks[1].textContent = "없음";
            blanks[0].style.color = '#ffaa00';
            blanks[1].style.color = '#ffaa00';
            setTimeout(loadNextProblem, 1500);
        } else {
            // 오답 (반응하는데 안 한다고 함)
            score = Math.max(0, score - 20);
            scoreDisplay.textContent = score;
            feedbackMsg.style.color = '#f00';
            feedbackMsg.textContent = "틀렸습니다! 금속의 이온화 경향성이 더 커서 반응합니다!";
            shakeScreen();
        }
    });

    // --- 드래그 앤 드롭 로직 ---
    const materials = [matLeft, matRight];
    materials.forEach(mat => {
        const electron = mat.querySelector('.electron');
        
        electron.addEventListener('dragstart', (e) => {
            if(isReacted) { e.preventDefault(); return; }
            e.dataTransfer.setData('sourceId', mat.id);
            setTimeout(() => { electron.style.opacity = '0.5'; }, 0);
            feedbackMsg.textContent = ''; 
        });

        electron.addEventListener('dragend', () => { electron.style.opacity = '1'; });
        mat.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            mat.style.borderColor = '#fff'; mat.style.boxShadow = '0 0 15px #fff';
        });
        mat.addEventListener('dragleave', () => {
            mat.style.borderColor = 'rgba(255,255,255,0.3)'; mat.style.boxShadow = 'none';
        });

        mat.addEventListener('drop', (e) => {
            e.preventDefault();
            mat.style.borderColor = 'rgba(255,255,255,0.3)'; mat.style.boxShadow = 'none';
            if(isReacted) return;

            const sourceId = e.dataTransfer.getData('sourceId');
            if(sourceId === mat.id) return; // 제자리 드롭 무시

            // 1. 이온에서 금속으로 드래그 시도 (무조건 오답)
            if (sourceId !== metalSide) {
                score = Math.max(0, score - 10);
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#f00';
                feedbackMsg.textContent = "이온은 전자를 내어줄 수 없습니다!";
                shakeScreen();
                return;
            }

            // 2. 금속에서 이온으로 드래그
            if (sourceId === metalSide) {
                if (currentProblem.isReact === false) {
                    // 반응하지 않는 조합인데 전자를 강제로 넘김
                    score = Math.max(0, score - 20);
                    scoreDisplay.textContent = score;
                    feedbackMsg.style.color = '#f00';
                    feedbackMsg.textContent = "반응성이 작아 전자를 줄 수 없어요! (반응 없음 버튼을 누르세요)";
                    shakeScreen();
                } else {
                    // 반응하는 조합 -> 전자 계수 선택 모달 띄우기
                    modal.classList.remove('hidden');
                }
            }
        });
    });

    // --- 전자 계수 모달 로직 ---
    btnModalClose.addEventListener('click', () => {
        modal.classList.add('hidden'); // 취소 버튼
    });

    eBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedCount = parseInt(e.target.getAttribute('data-val'));
            modal.classList.add('hidden');

            if (selectedCount === currentProblem.eCount) {
                // 계수 정답!
                isReacted = true;
                score += 100;
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#0f0';
                feedbackMsg.textContent = `정답입니다! 전자 ${selectedCount}개 이동 성공!`;

                blanks[0].textContent = currentProblem.prod1;
                blanks[1].textContent = currentProblem.prod2;
                blanks[0].style.color = '#0ff'; blanks[1].style.color = '#0ff';

                setTimeout(loadNextProblem, 1500);
            } else {
                // 계수 오답
                score = Math.max(0, score - 20);
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#f00';
                feedbackMsg.textContent = "이동하는 전자 수가 틀렸습니다! 반응식을 다시 확인하세요.";
                shakeScreen();
            }
        });
    });

    function loadNextProblem() {
        if (timeLeft <= 0) return; 
        isReacted = false;
        feedbackMsg.textContent = '';
        modal.classList.add('hidden');
        
        // 중복 방지 문제 뽑기
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * problems.length); } 
        while (randomIndex === lastProblemIndex);
        
        lastProblemIndex = randomIndex;
        currentProblem = problems[randomIndex];

        // 50% 확률로 좌우 배치
        const isMetalLeft = Math.random() < 0.5;
        metalSide = isMetalLeft ? 'mat-left' : 'mat-right';
        
        const metalElement = isMetalLeft ? matLeft.querySelector('.element') : matRight.querySelector('.element');
        const ionElement = isMetalLeft ? matRight.querySelector('.element') : matLeft.querySelector('.element');
        
        metalElement.textContent = currentProblem.metal;
        ionElement.textContent = currentProblem.ion;

        // 화면 하단 반응식 순서 맞춤
        if (isMetalLeft) {
            reactantsText.textContent = `${currentProblem.metal} + ${currentProblem.ion}`;
        } else {
            reactantsText.textContent = `${currentProblem.ion} + ${currentProblem.metal}`;
        }
        
        blanks[0].textContent = '[ ? ]'; blanks[1].textContent = '';
        blanks[0].style.color = '#f0f';

        // 전자 UI 초기화
        materials.forEach(mat => {
            const eBtn = mat.querySelector('.electron');
            eBtn.style.display = 'flex'; eBtn.style.opacity = '1';
        });
    }

    function shakeScreen() {
        const pf = document.querySelector('.play-field');
        pf.classList.add('shake');
        setTimeout(() => { pf.classList.remove('shake'); }, 500);
    }

    function startGame() {
        score = 0; timeLeft = 600; 
        scoreDisplay.textContent = score; updateTimerDisplay();
        loadNextProblem(); switchScreen(screenGame);

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--; updateTimerDisplay();
            if (timeLeft <= 0) endGame(); 
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.style.color = timeLeft <= 60 ? '#f00' : '#0ff';
        timeDisplay.style.textShadow = timeLeft <= 60 ? '0 0 10px #f00' : '0 0 10px #0ff';
    }

    function endGame() {
        clearInterval(timerInterval); 
        finalScoreDisplay.textContent = score; 
        switchScreen(screenResult); saveScoreToSheet(); 
    }

    async function saveScoreToSheet() {
        studentData.score = score; 
        btnRestart.style.display = 'none';
        
        let statusMsg = document.getElementById('save-status');
        if (!statusMsg) {
            statusMsg = document.createElement('p'); statusMsg.id = 'save-status';
            statusMsg.style.marginTop = '20px'; statusMsg.style.color = '#0ff'; statusMsg.style.fontSize = '1.2rem';
            document.querySelector('.result-info').appendChild(statusMsg);
        }
        statusMsg.textContent = '점수를 기록 중입니다...';

        try {
            const response = await fetch(sheetUrl, { method: 'POST', body: JSON.stringify(studentData) });
            if (response.ok) { statusMsg.textContent = '저장 완료!'; statusMsg.style.color = '#0f0'; } 
            else { throw new Error('Network error'); }
        } catch (error) {
            statusMsg.textContent = '저장에 실패했습니다.'; statusMsg.style.color = '#f00';
        } finally { btnRestart.style.display = 'block'; }
    }

    function switchScreen(targetScreen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        targetScreen.classList.add('active');
    }
});