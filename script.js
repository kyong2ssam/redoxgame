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
    const heartDisplay = document.getElementById('heart-display');
    const problemCountDisplay = document.getElementById('problem-count-display');
    const resultTitle = document.getElementById('result-title');
    const resultPlayer = document.getElementById('result-player');
    const finalScoreDisplay = document.getElementById('final-score-display');

    const matLeft = document.getElementById('mat-left');
    const matRight = document.getElementById('mat-right');
    const feedbackMsg = document.getElementById('feedback-msg');
    const reactantsText = document.getElementById('reactants-text');
    const blanks = document.querySelectorAll('.reaction-formula .blank');

    const modal = document.getElementById('electron-modal');
    const btnModalClose = document.getElementById('btn-modal-close');
    const eBtns = document.querySelectorAll('.e-btn');

    let timerInterval;
    let timeLeft = 300; // ★ 5분(300초)으로 단축
    let score = 0;
    let hearts = 3; // ★ 하트 3개
    let problemCount = 0; // 푼 문제 수
    let isReacted = false;
    let studentData = {};
    
    let currentProblem = null;
    let unusedProblems = []; // 중복 출제 방지용 큐
    let metalSide = ''; 

    // ★ 여기에 구글 앱스 스크립트 웹 앱 URL을 붙여넣으세요 ★
    const sheetUrl = 'https://script.google.com/macros/s/AKfycbwt9yZmDbP-4jWD5skO85LLZcv8gGLsdsgf-XaCXq5SYUzuCGTfeK_QVatgHIEgTycVeQ/exec'; 

    // 📚 거대 문제 은행 (39문제 - 중복 절대 없음)
    const problemsPool = [
        // 1개 전자 이동 (나트륨, 칼륨 등 1족 금속)
        { metal: 'Na', ion: 'Ag⁺', isReact: true, eCount: 1, prod1: 'Na⁺', prod2: '+ Ag' },
        { metal: 'K', ion: 'Ag⁺', isReact: true, eCount: 1, prod1: 'K⁺', prod2: '+ Ag' },
        { metal: 'Li', ion: 'Ag⁺', isReact: true, eCount: 1, prod1: 'Li⁺', prod2: '+ Ag' },
        // 2개 전자 이동
        { metal: 'Mg', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Cu' },
        { metal: 'Mg', ion: 'Zn²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Zn' },
        { metal: 'Mg', ion: 'Fe²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Fe' },
        { metal: 'Mg', ion: 'Ni²⁺', isReact: true, eCount: 2, prod1: 'Mg²⁺', prod2: '+ Ni' },
        { metal: 'Zn', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ Cu' },
        { metal: 'Zn', ion: 'Fe²⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ Fe' },
        { metal: 'Zn', ion: 'Ni²⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ Ni' },
        { metal: 'Fe', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Fe²⁺', prod2: '+ Cu' },
        { metal: 'Fe', ion: 'Ni²⁺', isReact: true, eCount: 2, prod1: 'Fe²⁺', prod2: '+ Ni' },
        { metal: 'Ni', ion: 'Cu²⁺', isReact: true, eCount: 2, prod1: 'Ni²⁺', prod2: '+ Cu' },
        { metal: 'Cu', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Cu²⁺', prod2: '+ 2Ag' },
        { metal: 'Zn', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Zn²⁺', prod2: '+ 2Ag' },
        { metal: 'Fe', ion: '2Ag⁺', isReact: true, eCount: 2, prod1: 'Fe²⁺', prod2: '+ 2Ag' },
        // 3개 전자 이동
        { metal: 'Al', ion: '3Ag⁺', isReact: true, eCount: 3, prod1: 'Al³⁺', prod2: '+ 3Ag' },
        // 6개 전자 이동
        { metal: '2Al', ion: '3Cu²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Cu' },
        { metal: '2Al', ion: '3Zn²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Zn' },
        { metal: '2Al', ion: '3Fe²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Fe' },
        { metal: '2Al', ion: '3Ni²⁺', isReact: true, eCount: 6, prod1: '2Al³⁺', prod2: '+ 3Ni' },
        // --- 반응 안 함 (금속 < 이온) 0개 ---
        { metal: 'Cu', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: 'Na⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ag', ion: 'Cu²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ag', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ag', ion: 'Na⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Fe', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Fe', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Zn', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Al', ion: 'Mg²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Ni', ion: 'Zn²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Cu', ion: 'Fe²⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' },
        { metal: 'Fe', ion: 'Al³⁺', isReact: false, eCount: 0, prod1: '반응', prod2: '안 함' }
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

    tempEndBtn.addEventListener('click', () => endGame(false));
    btnRestart.addEventListener('click', () => {
        infoForm.reset(); 
        const statusMsg = document.getElementById('save-status');
        if(statusMsg) statusMsg.remove();
        switchScreen(screenIntro); 
    });

    // ★ 감점 및 하트 감소 처리 함수
    function handleMistake(penaltyPoint, message) {
        score = Math.max(0, score - penaltyPoint);
        scoreDisplay.textContent = score;
        feedbackMsg.style.color = '#f00';
        feedbackMsg.textContent = message;
        shakeScreen();

        hearts--;
        updateHUD();

        if (hearts <= 0) {
            isReacted = true; // 추가 조작 방지
            feedbackMsg.textContent = "하트가 모두 소진되었습니다! GAME OVER";
            setTimeout(() => endGame(false), 1500);
            return true; // 게임 오버 상태 반환
        }
        return false;
    }

    // --- 반응 없음 버튼 ---
    btnNoReaction.addEventListener('click', () => {
        if(isReacted || hearts <= 0) return;
        
        if(currentProblem.isReact === false) {
            isReacted = true;
            score += 100;
            scoreDisplay.textContent = score;
            feedbackMsg.style.color = '#0f0';
            feedbackMsg.textContent = "정답! 이온화 경향성이 작아 반응하지 않습니다.";
            blanks[0].textContent = "반응"; blanks[1].textContent = "없음";
            blanks[0].style.color = '#ffaa00'; blanks[1].style.color = '#ffaa00';
            
            problemCount++;
            setTimeout(loadNextProblem, 1500);
        } else {
            handleMistake(20, "틀렸습니다! 금속의 이온화 경향성이 더 커서 반응합니다!");
        }
    });

    // --- 드래그 앤 드롭 ---
    const materials = [matLeft, matRight];
    materials.forEach(mat => {
        const electron = mat.querySelector('.electron');
        
        electron.addEventListener('dragstart', (e) => {
            if(isReacted || hearts <= 0) { e.preventDefault(); return; }
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
            if(isReacted || hearts <= 0) return;

            const sourceId = e.dataTransfer.getData('sourceId');
            if(sourceId === mat.id) return; 

            // 이온 -> 금속 오답
            if (sourceId !== metalSide) {
                handleMistake(10, "이온은 전자를 내어줄 수 없습니다!");
                return;
            }

            // 금속 -> 이온
            if (sourceId === metalSide) {
                if (currentProblem.isReact === false) {
                    handleMistake(20, "반응성이 작아 전자를 줄 수 없어요! (반응 없음 버튼 이용)");
                } else {
                    modal.classList.remove('hidden');
                }
            }
        });
    });

    // --- 전자 계수 모달 ---
    btnModalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    eBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(hearts <= 0) return;
            const selectedCount = parseInt(e.target.getAttribute('data-val'));
            modal.classList.add('hidden');

            if (selectedCount === currentProblem.eCount) {
                isReacted = true;
                score += 100;
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#0f0';
                feedbackMsg.textContent = `정답입니다! 전자 ${selectedCount}개 이동 성공!`;
                blanks[0].textContent = currentProblem.prod1; blanks[1].textContent = currentProblem.prod2;
                blanks[0].style.color = '#0ff'; blanks[1].style.color = '#0ff';
                
                problemCount++;
                setTimeout(loadNextProblem, 1500);
            } else {
                handleMistake(20, `틀렸습니다! 전자가 ${selectedCount}개 이동하지 않습니다.`);
            }
        });
    });

    // --- 문제 출제 (중복 방지 셔플 알고리즘) ---
    function loadNextProblem() {
        if (timeLeft <= 0 || hearts <= 0) return; 
        
        // ★ 30문제를 다 풀면 성공적으로 종료
        if (problemCount >= 30) {
            endGame(true);
            return;
        }

        isReacted = false;
        feedbackMsg.textContent = '';
        modal.classList.add('hidden');
        
        updateHUD(); // 진행도 업데이트
        
        // 남은 문제가 없으면 배열을 다시 복사하고 랜덤으로 섞음
        if (unusedProblems.length === 0) {
            unusedProblems = [...problemsPool].sort(() => Math.random() - 0.5);
        }
        
        // 큐에서 하나 뽑기 (중복 없음)
        currentProblem = unusedProblems.pop();

        // 50% 확률로 좌우 배치 뒤집기
        const isMetalLeft = Math.random() < 0.5;
        metalSide = isMetalLeft ? 'mat-left' : 'mat-right';
        
        const metalElement = isMetalLeft ? matLeft.querySelector('.element') : matRight.querySelector('.element');
        const ionElement = isMetalLeft ? matRight.querySelector('.element') : matLeft.querySelector('.element');
        
        metalElement.textContent = currentProblem.metal;
        ionElement.textContent = currentProblem.ion;

        if (isMetalLeft) { reactantsText.textContent = `${currentProblem.metal} + ${currentProblem.ion}`; } 
        else { reactantsText.textContent = `${currentProblem.ion} + ${currentProblem.metal}`; }
        
        blanks[0].textContent = '[ ? ]'; blanks[1].textContent = '';
        blanks[0].style.color = '#f0f';

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
        score = 0; 
        timeLeft = 300; 
        hearts = 3;
        problemCount = 0;
        unusedProblems = []; // 큐 초기화
        
        updateHUD();
        loadNextProblem(); 
        switchScreen(screenGame);

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--; 
            updateHUD();
            if (timeLeft <= 0) endGame(false); 
        }, 1000);
    }

    function updateHUD() {
        // 시간
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeDisplay.style.color = timeLeft <= 60 ? '#f00' : '#0ff';
        timeDisplay.style.textShadow = timeLeft <= 60 ? '0 0 10px #f00' : '0 0 10px #0ff';

        // 하트
        heartDisplay.textContent = '❤️'.repeat(hearts) + '🖤'.repeat(3 - hearts);
        
        // 문제 진행도
        problemCountDisplay.textContent = (problemCount + 1 > 30) ? 30 : problemCount + 1;
    }

    // isSuccess: 30문제를 다 풀었으면 true, 시간초과/하트소진이면 false
    function endGame(isSuccess) {
        clearInterval(timerInterval); 
        finalScoreDisplay.textContent = score; 
        
        if(isSuccess) {
            resultTitle.textContent = "MISSION CLEAR!";
            resultTitle.style.color = "#0f0";
            resultTitle.style.textShadow = "0 0 20px #0f0";
        } else {
            resultTitle.textContent = "GAME OVER";
            resultTitle.style.color = "#f00";
            resultTitle.style.textShadow = "0 0 20px #f00";
        }

        switchScreen(screenResult); 
        saveScoreToSheet(); 
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