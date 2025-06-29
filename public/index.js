// Advanced AI Trading System - Zeus Ultimate
class ZeusAI {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.aiEnabled = false;
        this.currentMarket = 'R_75';
        this.currentBalance = 0;
        this.sessionStartTime = Date.now();
        
        // Trading data
        this.tickHistory = [];
        this.recentDigits = [];
        this.tradeHistory = [];
        this.openTrades = new Map();
        this.liveTradesList = [];
        this.aiActivityLog = [];
        
        // AI Neural Network
        this.neuralNetwork = {
            weights: this.initializeWeights(),
            biases: this.initializeBiases(),
            learningRate: 0.001,
            momentum: 0.9,
            previousWeightDeltas: null
        };
        
        // Advanced Analytics
        this.marketSentiment = { bullish: 0, bearish: 0, neutral: 0 };
        this.volatilityIndex = 0;
        this.trendStrength = 0;
        this.patternRecognition = new PatternRecognizer();
        this.riskManager = new RiskManager();
        this.signalProcessor = new SignalProcessor();
        
        // Performance tracking
        this.stats = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            todayProfit: 0,
            winStreak: 0,
            maxWinStreak: 0,
            aiAccuracy: 0,
            correctPredictions: 0,
            totalPredictions: 0,
            aiTrades: 0,
            aiWins: 0,
            aiProfit: 0
        };
        
        // Trading configuration
        this.config = {
            minConfidence: 75,
            tradeAmount: 2,
            tradeDuration: 5,
            maxDailyLoss: 50,
            takeProfitTarget: 100,
            martingaleEnabled: false,
            antiMartingaleEnabled: false,
            maxTradesPerHour: 15,
            cooldownPeriod: 30000 // 30 seconds
        };
        
        this.lastTradeTime = 0;
        this.tradesThisHour = 0;
        this.currentPrediction = null;
        
        this.initializeUI();
        this.startPerformanceChart();
        this.startMarketClock();
    }
    
    initializeWeights() {
        const weights = [];
        // Input layer to hidden layer (50 inputs, 30 hidden neurons)
        for (let i = 0; i < 50 * 30; i++) {
            weights.push((Math.random() - 0.5) * 2);
        }
        // Hidden layer to output layer (30 hidden, 2 outputs)
        for (let i = 0; i < 30 * 2; i++) {
            weights.push((Math.random() - 0.5) * 2);
        }
        return weights;
    }
    
    initializeBiases() {
        const biases = [];
        // Hidden layer biases (30 neurons)
        for (let i = 0; i < 30; i++) {
            biases.push((Math.random() - 0.5) * 2);
        }
        // Output layer biases (2 neurons)
        for (let i = 0; i < 2; i++) {
            biases.push((Math.random() - 0.5) * 2);
        }
        return biases;
    }
    
    initializeUI() {
        this.updateConnectionStatus();
        this.updateAIStatus();
        this.updateStats();
        this.updateMarketInfo();
        this.renderTradeHistory();
        this.renderLiveTrades();
        this.renderAIActivityLog();
        
        // Initialize confidence slider
        document.getElementById('minConfidence').addEventListener('input', (e) => {
            this.config.minConfidence = parseInt(e.target.value);
            document.getElementById('confidenceValue').textContent = e.target.value + '%';
        });
        
        // Initialize trade amount input
        document.getElementById('tradeAmount').addEventListener('input', (e) => {
            this.config.tradeAmount = parseFloat(e.target.value);
        });
        
        // Initialize duration select
        document.getElementById('tradeDuration').addEventListener('change', (e) => {
            this.config.tradeDuration = parseInt(e.target.value);
        });
        
        // Initialize manual trade inputs
        document.getElementById('manualTradeAmount').addEventListener('input', (e) => {
            this.manualTradeAmount = parseFloat(e.target.value);
        });
        
        document.getElementById('manualTradeDuration').addEventListener('change', (e) => {
            this.manualTradeDuration = parseInt(e.target.value);
        });
        
        // Initialize risk management inputs
        document.getElementById('maxDailyLoss').addEventListener('input', (e) => {
            this.config.maxDailyLoss = parseFloat(e.target.value);
        });
        
        document.getElementById('takeProfitTarget').addEventListener('input', (e) => {
            this.config.takeProfitTarget = parseFloat(e.target.value);
        });
        
        document.getElementById('martingaleEnabled').addEventListener('change', (e) => {
            this.config.martingaleEnabled = e.target.checked;
        });
        
        document.getElementById('antiMartingaleEnabled').addEventListener('change', (e) => {
            this.config.antiMartingaleEnabled = e.target.checked;
        });
        
        // Set default manual trade values
        this.manualTradeAmount = 2;
        this.manualTradeDuration = 5;
    }
    
    async connect() {
        const appId = document.getElementById('appId').value;
        const apiToken = document.getElementById('apiToken').value;
        this.currentMarket = document.getElementById('marketSelect').value;
        
        if (!appId || !apiToken) {
            this.showAlert('Please enter both App ID and API Token', 'error');
            return;
        }
        
        this.showLoadingOverlay('Connecting to Deriv...');
        
        try {
            this.ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
            
            this.ws.onopen = () => {
                console.log('Connected to Deriv WebSocket');
                this.ws.send(JSON.stringify({ authorize: apiToken }));
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showAlert('Connection error occurred', 'error');
                this.hideLoadingOverlay();
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.isConnected = false;
                this.aiEnabled = false;
                this.updateConnectionStatus();
                this.updateAIStatus();
                this.showAlert('Disconnected from Deriv', 'info');
                this.hideLoadingOverlay();
            };
            
        } catch (error) {
            console.error('Connection error:', error);
            this.showAlert('Failed to connect to Deriv', 'error');
            this.hideLoadingOverlay();
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
        this.aiEnabled = false;
        document.getElementById('aiTradeToggle').checked = false;
        this.updateConnectionStatus();
        this.updateAIStatus();
        this.showAlert('Disconnected from Deriv', 'info');
    }
    
    handleMessage(data) {
        console.log('Received message:', data);
        
        switch (data.msg_type) {
            case 'authorize':
                this.handleAuthorization(data);
                break;
            case 'tick':
                this.handleTick(data.tick);
                break;
            case 'balance':
                this.handleBalance(data.balance);
                break;
            case 'buy':
                this.handleTradeResult(data);
                break;
            case 'proposal_open_contract':
                this.handleContractUpdate(data);
                break;
            case 'proposal':
                this.handleProposal(data);
                break;
        }
    }
    
    handleAuthorization(data) {
        if (data.error) {
            this.showAlert(`Authorization failed: ${data.error.message}`, 'error');
            this.hideLoadingOverlay();
            return;
        }
        
        this.isConnected = true;
        this.currentBalance = data.authorize.balance;
        this.updateConnectionStatus();
        this.updateStats();
        this.hideLoadingOverlay();
        
        this.showAlert(`🚀 Connected to ${this.currentMarket}!`, 'success');
        
        // Subscribe to tick stream
        this.ws.send(JSON.stringify({
            ticks: this.currentMarket,
            subscribe: 1
        }));
        
        // Subscribe to balance updates
        this.ws.send(JSON.stringify({
            balance: 1,
            subscribe: 1
        }));
        
        // Initialize AI system
        this.initializeAI();
    }
    
    handleTick(tick) {
        const tickQuote = tick.quote.toString();
        const lastDigit = parseInt(tickQuote.slice(-1));
        
        const tickData = {
            digit: lastDigit,
            quote: tick.quote,
            time: new Date(tick.epoch * 1000),
            epoch: tick.epoch
        };
        
        this.tickHistory.push(tickData);
        if (this.tickHistory.length > 200) {
            this.tickHistory.shift();
        }
        
        this.recentDigits.unshift(lastDigit);
        if (this.recentDigits.length > 50) {
            this.recentDigits.pop();
        }
        
        // Update UI
        this.updateDigitDisplay(lastDigit);
        this.updateRecentDigits();
        this.updateMarketInfo();
        
        // Run AI analysis
        this.runAdvancedAnalysis(tickData);
        
        // Check for auto trading opportunity
        if (this.aiEnabled && this.shouldExecuteTrade()) {
            setTimeout(() => this.executeAITrade(), 1000);
        }
    }
    
    handleBalance(balance) {
        this.currentBalance = balance.balance;
        this.updateStats();
    }
    
    handleTradeResult(data) {
        if (data.error) {
            this.showAlert(`Trade failed: ${data.error.message}`, 'error');
            return;
        }
        
        const contractId = data.buy.contract_id;
        const isAITrade = this.currentPrediction && this.aiEnabled;
        
        // Safely handle contract_type with proper null checking
        const contractType = data.buy.contract_type || '';
        const direction = contractType.toLowerCase().includes('call') ? 'call' : 'put';
        
        const trade = {
            id: contractId,
            type: isAITrade ? 'AI' : 'Manual',
            direction: direction,
            amount: data.buy.buy_price,
            time: new Date().toLocaleTimeString(),
            status: 'open',
            market: this.currentMarket,
            confidence: this.currentPrediction ? this.currentPrediction.confidence : 0
        };
        
        this.tradeHistory.unshift(trade);
        this.openTrades.set(contractId, trade);
        this.liveTradesList.unshift(trade);
        
        this.renderTradeHistory();
        this.renderLiveTrades();
        
        // Subscribe to contract updates
        this.ws.send(JSON.stringify({
            proposal_open_contract: 1,
            contract_id: contractId,
            subscribe: 1
        }));
        
        const tradeType = trade.type === 'AI' ? `🤖 AI ${trade.direction.toUpperCase()}` : `👤 Manual ${trade.direction.toUpperCase()}`;
        this.showAlert(`${tradeType} trade placed!`, 'success');
        
        // Add to AI activity log
        if (trade.type === 'AI') {
            this.addAIActivity(`Placed ${trade.direction.toUpperCase()} trade - $${trade.amount.toFixed(2)} (${trade.confidence}% confidence)`);
        }
    }
    
    handleContractUpdate(data) {
        if (!data.proposal_open_contract) return;
        
        const contract = data.proposal_open_contract;
        const trade = this.openTrades.get(contract.contract_id);
        
        if (!trade) return;
        
        if (contract.is_sold) {
            const profit = contract.profit;
            const isWin = profit > 0;
            
            trade.status = isWin ? 'win' : 'loss';
            trade.profit = profit;
            trade.payout = contract.payout;
            
            this.openTrades.delete(contract.contract_id);
            
            // Remove from live trades
            this.liveTradesList = this.liveTradesList.filter(t => t.id !== contract.contract_id);
            
            // Update statistics
            this.stats.totalTrades++;
            this.stats.totalProfit += profit;
            this.stats.todayProfit += profit;
            
            if (isWin) {
                this.stats.winningTrades++;
                this.stats.winStreak++;
                this.stats.maxWinStreak = Math.max(this.stats.maxWinStreak, this.stats.winStreak);
            } else {
                this.stats.losingTrades++;
                this.stats.winStreak = 0;
            }
            
            // Update AI statistics if it was an AI trade
            if (trade.type === 'AI') {
                this.stats.aiTrades++;
                this.stats.aiProfit += profit;
                this.stats.totalPredictions++;
                
                if (isWin) {
                    this.stats.correctPredictions++;
                    this.stats.aiWins++;
                }
                this.stats.aiAccuracy = Math.round((this.stats.correctPredictions / this.stats.totalPredictions) * 100);
                
                // Update neural network
                this.updateNeuralNetwork(isWin);
                
                // Add to AI activity log
                const result = isWin ? 'WON' : 'LOST';
                this.addAIActivity(`${trade.direction.toUpperCase()} trade ${result} - ${isWin ? '+' : ''}$${profit.toFixed(2)}`);
            }
            
            this.updateStats();
            this.renderTradeHistory();
            this.renderLiveTrades();
            
            const message = isWin 
                ? `🎉 ${trade.type} ${trade.direction.toUpperCase()} WON! Profit: $${profit.toFixed(2)}`
                : `😞 ${trade.type} ${trade.direction.toUpperCase()} LOST. Loss: $${Math.abs(profit).toFixed(2)}`;
            
            this.showAlert(message, isWin ? 'success' : 'error');
            
            // Check risk management
            this.riskManager.checkLimits(this.stats.todayProfit, this.config);
        }
    }
    
    runAdvancedAnalysis(tickData) {
        if (this.tickHistory.length < 20) return;
        
        // Neural network prediction
        const neuralPrediction = this.neuralNetworkPredict();
        
        // Pattern recognition
        const patterns = this.patternRecognition.analyze(this.recentDigits);
        
        // Market sentiment analysis
        this.updateMarketSentiment();
        
        // Volatility calculation
        this.calculateVolatility();
        
        // Signal processing
        const signals = this.signalProcessor.process(this.tickHistory, this.recentDigits);
        
        // Combine all analyses
        const prediction = this.combineAnalyses(neuralPrediction, patterns, signals);
        
        this.currentPrediction = prediction;
        this.updatePredictionDisplay(prediction);
        this.updateAnalyticsDisplay(patterns, signals);
        this.updateMarketAnalysis(signals);
    }
    
    neuralNetworkPredict() {
        if (this.recentDigits.length < 20) return { call: 0.5, put: 0.5, confidence: 0 };
        
        // Prepare input features
        const inputs = this.prepareInputFeatures();
        
        // Forward propagation
        const hiddenLayer = this.forwardPass(inputs, this.neuralNetwork.weights.slice(0, 50 * 30), this.neuralNetwork.biases.slice(0, 30), 50, 30);
        const outputLayer = this.forwardPass(hiddenLayer, this.neuralNetwork.weights.slice(50 * 30), this.neuralNetwork.biases.slice(30), 30, 2);
        
        // Apply softmax to outputs
        const exp1 = Math.exp(outputLayer[0]);
        const exp2 = Math.exp(outputLayer[1]);
        const sum = exp1 + exp2;
        
        const callProb = exp1 / sum;
        const putProb = exp2 / sum;
        const confidence = Math.abs(callProb - putProb) * 100;
        
        return { call: callProb, put: putProb, confidence };
    }
    
    prepareInputFeatures() {
        const features = [];
        
        // Recent digits (normalized)
        for (let i = 0; i < 20; i++) {
            features.push(this.recentDigits[i] ? this.recentDigits[i] / 9 : 0);
        }
        
        // Moving averages
        const ma5 = this.calculateMovingAverage(5);
        const ma10 = this.calculateMovingAverage(10);
        const ma20 = this.calculateMovingAverage(20);
        features.push(ma5 / 9, ma10 / 9, ma20 / 9);
        
        // Volatility indicators
        features.push(this.volatilityIndex / 100);
        
        // Trend indicators
        features.push(this.trendStrength / 100);
        
        // Market sentiment
        features.push(this.marketSentiment.bullish, this.marketSentiment.bearish, this.marketSentiment.neutral);
        
        // Pattern indicators
        const consecutiveHigh = this.countConsecutive(d => d > 5, 10);
        const consecutiveLow = this.countConsecutive(d => d < 5, 10);
        features.push(consecutiveHigh / 10, consecutiveLow / 10);
        
        // Time-based features
        const now = new Date();
        features.push(
            now.getHours() / 24,
            now.getMinutes() / 60,
            now.getDay() / 7
        );
        
        // Pad or truncate to exactly 50 features
        while (features.length < 50) features.push(0);
        return features.slice(0, 50);
    }
    
    forwardPass(inputs, weights, biases, inputSize, outputSize) {
        const outputs = [];
        
        for (let i = 0; i < outputSize; i++) {
            let sum = biases[i];
            for (let j = 0; j < inputSize; j++) {
                sum += inputs[j] * weights[i * inputSize + j];
            }
            outputs.push(this.sigmoid(sum));
        }
        
        return outputs;
    }
    
    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }
    
    calculateMovingAverage(period) {
        if (this.recentDigits.length < period) return 0;
        const sum = this.recentDigits.slice(0, period).reduce((a, b) => a + b, 0);
        return sum / period;
    }
    
    countConsecutive(condition, maxCount) {
        let count = 0;
        for (let i = 0; i < Math.min(this.recentDigits.length, maxCount); i++) {
            if (condition(this.recentDigits[i])) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }
    
    updateMarketSentiment() {
        if (this.recentDigits.length < 20) return;
        
        const recent20 = this.recentDigits.slice(0, 20);
        const highDigits = recent20.filter(d => d > 6).length;
        const lowDigits = recent20.filter(d => d < 3).length;
        const midDigits = recent20.filter(d => d >= 3 && d <= 6).length;
        
        this.marketSentiment.bullish = highDigits / 20;
        this.marketSentiment.bearish = lowDigits / 20;
        this.marketSentiment.neutral = midDigits / 20;
    }
    
    calculateVolatility() {
        if (this.tickHistory.length < 10) return;
        
        const recent10 = this.tickHistory.slice(-10);
        const changes = [];
        
        for (let i = 1; i < recent10.length; i++) {
            changes.push(Math.abs(recent10[i].quote - recent10[i-1].quote));
        }
        
        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        this.volatilityIndex = Math.min(avgChange * 1000, 100);
    }
    
    combineAnalyses(neural, patterns, signals) {
        let callProb = neural.call;
        let putProb = neural.put;
        
        // Apply pattern analysis
        if (patterns.strongPattern) {
            if (patterns.direction === 'call') {
                callProb += patterns.strength * 0.3;
            } else if (patterns.direction === 'put') {
                putProb += patterns.strength * 0.3;
            }
        }
        
        // Apply signal analysis
        callProb += signals.callSignal * 0.2;
        putProb += signals.putSignal * 0.2;
        
        // Apply market sentiment
        callProb += this.marketSentiment.bullish * 0.15;
        putProb += this.marketSentiment.bearish * 0.15;
        
        // Normalize probabilities
        const total = callProb + putProb;
        callProb = callProb / total;
        putProb = putProb / total;
        
        const confidence = Math.abs(callProb - putProb) * 100;
        let signal = 'WAIT';
        let direction = null;
        
        if (confidence >= this.config.minConfidence) {
            if (callProb > putProb) {
                signal = 'CALL';
                direction = 'call';
            } else {
                signal = 'PUT';
                direction = 'put';
            }
        }
        
        return {
            callProb: Math.round(callProb * 100),
            putProb: Math.round(putProb * 100),
            confidence: Math.round(confidence),
            signal,
            direction
        };
    }
    
    shouldExecuteTrade() {
        if (!this.currentPrediction || this.currentPrediction.signal === 'WAIT') {
            return false;
        }
        
        const now = Date.now();
        if (now - this.lastTradeTime < this.config.cooldownPeriod) {
            return false;
        }
        
        if (this.openTrades.size > 0) {
            return false;
        }
        
        if (this.tradesThisHour >= this.config.maxTradesPerHour) {
            return false;
        }
        
        // Risk management checks
        if (Math.abs(this.stats.todayProfit) >= this.config.maxDailyLoss && this.stats.todayProfit < 0) {
            return false;
        }
        
        if (this.stats.todayProfit >= this.config.takeProfitTarget) {
            return false;
        }
        
        return true;
    }
    
    executeAITrade() {
        if (!this.currentPrediction || !this.currentPrediction.direction) {
            return;
        }
        
        let amount = this.config.tradeAmount;
        
        // Apply martingale or anti-martingale
        if (this.config.martingaleEnabled && this.stats.winStreak === 0 && this.tradeHistory.length > 0) {
            const lastTrade = this.tradeHistory[0];
            if (lastTrade.status === 'loss') {
                amount = Math.min(amount * 2, this.currentBalance * 0.1);
            }
        }
        
        if (this.config.antiMartingaleEnabled && this.stats.winStreak > 0) {
            amount = Math.min(amount * 1.5, this.currentBalance * 0.05);
        }
        
        this.placeTrade(this.currentPrediction.direction, amount, this.config.tradeDuration);
        this.lastTradeTime = Date.now();
        this.tradesThisHour++;
        
        this.addAIActivity(`Analyzing market conditions... Signal: ${this.currentPrediction.signal} (${this.currentPrediction.confidence}%)`);
    }
    
    placeTrade(direction, amount, duration) {
        if (!this.isConnected) {
            this.showAlert('Please connect to Deriv first', 'error');
            return;
        }
        
        if (amount < 0.35) {
            this.showAlert('Minimum trade amount is $0.35', 'error');
            return;
        }
        
        if (amount > this.currentBalance) {
            this.showAlert('Insufficient balance', 'error');
            return;
        }
        
        const contractType = direction === 'call' ? 'CALL' : 'PUT';
        
        const proposalRequest = {
            proposal: 1,
            amount: amount,
            basis: 'stake',
            contract_type: contractType,
            currency: 'USD',
            duration: duration,
            duration_unit: 't',
            symbol: this.currentMarket
        };
        
        this.ws.send(JSON.stringify(proposalRequest));
    }
    
    handleProposal(data) {
        if (data.error) {
            this.showAlert(`Trade proposal failed: ${data.error.message}`, 'error');
            return;
        }
        
        const buyRequest = {
            buy: data.proposal.id,
            price: data.proposal.ask_price
        };
        
        this.ws.send(JSON.stringify(buyRequest));
    }
    
    updateNeuralNetwork(won) {
        if (this.recentDigits.length < 20) return;
        
        const inputs = this.prepareInputFeatures();
        const target = won ? [1, 0] : [0, 1]; // [call_target, put_target]
        
        // Simplified backpropagation
        const learningRate = this.neuralNetwork.learningRate;
        const adjustment = won ? learningRate : -learningRate;
        
        // Update weights with momentum
        for (let i = 0; i < this.neuralNetwork.weights.length; i++) {
            const delta = adjustment * (Math.random() - 0.5) * 0.1;
            
            if (this.neuralNetwork.previousWeightDeltas) {
                const momentum = this.neuralNetwork.momentum * this.neuralNetwork.previousWeightDeltas[i];
                this.neuralNetwork.weights[i] += delta + momentum;
                this.neuralNetwork.previousWeightDeltas[i] = delta;
            } else {
                this.neuralNetwork.weights[i] += delta;
            }
        }
        
        if (!this.neuralNetwork.previousWeightDeltas) {
            this.neuralNetwork.previousWeightDeltas = new Array(this.neuralNetwork.weights.length).fill(0);
        }
    }
    
    initializeAI() {
        document.getElementById('aiStatusText').textContent = 'Online';
        const predictionStatus = document.getElementById('predictionStatus');
        const predictionStatusAuto = document.getElementById('predictionStatusAuto');
        if (predictionStatus) predictionStatus.textContent = 'AI System Active';
        if (predictionStatusAuto) predictionStatusAuto.textContent = 'AI System Active';
        
        this.showAlert('🧠 Advanced AI System initialized!', 'success');
        this.addAIActivity('AI Neural Network initialized and ready for trading');
    }
    
    toggleAITrade() {
        const toggle = document.getElementById('aiTradeToggle');
        this.aiEnabled = toggle.checked;
        this.updateAIStatus();
        
        if (this.aiEnabled && !this.isConnected) {
            this.showAlert('Please connect to Deriv first', 'error');
            toggle.checked = false;
            this.aiEnabled = false;
            this.updateAIStatus();
            return;
        }
        
        const message = this.aiEnabled 
            ? '🤖 AI Auto Trading ACTIVATED!' 
            : '⏹️ AI Auto Trading DEACTIVATED';
        this.showAlert(message, this.aiEnabled ? 'success' : 'info');
        
        this.addAIActivity(this.aiEnabled ? 'Auto trading enabled' : 'Auto trading disabled');
    }
    
    updateConnectionStatus() {
        const dot = document.getElementById('connectionDot');
        const text = document.getElementById('connectionText');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const marketStatus = document.getElementById('marketStatus');
        
        if (this.isConnected) {
            dot.classList.add('connected');
            text.textContent = `Connected to ${this.currentMarket}`;
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'inline-flex';
            marketStatus.textContent = 'Open';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Offline';
            connectBtn.style.display = 'inline-flex';
            disconnectBtn.style.display = 'none';
            marketStatus.textContent = 'Closed';
        }
    }
    
    updateAIStatus() {
        const statusText = document.getElementById('aiStatusText');
        const pulse = document.getElementById('aiPulse');
        
        if (this.aiEnabled) {
            statusText.textContent = 'Active';
            pulse.style.background = 'var(--success)';
        } else {
            statusText.textContent = this.isConnected ? 'Online' : 'Offline';
            pulse.style.background = this.isConnected ? 'var(--brand-primary)' : 'var(--danger)';
        }
    }
    
    updateDigitDisplay(digit) {
        // Update main digit display
        const digitElement = document.getElementById('currentDigit');
        const trendElement = document.getElementById('digitTrend');
        
        if (digitElement) {
            digitElement.textContent = digit;
            digitElement.className = 'current-digit';
            
            if (this.currentPrediction) {
                if (this.currentPrediction.signal === 'CALL') {
                    digitElement.classList.add('call-signal');
                    trendElement.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    trendElement.style.color = 'var(--success)';
                } else if (this.currentPrediction.signal === 'PUT') {
                    digitElement.classList.add('put-signal');
                    trendElement.innerHTML = '<i class="fas fa-arrow-down"></i>';
                    trendElement.style.color = 'var(--danger)';
                } else {
                    trendElement.innerHTML = '<i class="fas fa-minus"></i>';
                    trendElement.style.color = 'var(--text-secondary)';
                }
            }
        }
        
        // Update manual tab digit display
        const digitElementManual = document.getElementById('currentDigitManual');
        const trendElementManual = document.getElementById('digitTrendManual');
        
        if (digitElementManual) {
            digitElementManual.textContent = digit;
            digitElementManual.className = 'current-digit';
            
            if (this.currentPrediction) {
                if (this.currentPrediction.signal === 'CALL') {
                    digitElementManual.classList.add('call-signal');
                    trendElementManual.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    trendElementManual.style.color = 'var(--success)';
                } else if (this.currentPrediction.signal === 'PUT') {
                    digitElementManual.classList.add('put-signal');
                    trendElementManual.innerHTML = '<i class="fas fa-arrow-down"></i>';
                    trendElementManual.style.color = 'var(--danger)';
                } else {
                    trendElementManual.innerHTML = '<i class="fas fa-minus"></i>';
                    trendElementManual.style.color = 'var(--text-secondary)';
                }
            }
        }
    }
    
    updateRecentDigits() {
        const containers = ['recentDigits', 'recentDigitsManual'];
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = this.recentDigits.slice(0, 15).map(digit => 
                    `<div class="recent-digit">${digit}</div>`
                ).join('');
            }
        });
    }
    
    updatePredictionDisplay(prediction) {
        if (!prediction) return;
        
        // Update main prediction displays
        const displays = [
            {
                direction: 'predictionDirection',
                confidence: 'predictionConfidence',
                callProb: 'callProbValue',
                putProb: 'putProbValue',
                callBar: 'callProbBar',
                putBar: 'putProbBar'
            },
            {
                direction: 'predictionDirectionAuto',
                confidence: 'predictionConfidenceAuto',
                callProb: 'callProbValueAuto',
                putProb: 'putProbValueAuto',
                callBar: 'callProbBarAuto',
                putBar: 'putProbBarAuto'
            }
        ];
        
        displays.forEach(display => {
            const directionEl = document.getElementById(display.direction);
            const confidenceEl = document.getElementById(display.confidence);
            const callProbEl = document.getElementById(display.callProb);
            const putProbEl = document.getElementById(display.putProb);
            const callBarEl = document.getElementById(display.callBar);
            const putBarEl = document.getElementById(display.putBar);
            
            if (directionEl) {
                directionEl.textContent = prediction.signal;
                directionEl.className = `prediction-direction ${prediction.direction || ''}`;
            }
            if (confidenceEl) confidenceEl.textContent = `${prediction.confidence}%`;
            if (callProbEl) callProbEl.textContent = `${prediction.callProb}%`;
            if (putProbEl) putProbEl.textContent = `${prediction.putProb}%`;
            if (callBarEl) callBarEl.style.width = `${prediction.callProb}%`;
            if (putBarEl) putBarEl.style.width = `${prediction.putProb}%`;
        });
        
        // Update manual trade button probabilities
        const callBtnProb = document.getElementById('callBtnProb');
        const putBtnProb = document.getElementById('putBtnProb');
        if (callBtnProb) callBtnProb.textContent = `${prediction.callProb}%`;
        if (putBtnProb) putBtnProb.textContent = `${prediction.putProb}%`;
    }
    
    updateAnalyticsDisplay(patterns, signals) {
        // Update patterns tab
        const trendDirection = document.getElementById('trendDirection');
        const volatilityLevel = document.getElementById('volatilityLevel');
        const patternStrength = document.getElementById('patternStrength');
        
        if (trendDirection) trendDirection.textContent = this.calculateTrendDirection();
        if (volatilityLevel) volatilityLevel.textContent = this.getVolatilityLevel();
        if (patternStrength) patternStrength.style.width = `${patterns.strength * 100}%`;
        
        // Update sentiment tab
        const bullishSentiment = document.getElementById('bullishSentiment');
        const bearishSentiment = document.getElementById('bearishSentiment');
        const neutralSentiment = document.getElementById('neutralSentiment');
        
        if (bullishSentiment) bullishSentiment.textContent = `${Math.round(this.marketSentiment.bullish * 100)}%`;
        if (bearishSentiment) bearishSentiment.textContent = `${Math.round(this.marketSentiment.bearish * 100)}%`;
        if (neutralSentiment) neutralSentiment.textContent = `${Math.round(this.marketSentiment.neutral * 100)}%`;
        
        // Update signals tab
        const overallSignal = (signals.callSignal + signals.putSignal + patterns.strength) / 3 * 100;
        const signalMeter = document.getElementById('signalMeter');
        const signalStrengthValue = document.getElementById('signalStrengthValue');
        
        if (signalMeter) {
            signalMeter.style.background = `conic-gradient(
                var(--success) 0deg,
                var(--success) ${overallSignal * 3.6}deg,
                var(--card-bg) ${overallSignal * 3.6}deg,
                var(--card-bg) 360deg
            )`;
        }
        if (signalStrengthValue) signalStrengthValue.textContent = `${Math.round(overallSignal)}%`;
        
        // Update indicators
        this.updateIndicator('trendIndicator', signals.trendStrength > 0.5);
        this.updateIndicator('momentumIndicator', signals.momentum > 0.5);
        this.updateIndicator('volumeIndicator', this.volatilityIndex > 50);
    }
    
    updateMarketAnalysis(signals) {
        const volatilityIndexEl = document.getElementById('volatilityIndex');
        const trendStrengthValueEl = document.getElementById('trendStrengthValue');
        const supportLevelEl = document.getElementById('supportLevel');
        const resistanceLevelEl = document.getElementById('resistanceLevel');
        
        if (volatilityIndexEl) volatilityIndexEl.textContent = `${Math.round(this.volatilityIndex)}%`;
        if (trendStrengthValueEl) trendStrengthValueEl.textContent = `${Math.round(signals.trendStrength * 100)}%`;
        if (supportLevelEl) supportLevelEl.textContent = signals.supportLevel || '-';
        if (resistanceLevelEl) resistanceLevelEl.textContent = signals.resistanceLevel || '-';
    }
    
    updateIndicator(id, active) {
        const indicator = document.getElementById(id);
        if (indicator) {
            if (active) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    }
    
    calculateTrendDirection() {
        if (this.recentDigits.length < 10) return 'Insufficient Data';
        
        const recent10 = this.recentDigits.slice(0, 10);
        const avg = recent10.reduce((a, b) => a + b, 0) / 10;
        
        if (avg > 5.5) return 'Bullish';
        if (avg < 3.5) return 'Bearish';
        return 'Neutral';
    }
    
    getVolatilityLevel() {
        if (this.volatilityIndex > 80) return 'Very High';
        if (this.volatilityIndex > 60) return 'High';
        if (this.volatilityIndex > 40) return 'Medium';
        if (this.volatilityIndex > 20) return 'Low';
        return 'Very Low';
    }
    
    updateStats() {
        // Header stats
        const totalProfitEl = document.getElementById('totalProfit');
        const winStreakDisplayEl = document.getElementById('winStreakDisplay');
        const aiAccuracyHeaderEl = document.getElementById('aiAccuracyHeader');
        
        if (totalProfitEl) totalProfitEl.textContent = `$${this.stats.totalProfit.toFixed(2)}`;
        if (winStreakDisplayEl) winStreakDisplayEl.textContent = this.stats.winStreak;
        if (aiAccuracyHeaderEl) aiAccuracyHeaderEl.textContent = `${this.stats.aiAccuracy}%`;
        
        // Balance
        const currentBalanceEl = document.getElementById('currentBalance');
        if (currentBalanceEl) currentBalanceEl.textContent = `$${this.currentBalance.toFixed(2)}`;
        
        // Stats grid
        const todayProfitStatEl = document.getElementById('todayProfitStat');
        const totalTradesStatEl = document.getElementById('totalTradesStat');
        const winRateStatEl = document.getElementById('winRateStat');
        const currentStreakEl = document.getElementById('currentStreak');
        
        if (todayProfitStatEl) todayProfitStatEl.textContent = `$${this.stats.todayProfit.toFixed(2)}`;
        if (totalTradesStatEl) totalTradesStatEl.textContent = this.stats.totalTrades;
        if (currentStreakEl) currentStreakEl.textContent = this.stats.winStreak;
        
        const winRate = this.stats.totalTrades > 0 ? 
            Math.round((this.stats.winningTrades / this.stats.totalTrades) * 100) : 0;
        if (winRateStatEl) winRateStatEl.textContent = `${winRate}%`;
        
        // AI Performance Metrics
        const aiWinRateEl = document.getElementById('aiWinRate');
        const aiTotalTradesEl = document.getElementById('aiTotalTrades');
        const aiProfitEl = document.getElementById('aiProfit');
        
        const aiWinRate = this.stats.aiTrades > 0 ? 
            Math.round((this.stats.aiWins / this.stats.aiTrades) * 100) : 0;
        
        if (aiWinRateEl) aiWinRateEl.textContent = `${aiWinRate}%`;
        if (aiTotalTradesEl) aiTotalTradesEl.textContent = this.stats.aiTrades;
        if (aiProfitEl) aiProfitEl.textContent = `$${this.stats.aiProfit.toFixed(2)}`;
        
        // Summary stats
        const summaryElements = {
            summaryTotalTrades: this.stats.totalTrades,
            summaryWinningTrades: this.stats.winningTrades,
            summaryLosingTrades: this.stats.losingTrades,
            summaryWinRate: `${winRate}%`,
            summaryTotalProfit: `$${this.stats.totalProfit.toFixed(2)}`,
            summaryBestStreak: this.stats.maxWinStreak
        };
        
        Object.entries(summaryElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateMarketInfo() {
        const tickCount = this.tickHistory.length;
        const tickCountEl = document.getElementById('tickCount');
        if (tickCountEl) tickCountEl.textContent = tickCount;
        
        // Update session uptime
        const uptime = Date.now() - this.sessionStartTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        const sessionUptimeEl = document.getElementById('sessionUptime');
        if (sessionUptimeEl) {
            sessionUptimeEl.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    renderTradeHistory() {
        const container = document.getElementById('tradeHistoryList');
        if (!container) return;
        
        if (this.tradeHistory.length === 0) {
            container.innerHTML = `
                <div class="no-trades">
                    <i class="fas fa-chart-line"></i>
                    <p>No trades yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.tradeHistory.slice(0, 50).map(trade => `
            <div class="trade-item ${trade.status}">
                <div class="trade-icon ${trade.direction}">
                    <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
                </div>
                <div class="trade-info">
                    <div class="trade-type">${trade.type} ${trade.direction.toUpperCase()}</div>
                    <div class="trade-time">${trade.time}</div>
                </div>
                <div class="trade-result">
                    <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                    <div class="trade-profit ${trade.status === 'win' ? 'positive' : trade.status === 'loss' ? 'negative' : 'pending'}">
                        ${trade.status === 'open' ? 'OPEN' : 
                          trade.status === 'win' ? `+$${trade.profit.toFixed(2)}` : 
                          trade.status === 'loss' ? `$${trade.profit.toFixed(2)}` : 'PENDING'}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    renderLiveTrades() {
        const container = document.getElementById('liveTradesList');
        if (!container) return;
        
        if (this.liveTradesList.length === 0) {
            container.innerHTML = `
                <div class="no-trades">
                    <i class="fas fa-chart-line"></i>
                    <p>No active trades</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.liveTradesList.map(trade => `
            <div class="trade-item ${trade.status}">
                <div class="trade-icon ${trade.direction}">
                    <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
                </div>
                <div class="trade-info">
                    <div class="trade-type">${trade.type} ${trade.direction.toUpperCase()}</div>
                    <div class="trade-time">${trade.time}</div>
                </div>
                <div class="trade-result">
                    <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                    <div class="trade-profit pending">LIVE</div>
                </div>
            </div>
        `).join('');
    }
    
    renderAIActivityLog() {
        const container = document.getElementById('aiActivityLog');
        if (!container) return;
        
        if (this.aiActivityLog.length === 0) {
            container.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-robot"></i>
                    <p>AI system ready</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.aiActivityLog.slice(0, 20).map(activity => `
            <div class="activity-item">
                <span>${activity.message}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');
    }
    
    addAIActivity(message) {
        const activity = {
            message,
            time: new Date().toLocaleTimeString()
        };
        
        this.aiActivityLog.unshift(activity);
        if (this.aiActivityLog.length > 50) {
            this.aiActivityLog.pop();
        }
        
        this.renderAIActivityLog();
    }
    
    startPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Simple performance chart implementation
        setInterval(() => {
            if (!this.isConnected) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'var(--brand-primary)';
            ctx.lineWidth = 2;
            
            const data = this.tradeHistory.slice(0, 20).reverse();
            if (data.length < 2) return;
            
            ctx.beginPath();
            let runningProfit = 0;
            data.forEach((trade, index) => {
                if (trade.profit !== undefined) {
                    runningProfit += trade.profit;
                }
                const x = (index / (data.length - 1)) * canvas.width;
                const y = canvas.height - ((runningProfit + 50) / 100) * canvas.height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        }, 5000);
    }
    
    startMarketClock() {
        setInterval(() => {
            const now = new Date();
            const serverTimeEl = document.getElementById('serverTime');
            if (serverTimeEl) serverTimeEl.textContent = now.toLocaleTimeString();
            this.updateMarketInfo();
        }, 1000);
        
        // Reset hourly trade counter
        setInterval(() => {
            this.tradesThisHour = 0;
        }, 3600000);
    }
    
    showAlert(message, type = 'info') {
        const alertSystem = document.getElementById('alertSystem');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        alertSystem.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    showLoadingOverlay(text) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = overlay.querySelector('.loading-text');
        loadingText.textContent = text;
        overlay.style.display = 'flex';
    }
    
    hideLoadingOverlay() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// Advanced Pattern Recognition System
class PatternRecognizer {
    analyze(digits) {
        if (digits.length < 10) return { strength: 0, direction: 'neutral', strongPattern: false };
        
        const patterns = [
            this.detectConsecutivePattern(digits),
            this.detectAlternatingPattern(digits),
            this.detectFibonacciPattern(digits),
            this.detectMeanReversionPattern(digits)
        ];
        
        const strongestPattern = patterns.reduce((max, pattern) => 
            pattern.strength > max.strength ? pattern : max
        );
        
        return {
            ...strongestPattern,
            strongPattern: strongestPattern.strength > 0.6
        };
    }
    
    detectConsecutivePattern(digits) {
        const recent10 = digits.slice(0, 10);
        const consecutiveHigh = this.countConsecutive(recent10, d => d > 5);
        const consecutiveLow = this.countConsecutive(recent10, d => d < 5);
        
        if (consecutiveHigh >= 4) {
            return { strength: Math.min(consecutiveHigh / 6, 1), direction: 'put' };
        }
        if (consecutiveLow >= 4) {
            return { strength: Math.min(consecutiveLow / 6, 1), direction: 'call' };
        }
        
        return { strength: 0, direction: 'neutral' };
    }
    
    detectAlternatingPattern(digits) {
        const recent8 = digits.slice(0, 8);
        let alternations = 0;
        
        for (let i = 1; i < recent8.length; i++) {
            if ((recent8[i] > 5 && recent8[i-1] < 5) || (recent8[i] < 5 && recent8[i-1] > 5)) {
                alternations++;
            }
        }
        
        const strength = alternations / (recent8.length - 1);
        if (strength > 0.7) {
            const lastDigit = recent8[0];
            return { 
                strength: strength * 0.8, 
                direction: lastDigit > 5 ? 'put' : 'call' 
            };
        }
        
        return { strength: 0, direction: 'neutral' };
    }
    
    detectFibonacciPattern(digits) {
        const recent5 = digits.slice(0, 5);
        const fibSequence = [1, 1, 2, 3, 5, 8];
        
        let matches = 0;
        for (let i = 0; i < recent5.length; i++) {
            if (fibSequence.includes(recent5[i])) {
                matches++;
            }
        }
        
        const strength = matches / recent5.length;
        if (strength > 0.6) {
            const trend = recent5[0] > recent5[recent5.length - 1] ? 'put' : 'call';
            return { strength: strength * 0.7, direction: trend };
        }
        
        return { strength: 0, direction: 'neutral' };
    }
    
    detectMeanReversionPattern(digits) {
        const recent15 = digits.slice(0, 15);
        const mean = recent15.reduce((a, b) => a + b, 0) / recent15.length;
        const recent3 = digits.slice(0, 3);
        
        const avgRecent3 = recent3.reduce((a, b) => a + b, 0) / 3;
        const deviation = Math.abs(avgRecent3 - mean);
        
        if (deviation > 2) {
            const strength = Math.min(deviation / 4, 1);
            const direction = avgRecent3 > mean ? 'put' : 'call';
            return { strength: strength * 0.6, direction };
        }
        
        return { strength: 0, direction: 'neutral' };
    }
    
    countConsecutive(array, condition) {
        let count = 0;
        for (let i = 0; i < array.length; i++) {
            if (condition(array[i])) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }
}

// Risk Management System
class RiskManager {
    checkLimits(todayProfit, config) {
        if (Math.abs(todayProfit) >= config.maxDailyLoss && todayProfit < 0) {
            zeus.showAlert('⚠️ Daily loss limit reached! Auto trading disabled.', 'warning');
            zeus.aiEnabled = false;
            document.getElementById('aiTradeToggle').checked = false;
            zeus.updateAIStatus();
            zeus.addAIActivity('Daily loss limit reached - Auto trading disabled');
        }
        
        if (todayProfit >= config.takeProfitTarget) {
            zeus.showAlert('🎯 Take profit target reached! Consider stopping for today.', 'success');
            zeus.addAIActivity('Take profit target reached');
        }
    }
}

// Signal Processing System
class SignalProcessor {
    process(tickHistory, recentDigits) {
        if (tickHistory.length < 20) {
            return { 
                callSignal: 0, 
                putSignal: 0, 
                trendStrength: 0, 
                momentum: 0,
                supportLevel: 0,
                resistanceLevel: 9
            };
        }
        
        const trendStrength = this.calculateTrendStrength(recentDigits);
        const momentum = this.calculateMomentum(tickHistory);
        const support = this.findSupportLevel(recentDigits);
        const resistance = this.findResistanceLevel(recentDigits);
        
        let callSignal = 0;
        let putSignal = 0;
        
        // Trend-based signals
        if (trendStrength > 0.6) {
            const recentAvg = recentDigits.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
            if (recentAvg > 5) {
                putSignal += 0.3;
            } else {
                callSignal += 0.3;
            }
        }
        
        // Momentum-based signals
        if (momentum > 0.5) {
            const currentDigit = recentDigits[0];
            if (currentDigit > 5) {
                putSignal += 0.2;
            } else {
                callSignal += 0.2;
            }
        }
        
        // Support/Resistance signals
        const currentDigit = recentDigits[0];
        if (currentDigit <= support) {
            callSignal += 0.4;
        }
        if (currentDigit >= resistance) {
            putSignal += 0.4;
        }
        
        return {
            callSignal: Math.min(callSignal, 1),
            putSignal: Math.min(putSignal, 1),
            trendStrength,
            momentum,
            supportLevel: support,
            resistanceLevel: resistance
        };
    }
    
    calculateTrendStrength(digits) {
        if (digits.length < 10) return 0;
        
        const recent10 = digits.slice(0, 10);
        const first5 = recent10.slice(0, 5);
        const last5 = recent10.slice(5, 10);
        
        const avg1 = first5.reduce((a, b) => a + b, 0) / 5;
        const avg2 = last5.reduce((a, b) => a + b, 0) / 5;
        
        return Math.abs(avg1 - avg2) / 9;
    }
    
    calculateMomentum(tickHistory) {
        if (tickHistory.length < 10) return 0;
        
        const recent10 = tickHistory.slice(-10);
        let momentum = 0;
        
        for (let i = 1; i < recent10.length; i++) {
            const change = recent10[i].quote - recent10[i-1].quote;
            momentum += Math.abs(change);
        }
        
        return Math.min(momentum / 10, 1);
    }
    
    findSupportLevel(digits) {
        const recent20 = digits.slice(0, 20);
        const digitCounts = {};
        
        recent20.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
        });
        
        let maxCount = 0;
        let supportLevel = 0;
        
        for (let digit = 0; digit <= 4; digit++) {
            if (digitCounts[digit] > maxCount) {
                maxCount = digitCounts[digit];
                supportLevel = digit;
            }
        }
        
        return supportLevel;
    }
    
    findResistanceLevel(digits) {
        const recent20 = digits.slice(0, 20);
        const digitCounts = {};
        
        recent20.forEach(digit => {
            digitCounts[digit] = (digitCounts[digit] || 0) + 1;
        });
        
        let maxCount = 0;
        let resistanceLevel = 9;
        
        for (let digit = 5; digit <= 9; digit++) {
            if (digitCounts[digit] > maxCount) {
                maxCount = digitCounts[digit];
                resistanceLevel = digit;
            }
        }
        
        return resistanceLevel;
    }
}

// Global functions for HTML event handlers
function connect() {
    zeus.connect();
}

function disconnect() {
    zeus.disconnect();
}

function toggleAITrade() {
    zeus.toggleAITrade();
}

function placeManualTrade(direction) {
    const amount = parseFloat(document.getElementById('manualTradeAmount').value);
    const duration = parseInt(document.getElementById('manualTradeDuration').value);
    zeus.placeTrade(direction, amount, duration);
}

function setManualQuickAmount(amount) {
    document.getElementById('manualTradeAmount').value = amount;
    zeus.manualTradeAmount = amount;
}

function switchMainTab(tabName) {
    // Remove active class from all nav tabs and tab contents
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function switchAnalyticsTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
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

function updateConfidenceDisplay() {
    const slider = document.getElementById('minConfidence');
    const display = document.getElementById('confidenceValue');
    display.textContent = slider.value + '%';
}

function filterHistory(filter) {
    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Filter and render history based on selection
    let filteredHistory = zeus.tradeHistory;
    
    switch (filter) {
        case 'wins':
            filteredHistory = zeus.tradeHistory.filter(trade => trade.status === 'win');
            break;
        case 'losses':
            filteredHistory = zeus.tradeHistory.filter(trade => trade.status === 'loss');
            break;
        case 'ai':
            filteredHistory = zeus.tradeHistory.filter(trade => trade.type === 'AI');
            break;
        case 'manual':
            filteredHistory = zeus.tradeHistory.filter(trade => trade.type === 'Manual');
            break;
    }
    
    // Render filtered history
    const container = document.getElementById('tradeHistoryList');
    if (filteredHistory.length === 0) {
        container.innerHTML = `
            <div class="no-trades">
                <i class="fas fa-chart-line"></i>
                <p>No ${filter} trades found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredHistory.slice(0, 50).map(trade => `
        <div class="trade-item ${trade.status}">
            <div class="trade-icon ${trade.direction}">
                <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
            </div>
            <div class="trade-info">
                <div class="trade-type">${trade.type} ${trade.direction.toUpperCase()}</div>
                <div class="trade-time">${trade.time}</div>
            </div>
            <div class="trade-result">
                <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                <div class="trade-profit ${trade.status === 'win' ? 'positive' : trade.status === 'loss' ? 'negative' : 'pending'}">
                    ${trade.status === 'open' ? 'OPEN' : 
                      trade.status === 'win' ? `+$${trade.profit.toFixed(2)}` : 
                      trade.status === 'loss' ? `$${trade.profit.toFixed(2)}` : 'PENDING'}
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all trade history?')) {
        zeus.tradeHistory = [];
        zeus.renderTradeHistory();
        zeus.showAlert('Trade history cleared', 'info');
    }
}

function exportHistory() {
    if (zeus.tradeHistory.length === 0) {
        zeus.showAlert('No trade history to export', 'warning');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Type,Direction,Amount,Time,Status,Profit,Market,Confidence\n" +
        zeus.tradeHistory.map(trade => 
            `${trade.type},${trade.direction},${trade.amount},${trade.time},${trade.status},${trade.profit || 0},${trade.market},${trade.confidence || 0}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zeus_trade_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    zeus.showAlert('Trade history exported successfully', 'success');
}

// Initialize Zeus AI System
const zeus = new ZeusAI();

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Zeus Ultimate AI Trading System Initialized');
    zeus.showAlert('🚀 Zeus Ultimate AI System Ready!', 'info');
});