const selectors = {
  boardContainer: document.querySelector('.board-container'),
  board: document.querySelector('.board'),
  moves: document.querySelector('.moves'),
  timer: document.querySelector('.timer'),
  start: document.querySelector('button'),
  pause: document.querySelector('.pause-button'),
  win: document.querySelector('.win')
}

const state = {
  gameStarted: false,
  gamePaused: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null
}

const shuffle = array => {
  const clonedArray = [...array]

  for (let index = clonedArray.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const original = clonedArray[index]

    clonedArray[index] = clonedArray[randomIndex]
    clonedArray[randomIndex] = original
    
  }

  return clonedArray
}

const pickRandom = (array, items) => {
  const clonedArray = [...array]
  const randomPicks = []

  for (let index = 0; index < items; index++) {
    const randomIndex = Math.floor(Math.random() * clonedArray.length)

    randomPicks.push(clonedArray[randomIndex])
    clonedArray.splice(randomIndex, 1)
    
  }

  return randomPicks
}

const generateGame = () => {
  const dimensions = selectors.board.getAttribute('data-dimension')

  if (dimensions % 2 !== 0) {
    throw new Error("The dimension of the board must be even number.")
  }

  const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍']
  const picks = pickRandom(emojis, (dimensions * dimensions) / 2)
  const items = shuffle([...picks, ...picks])
  const cards = `
    <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
      ${items.map(item => `
        <div class="card">
          <div class="card-front"></div>
          <div class="card-back">${item}</div>
        </div>
      `).join('')}
    </div>
  `

  const parser = new DOMParser().parseFromString(cards, 'text/html')

  selectors.board.replaceWith(parser.querySelector('.board'))
}

const startGame = () => { 
  if (state.gameStarted && !state.gamePaused) {
    resetGame()
  } else {
    state.gameStarted = true
    state.gamePaused = false
    selectors.start.classList.add('disabled')
    selectors.pause.classList.remove('disabled') //enable the pause button

    state.loop = setInterval(() => {
      state.totalTime++

      selectors.moves.innerText = `${state.totalFlips} moves`
      selectors.timer.innerText = `time: ${state.totalTime} sec`
    }, 1000)
  } 
}

const pauseGame = () => {
  if (state.gamePaused) {
    //resume the game
    state.gamePaused = false
    selectors.pause.innerText = 'Pause'
    
    state.loop = setInterval(() => {
      state.totalTime++
      selectors.moves.innerText = `${state.totalFlips} moves`
      selectors.timer.innerText = `time: ${state.totalTime} sec`
    }, 1000)
  } else {
    //pause the game
    state.gamePaused = true
    selectors.pause.innerText = 'Resume'
    clearInterval(state.loop)
    
  }
}

const resetGame = () => {
  state.gameStarted = false
  state.flippedCards = 0
  state.totalFlips = 0
  state.totalTime = 0

  clearInterval(state.loop)

  selectors.moves.innerText = `${state.totalFlips} moves`
  selectors.timer.innerText = `time: ${state.totalTime} sec`
  selectors.start.classList.remove('desabled')
  selectors.pause.innerText = 'Pause'
  selectors.pause.classList.add('desabled')

  generateGame()
}

const flipBackCards = () => {
  document.querySelectorAll('.card:not(.matched)').forEach(card => {
    card.classList.remove('flipped')
  })

  state.flippedCards = 0
}

const flipCard = card => {
  state.flippedCards++
  state.totalFlips++

  if (!state.gameStarted) {
    startGame()
  }

  if (state.flippedCards <= 2) {
    card.classList.add('flipped')
  }

  if (state.flippedCards === 2) {
    const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

    if (flippedCards[0].innerText === flippedCards[1].innerText) {
      flippedCards[0].classList.add('matched')
      flippedCards[1].classList.add('matched')
      
      } 

      setTimeout(() => {
      flipBackCards(flippedCards);
      
    }, 1000)
  }
  


  if (!document.querySelectorAll('.card:not(.flipped)').length) {
    setTimeout(() => {
      
      selectors.boardContainer.classList.add('flipped')
      selectors.win.innerHTML = `
        <span class="win-text">
          You won!<br/>
          with <span class="highlight">${state.totalFlips}</span> moves<br />
          under <span class="highlight">${state.totalTime}</span> seconds
        </span>
      `

      clearInterval(state.loop)
    }, 1000)
  }

}

const attachEventListeners = () => {
  document.addEventListener('click', event => {
    const eventTarget = event.target
    const eventParent = eventTarget.parentElement

    if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped') && !state.gamePaused) {
      flipCard(eventParent)
    } else if (eventTarget.className.includes('pause-button')) {
      pauseGame()
    } else if (eventTarget.className.includes('start-button') && !state.gamePaused) {
      startGame()
    }
  })
}

generateGame();
attachEventListeners();