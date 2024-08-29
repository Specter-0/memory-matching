const game = {
    _cards: [],
    _found: [],
    _flipped: [],
    _isStart: false,
    _attempts: 0,

    _onReset: undefined,
    _onStart: undefined,
    _onEnd: undefined,
    _onUnflip: undefined,

    get cards() {
        return this._cards
    },

    get attempts() {
        return this._attempts
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
        this._attempts = 0
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

        this._attempts++;

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

/** Stopwatch for game time count */
const stopwatch = {
    /**
     * @type {number}
     * @private
     */
    _startTime: 0,

    /**
     * @type {number?}
     * @private
     */
    _timerId: null,

    /**
     * @type {number}
     * @private
     */
    _elapsed: 0,

    /**
     * @type {((t: number) => void)?}
     * @private
     */
    _onUpdate: null,

    /**
     * Get current elapsed time in milliseconds.
     * @returns {number}
     */
    get current() {
        if (this._timerId === null)
            return this._elapsed
        return Date.now() - this._startTime
    },

    /**
     * Set callback function to be executed on each update.
     * @param {(t: number) => void} fn - Callback function.
     */
    set onUpdate(fn) {
        this._onUpdate = fn
    },

    /**
     * Call `_onUpdate` callback with current elapsed time.
     * @private
     */
    _update() {
        if (this._onUpdate === null) return;
        this._onUpdate(this.current);
    },

    /** Start stopwatch, if it's not already running. */
    start() {
        if (this._timerId !== null) return;
        this._startTime = Date.now() - this._elapsed;
        this._timerId = setInterval(_ => this._update(), 1000);
    },

    /** Stop stopwatch and record elapsed time. */
    stop() {
        if (this._timerId === null) return
        this._elapsed = Date.now() - this._startTime
        clearInterval(this._timerId)
        this._timerId = null
    },

    /** Stop stopwatch and reset elapsed time to zero. */
    reset() {
        this.stop()
        this._elapsed = 0
        if (this._onUpdate === null) return
        this._onUpdate(0)
    }
}

const UI = {
    _header: document.getElementById("size"),
    _style: document.createElement('style'),
    _board: document.getElementById("game-board"),

    _onFlipFn: undefined,

    init(size, cards, onFlip) {
        this._onFlipFn = onFlip
        this._initStyle(size)
        this._setDisplaySize(size)

        this.reset(cards)
    },

    reset(cards) {
        this._clearBoard()
        this._createBoard(cards)
    },

    _setDisplaySize(size) {
        this._header.innerText = `${size}x${size}`;
    },

    _initStyle(size) {
        document.head.appendChild(this._style);
        this._style.sheet.insertRule(`:root {--size: ${size}}`);
    },

    _clearBoard() {
        this._board.innerHTML = ""
    },

    _createBoard(cards) {
        cards.forEach((v, i) =>
            this._board.appendChild(this._createCard(i, v)))
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

        card.addEventListener('click', e => this._onFlip(e));
        return card
    },

    _onFlip(e) {
        const btn = e.target.parentElement.parentElement;
        if (btn.classList.contains('flipped')) return;
        btn.classList.add('flipped');
        this._onFlipFn(btn.dataset.cardId)
    },

    unflipCard(dataId) {
        const selector = `button[data-card-id="${dataId}"]`;

        const cards = document.querySelectorAll(selector);
        cards.forEach(c => c.disabled = true);

        setTimeout(_ => cards.forEach(c => {
            c.classList.remove("flipped");
            c.disabled = false;
        }), 1000);
    }
}

const saveDialog = {
    dialog: document.getElementById("end"),
    form: document.forms.save,
    points: document.getElementById("points"),

    onYes: undefined,

    init(onYes) {
        this.onYes = onYes
        this.form.addEventListener("submit", e => this._onSubmit(e))
    },

    /** @param {SubmitEvent} e  */
    _onSubmit(e) {
        const id = e.submitter.id
        if (id === "no") return
        this.onYes(e.target.nick.value)
    },

    onNo() {
        this.dialog.close()
    },

    show(points) {
        this.points.innerText = points
        this.dialog.showModal()
    }
}

/** Leaderboard storage */
const storage = {
    _nextId: 0,

    /** Initialize storage */
    init() {
        this._nextId =
            localStorage.getItem("next") ?? 0
    },

    /**
     * Save new record in the leaderboard
     * @param {string} name player nickname
     * @param {number} points game points
     */
    save(name, points) {
        console.log(name, points);

        const v = JSON.stringify({
            name: name,
            points: points
        })
        localStorage.setItem(this._nextId++, v)
        localStorage.setItem("next", this._nextId)
    }
}

const gameController = {
    _backBtn: document.getElementById("back"),
    _resetBtn: document.getElementById("reset"),

    _game: game,
    _ui: UI,
    _stopwatch: stopwatch,
    _dialog: saveDialog,
    _storage: storage,

    _size: 0,

    init() {
        const size = this._getSizeFromURL()
        if (!size || size % 2) this._back();
        this._size = size

        this._game.init(
            size,
            _ => this._onReset(),
            _ => this._onStart(),
            _ => this._onEnd(),
            indexes => this._onUnflip(indexes)
        )

        this._ui.init(size, this._game.cards, e => this._onFlip(e))

        this._dialog.init(nick => this._onSave(nick))

        this._storage.init()

        this._initResetBtn()
    },

    _getSizeFromURL() {
        return new URLSearchParams(window.location.search)
            .get("size")
    },

    _back() {
        this._backBtn.click();
    },

    _onReset() {
        this._stopwatch.reset()
        this._ui.reset(this._game.cards)
    },

    _onStart() {
        this._stopwatch.start()
    },

    _onEnd() {
        this._stopwatch.stop()
        this._dialog.show(this._calcPoints().toFixed())
    },

    _calcPoints() {
        const cardCount = this._size ** 2;
        const attempts = this._game.attempts;
        const seconds = this._stopwatch.current / 1000;
        const k = 1000;
        return cardCount / (attempts + seconds) * k;
    },

    _onUnflip(indexes) {
        indexes.forEach(i => this._ui.unflipCard(i))
    },

    _onFlip(cardId) {
        this._game.flip(cardId);
    },

    _onSave(nick) {
        this._storage.save(nick, this._calcPoints())
    },

    _initResetBtn() {
        this._resetBtn
            .addEventListener("click", _ => this._onReset());
    },
}

gameController.init()
