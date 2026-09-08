document.addEventListener('DOMContentLoaded', () => {
    const screenIntro = document.getElementById('screen-intro');
    const screenGame = document.getElementById('screen-game');
    const screenResult = document.getElementById('screen-result');

    const infoForm = document.getElementById('info-form');
    const tempEndBtn = document.getElementById('temp-end-btn');
    const btnRestart = document.getElementById('btn-restart');
    
    const timeDisplay = document.getElementById('time-display');
    const scoreDisplay = document.getElementById('score-display');
    const resultPlayer = document.getElementById('result-player');
    const finalScoreDisplay = document.getElementById('final-score-display');

    const matLeft = document.getElementById('mat-left');
    const matRight = document.getElementById('mat-right');
    const feedbackMsg = document.getElementById('feedback-msg');
    
    const reactantsText = document.getElementById('reactants-text');
    const blanks = document.querySelectorAll('.reaction-formula .blank');

    let timerInterval;
    let timeLeft = 600; 
    let score = 0;
    let isReacted = false;
    let studentData = {};
    let currentProblem = null;
    let donorSide = ''; // 정답이 되는 위치 (전자를 주는 쪽)

    // ★ 여기에 구글 앱스 스크립트 웹 앱 URL을 붙여넣으세요 ★
    const sheetUrl = 'https://script.google.com/macros/s/AKfycbwt9yZmDbP-4jWD5skO85LLZcv8gGLsdsgf-XaCXq5SYUzuCGTfeK_QVatgHIEgTycVeQ/exec'; 

    // 📚 산화-환원 문제 은행 (31문제)
    const problems = [
        // Mg (마그네슘은 반응성이 매우 큼)
        { donor: 'Mg', acceptor: 'Zn²⁺', prod1: 'Mg²⁺', prod2: 'Zn' },
        { donor: 'Mg', acceptor: 'Fe²⁺', prod1: 'Mg²⁺', prod2: 'Fe' },
        { donor: 'Mg', acceptor: 'Cu²⁺', prod1: 'Mg²⁺', prod2: 'Cu' },
        { donor: 'Mg', acceptor: '2Ag⁺', prod1: 'Mg²⁺', prod2: '2Ag' },
        // Al (알루미늄)
        { donor: '2Al', acceptor: '3Zn²⁺', prod1: '2Al³⁺', prod2: '3Zn' },
        { donor: '2Al', acceptor: '3Fe²⁺', prod1: '2Al³⁺', prod2: '3Fe' },
        { donor: '2Al', acceptor: '3Cu²⁺', prod1: '2Al³⁺', prod2: '3Cu' },
        { donor: 'Al', acceptor: '3Ag⁺', prod1: 'Al³⁺', prod2: '3Ag' },
        // Zn (아연)
        { donor: 'Zn', acceptor: 'Fe²⁺', prod1: 'Zn²⁺', prod2: 'Fe' },
        { donor: 'Zn', acceptor: 'Ni²⁺', prod1: 'Zn²⁺', prod2: 'Ni' },
        { donor: 'Zn', acceptor: 'Cu²⁺', prod1: 'Zn²⁺', prod2: 'Cu' },
        { donor: 'Zn', acceptor: '2Ag⁺', prod1: 'Zn²⁺', prod2: '2Ag' },
        // Fe (철)
        { donor: 'Fe', acceptor: 'Ni²⁺', prod1: 'Fe²⁺', prod2: 'Ni' },
        { donor: 'Fe', acceptor: 'Sn²⁺', prod1: 'Fe²⁺', prod2: 'Sn' },
        { donor: 'Fe', acceptor: 'Cu²⁺', prod1: 'Fe²⁺', prod2: 'Cu' },
        { donor: 'Fe', acceptor: '2Ag⁺', prod1: 'Fe²⁺', prod2: '2Ag' },
        // Ni (니켈)
        { donor: 'Ni', acceptor: 'Sn²⁺', prod1: 'Ni²⁺', prod2: 'Sn' },
        { donor: 'Ni', acceptor: 'Cu²⁺', prod1: 'Ni²⁺', prod2: 'Cu' },
        { donor: 'Ni', acceptor: '2Ag⁺', prod1: 'Ni²⁺', prod2: '2Ag' },
        // Sn, Pb (주석, 납)
        { donor: 'Sn', acceptor: 'Cu²⁺', prod1: 'Sn²⁺', prod2: 'Cu' },
        { donor: 'Sn', acceptor: '2Ag⁺', prod1: 'Sn²⁺', prod2: '2Ag' },
        { donor: 'Pb', acceptor: 'Cu²⁺', prod1: 'Pb²⁺', prod2: 'Cu' },
        // Cu (구리)
        { donor: 'Cu', acceptor: '2Ag⁺', prod1: 'Cu²⁺', prod2: '2Ag' },
        // 알칼리/알칼리 토금속 
        { donor: 'Ca', acceptor: 'Mg²⁺', prod1: 'Ca²⁺', prod2: 'Mg' },
        { donor: 'Ca', acceptor: 'Zn²⁺', prod1: 'Ca²⁺', prod2: 'Zn' },
        { donor: 'Ca', acceptor: 'Cu²⁺', prod1: 'Ca²⁺', prod2: 'Cu' },
        { donor: '2Na', acceptor: 'Mg²⁺', prod1: '2Na⁺', prod2: 'Mg' },
        { donor: '2Na', acceptor: 'Zn²⁺', prod1: '2Na⁺', prod2: 'Zn' },
        { donor: '2Na', acceptor: 'Cu²⁺', prod1: '2Na⁺', prod2: 'Cu' },
        // 철 3가 이온 환원
        { donor: 'Zn', acceptor: '2Fe³⁺', prod1: 'Zn²⁺', prod2: '2Fe²⁺' },
        { donor: 'Cu', acceptor: '2Fe³⁺', prod1: 'Cu²⁺', prod2: '2Fe²⁺' }
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

    // --- 새로운 드래그 앤 드롭 로직 (양방향 판별) ---
    const materials = [matLeft, matRight];
    
    materials.forEach(mat => {
        const electron = mat.querySelector('.electron');
        
        // 드래그 시작 (어느 쪽에서 출발했는지 기록)
        electron.addEventListener('dragstart', (e) => {
            if(isReacted) { e.preventDefault(); return; }
            e.dataTransfer.setData('sourceId', mat.id);
            setTimeout(() => { electron.style.opacity = '0.5'; }, 0);
            feedbackMsg.textContent = ''; // 드래그 시작 시 메시지 초기화
        });

        electron.addEventListener('dragend', () => {
            electron.style.opacity = '1';
        });

        // 드롭 허용 영역 설정
        mat.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            mat.style.borderColor = '#fff';
            mat.style.boxShadow = '0 0 15px #fff';
        });

        mat.addEventListener('dragleave', () => {
            mat.style.borderColor = 'rgba(255,255,255,0.3)';
            mat.style.boxShadow = 'none';
        });

        // 드롭 처리 로직
        mat.addEventListener('drop', (e) => {
            e.preventDefault();
            mat.style.borderColor = 'rgba(255,255,255,0.3)';
            mat.style.boxShadow = 'none';

            if(isReacted) return;

            const sourceId = e.dataTransfer.getData('sourceId');
            const targetId = mat.id;

            // 같은 제자리(자신)에 드롭한 경우 무시
            if(sourceId === targetId) return;

            // 정답 체크 (출발지가 정답(donorSide)과 일치하는가?)
            if (sourceId === donorSide) {
                // 정답!
                isReacted = true; 
                
                // 연출 (출발지 전자는 사라지고, 목적지 전자는 크게 반짝임)
                document.getElementById(sourceId).querySelector('.electron').style.display = 'none';
                
                const targetElectron = mat.querySelector('.electron');
                targetElectron.style.background = '#0f0';
                targetElectron.style.color = '#000';
                targetElectron.style.boxShadow = '0 0 30px #0f0';
                targetElectron.style.transform = 'scale(1.2)';

                score += 100;
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#0f0';
                feedbackMsg.textContent = "정답입니다! 전자 이동 성공!";

                // 반응식 완성
                blanks[0].textContent = currentProblem.prod1;
                blanks[1].textContent = currentProblem.prod2;
                blanks[0].style.color = '#0ff';
                blanks[1].style.color = '#0ff';

                setTimeout(loadNextProblem, 1500); // 1.5초 뒤 다음 문제
            } else {
                // 오답! (반응성이 작은 놈한테서 전자를 뺏으려 함)
                score = Math.max(0, score - 20); // 오답 감점 (0점 밑으론 안 내려감)
                scoreDisplay.textContent = score;
                feedbackMsg.style.color = '#f00';
                feedbackMsg.textContent = "반응성이 작아 전자를 줄 수 없어요!";
                
                // 화면 흔들림 효과
                document.querySelector('.play-field').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('.play-field').classList.remove('shake');
                }, 500);
            }
        });
    });

    function loadNextProblem() {
        if (timeLeft <= 0) return; 

        isReacted = false;
        feedbackMsg.textContent = '';
        
        // 문제 뽑기
        const randomIndex = Math.floor(Math.random() * problems.length);
        currentProblem = problems[randomIndex];

        // 50% 확률로 좌우 배치 뒤섞기 (누가 산화할지 플레이어가 직접 판단하게 함)
        const isDonorLeft = Math.random() < 0.5;
        
        const donorElement = isDonorLeft ? matLeft.querySelector('.element') : matRight.querySelector('.element');
        const acceptorElement = isDonorLeft ? matRight.querySelector('.element') : matLeft.querySelector('.element');
        
        // 정답 위치 기록
        donorSide = isDonorLeft ? 'mat-left' : 'mat-right';

        donorElement.textContent = currentProblem.donor;
        acceptorElement.textContent = currentProblem.acceptor;

        // 화면 하단 반응식 (보이는 대로 좌우 순서 맞춰서 표시)
        if (isDonorLeft) {
            reactantsText.textContent = `${currentProblem.donor} + ${currentProblem.acceptor}`;
        } else {
            reactantsText.textContent = `${currentProblem.acceptor} + ${currentProblem.donor}`;
        }
        
        blanks[0].textContent = '[ ? ]';
        blanks[1].textContent = '[ ? ]';
        blanks[0].style.color = '#f0f';
        blanks[1].style.color = '#f0f';

        // 전자 UI 초기화
        materials.forEach(mat => {
            const eBtn = mat.querySelector('.electron');
            eBtn.style.display = 'flex';
            eBtn.style.opacity = '1';
            eBtn.style.background = '#0ff';
            eBtn.style.color = '#000';
            eBtn.style.boxShadow = '0 0 15px #0ff';
            eBtn.style.transform = 'scale(1)';
        });
    }

    function startGame() {
        score = 0;
        timeLeft = 600; 
        scoreDisplay.textContent = score;
        updateTimerDisplay();
        
        loadNextProblem(); 
        switchScreen(screenGame);

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) { endGame(); }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if(timeLeft <= 60) {
            timeDisplay.style.color = '#f00';
            timeDisplay.style.textShadow = '0 0 10px #f00';
        } else {
            timeDisplay.style.color = '#0ff';
            timeDisplay.style.textShadow = '0 0 10px #0ff';
        }
    }

    function endGame() {
        clearInterval(timerInterval); 
        finalScoreDisplay.textContent = score; 
        switchScreen(screenResult); 
        saveScoreToSheet(); 
    }

    async function saveScoreToSheet() {
        studentData.score = score; 
        btnRestart.style.display = 'none';
        
        let statusMsg = document.getElementById('save-status');
        if (!statusMsg) {
            statusMsg = document.createElement('p');
            statusMsg.id = 'save-status';
            statusMsg.style.marginTop = '20px';
            statusMsg.style.color = '#0ff';
            statusMsg.style.fontSize = '1.2rem';
            document.querySelector('.result-info').appendChild(statusMsg);
        }
        statusMsg.textContent = '점수를 기록 중입니다...';

        try {
            const response = await fetch(sheetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(studentData)
            });

            if (response.ok) {
                statusMsg.textContent = '저장 완료!';
                statusMsg.style.color = '#0f0';
            } else {
                throw new Error('Network error');
            }
        } catch (error) {
            statusMsg.textContent = '저장에 실패했습니다.';
            statusMsg.style.color = '#f00';
        } finally {
            btnRestart.style.display = 'block';
        }
    }

    function switchScreen(targetScreen) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        targetScreen.classList.add('active');
    }
});