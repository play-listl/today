document.addEventListener('DOMContentLoaded', function() {
    const answersList = document.getElementById('answers');
    const submitButton = document.getElementById('submit-btn');
    const shareButton = document.getElementById('share-btn');
    const scoreText = document.getElementById('score');
    const instructions = document.getElementById('instructions');

    const points = {
        'Star Trek': [20, 12, 8, 6, 4, 3, 2, 0],
        'Seinfeld': [16, 16, 11, 7, 5, 4, 2, 1],
        'The Simpsons': [12, 12, 14, 9, 7, 5, 3, 2],
        'Friends': [10, 10, 11, 12, 8, 6, 4, 4],
        'The Office (US)': [8, 8, 8, 9, 11, 8, 5, 5],
        'Breaking Bad': [6, 6, 7, 7, 8, 10, 7, 5],
        'Game of Thrones': [5, 5, 5, 6, 7, 9, 9, 7],
        'Squid Games': [4, 4, 4, 4, 5, 6, 7, 8]
    };

    const correctOrder = [
        'Star Trek',
        'Seinfeld',
        'The Simpsons',
        'Friends',
        'The Office (US)',
        'Breaking Bad',
        'Game of Thrones',
        'Squid Games'
    ];

    let gamesPlayed = 0;
    let highScore = 0;
    let totalScore = 0;
    let userAnswers = [];
    let scores = [];

    function displayAnswers() {
        const shuffledOrder = shuffle([...correctOrder]);
        answersList.innerHTML = '';
        shuffledOrder.forEach(answer => {
            const li = document.createElement('li');
            li.textContent = answer;
            li.draggable = true;
            answersList.appendChild(li);
        });
        addDragAndDropHandlers();
    }

    function addDragAndDropHandlers() {
        answersList.querySelectorAll('li').forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);

            // Touch events
            item.addEventListener('touchstart', handleTouchStart);
            item.addEventListener('touchmove', handleTouchMove);
            item.addEventListener('touchend', handleTouchEnd);
        });
    }

    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(answersList, e.clientY);
        if (afterElement == null) {
            answersList.appendChild(draggedItem);
        } else {
            answersList.insertBefore(draggedItem, afterElement);
        }
    }

    function handleDrop() {
        this.classList.remove('dragging');
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    // Touch event handlers
    let touchStartX = 0;
    let touchStartY = 0;

    function handleTouchStart(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        this.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    function handleTouchEnd(e) {
        this.classList.remove('dragging');
        this.style.transform = 'translate(0, 0)';
        draggedItem = null;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    submitButton.addEventListener('click', function() {
        userAnswers = Array.from(answersList.querySelectorAll('li')).map(li => li.textContent.trim());
        const result = calculateScore(userAnswers);
        gamesPlayed++;
        totalScore += result.score;
        highScore = Math.max(highScore, result.score);
        scores = result.scores;
        scoreText.textContent = `Total Score ${totalScore}/100`;

        // Show correct answers and user scores
        showCorrectAnswers(userAnswers, scores);

        submitButton.disabled = true;

        setTimeout(() => {
            alert(`High Score: ${highScore}\nGames Played: ${gamesPlayed}\nAverage Score: ${(totalScore / gamesPlayed).toFixed(2)}/100`);
        }, 500);
    });

    shareButton.addEventListener('click', function() {
        const scoreMessage = `Check out my score on today's listl: ${totalScore}/100`;
        const individualScores = userAnswers.map((answer, index) => `${index + 1}. ${scores[index].points}/${points[correctOrder[index]][index]}`).join('\n');
        const shareText = `${scoreMessage}\n\n${individualScores}`;

        if (navigator.share) {
            navigator.share({
                title: 'Listl Score',
                text: shareText
            }).then(() => {
                alert('Score shared successfully!');
            }).catch((error) => {
                console.error('Error sharing score:', error);
                alert('Failed to share score.');
            });
        } else {
            alert('Share functionality is not supported on your device.');
        }
    });

    function calculateScore(userAnswers) {
        let score = 0;
        let scores = [];

        userAnswers.forEach((answer, index) => {
            const pointsEarned = points[answer][index];
            score += pointsEarned;
            scores.push({ answer, points: pointsEarned });
        });
        return { score, scores };
    }

    function showCorrectAnswers(userAnswers, scores) {
        answersList.innerHTML = '';
        userAnswers.forEach((answer, index) => {
            const li = document.createElement('li');
            const userScore = scores[index].points;
            const maxScore = points[correctOrder[index]][index];
            li.textContent = `${answer} (${correctOrder[index]}) ${userScore}/${maxScore}`;
            if (correctOrder[index] === answer) {
                li.classList.add('correct');
            } else {
                const difference = Math.abs(correctOrder.indexOf(answer) - index);
                if (difference === 0) {
                    li.classList.add('correct');
                } else if (difference === 1) {
                    li.classList.add('very-close');
                } else if (difference === 2) {
                    li.classList.add('close');
                } else if (difference === 3) {
                    li.classList.add('somewhat-close');
                } else {
                    li.classList.add('far');
                }
            }
            answersList.appendChild(li);
        });
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    displayAnswers();
});
