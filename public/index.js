// Zeus Ultimate AI Trading System
class ZeusAI {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.currentTick = null;
        this.recentDigits = [];
        this.balance = 0;
        this.trades = [];
        this.aiEnabled = false;
        this.sessionStartTime = Date.now();
        this.tickCount = 0;
        this.winStreak = 0;
        this.totalProfit = 0;
        this.aiStats = {
            totalTrades: 0,
            winningTrades: 0,
            profit: 0
        };
        
        // Neural network simulation
        this.neuralNetwork = {
            patterns: [],
            weights: this.initializeWeights(),
            learningRate: 0.01
        };
        
        this.initializeEventListeners();
        this.startAIAnalysis();
        this.updateUI();
    }
    
    initializeWeights() {
        const weights = {};
        const patterns = [
            'consecutive_same', 'alternating', 'ascending', 'descending',
            'even_odd_pattern', 'fibonacci_like', 'prime_pattern', 'sum_pattern'
        ];
        
        patterns.forEach(pattern => {
            weights[pattern] = Math.random() * 2 - 1; // Random between -1 and 1
        });
        
        return weights;
    }
    
    initializeEventListeners() {
        // Update confidence display
        const confidenceSlider = document.getElementById('minConfidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', () => {
                this.updateConfidenceDisplay();
            });
        }
    }
    
    async connect() {
        const appId = document.getElementById('appId').value;
        const apiToken = document.getElementById('apiToken').value;
        const market = document.getElementById('marketSelect').value;
        
        if (!appId || !apiToken) {
            this.showAlert('Please enter App ID and API Token', 'error');
            return;
        }
        
        try {
            this.showLoading('Connecting to Deriv API...');
            
            this.ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);
            
            this.ws.onopen = () => {
                console.log('Connected to Deriv WebSocket');
                this.hideLoading();
                
                // Authorize the connection
                this.authorize(apiToken);
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };
            
            this.ws.onclose = () => {
                console.log('Disconnected from Deriv WebSocket');
                this.isConnected = false;
                this.updateConnectionStatus();
                this.hideLoading();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showAlert('Connection failed. Please check your credentials.', 'error');
                this.hideLoading();
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showAlert('Failed to connect. Please try again.', 'error');
            this.hideLoading();
        }
    }
    
    authorize(token) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                authorize: token,
                req_id: 1
            }));
        }
    }
    
    handleMessage(data) {
        console.log('Received:', data);
        
        if (data.error) {
            console.error('API Error:', data.error);
            this.showAlert(`API Error: ${data.error.message}`, 'error');
            return;
        }
        
        // Handle authorization response
        if (data.authorize) {
            this.handleAuthorization(data.authorize);
            return;
        }
        
        // Handle balance updates
        if (data.balance) {
            this.handleBalanceUpdate(data.balance);
            return;
        }
        
        // Handle tick data
        if (data.tick) {
            this.handleTick(data.tick);
            return;
        }
        
        // Handle trade results
        if (data.buy) {
            this.handleTradeResult(data.buy);
            return;
        }
        
        // Handle proposal responses
        if (data.proposal) {
            this.handleProposal(data.proposal);
            return;
        }
        
        // Handle portfolio updates
        if (data.portfolio) {
            this.handlePortfolio(data.portfolio);
            return;
        }
    }
    
    handleAuthorization(authData) {
        console.log('Authorization successful:', authData);
        this.isConnected = true;
        
        this.updateConnectionStatus();
        this.showAlert('Successfully connected to Deriv!', 'success');
        
        // Get balance
        this.getBalance();
        
        // Subscribe to tick data
        this.subscribeTicks();
        
        // Subscribe to portfolio for trade updates
        this.subscribePortfolio();
    }
    
    getBalance() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                balance: 1,
                subscribe: 1,
                req_id: 3
            }));
        }
    }
    
    handleBalanceUpdate(balanceData) {
        this.balance = parseFloat(balanceData.balance);
        this.updateBalanceDisplay();
    }
    
    subscribeTicks() {
        const market = document.getElementById('marketSelect').value;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                ticks: market,
                subscribe: 1,
                req_id: 4
            }));
        }
    }
    
    subscribePortfolio() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                portfolio: 1,
                subscribe: 1,
                req_id: 5
            }));
        }
    }
    
    handlePortfolio(portfolioData) {
        // Update live trades display
        this.updateLiveTradesDisplay(portfolioData.contracts || []);
    }
    
    handleTick(tickData) {
        this.currentTick = tickData;
        this.tickCount++;
        
        const lastDigit = parseInt(tickData.quote.toString().slice(-1));
        this.recentDigits.push(lastDigit);
        
        if (this.recentDigits.length > 20) {
            this.recentDigits.shift();
        }
        
        this.updateDigitDisplay(lastDigit);
        this.updateMarketInfo();
        
        // Run AI analysis
        if (this.recentDigits.length >= 10) {
            this.runAIAnalysis();
        }
        
        // Auto trade logic
        if (this.aiEnabled && this.recentDigits.length >= 15) {
            this.checkAutoTrade();
        }
    }
    
    checkAutoTrade() {
        const prediction = this.getPrediction();
        const minConfidence = parseInt(document.getElementById('minConfidence').value);
        
        if (prediction.confidence >= minConfidence) {
            const amount = parseFloat(document.getElementById('tradeAmount').value);
            const duration = document.getElementById('tradeDuration').value;
            
            this.placeAITrade(prediction.direction, amount, duration);
        }
    }
    
    placeAITrade(direction, amount, duration) {
        this.logAIActivity(`Placing ${direction.toUpperCase()} trade: $${amount} for ${duration} ticks`);
        this.placeTrade(direction, amount, duration, 'ai');
    }
    
    placeTrade(direction, amount, duration, source = 'manual') {
        if (!this.isConnected) {
            this.showAlert('Not connected to Deriv', 'error');
            return;
        }
        
        if (amount > this.balance) {
            this.showAlert('Insufficient balance', 'error');
            return;
        }
        
        const market = document.getElementById('marketSelect').value;
        const contractType = direction === 'call' ? 'DIGITRISE' : 'DIGITFALL';
        
        // First get a proposal to validate the trade
        this.getProposal(contractType, market, amount, duration, direction, source);
    }
    
    getProposal(contractType, market, amount, duration, direction, source) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const proposalId = Date.now();
            this.ws.send(JSON.stringify({
                proposal: 1,
                amount: amount,
                basis: 'stake',
                contract_type: contractType,
                currency: 'USD',
                duration: duration,
                duration_unit: 't',
                symbol: market,
                req_id: proposalId
            }));
            
            // Store proposal context
            this.pendingProposals = this.pendingProposals || {};
            this.pendingProposals[proposalId] = {
                direction,
                amount,
                duration,
                source,
                contractType,
                market
            };
        }
    }
    
    handleProposal(proposalData) {
        const proposalContext = this.pendingProposals && this.pendingProposals[proposalData.req_id];
        if (!proposalContext) return;
        
        if (proposalData.error) {
            this.showAlert(`Trade error: ${proposalData.error.message}`, 'error');
            return;
        }
        
        // Execute the trade using the proposal ID
        this.executeTrade(proposalData.id, proposalContext);
    }
    
    executeTrade(proposalId, context) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const buyId = Date.now();
            this.ws.send(JSON.stringify({
                buy: proposalId,
                price: context.amount,
                req_id: buyId
            }));
            
            // Store buy context
            this.pendingBuys = this.pendingBuys || {};
            this.pendingBuys[buyId] = context;
        }
    }
    
    handleTradeResult(buyData) {
        const buyContext = this.pendingBuys && this.pendingBuys[buyData.req_id];
        
        if (buyData.error) {
            this.showAlert(`Trade failed: ${buyData.error.message}`, 'error');
            return;
        }
        
        const trade = {
            id: buyData.contract_id,
            direction: buyContext ? buyContext.direction : 'unknown',
            amount: buyData.buy_price,
            timestamp: new Date(),
            status: 'open',
            source: buyContext ? buyContext.source : 'manual',
            payout: buyData.payout
        };
        
        this.trades.push(trade);
        this.updateTradeHistory();
        this.updateLiveTradesDisplay();
        
        if (buyContext && buyContext.source === 'ai') {
            this.aiStats.totalTrades++;
            this.logAIActivity(`Trade placed: ${trade.direction.toUpperCase()} $${trade.amount}`);
        }
        
        this.showAlert(`${trade.direction.toUpperCase()} trade placed: $${trade.amount}`, 'success');
    }
    
    // AI Analysis
    runAIAnalysis() {
        if (this.recentDigits.length < 10) return;
        
        const patterns = this.analyzePatterns();
        const prediction = this.calculatePrediction(patterns);
        
        this.updatePredictionDisplay(prediction);
        this.updateAnalyticsDisplay(patterns);
        
        // Learn from patterns
        this.updateNeuralNetwork(patterns);
    }
    
    analyzePatterns() {
        const digits = this.recentDigits.slice(-15);
        const patterns = {};
        
        // Pattern 1: Consecutive same digits
        patterns.consecutive_same = this.analyzeConsecutiveSame(digits);
        
        // Pattern 2: Alternating pattern
        patterns.alternating = this.analyzeAlternating(digits);
        
        // Pattern 3: Ascending/Descending
        patterns.ascending = this.analyzeAscending(digits);
        patterns.descending = this.analyzeDescending(digits);
        
        // Pattern 4: Even/Odd patterns
        patterns.even_odd_pattern = this.analyzeEvenOdd(digits);
        
        // Pattern 5: Fibonacci-like sequences
        patterns.fibonacci_like = this.analyzeFibonacci(digits);
        
        // Pattern 6: Prime number patterns
        patterns.prime_pattern = this.analyzePrimes(digits);
        
        // Pattern 7: Sum patterns
        patterns.sum_pattern = this.analyzeSumPatterns(digits);
        
        return patterns;
    }
    
    analyzeConsecutiveSame(digits) {
        let maxConsecutive = 0;
        let current = 1;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] === digits[i-1]) {
                current++;
            } else {
                maxConsecutive = Math.max(maxConsecutive, current);
                current = 1;
            }
        }
        
        return Math.min(maxConsecutive / digits.length, 1);
    }
    
    analyzeAlternating(digits) {
        let alternatingCount = 0;
        for (let i = 2; i < digits.length; i++) {
            if (digits[i] === digits[i-2] && digits[i] !== digits[i-1]) {
                alternatingCount++;
            }
        }
        return alternatingCount / (digits.length - 2);
    }
    
    analyzeAscending(digits) {
        let ascendingCount = 0;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] > digits[i-1]) {
                ascendingCount++;
            }
        }
        return ascendingCount / (digits.length - 1);
    }
    
    analyzeDescending(digits) {
        let descendingCount = 0;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] < digits[i-1]) {
                descendingCount++;
            }
        }
        return descendingCount / (digits.length - 1);
    }
    
    analyzeEvenOdd(digits) {
        const evenCount = digits.filter(d => d % 2 === 0).length;
        const oddCount = digits.length - evenCount;
        return Math.abs(evenCount - oddCount) / digits.length;
    }
    
    analyzeFibonacci(digits) {
        let fibCount = 0;
        const fibNumbers = [0, 1, 1, 2, 3, 5, 8];
        
        for (let digit of digits) {
            if (fibNumbers.includes(digit)) {
                fibCount++;
            }
        }
        
        return fibCount / digits.length;
    }
    
    analyzePrimes(digits) {
        const primes = [2, 3, 5, 7];
        let primeCount = 0;
        
        for (let digit of digits) {
            if (primes.includes(digit)) {
                primeCount++;
            }
        }
        
        return primeCount / digits.length;
    }
    
    analyzeSumPatterns(digits) {
        if (digits.length < 3) return 0;
        
        let patternCount = 0;
        for (let i = 2; i < digits.length; i++) {
            const sum = (digits[i-2] + digits[i-1]) % 10;
            if (sum === digits[i]) {
                patternCount++;
            }
        }
        
        return patternCount / (digits.length - 2);
    }
    
    calculatePrediction(patterns) {
        let callScore = 0;
        let putScore = 0;
        
        // Apply neural network weights
        for (let pattern in patterns) {
            const weight = this.neuralNetwork.weights[pattern] || 0;
            const value = patterns[pattern] * weight;
            
            if (value > 0) {
                callScore += value;
            } else {
                putScore += Math.abs(value);
            }
        }
        
        // Normalize scores
        const total = callScore + putScore;
        if (total === 0) {
            return {
                direction: 'neutral',
                confidence: 50,
                callProbability: 50,
                putProbability: 50
            };
        }
        
        const callProb = (callScore / total) * 100;
        const putProb = (putScore / total) * 100;
        
        const direction = callProb > putProb ? 'call' : 'put';
        const confidence = Math.max(callProb, putProb);
        
        return {
            direction,
            confidence: Math.round(confidence),
            callProbability: Math.round(callProb),
            putProbability: Math.round(putProb)
        };
    }
    
    updateNeuralNetwork(patterns) {
        // Simple learning algorithm
        const lastDigit = this.recentDigits[this.recentDigits.length - 1];
        const prevDigit = this.recentDigits[this.recentDigits.length - 2];
        
        if (prevDigit !== undefined) {
            const actualDirection = lastDigit > prevDigit ? 'call' : 'put';
            const prediction = this.calculatePrediction(patterns);
            
            // Adjust weights based on prediction accuracy
            const correct = prediction.direction === actualDirection;
            const adjustment = correct ? this.neuralNetwork.learningRate : -this.neuralNetwork.learningRate;
            
            for (let pattern in patterns) {
                if (this.neuralNetwork.weights[pattern] !== undefined) {
                    this.neuralNetwork.weights[pattern] += adjustment * patterns[pattern];
                }
            }
        }
    }
    
    getPrediction() {
        if (this.recentDigits.length < 10) {
            return {
                direction: 'neutral',
                confidence: 50,
                callProbability: 50,
                putProbability: 50
            };
        }
        
        const patterns = this.analyzePatterns();
        return this.calculatePrediction(patterns);
    }
    
    // UI Update Methods
    updateConnectionStatus() {
        const dot = document.getElementById('connectionDot');
        const text = document.getElementById('connectionText');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        
        if (this.isConnected) {
            dot.classList.add('connected');
            text.textContent = 'Connected';
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-flex';
            
            document.getElementById('marketStatus').textContent = 'Open';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Offline';
            connectBtn.style.display = 'inline-flex';
            disconnectBtn.style.display = 'none';
            
            document.getElementById('marketStatus').textContent = 'Closed';
        }
    }
    
    updateBalanceDisplay() {
        const balanceElements = [
            'currentBalance'
        ];
        
        balanceElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `$${this.balance.toFixed(2)}`;
            }
        });
    }
    
    updateDigitDisplay(digit) {
        // Update all digit displays
        const digitElements = ['currentDigit', 'currentDigitManual'];
        const trendElements = ['digitTrend', 'digitTrendManual'];
        const recentElements = ['recentDigits', 'recentDigitsManual'];
        
        digitElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = digit;
                element.className = 'current-digit';
                
                // Add signal class based on AI prediction
                const prediction = this.getPrediction();
                if (prediction.confidence > 70) {
                    element.classList.add(prediction.direction === 'call' ? 'call-signal' : 'put-signal');
                }
            }
        });
        
        // Update trend indicators
        if (this.recentDigits.length >= 2) {
            const prevDigit = this.recentDigits[this.recentDigits.length - 2];
            const trend = digit > prevDigit ? 'up' : digit < prevDigit ? 'down' : 'same';
            
            trendElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (trend === 'up') {
                        element.innerHTML = '<i class="fas fa-arrow-up" style="color: var(--success);"></i>';
                    } else if (trend === 'down') {
                        element.innerHTML = '<i class="fas fa-arrow-down" style="color: var(--danger);"></i>';
                    } else {
                        element.innerHTML = '<i class="fas fa-minus" style="color: var(--text-muted);"></i>';
                    }
                }
            });
        }
        
        // Update recent digits
        recentElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = this.recentDigits.slice(-10).map(d => 
                    `<div class="recent-digit">${d}</div>`
                ).join('');
            }
        });
    }
    
    updatePredictionDisplay(prediction) {
        // Update manual tab prediction
        this.updatePredictionElements('', prediction);
        
        // Update auto tab prediction
        this.updatePredictionElements('Auto', prediction);
        
        // Update button probabilities
        const callBtnProb = document.getElementById('callBtnProb');
        const putBtnProb = document.getElementById('putBtnProb');
        
        if (callBtnProb) callBtnProb.textContent = `${prediction.callProbability}%`;
        if (putBtnProb) putBtnProb.textContent = `${prediction.putProbability}%`;
    }
    
    updatePredictionElements(suffix, prediction) {
        const directionElement = document.getElementById(`predictionDirection${suffix}`);
        const confidenceElement = document.getElementById(`predictionConfidence${suffix}`);
        const statusElement = document.getElementById(`predictionStatus${suffix}`);
        const callProbElement = document.getElementById(`callProbValue${suffix}`);
        const putProbElement = document.getElementById(`putProbValue${suffix}`);
        const callBarElement = document.getElementById(`callProbBar${suffix}`);
        const putBarElement = document.getElementById(`putProbBar${suffix}`);
        
        if (directionElement) {
            directionElement.textContent = prediction.direction.toUpperCase();
            directionElement.className = `prediction-direction ${prediction.direction}`;
        }
        
        if (confidenceElement) {
            confidenceElement.textContent = `${prediction.confidence}% Confidence`;
        }
        
        if (statusElement) {
            statusElement.textContent = prediction.confidence > 75 ? 'High Confidence Signal' : 'Analyzing Market...';
        }
        
        if (callProbElement) callProbElement.textContent = `${prediction.callProbability}%`;
        if (putProbElement) putProbElement.textContent = `${prediction.putProbability}%`;
        
        if (callBarElement) callBarElement.style.width = `${prediction.callProbability}%`;
        if (putBarElement) putBarElement.style.width = `${prediction.putProbability}%`;
    }
    
    updateMarketInfo() {
        const serverTime = new Date().toLocaleTimeString();
        const uptime = this.formatUptime(Date.now() - this.sessionStartTime);
        
        document.getElementById('serverTime').textContent = serverTime;
        document.getElementById('tickCount').textContent = this.tickCount;
        document.getElementById('sessionUptime').textContent = uptime;
    }
    
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateConfidenceDisplay() {
        const slider = document.getElementById('minConfidence');
        const display = document.getElementById('confidenceValue');
        
        if (slider && display) {
            const value = parseInt(slider.value);
            display.textContent = `${value}%`;
        }
    }
    
    logAIActivity(message) {
        const log = document.getElementById('aiActivityLog');
        if (!log) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <i class="fas fa-robot"></i>
            <span>${message}</span>
            <span class="activity-time">${timestamp}</span>
        `;
        
        log.insertBefore(item, log.firstChild);
        
        // Keep only last 50 items
        while (log.children.length > 50) {
            log.removeChild(log.lastChild);
        }
    }
    
    showAlert(message, type = 'info') {
        const alertSystem = document.getElementById('alertSystem');
        if (!alertSystem) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        alertSystem.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
    
    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('.loading-text');
        
        if (text) text.textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
    }
    
    startAIAnalysis() {
        setInterval(() => {
            if (this.recentDigits.length >= 10) {
                this.runAIAnalysis();
            }
        }, 1000);
    }
    
    updateUI() {
        setInterval(() => {
            this.updateMarketInfo();
        }, 1000);
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        this.aiEnabled = false;
        document.getElementById('aiTradeToggle').checked = false;
        this.updateConnectionStatus();
        this.showAlert('Disconnected from Deriv', 'info');
    }
}

// Global functions for UI interaction
let zeusAI;

function initializeZeusAI() {
    zeusAI = new ZeusAI();
}

function connect() {
    if (zeusAI) {
        zeusAI.connect();
    }
}

function disconnect() {
    if (zeusAI) {
        zeusAI.disconnect();
    }
}

function togglePassword() {
    const input = document.getElementById('apiToken');
    const icon = document.getElementById('passwordToggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function toggleAITrade() {
    if (!zeusAI) return;
    
    const toggle = document.getElementById('aiTradeToggle');
    zeusAI.aiEnabled = toggle.checked;
    
    if (zeusAI.aiEnabled) {
        if (!zeusAI.isConnected) {
            zeusAI.showAlert('Please connect to Deriv first', 'error');
            toggle.checked = false;
            zeusAI.aiEnabled = false;
            return;
        }
        
        zeusAI.logAIActivity('AI Trading System ACTIVATED');
        zeusAI.showAlert('AI Trading activated', 'success');
    } else {
        zeusAI.logAIActivity('AI Trading System DEACTIVATED');
        zeusAI.showAlert('AI Trading deactivated', 'info');
    }
}

function updateConfidenceDisplay() {
    if (zeusAI) {
        zeusAI.updateConfidenceDisplay();
    }
}

function placeManualTrade(direction) {
    if (!zeusAI) return;
    
    const amount = parseFloat(document.getElementById('manualTradeAmount').value);
    const duration = document.getElementById('manualTradeDuration').value;
    
    zeusAI.placeTrade(direction, amount, duration, 'manual');
}

function setManualQuickAmount(amount) {
    document.getElementById('manualTradeAmount').value = amount;
}

// Tab switching functions
function switchMainTab(tabName) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.main-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked nav tab
    const clickedNavTab = event.target.closest('.nav-tab');
    if (clickedNavTab) {
        clickedNavTab.classList.add('active');
    }
}

function switchAnalyticsTab(tabName) {
    // Hide all analytics tab contents
    const tabs = document.querySelectorAll('#analytics-tab .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all analytics tab buttons
    const tabBtns = document.querySelectorAll('#analytics-tab .tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked tab button
    const clickedBtn = event.target.closest('.tab-btn');
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeZeusAI();
});