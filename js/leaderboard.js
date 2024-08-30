/** Leaderboard config */
const lbCfg = {
    /** Leaderboard body element id */
    leaderboardElId: "leaderboard",
    /** Main leaderboard panel id */
    mainPanelElId: "main",
    /** Empty leaderboard panel id */
    emptyPanelElId: "empty",
    /** Hide element class */
    hideClass: "hiden"
}
Object.freeze(lbCfg);

/** leaderboard storage */
const storage = {
    /**
     * Extract leaderboard records from local storage
     * @returns {Array} leaderboard records
     * @private
     */
    _extract() {
        i = 0
        const leaderboard = []
        while (true) {
            const result = localStorage.getItem(i++)
            if (result === null) return leaderboard
            const player = JSON.parse(result)
            leaderboard.push(player)
        }
    },

    /**
     * Sorted leaderboard records
     * @type {Array}
     */
    get leaderboard() {
        const leaderboard = this._extract()
        leaderboard.sort((a, b) => {
            if (a.points < b.points) return 1
            if (a.points > b.points) return -1
            return 0
        })
        return leaderboard
    }
}

/** Leaderboard builder */
const leaderboard = {
    /**
     * Main leaderboard panel
     * @type {HTMLElement}
     * @private
     */
    _mainPanel: document.getElementById(lbCfg.mainPanelElId),
    /**
     * Show this if leaderboard is empty
     * @type {HTMLElement}
     * @private
     */
    _emptyPanel: document.getElementById(lbCfg.emptyPanelElId),

    /**
     * Leaderboard storage
     * @private
     */
    _storage: storage,
    /**
     * Leaderboard element
     * @type {HTMLElement}
     * @private
     */
    _leaderboard: document.getElementById(lbCfg.leaderboardElId),

    /**
     * Build table row from leaderboard record
     * @param {number} place record place in leaderboard
     * @param {string} nick player nickname
     * @param {number} points game points
     * @returns {HTMLTableRowElement}
     */
    _row(place, nick, points) {
        const row = document.createElement("tr")

        for (const e of [place, nick, points]) {
            const td = document.createElement("th")
            td.innerText = e
            row.appendChild(td)
        }
        return row
    },

    /** Swap elements if no leaderboard records */
    _onEmpty() {
        this._mainPanel.classList.add(lbCfg.hideClass)
        this._emptyPanel.classList.remove(lbCfg.hideClass)
    },

    /** Initialize leaderboard */
    init() {
        const lb = storage.leaderboard
        if (lb.length === 0) this._onEmpty()

        for (let i = 0; i < lb.length; i++) {
            const e = lb[i];
            const row =
                this._row(i + 1, e.name, e.points.toFixed(0))
            this._leaderboard.appendChild(row)
        }
    }
}
leaderboard.init()
