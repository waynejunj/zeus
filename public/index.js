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
        
        // Advanced Neural Network
        this.neuralNetwork = {
            patterns: [],
            weights: {},
            previousWeightChanges: {},
            learningRate: 0.01,
            momentum: 0.9,
            layers: {
                input: 20,
                hidden1: 15,
                hidden2: 10,
                output: 2
            }
        };
        
        this.initializeAdvancedWeights();
        this.initializeEventListeners();
        this.startAIAnalysis();
        this.updateUI();
    }
    
    initializeAdvancedWeights() {
        const patterns = [
            'consecutive_same', 'alternating', 'ascending', 'descending',
            'even_odd_pattern', 'fibonacci_like', 'prime_pattern', 'sum_pattern',
            'volatility_pattern', 'momentum_pattern', 'reversal_pattern',
            'support_resistance', 'moving_average', 'rsi_pattern', 'bollinger_pattern'
        ];
        
        patterns.forEach(pattern => {
            this.neuralNetwork.weights[pattern] = Math.random() * 2 - 1;
            this.neuralNetwork.previousWeightChanges[pattern] = 0;
        });
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
    }
    
    handleAuthorization(authData) {
        console.log('Authorization successful:', authData);
        this.isConnected = true;
        
        this.updateConnectionStatus();
        this.showAlert('Successfully connected to Deriv!', 'success');
        
        // Get initial balance (one-time request)
        this.getBalance();
        
        // Subscribe to tick data (essential for trading)
        this.subscribeTicks();
    }
    
    getBalance() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                balance: 1,
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
    
    handleTick(tickData) {
        this.currentTick = tickData;
        this.tickCount++;
        
        const lastDigit = parseInt(tickData.quote.toString().slice(-1));
        this.recentDigits.push(lastDigit);
        
        if (this.recentDigits.length > 50) {
            this.recentDigits.shift();
        }
        
        this.updateDigitDisplay(lastDigit);
        this.updateMarketInfo();
        
        // Run AI analysis
        if (this.recentDigits.length >= 15) {
            this.runAdvancedAIAnalysis();
        }
        
        // Auto trade logic with enhanced conditions
        if (this.aiEnabled && this.recentDigits.length >= 20) {
            this.checkAdvancedAutoTrade();
        }
    }
    
    checkAdvancedAutoTrade() {
        const prediction = this.getAdvancedPrediction();
        const minConfidence = parseInt(document.getElementById('minConfidence').value);
        
        // Enhanced trading conditions
        const marketConditions = this.analyzeMarketConditions();
        const riskAssessment = this.assessRisk();
        
        if (prediction.confidence >= minConfidence && 
            marketConditions.favorable && 
            riskAssessment.safe) {
            
            const amount = this.calculateOptimalAmount();
            const duration = document.getElementById('tradeDuration').value;
            
            this.placeAITrade(prediction.direction, amount, duration);
        }
    }
    
    analyzeMarketConditions() {
        if (this.recentDigits.length < 20) {
            return { favorable: false, reason: 'Insufficient data' };
        }
        
        const volatility = this.calculateVolatility();
        const trend = this.calculateTrend();
        const momentum = this.calculateMomentum();
        
        // Market is favorable if volatility is moderate and trend is clear
        const favorable = volatility > 0.3 && volatility < 0.8 && Math.abs(trend) > 0.6;
        
        return {
            favorable,
            volatility,
            trend,
            momentum,
            reason: favorable ? 'Good market conditions' : 'Unfavorable conditions'
        };
    }
    
    assessRisk() {
        const dailyLoss = this.calculateDailyLoss();
        const maxDailyLoss = parseFloat(document.getElementById('maxDailyLoss').value);
        const consecutiveLosses = this.getConsecutiveLosses();
        
        const safe = dailyLoss < maxDailyLoss && consecutiveLosses < 3;
        
        return {
            safe,
            dailyLoss,
            consecutiveLosses,
            reason: safe ? 'Risk within limits' : 'Risk too high'
        };
    }
    
    calculateOptimalAmount() {
        const baseAmount = parseFloat(document.getElementById('tradeAmount').value);
        const martingaleEnabled = document.getElementById('martingaleEnabled').checked;
        const antiMartingaleEnabled = document.getElementById('antiMartingaleEnabled').checked;
        
        if (martingaleEnabled && this.getLastTradeResult() === 'loss') {
            return Math.min(baseAmount * 2, this.balance * 0.1);
        }
        
        if (antiMartingaleEnabled && this.getLastTradeResult() === 'win') {
            return Math.min(baseAmount * 1.5, this.balance * 0.05);
        }
        
        return baseAmount;
    }
    
    getLastTradeResult() {
        if (this.trades.length === 0) return null;
        const lastTrade = this.trades[this.trades.length - 1];
        return lastTrade.result || 'pending';
    }
    
    getConsecutiveLosses() {
        let losses = 0;
        for (let i = this.trades.length - 1; i >= 0; i--) {
            if (this.trades[i].result === 'loss') {
                losses++;
            } else {
                break;
            }
        }
        return losses;
    }
    
    calculateDailyLoss() {
        const today = new Date().toDateString();
        return this.trades
            .filter(trade => new Date(trade.timestamp).toDateString() === today)
            .reduce((total, trade) => {
                if (trade.result === 'loss') {
                    return total + trade.amount;
                }
                return total;
            }, 0);
    }
    
    placeAITrade(direction, amount, duration) {
        this.logAIActivity(`Placing ${direction.toUpperCase()} trade: $${amount} for ${duration} ticks (Confidence: ${this.getAdvancedPrediction().confidence}%)`);
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
            payout: buyData.payout,
            result: 'pending'
        };
        
        this.trades.push(trade);
        this.updateTradeHistory();
        this.updateLiveTradesDisplay();
        
        if (buyContext && buyContext.source === 'ai') {
            this.aiStats.totalTrades++;
            this.logAIActivity(`Trade placed: ${trade.direction.toUpperCase()} $${trade.amount}`);
        }
        
        this.showAlert(`${trade.direction.toUpperCase()} trade placed: $${trade.amount}`, 'success');
        
        // Update balance after trade
        this.balance -= trade.amount;
        this.updateBalanceDisplay();
    }
    
    // Advanced AI Analysis
    runAdvancedAIAnalysis() {
        if (this.recentDigits.length < 15) return;
        
        const patterns = this.analyzeAdvancedPatterns();
        const prediction = this.calculateAdvancedPrediction(patterns);
        
        this.updatePredictionDisplay(prediction);
        this.updateAnalyticsDisplay(patterns);
        
        // Advanced learning with momentum
        this.updateAdvancedNeuralNetwork(patterns);
    }
    
    analyzeAdvancedPatterns() {
        const digits = this.recentDigits.slice(-30);
        const patterns = {};
        
        // Original patterns
        patterns.consecutive_same = this.analyzeConsecutiveSame(digits);
        patterns.alternating = this.analyzeAlternating(digits);
        patterns.ascending = this.analyzeAscending(digits);
        patterns.descending = this.analyzeDescending(digits);
        patterns.even_odd_pattern = this.analyzeEvenOdd(digits);
        patterns.fibonacci_like = this.analyzeFibonacci(digits);
        patterns.prime_pattern = this.analyzePrimes(digits);
        patterns.sum_pattern = this.analyzeSumPatterns(digits);
        
        // Advanced patterns
        patterns.volatility_pattern = this.calculateVolatility();
        patterns.momentum_pattern = this.calculateMomentum();
        patterns.reversal_pattern = this.analyzeReversalPattern(digits);
        patterns.support_resistance = this.analyzeSupportResistance(digits);
        patterns.moving_average = this.calculateMovingAverage(digits);
        patterns.rsi_pattern = this.calculateRSI(digits);
        patterns.bollinger_pattern = this.calculateBollingerBands(digits);
        
        return patterns;
    }
    
    calculateVolatility() {
        if (this.recentDigits.length < 10) return 0;
        
        const digits = this.recentDigits.slice(-10);
        const mean = digits.reduce((sum, d) => sum + d, 0) / digits.length;
        const variance = digits.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / digits.length;
        
        return Math.sqrt(variance) / 10; // Normalized
    }
    
    calculateMomentum() {
        if (this.recentDigits.length < 5) return 0;
        
        const recent = this.recentDigits.slice(-5);
        const older = this.recentDigits.slice(-10, -5);
        
        if (older.length === 0) return 0;
        
        const recentAvg = recent.reduce((sum, d) => sum + d, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d, 0) / older.length;
        
        return (recentAvg - olderAvg) / 10; // Normalized
    }
    
    calculateTrend() {
        if (this.recentDigits.length < 10) return 0;
        
        const digits = this.recentDigits.slice(-10);
        let upCount = 0;
        let downCount = 0;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] > digits[i-1]) upCount++;
            else if (digits[i] < digits[i-1]) downCount++;
        }
        
        return (upCount - downCount) / (digits.length - 1);
    }
    
    analyzeReversalPattern(digits) {
        if (digits.length < 5) return 0;
        
        let reversals = 0;
        for (let i = 2; i < digits.length; i++) {
            const prev = digits[i-2];
            const curr = digits[i-1];
            const next = digits[i];
            
            if ((curr > prev && curr > next) || (curr < prev && curr < next)) {
                reversals++;
            }
        }
        
        return reversals / (digits.length - 2);
    }
    
    analyzeSupportResistance(digits) {
        if (digits.length < 10) return 0;
        
        const max = Math.max(...digits);
        const min = Math.min(...digits);
        const current = digits[digits.length - 1];
        
        const distanceFromSupport = (current - min) / (max - min);
        const distanceFromResistance = (max - current) / (max - min);
        
        return Math.min(distanceFromSupport, distanceFromResistance);
    }
    
    calculateMovingAverage(digits) {
        if (digits.length < 5) return 0;
        
        const shortMA = digits.slice(-5).reduce((sum, d) => sum + d, 0) / 5;
        const longMA = digits.slice(-10).reduce((sum, d) => sum + d, 0) / Math.min(10, digits.length);
        
        return (shortMA - longMA) / 10; // Normalized
    }
    
    calculateRSI(digits) {
        if (digits.length < 14) return 0.5;
        
        const changes = [];
        for (let i = 1; i < digits.length; i++) {
            changes.push(digits[i] - digits[i-1]);
        }
        
        const gains = changes.filter(c => c > 0);
        const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
        
        if (losses.length === 0) return 1;
        if (gains.length === 0) return 0;
        
        const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
        const avgLoss = losses.reduce((sum, l) => sum + l, 0) / losses.length;
        
        const rs = avgGain / avgLoss;
        return rs / (1 + rs);
    }
    
    calculateBollingerBands(digits) {
        if (digits.length < 20) return 0;
        
        const period = Math.min(20, digits.length);
        const recentDigits = digits.slice(-period);
        
        const mean = recentDigits.reduce((sum, d) => sum + d, 0) / period;
        const variance = recentDigits.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const upperBand = mean + (2 * stdDev);
        const lowerBand = mean - (2 * stdDev);
        const current = digits[digits.length - 1];
        
        if (current > upperBand) return 1; // Overbought
        if (current < lowerBand) return -1; // Oversold
        
        return (current - mean) / (upperBand - lowerBand); // Position within bands
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
    
    calculateAdvancedPrediction(patterns) {
        let callScore = 0;
        let putScore = 0;
        let totalWeight = 0;
        
        // Apply neural network weights with confidence scaling
        for (let pattern in patterns) {
            const weight = this.neuralNetwork.weights[pattern] || 0;
            const value = patterns[pattern] * weight;
            const confidence = Math.abs(patterns[pattern]);
            
            totalWeight += confidence;
            
            if (value > 0) {
                callScore += value * confidence;
            } else {
                putScore += Math.abs(value) * confidence;
            }
        }
        
        // Normalize scores
        const total = callScore + putScore;
        if (total === 0 || totalWeight === 0) {
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
        
        // Apply confidence boost based on pattern strength
        const patternStrength = totalWeight / Object.keys(patterns).length;
        const adjustedConfidence = Math.min(confidence * (1 + patternStrength), 95);
        
        return {
            direction,
            confidence: Math.round(adjustedConfidence),
            callProbability: Math.round(callProb),
            putProbability: Math.round(putProb)
        };
    }
    
    updateAdvancedNeuralNetwork(patterns) {
        if (this.recentDigits.length < 2) return;
        
        const lastDigit = this.recentDigits[this.recentDigits.length - 1];
        const prevDigit = this.recentDigits[this.recentDigits.length - 2];
        
        const actualDirection = lastDigit > prevDigit ? 'call' : 'put';
        const prediction = this.calculateAdvancedPrediction(patterns);
        
        // Enhanced learning with momentum
        const correct = prediction.direction === actualDirection;
        const learningRate = this.neuralNetwork.learningRate;
        const momentum = this.neuralNetwork.momentum;
        
        const adjustment = correct ? learningRate : -learningRate;
        
        for (let pattern in patterns) {
            if (this.neuralNetwork.weights[pattern] !== undefined) {
                const weightChange = adjustment * patterns[pattern] + 
                                   momentum * this.neuralNetwork.previousWeightChanges[pattern];
                
                this.neuralNetwork.weights[pattern] += weightChange;
                this.neuralNetwork.previousWeightChanges[pattern] = weightChange;
                
                // Prevent weights from becoming too extreme
                this.neuralNetwork.weights[pattern] = Math.max(-2, Math.min(2, this.neuralNetwork.weights[pattern]));
            }
        }
        
        // Update AI stats
        if (correct && this.aiStats.totalTrades > 0) {
            this.aiStats.winningTrades++;
        }
    }
    
    getAdvancedPrediction() {
        if (this.recentDigits.length < 15) {
            return {
                direction: 'neutral',
                confidence: 50,
                callProbability: 50,
                putProbability: 50
            };
        }
        
        const patterns = this.analyzeAdvancedPatterns();
        return this.calculateAdvancedPrediction(patterns);
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
                const prediction = this.getAdvancedPrediction();
                if (prediction.confidence > 75) {
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
        
        // Update AI stats display
        this.updateAIStatsDisplay();
    }
    
    updateAIStatsDisplay() {
        const winRate = this.aiStats.totalTrades > 0 ? 
            Math.round((this.aiStats.winningTrades / this.aiStats.totalTrades) * 100) : 0;
        
        const elements = {
            'aiWinRate': `${winRate}%`,
            'aiTotalTrades': this.aiStats.totalTrades,
            'aiProfit': `$${this.aiStats.profit.toFixed(2)}`,
            'aiAccuracyHeader': `${winRate}%`
        };
        
        for (let id in elements) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        }
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
            if (prediction.confidence > 85) {
                statusElement.textContent = 'Very High Confidence Signal';
            } else if (prediction.confidence > 75) {
                statusElement.textContent = 'High Confidence Signal';
            } else if (prediction.confidence > 65) {
                statusElement.textContent = 'Moderate Confidence Signal';
            } else {
                statusElement.textContent = 'Analyzing Market Patterns...';
            }
        }
        
        if (callProbElement) callProbElement.textContent = `${prediction.callProbability}%`;
        if (putProbElement) putProbElement.textContent = `${prediction.putProbability}%`;
        
        if (callBarElement) callBarElement.style.width = `${prediction.callProbability}%`;
        if (putBarElement) putBarElement.style.width = `${prediction.putProbability}%`;
    }
    
    updateAnalyticsDisplay(patterns) {
        // Update pattern analysis
        const volatility = patterns.volatility_pattern || 0;
        const momentum = patterns.momentum_pattern || 0;
        
        const volatilityLevel = volatility < 0.3 ? 'Low' : volatility < 0.7 ? 'Medium' : 'High';
        const trendDirection = momentum > 0.1 ? 'Bullish' : momentum < -0.1 ? 'Bearish' : 'Neutral';
        
        const elements = {
            'volatilityLevel': volatilityLevel,
            'trendDirection': trendDirection,
            'volatilityIndex': `${Math.round(volatility * 100)}%`,
            'trendStrengthValue': `${Math.round(Math.abs(momentum) * 100)}%`
        };
        
        for (let id in elements) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        }
        
        // Update pattern strength bar
        const patternStrength = document.getElementById('patternStrength');
        if (patternStrength) {
            const strength = Math.round((volatility + Math.abs(momentum)) * 50);
            patternStrength.style.width = `${Math.min(strength, 100)}%`;
        }
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
    
    updateTradeHistory() {
        const historyList = document.getElementById('tradeHistoryList');
        if (!historyList) return;
        
        if (this.trades.length === 0) {
            historyList.innerHTML = `
                <div class="no-trades">
                    <i class="fas fa-chart-line"></i>
                    <p>No trades yet</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.trades.slice(-20).reverse().map(trade => `
            <div class="trade-item ${trade.result || 'open'}">
                <div class="trade-icon ${trade.direction}">
                    <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
                </div>
                <div class="trade-info">
                    <div class="trade-type">${trade.direction.toUpperCase()} - ${trade.source.toUpperCase()}</div>
                    <div class="trade-time">${new Date(trade.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="trade-result">
                    <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                    <div class="trade-profit ${trade.result || 'pending'}">
                        ${trade.result === 'win' ? `+$${(trade.payout - trade.amount).toFixed(2)}` : 
                          trade.result === 'loss' ? `-$${trade.amount.toFixed(2)}` : 'Pending'}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateLiveTradesDisplay() {
        const liveTradesList = document.getElementById('liveTradesList');
        if (!liveTradesList) return;
        
        const openTrades = this.trades.filter(trade => trade.status === 'open');
        
        if (openTrades.length === 0) {
            liveTradesList.innerHTML = `
                <div class="no-trades">
                    <i class="fas fa-chart-line"></i>
                    <p>No active trades</p>
                </div>
            `;
            return;
        }
        
        liveTradesList.innerHTML = openTrades.map(trade => `
            <div class="trade-item open">
                <div class="trade-icon ${trade.direction}">
                    <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
                </div>
                <div class="trade-info">
                    <div class="trade-type">${trade.direction.toUpperCase()}</div>
                    <div class="trade-time">${new Date(trade.timestamp).toLocaleTimeString()}</div>
                </div>
                <div class="trade-result">
                    <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                    <div class="trade-profit pending">Active</div>
                </div>
            </div>
        `).join('');
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
            if (this.recentDigits.length >= 15) {
                this.runAdvancedAIAnalysis();
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
        
        zeusAI.logAIActivity('AI Trading System ACTIVATED - Enhanced Neural Network Online');
        zeusAI.showAlert('AI Trading activated with advanced algorithms', 'success');
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

function filterHistory(filter) {
    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Filter logic would go here
    console.log('Filtering history by:', filter);
}

function clearHistory() {
    if (zeusAI && confirm('Are you sure you want to clear all trade history?')) {
        zeusAI.trades = [];
        zeusAI.updateTradeHistory();
        zeusAI.showAlert('Trade history cleared', 'info');
    }
}

function exportHistory() {
    if (zeusAI && zeusAI.trades.length > 0) {
        const data = JSON.stringify(zeusAI.trades, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zeus-ai-trades-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        zeusAI.showAlert('Trade history exported', 'success');
    } else {
        zeusAI.showAlert('No trade history to export', 'warning');
    }
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