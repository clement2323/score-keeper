class ScoreKeeper {
    constructor() {
        this.players = [];
        this.rounds = [];
        this.initializeElements();
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }

    initializeElements() {
        this.playerInput = document.getElementById('playerName');
        this.roundNameInput = document.getElementById('roundName');
        this.addPlayerBtn = document.getElementById('addPlayer');
        this.addRoundBtn = document.getElementById('addRound');
        this.saveDataBtn = document.getElementById('saveData');
        this.loadDataBtn = document.getElementById('loadData');
        this.fileInput = document.getElementById('fileInput');
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
        this.saveDataBtn.addEventListener('click', () => this.saveToFile());
        this.loadDataBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.loadFromFile(e));
    }

    updateHeader() {
        // Keep only Manche and delete column
        while (this.headerRow.children.length > 2) {
            this.headerRow.removeChild(this.headerRow.children[2]);
        }

        // Add player names first
        this.players.forEach(player => {
            const th = document.createElement('th');
            th.textContent = player;
            this.headerRow.appendChild(th);
        });

        // Add Total column last
        const totalTh = document.createElement('th');
        totalTh.textContent = 'Total';
        totalTh.className = 'total-column';
        this.headerRow.appendChild(totalTh);
    }

    addRoundRow(roundIndex) {
        const round = this.rounds[roundIndex];
        const row = document.createElement('tr');
        
        // Add round name
        const nameCell = document.createElement('td');
        nameCell.textContent = round.name;
        row.appendChild(nameCell);

        // Add delete button
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir supprimer cette manche ?')) {
                this.deleteRound(roundIndex);
            }
        });
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        // Add score cells for each player
        round.scores.forEach((score, playerIndex) => {
            this.addScoreCell(row, playerIndex, roundIndex);
        });

        // Add round total last
        const totalCell = document.createElement('td');
        totalCell.className = 'round-total total-column';
        totalCell.textContent = this.calculateRoundTotal(round);
        row.appendChild(totalCell);

        this.scoreBody.appendChild(row);
        this.updateRoundTotal(roundIndex);
    }

    addScoreCell(row, playerIndex, roundIndex) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'score-input';
        input.min = '0';
        input.value = this.rounds[roundIndex].scores[playerIndex];
        
        input.addEventListener('change', (e) => {
            const newScore = parseInt(e.target.value) || 0;
            this.rounds[roundIndex].scores[playerIndex] = newScore;
            this.updateRoundTotal(roundIndex);
            this.updateTotals();
            this.saveToLocalStorage();
        });

        const cell = document.createElement('td');
        cell.appendChild(input);
        row.appendChild(cell);
    }

    calculateRoundTotal(round) {
        return round.scores.reduce((sum, score) => sum + score, 0);
    }

    updateRoundTotal(roundIndex) {
        const round = this.rounds[roundIndex];
        const total = this.calculateRoundTotal(round);
        const row = this.scoreBody.children[roundIndex];
        row.lastChild.textContent = total;
    }

    updateTotals() {
        // Keep only name and delete column
        while (this.totalRow.children.length > 2) {
            this.totalRow.removeChild(this.totalRow.children[2]);
        }

        // Add player totals first
        this.players.forEach((_, playerIndex) => {
            const td = document.createElement('td');
            td.textContent = this.calculatePlayerTotal(playerIndex);
            this.totalRow.appendChild(td);
        });

        // Add final total last
        const finalTotal = document.createElement('td');
        finalTotal.className = 'total-column';
        finalTotal.textContent = this.calculateFinalTotal();
        this.totalRow.appendChild(finalTotal);
    }

    calculatePlayerTotal(playerIndex) {
        return this.rounds.reduce((sum, round) => sum + round.scores[playerIndex], 0);
    }

    calculateFinalTotal() {
        return this.rounds.reduce((sum, round) => 
            sum + round.scores.reduce((roundSum, score) => roundSum + score, 0), 0);
    }

    saveToFile() {
        const data = {
            players: this.players,
            rounds: this.rounds,
            savedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `score-keeper-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadFromFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.players = data.players;
                    this.rounds = data.rounds;
                    
                    // Clear existing content
                    this.scoreBody.innerHTML = '';
                    
                    // Update UI
                    this.updateHeader();
                    this.rounds.forEach((_, index) => this.addRoundRow(index));
                    this.updateTotals();
                    this.saveToLocalStorage();
                } catch (error) {
                    alert('Erreur lors du chargement du fichier. Vérifiez le format JSON.');
                }
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    }

    saveToLocalStorage() {
        const data = {
            players: this.players,
            rounds: this.rounds
        };
        localStorage.setItem('scoreKeeperData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('scoreKeeperData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.players = data.players;
            this.rounds = data.rounds;
            this.updateHeader();
            this.rounds.forEach((_, index) => this.addRoundRow(index));
            this.updateTotals();
        }
    }

    addPlayer() {
        const name = this.playerInput.value.trim();
        if (name) {
            this.players.push(name);
            this.updateHeader();
            this.updateExistingRounds();
            this.updateTotals();
            this.playerInput.value = '';
            this.saveToLocalStorage();
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
        this.saveToLocalStorage();
    }

    deleteRound(roundIndex) {
        this.rounds.splice(roundIndex, 1);
        this.scoreBody.removeChild(this.scoreBody.children[roundIndex]);
        this.updateTotals();
        this.saveToLocalStorage();
    }

    updateExistingRounds() {
        this.rounds.forEach(round => {
            round.scores.push(0);
        });
        this.scoreBody.innerHTML = '';
        this.rounds.forEach((_, index) => this.addRoundRow(index));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ScoreKeeper();
});
