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
    _mainPanel: document.getElementById(lbCfg.mainPanelElId),
    _emptyPanel: document.getElementById(lbCfg.emptyPanelElId),

    _storage: storage,
    _leaderboard: document.getElementById(lbCfg.leaderboardElId),

    _row(place, nick, points) {
        const row = document.createElement("tr")

        for (const e of [place, nick, points]) {
            const td = document.createElement("th")
            td.innerText = e
            row.appendChild(td)
        }
        return row
    },

    _onEmpty() {
        this._mainPanel.classList.add(lbCfg.hideClass)
        this._emptyPanel.classList.remove(lbCfg.hideClass)
    },

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