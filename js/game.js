const game = {
    _cards: [],
    _found: [],
    _flipped: [],
    _isStart: false,

    _onReset: undefined,
    _onStart: undefined,
    _onEnd: undefined,
    _onUnflip: undefined,

    get cards() {
        return this._cards
    },

    init(size, on_reset, on_start, on_end, on_unflip) {
        this._onReset = on_reset
        this._onStart = on_start
        this._onEnd = on_end
        this._onUnflip = on_unflip
        this.reset(size)
    },

    _createCards(size) {
        const cards = Array.from({ length: size ** 2 }, (_, i) => Math.floor(i / 2) + 1);
        cards.sort(_ => Math.random() - 0.5);
        return cards
    },

    reset(size) {
        this._cards = this._createCards(size)
        this._flipped = []
        if (this._onReset) this._onReset(size)
    },

    _isValid(index) {
        return index >= 0 &&
            index < this._cards.length &&
            !this._found.includes(index) &&
            !this._flipped.includes(index)
    },

    flip(index) {
        if (!this._isValid(index)) {
            if (this._onUnflip) this._onUnflip(this._flipped)
            return
        }

        if (!this._isStart) {
            this._isStart = true
            if (this._onStart) this._onStart()
        }

        this._flipped.push(index)
        if (this._flipped.length < 2) return

        const c1 = this._cards[this._flipped[0]]
        const c2 = this._cards[this._flipped[1]]
        if (c1 === c2) {
            this._found = this._found.concat(this._flipped)
        }
        else
            if (this._onUnflip) this._onUnflip(this._flipped);

        this._flipped = []

        if (this._cards.length === this._found.length) {
            this._isStart = false
            if (this._onEnd) this._onEnd()
        }
    }
}

const gameController = {
    game: game,

    init() {
        const size = this._getSizeFromURL()

        this.game.init(size,
            size => this._onReset(size),
            _ => console.log("Start"),
            _ => console.log("End"),
            indexes => this._onUnflip(indexes)
        )
    },

    _getSizeFromURL() {
        return new URLSearchParams(window.location.search)
            .get("size")
    },

    _onReset(size) {
        if (!size || size % 2) this._onInvalidSize(size)

        this._setDisplaySize(size)
        this._createStyle(size)
        this._initResetBtn(size)

        this._clearBoard()
        this._createBoard(size)
    },

    _onInvalidSize(size) {
        document.getElementById("back").click();
    },

    _setDisplaySize(size) {
        document
            .getElementById("size")
            .innerText = `${size}x${size}`;
    },

    _createStyle(size) {
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.sheet.insertRule(`:root {--size: ${size}}`);
    },

    _initResetBtn(size) {
        document
            .getElementById("reset")
            .addEventListener("click", _ => this._onReset(size));
    },

    _clearBoard() {
        document.getElementById("game-board").innerHTML = ""
    },

    _createBoard(size) {
        const gameBoard = document.getElementById('game-board');
        const cardCount = size ** 2;

        for (let i = 0; i < cardCount; i++) {
            const content = game.cards[i]
            const card = this._createCard(i, content)
            gameBoard.appendChild(card);
        }
    },

    _createCard(index, content) {
        const card = document.createElement('button');
        card.classList.add('card');
        card.dataset.cardId = index;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = content;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', e => this._onFlipCard(e));
        return card
    },

    _onFlipCard(e) {
        const btn = e.target.parentElement.parentElement;
        if (btn.classList.contains('flipped')) return;
        btn.classList.add('flipped');
        this.game.flip(btn.dataset.cardId);
    },

    _onUnflip(indexes) {
        indexes.forEach(i => this._unflipCard(i))
    },

    _unflipCard(dataId) {
        const selector = `button[data-card-id="${dataId}"]`;

        const cards = document.querySelectorAll(selector);
        cards.forEach(c => c.disabled = true);

        setTimeout(_ => cards.forEach(c => {
            c.classList.remove("flipped");
            c.disabled = false;
        }), 1000);
    }
}

gameController.init()