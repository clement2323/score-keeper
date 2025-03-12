class ScoreKeeper {
    constructor() {
        this.players = [];
        this.rounds = [];
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.playerInput = document.getElementById('playerName');
        this.roundNameInput = document.getElementById('roundName');
        this.addPlayerBtn = document.getElementById('addPlayer');
        this.addRoundBtn = document.getElementById('addRound');
        this.headerRow = document.getElementById('headerRow');
        this.scoreBody = document.getElementById('scoreBody');
        this.totalRow = document.getElementById('totalRow');
    }

    setupEventListeners() {
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.addRoundBtn.addEventListener('click', () => this.addRound());
        this.playerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        this.roundNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addRound();
        });
    }

    addPlayer() {
        const name = this.playerInput.value.trim();
        if (name) {
            this.players.push(name);
            this.updateHeader();
            this.updateExistingRounds();
            this.updateTotals();
            this.playerInput.value = '';
        }
    }

    addRound() {
        const name = this.roundNameInput.value.trim() || `Manche ${this.rounds.length + 1}`;
        
        if (this.players.length === 0) {
            alert('Ajoutez d\'abord des joueurs !');
            return;
        }

        this.rounds.push({ name, scores: Array(this.players.length).fill(0) });
        this.addRoundRow(this.rounds.length - 1);
        this.updateTotals();
        
        this.roundNameInput.value = '';
    }

    updateHeader() {
        while (this.headerRow.children.length > 2) {
            this.headerRow.removeChild(this.headerRow.lastChild);
        }
        this.players.forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            this.headerRow.appendChild(th);
        });
    }

    updateExistingRounds() {
        this.rounds.forEach((round, index) => {
            round.scores.push(0);
            const row = this.scoreBody.children[index];
            this.addScoreCell(row, round.scores.length - 1, index);
            this.updateRoundTotal(index);
        });
    }

    addRoundRow(roundIndex) {
        const round = this.rounds[roundIndex];
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = round.name;
        row.appendChild(nameCell);

        const totalCell = document.createElement('td');
        totalCell.className = 'round-total';
        totalCell.textContent = '0';
        row.appendChild(totalCell);

        round.scores.forEach((score, playerIndex) => {
            this.addScoreCell(row, playerIndex, roundIndex);
        });

        this.scoreBody.appendChild(row);
    }

    addScoreCell(row, playerIndex, roundIndex) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'score-input';
        input.value = this.rounds[roundIndex].scores[playerIndex];
        
        input.addEventListener('change', (e) => {
            const newScore = parseInt(e.target.value) || 0;
            this.rounds[roundIndex].scores[playerIndex] = newScore;
            this.updateRoundTotal(roundIndex);
            this.updateTotals();
        });

        cell.appendChild(input);
        row.appendChild(cell);
    }

    updateRoundTotal(roundIndex) {
        const round = this.rounds[roundIndex];
        const total = round.scores.reduce((sum, score) => sum + score, 0);
        const row = this.scoreBody.children[roundIndex];
        const totalCell = row.children[1];
        totalCell.textContent = total;
    }

    updateTotals() {
        while (this.totalRow.children.length > 2) {
            this.totalRow.removeChild(this.totalRow.lastChild);
        }

        const roundsTotal = this.rounds.reduce((sum, round) => 
            sum + round.scores.reduce((roundSum, score) => roundSum + score, 0), 0);
        this.totalRow.children[1].textContent = roundsTotal;

        const playerTotals = this.players.map((_, playerIndex) => {
            return this.rounds.reduce((sum, round) => sum + round.scores[playerIndex], 0);
        });

        playerTotals.forEach(total => {
            const td = document.createElement('td');
            td.textContent = total;
            this.totalRow.appendChild(td);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScoreKeeper();
});
