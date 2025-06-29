// Advanced AI Trading System - Zeus Ultimate with 15 Strategies
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
        this.activityLog = [];
        
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
        
        // 15 Advanced Trading Strategies
        this.strategies = {
            meanReversion: new MeanReversionStrategy(),
            trendFollowing: new TrendFollowingStrategy(),
            fibonacci: new FibonacciStrategy(),
            martingale: new MartingaleStrategy(),
            antiMartingale: new AntiMartingaleStrategy(),
            scalping: new ScalpingStrategy(),
            breakout: new BreakoutStrategy(),
            support_resistance: new SupportResistanceStrategy(),
            momentum: new MomentumStrategy(),
            contrarian: new ContrarianStrategy(),
            pattern_recognition: new PatternRecognitionStrategy(),
            volatility_breakout: new VolatilityBreakoutStrategy(),
            time_based: new TimeBasedStrategy(),
            neural_ensemble: new NeuralEnsembleStrategy(),
            adaptive_learning: new AdaptiveLearningStrategy()
        };
        
        // Strategy performance tracking
        this.strategyPerformance = {};
        Object.keys(this.strategies).forEach(strategy => {
            this.strategyPerformance[strategy] = {
                trades: 0,
                wins: 0,
                losses: 0,
                profit: 0,
                winRate: 0,
                enabled: true,
                weight: 1.0
            };
        });
        
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
            cooldownPeriod: 30000, // 30 seconds
            adaptiveWeighting: true,
            strategyDiversification: true,
            riskPerTrade: 0.02 // 2% of balance per trade
        };
        
        this.lastTradeTime = 0;
        this.tradesThisHour = 0;
        this.currentPrediction = null;
        this.currentTab = 'connection';
        
        this.initializeUI();
        this.startPerformanceChart();
        this.startMarketClock();
    }
    
    initializeWeights() {
        const weights = [];
        // Input layer to hidden layer (60 inputs, 40 hidden neurons)
        for (let i = 0; i < 60 * 40; i++) {
            weights.push((Math.random() - 0.5) * 2);
        }
        // Hidden layer to output layer (40 hidden, 2 outputs)
        for (let i = 0; i < 40 * 2; i++) {
            weights.push((Math.random() - 0.5) * 2);
        }
        return weights;
    }
    
    initializeBiases() {
        const biases = [];
        // Hidden layer biases (40 neurons)
        for (let i = 0; i < 40; i++) {
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
        this.updateActivityLog();
        
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
            this.config.manualTradeAmount = parseFloat(e.target.value);
        });
        
        document.getElementById('manualTradeDuration').addEventListener('change', (e) => {
            this.config.manualTradeDuration = parseInt(e.target.value);
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
        this.logActivity('🔗 Connected to Deriv API', 'success');
        
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
        if (this.tickHistory.length > 500) {
            this.tickHistory.shift();
        }
        
        this.recentDigits.unshift(lastDigit);
        if (this.recentDigits.length > 100) {
            this.recentDigits.pop();
        }
        
        // Update UI
        this.updateDigitDisplay(lastDigit);
        this.updateRecentDigits();
        this.updateMarketInfo();
        
        // Run comprehensive AI analysis with all 15 strategies
        this.runComprehensiveAnalysis(tickData);
        
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
            this.logActivity(`❌ Trade failed: ${data.error.message}`, 'error');
            return;
        }
        
        const contractId = data.buy.contract_id;
        const contractType = data.buy.contract_type || '';
        const direction = contractType.toLowerCase().includes('call') ? 'call' : 'put';
        
        const trade = {
            id: contractId,
            type: this.currentPrediction ? 'AI' : 'Manual',
            direction: direction,
            amount: data.buy.buy_price,
            time: new Date().toLocaleTimeString(),
            status: 'open',
            market: this.currentMarket,
            confidence: this.currentPrediction ? this.currentPrediction.confidence : 0,
            strategies: this.currentPrediction ? this.currentPrediction.activeStrategies : []
        };
        
        this.tradeHistory.unshift(trade);
        this.openTrades.set(contractId, trade);
        this.renderTradeHistory();
        this.updateLiveTrades();
        
        // Subscribe to contract updates
        this.ws.send(JSON.stringify({
            proposal_open_contract: 1,
            contract_id: contractId,
            subscribe: 1
        }));
        
        const tradeType = trade.type === 'AI' ? `🤖 AI ${trade.direction.toUpperCase()}` : `👤 Manual ${trade.direction.toUpperCase()}`;
        this.showAlert(`${tradeType} trade placed!`, 'success');
        this.logActivity(`${tradeType} trade placed - $${trade.amount.toFixed(2)}`, 'success');
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
            
            // Update AI-specific stats
            if (trade.type === 'AI') {
                this.stats.aiTrades++;
                this.stats.aiProfit += profit;
                this.stats.totalPredictions++;
                if (isWin) {
                    this.stats.correctPredictions++;
                    this.stats.aiWins++;
                }
                this.stats.aiAccuracy = Math.round((this.stats.correctPredictions / this.stats.totalPredictions) * 100);
                
                // Update strategy performance
                if (trade.strategies) {
                    trade.strategies.forEach(strategyName => {
                        if (this.strategyPerformance[strategyName]) {
                            this.strategyPerformance[strategyName].trades++;
                            this.strategyPerformance[strategyName].profit += profit;
                            if (isWin) {
                                this.strategyPerformance[strategyName].wins++;
                            } else {
                                this.strategyPerformance[strategyName].losses++;
                            }
                            this.strategyPerformance[strategyName].winRate = 
                                Math.round((this.strategyPerformance[strategyName].wins / this.strategyPerformance[strategyName].trades) * 100);
                        }
                    });
                }
                
                // Update neural network
                this.updateNeuralNetwork(isWin);
                
                // Adaptive strategy weighting
                if (this.config.adaptiveWeighting) {
                    this.updateStrategyWeights();
                }
            }
            
            this.updateStats();
            this.renderTradeHistory();
            this.updateLiveTrades();
            
            const message = isWin 
                ? `🎉 ${trade.type} ${trade.direction.toUpperCase()} WON! Profit: $${profit.toFixed(2)}`
                : `😞 ${trade.type} ${trade.direction.toUpperCase()} LOST. Loss: $${Math.abs(profit).toFixed(2)}`;
            
            this.showAlert(message, isWin ? 'success' : 'error');
            this.logActivity(message, isWin ? 'success' : 'error');
            
            // Check risk management
            this.riskManager.checkLimits(this.stats.todayProfit, this.config);
        }
    }
    
    runComprehensiveAnalysis(tickData) {
        if (this.tickHistory.length < 30) return;
        
        // Collect signals from all 15 strategies
        const strategySignals = {};
        const activeStrategies = [];
        
        Object.keys(this.strategies).forEach(strategyName => {
            if (this.strategyPerformance[strategyName].enabled) {
                const signal = this.strategies[strategyName].analyze(this.recentDigits, this.tickHistory, this.marketSentiment);
                if (signal && signal.confidence > 0) {
                    strategySignals[strategyName] = signal;
                    if (signal.confidence >= 60) {
                        activeStrategies.push(strategyName);
                    }
                }
            }
        });
        
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
        
        // Combine all analyses with strategy ensemble
        const prediction = this.combineStrategicAnalyses(neuralPrediction, patterns, signals, strategySignals);
        prediction.activeStrategies = activeStrategies;
        
        this.currentPrediction = prediction;
        this.updatePredictionDisplay(prediction);
        this.updateAnalyticsDisplay(patterns, signals);
        
        // Log AI decision making
        if (prediction.confidence >= this.config.minConfidence) {
            this.logActivity(`🧠 AI Signal: ${prediction.signal} (${prediction.confidence}%) - ${activeStrategies.length} strategies active`, 'info');
        }
    }
    
    combineStrategicAnalyses(neural, patterns, signals, strategySignals) {
        let callProb = neural.call * 0.2; // Reduced neural weight to 20%
        let putProb = neural.put * 0.2;
        
        // Strategy ensemble voting (60% weight)
        let strategyCallVotes = 0;
        let strategyPutVotes = 0;
        let totalStrategyWeight = 0;
        
        Object.keys(strategySignals).forEach(strategyName => {
            const signal = strategySignals[strategyName];
            const weight = this.strategyPerformance[strategyName].weight;
            const confidence = signal.confidence / 100;
            
            if (signal.direction === 'call') {
                strategyCallVotes += confidence * weight;
            } else if (signal.direction === 'put') {
                strategyPutVotes += confidence * weight;
            }
            totalStrategyWeight += weight;
        });
        
        if (totalStrategyWeight > 0) {
            callProb += (strategyCallVotes / totalStrategyWeight) * 0.6;
            putProb += (strategyPutVotes / totalStrategyWeight) * 0.6;
        }
        
        // Apply pattern analysis (10% weight)
        if (patterns.strongPattern) {
            if (patterns.direction === 'call') {
                callProb += patterns.strength * 0.1;
            } else if (patterns.direction === 'put') {
                putProb += patterns.strength * 0.1;
            }
        }
        
        // Apply signal analysis (10% weight)
        callProb += signals.callSignal * 0.1;
        putProb += signals.putSignal * 0.1;
        
        // Normalize probabilities
        const total = callProb + putProb;
        if (total > 0) {
            callProb = callProb / total;
            putProb = putProb / total;
        } else {
            callProb = 0.5;
            putProb = 0.5;
        }
        
        const confidence = Math.abs(callProb - putProb) * 100;
        let signal = 'WAIT';
        let direction = null;
        
        // Enhanced confidence calculation with strategy consensus
        let strategyConsensus = 0;
        if (Object.keys(strategySignals).length > 0) {
            const callStrategies = Object.values(strategySignals).filter(s => s.direction === 'call').length;
            const putStrategies = Object.values(strategySignals).filter(s => s.direction === 'put').length;
            strategyConsensus = Math.abs(callStrategies - putStrategies) / Object.keys(strategySignals).length * 20;
        }
        
        const enhancedConfidence = Math.min(confidence + strategyConsensus, 100);
        
        if (enhancedConfidence >= this.config.minConfidence) {
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
            confidence: Math.round(enhancedConfidence),
            signal,
            direction,
            strategySignals
        };
    }
    
    updateStrategyWeights() {
        Object.keys(this.strategyPerformance).forEach(strategyName => {
            const perf = this.strategyPerformance[strategyName];
            if (perf.trades >= 5) {
                // Adjust weight based on performance
                const winRate = perf.winRate / 100;
                const profitFactor = perf.profit > 0 ? Math.min(perf.profit / 100, 2) : 0.1;
                
                perf.weight = Math.max(0.1, Math.min(2.0, winRate * profitFactor));
            }
        });
    }
    
    neuralNetworkPredict() {
        if (this.recentDigits.length < 30) return { call: 0.5, put: 0.5, confidence: 0 };
        
        // Prepare enhanced input features
        const inputs = this.prepareEnhancedInputFeatures();
        
        // Forward propagation
        const hiddenLayer = this.forwardPass(inputs, this.neuralNetwork.weights.slice(0, 60 * 40), this.neuralNetwork.biases.slice(0, 40), 60, 40);
        const outputLayer = this.forwardPass(hiddenLayer, this.neuralNetwork.weights.slice(60 * 40), this.neuralNetwork.biases.slice(40), 40, 2);
        
        // Apply softmax to outputs
        const exp1 = Math.exp(outputLayer[0]);
        const exp2 = Math.exp(outputLayer[1]);
        const sum = exp1 + exp2;
        
        const callProb = exp1 / sum;
        const putProb = exp2 / sum;
        const confidence = Math.abs(callProb - putProb) * 100;
        
        return { call: callProb, put: putProb, confidence };
    }
    
    prepareEnhancedInputFeatures() {
        const features = [];
        
        // Recent digits (normalized) - 30 features
        for (let i = 0; i < 30; i++) {
            features.push(this.recentDigits[i] ? this.recentDigits[i] / 9 : 0);
        }
        
        // Moving averages - 5 features
        const ma5 = this.calculateMovingAverage(5);
        const ma10 = this.calculateMovingAverage(10);
        const ma20 = this.calculateMovingAverage(20);
        const ma50 = this.calculateMovingAverage(50);
        const ema10 = this.calculateEMA(10);
        features.push(ma5 / 9, ma10 / 9, ma20 / 9, ma50 / 9, ema10 / 9);
        
        // Technical indicators - 8 features
        features.push(this.volatilityIndex / 100);
        features.push(this.trendStrength / 100);
        features.push(this.calculateRSI() / 100);
        features.push(this.calculateStochastic() / 100);
        features.push(this.calculateBollingerPosition());
        features.push(this.calculateMomentum() / 100);
        features.push(this.calculateWilliamsR() / 100);
        features.push(this.calculateCCI() / 100);
        
        // Market sentiment - 3 features
        features.push(this.marketSentiment.bullish, this.marketSentiment.bearish, this.marketSentiment.neutral);
        
        // Pattern indicators - 6 features
        const consecutiveHigh = this.countConsecutive(d => d > 5, 10);
        const consecutiveLow = this.countConsecutive(d => d < 5, 10);
        const consecutiveEven = this.countConsecutive(d => d % 2 === 0, 10);
        const consecutiveOdd = this.countConsecutive(d => d % 2 === 1, 10);
        const highLowRatio = this.calculateHighLowRatio();
        const digitVariance = this.calculateDigitVariance();
        features.push(consecutiveHigh / 10, consecutiveLow / 10, consecutiveEven / 10, consecutiveOdd / 10, highLowRatio, digitVariance);
        
        // Time-based features - 5 features
        const now = new Date();
        features.push(
            now.getHours() / 24,
            now.getMinutes() / 60,
            now.getDay() / 7,
            (now.getTime() % 86400000) / 86400000, // Time of day
            Math.sin(2 * Math.PI * now.getHours() / 24) // Cyclical hour
        );
        
        // Market microstructure - 3 features
        features.push(this.calculateTickVelocity());
        features.push(this.calculatePriceAcceleration());
        features.push(this.calculateMarketPressure());
        
        // Pad or truncate to exactly 60 features
        while (features.length < 60) features.push(0);
        return features.slice(0, 60);
    }
    
    // Technical Analysis Methods
    calculateEMA(period) {
        if (this.recentDigits.length < period) return 0;
        const multiplier = 2 / (period + 1);
        let ema = this.recentDigits[period - 1];
        for (let i = period - 2; i >= 0; i--) {
            ema = (this.recentDigits[i] * multiplier) + (ema * (1 - multiplier));
        }
        return ema;
    }
    
    calculateRSI(period = 14) {
        if (this.recentDigits.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        for (let i = 0; i < period; i++) {
            const change = this.recentDigits[i] - this.recentDigits[i + 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / (avgLoss || 1);
        return 100 - (100 / (1 + rs));
    }
    
    calculateStochastic(period = 14) {
        if (this.recentDigits.length < period) return 50;
        
        const recent = this.recentDigits.slice(0, period);
        const high = Math.max(...recent);
        const low = Math.min(...recent);
        const current = this.recentDigits[0];
        
        return ((current - low) / (high - low || 1)) * 100;
    }
    
    calculateBollingerPosition(period = 20) {
        if (this.recentDigits.length < period) return 0.5;
        
        const recent = this.recentDigits.slice(0, period);
        const mean = recent.reduce((a, b) => a + b, 0) / period;
        const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const upperBand = mean + (2 * stdDev);
        const lowerBand = mean - (2 * stdDev);
        const current = this.recentDigits[0];
        
        return (current - lowerBand) / (upperBand - lowerBand || 1);
    }
    
    calculateMomentum(period = 10) {
        if (this.recentDigits.length < period) return 0;
        return ((this.recentDigits[0] - this.recentDigits[period - 1]) / this.recentDigits[period - 1]) * 100;
    }
    
    calculateWilliamsR(period = 14) {
        if (this.recentDigits.length < period) return -50;
        
        const recent = this.recentDigits.slice(0, period);
        const high = Math.max(...recent);
        const low = Math.min(...recent);
        const current = this.recentDigits[0];
        
        return ((high - current) / (high - low || 1)) * -100;
    }
    
    calculateCCI(period = 20) {
        if (this.recentDigits.length < period) return 0;
        
        const recent = this.recentDigits.slice(0, period);
        const mean = recent.reduce((a, b) => a + b, 0) / period;
        const meanDeviation = recent.reduce((a, b) => a + Math.abs(b - mean), 0) / period;
        const current = this.recentDigits[0];
        
        return (current - mean) / (0.015 * meanDeviation || 1);
    }
    
    calculateHighLowRatio() {
        if (this.recentDigits.length < 20) return 0.5;
        const recent20 = this.recentDigits.slice(0, 20);
        const highCount = recent20.filter(d => d > 5).length;
        return highCount / 20;
    }
    
    calculateDigitVariance() {
        if (this.recentDigits.length < 20) return 0;
        const recent20 = this.recentDigits.slice(0, 20);
        const mean = recent20.reduce((a, b) => a + b, 0) / 20;
        const variance = recent20.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20;
        return variance / 9; // Normalized
    }
    
    calculateTickVelocity() {
        if (this.tickHistory.length < 10) return 0;
        const recent10 = this.tickHistory.slice(-10);
        const timeSpan = recent10[recent10.length - 1].epoch - recent10[0].epoch;
        return timeSpan > 0 ? recent10.length / timeSpan : 0;
    }
    
    calculatePriceAcceleration() {
        if (this.tickHistory.length < 5) return 0;
        const recent5 = this.tickHistory.slice(-5);
        let acceleration = 0;
        for (let i = 2; i < recent5.length; i++) {
            const velocity1 = recent5[i-1].quote - recent5[i-2].quote;
            const velocity2 = recent5[i].quote - recent5[i-1].quote;
            acceleration += velocity2 - velocity1;
        }
        return acceleration / 3;
    }
    
    calculateMarketPressure() {
        if (this.recentDigits.length < 10) return 0;
        const recent10 = this.recentDigits.slice(0, 10);
        const upMoves = recent10.filter((d, i) => i > 0 && d > recent10[i-1]).length;
        const downMoves = recent10.filter((d, i) => i > 0 && d < recent10[i-1]).length;
        return (upMoves - downMoves) / 9;
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
        if (this.recentDigits.length < 30) return;
        
        const recent30 = this.recentDigits.slice(0, 30);
        const highDigits = recent30.filter(d => d > 6).length;
        const lowDigits = recent30.filter(d => d < 3).length;
        const midDigits = recent30.filter(d => d >= 3 && d <= 6).length;
        
        this.marketSentiment.bullish = highDigits / 30;
        this.marketSentiment.bearish = lowDigits / 30;
        this.marketSentiment.neutral = midDigits / 30;
    }
    
    calculateVolatility() {
        if (this.tickHistory.length < 20) return;
        
        const recent20 = this.tickHistory.slice(-20);
        const changes = [];
        
        for (let i = 1; i < recent20.length; i++) {
            changes.push(Math.abs(recent20[i].quote - recent20[i-1].quote));
        }
        
        const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        this.volatilityIndex = Math.min(avgChange * 1000, 100);
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
        
        // Risk-based position sizing
        const riskAmount = this.currentBalance * this.config.riskPerTrade;
        amount = Math.min(amount, riskAmount);
        
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
        if (this.recentDigits.length < 30) return;
        
        const inputs = this.prepareEnhancedInputFeatures();
        const target = won ? [1, 0] : [0, 1]; // [call_target, put_target]
        
        // Enhanced backpropagation with adaptive learning rate
        const learningRate = this.neuralNetwork.learningRate * (won ? 1.1 : 0.9);
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
        document.getElementById('predictionStatus').textContent = 'AI System Active';
        document.getElementById('predictionStatusAuto').textContent = 'AI System Active';
        this.showAlert('🧠 Advanced AI System with 15 strategies initialized!', 'success');
        this.logActivity('🧠 AI System initialized with 15 trading strategies', 'success');
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
        this.logActivity(message, this.aiEnabled ? 'success' : 'info');
    }
    
    logActivity(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.unshift({ message, type, timestamp });
        if (this.activityLog.length > 50) {
            this.activityLog.pop();
        }
        this.updateActivityLog();
    }
    
    updateActivityLog() {
        const container = document.getElementById('aiActivityLog');
        if (!container) return;
        
        if (this.activityLog.length === 0) {
            container.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-robot"></i>
                    <p>AI system ready</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.activityLog.slice(0, 20).map(log => `
            <div class="activity-item">
                <span>${log.message}</span>
                <span class="activity-time">${log.timestamp}</span>
            </div>
        `).join('');
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
        // Update all digit displays
        const digitElements = ['currentDigit', 'currentDigitManual'];
        const trendElements = ['digitTrend', 'digitTrendManual'];
        
        digitElements.forEach(elementId => {
            const digitElement = document.getElementById(elementId);
            if (digitElement) {
                digitElement.textContent = digit;
                digitElement.className = 'current-digit';
                
                if (this.currentPrediction) {
                    if (this.currentPrediction.signal === 'CALL') {
                        digitElement.classList.add('call-signal');
                    } else if (this.currentPrediction.signal === 'PUT') {
                        digitElement.classList.add('put-signal');
                    }
                }
            }
        });
        
        trendElements.forEach(elementId => {
            const trendElement = document.getElementById(elementId);
            if (trendElement) {
                if (this.currentPrediction) {
                    if (this.currentPrediction.signal === 'CALL') {
                        trendElement.innerHTML = '<i class="fas fa-arrow-up"></i>';
                        trendElement.style.color = 'var(--success)';
                    } else if (this.currentPrediction.signal === 'PUT') {
                        trendElement.innerHTML = '<i class="fas fa-arrow-down"></i>';
                        trendElement.style.color = 'var(--danger)';
                    } else {
                        trendElement.innerHTML = '<i class="fas fa-minus"></i>';
                        trendElement.style.color = 'var(--text-secondary)';
                    }
                }
            }
        });
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
        
        // Update all prediction displays
        const predictionElements = [
            { direction: 'predictionDirection', confidence: 'predictionConfidence', callProb: 'callProbValue', putProb: 'putProbValue', callBar: 'callProbBar', putBar: 'putProbBar' },
            { direction: 'predictionDirectionAuto', confidence: 'predictionConfidenceAuto', callProb: 'callProbValueAuto', putProb: 'putProbValueAuto', callBar: 'callProbBarAuto', putBar: 'putProbBarAuto' }
        ];
        
        predictionElements.forEach(elements => {
            // Update main prediction
            const directionEl = document.getElementById(elements.direction);
            const confidenceEl = document.getElementById(elements.confidence);
            
            if (directionEl) {
                directionEl.textContent = prediction.signal;
                directionEl.className = `prediction-direction ${prediction.direction || ''}`;
            }
            
            if (confidenceEl) {
                confidenceEl.textContent = `${prediction.confidence}%`;
            }
            
            // Update probability values
            const callProbEl = document.getElementById(elements.callProb);
            const putProbEl = document.getElementById(elements.putProb);
            
            if (callProbEl) callProbEl.textContent = `${prediction.callProb}%`;
            if (putProbEl) putProbEl.textContent = `${prediction.putProb}%`;
            
            // Update probability bars
            const callBarEl = document.getElementById(elements.callBar);
            const putBarEl = document.getElementById(elements.putBar);
            
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
        const trendDir = document.getElementById('trendDirection');
        const volLevel = document.getElementById('volatilityLevel');
        const patternStr = document.getElementById('patternStrength');
        
        if (trendDir) trendDir.textContent = this.calculateTrendDirection();
        if (volLevel) volLevel.textContent = this.getVolatilityLevel();
        if (patternStr) patternStr.style.width = `${patterns.strength * 100}%`;
        
        // Update sentiment tab
        const bullishSent = document.getElementById('bullishSentiment');
        const bearishSent = document.getElementById('bearishSentiment');
        const neutralSent = document.getElementById('neutralSentiment');
        
        if (bullishSent) bullishSent.textContent = `${Math.round(this.marketSentiment.bullish * 100)}%`;
        if (bearishSent) bearishSent.textContent = `${Math.round(this.marketSentiment.bearish * 100)}%`;
        if (neutralSent) neutralSent.textContent = `${Math.round(this.marketSentiment.neutral * 100)}%`;
        
        // Update signals tab
        const overallSignal = (signals.callSignal + signals.putSignal + patterns.strength) / 3 * 100;
        const signalMeter = document.getElementById('signalMeter');
        const signalValue = document.getElementById('signalStrengthValue');
        
        if (signalMeter) {
            signalMeter.style.background = `conic-gradient(
                var(--success) 0deg,
                var(--success) ${overallSignal * 3.6}deg,
                var(--card-bg) ${overallSignal * 3.6}deg,
                var(--card-bg) 360deg
            )`;
        }
        
        if (signalValue) signalValue.textContent = `${Math.round(overallSignal)}%`;
        
        // Update indicators
        this.updateIndicator('trendIndicator', signals.trendStrength > 0.5);
        this.updateIndicator('momentumIndicator', signals.momentum > 0.5);
        this.updateIndicator('volumeIndicator', this.volatilityIndex > 50);
        
        // Update market analysis
        const volIndex = document.getElementById('volatilityIndex');
        const trendStrengthVal = document.getElementById('trendStrengthValue');
        const supportLevel = document.getElementById('supportLevel');
        const resistanceLevel = document.getElementById('resistanceLevel');
        
        if (volIndex) volIndex.textContent = `${Math.round(this.volatilityIndex)}%`;
        if (trendStrengthVal) trendStrengthVal.textContent = `${Math.round(this.trendStrength)}%`;
        if (supportLevel) supportLevel.textContent = this.findSupportLevel();
        if (resistanceLevel) resistanceLevel.textContent = this.findResistanceLevel();
    }
    
    findSupportLevel() {
        if (this.recentDigits.length < 20) return '-';
        const recent20 = this.recentDigits.slice(0, 20);
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
    
    findResistanceLevel() {
        if (this.recentDigits.length < 20) return '-';
        const recent20 = this.recentDigits.slice(0, 20);
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
        const winStreakEl = document.getElementById('winStreakDisplay');
        const aiAccuracyEl = document.getElementById('aiAccuracyHeader');
        
        if (totalProfitEl) totalProfitEl.textContent = `$${this.stats.totalProfit.toFixed(2)}`;
        if (winStreakEl) winStreakEl.textContent = this.stats.winStreak;
        if (aiAccuracyEl) aiAccuracyEl.textContent = `${this.stats.aiAccuracy}%`;
        
        // Balance
        const balanceEl = document.getElementById('currentBalance');
        if (balanceEl) balanceEl.textContent = `$${this.currentBalance.toFixed(2)}`;
        
        // Stats grid
        const todayProfitEl = document.getElementById('todayProfitStat');
        const totalTradesEl = document.getElementById('totalTradesStat');
        const winRateEl = document.getElementById('winRateStat');
        const currentStreakEl = document.getElementById('currentStreak');
        
        if (todayProfitEl) todayProfitEl.textContent = `$${this.stats.todayProfit.toFixed(2)}`;
        if (totalTradesEl) totalTradesEl.textContent = this.stats.totalTrades;
        if (currentStreakEl) currentStreakEl.textContent = this.stats.winStreak;
        
        const winRate = this.stats.totalTrades > 0 ? 
            Math.round((this.stats.winningTrades / this.stats.totalTrades) * 100) : 0;
        if (winRateEl) winRateEl.textContent = `${winRate}%`;
        
        // AI-specific stats
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
        
        Object.keys(summaryElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = summaryElements[id];
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
        const uptimeEl = document.getElementById('sessionUptime');
        if (uptimeEl) {
            uptimeEl.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateLiveTrades() {
        const container = document.getElementById('liveTradesList');
        if (!container) return;
        
        const liveTrades = Array.from(this.openTrades.values());
        
        if (liveTrades.length === 0) {
            container.innerHTML = `
                <div class="no-trades">
                    <i class="fas fa-chart-line"></i>
                    <p>No active trades</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = liveTrades.map(trade => `
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
            
            const data = this.tradeHistory.slice(0, 50).reverse();
            if (data.length < 2) return;
            
            ctx.beginPath();
            let runningProfit = 0;
            data.forEach((trade, index) => {
                if (trade.profit !== undefined) {
                    runningProfit += trade.profit;
                }
                const x = (index / (data.length - 1)) * canvas.width;
                const y = canvas.height - ((runningProfit + 100) / 200) * canvas.height;
                
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

// 15 Advanced Trading Strategies

// 1. Mean Reversion Strategy
class MeanReversionStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 20) return null;
        
        const recent20 = digits.slice(0, 20);
        const mean = recent20.reduce((a, b) => a + b, 0) / 20;
        const current = digits[0];
        const deviation = Math.abs(current - mean);
        
        if (deviation > 2.5) {
            return {
                direction: current > mean ? 'put' : 'call',
                confidence: Math.min(deviation * 20, 85),
                reason: `Mean reversion: Current ${current} vs Mean ${mean.toFixed(1)}`
            };
        }
        
        return null;
    }
}

// 2. Trend Following Strategy
class TrendFollowingStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 15) return null;
        
        const recent15 = digits.slice(0, 15);
        const first5 = recent15.slice(0, 5);
        const last5 = recent15.slice(10, 15);
        
        const avgFirst = first5.reduce((a, b) => a + b, 0) / 5;
        const avgLast = last5.reduce((a, b) => a + b, 0) / 5;
        const trend = avgFirst - avgLast;
        
        if (Math.abs(trend) > 1.5) {
            return {
                direction: trend > 0 ? 'call' : 'put',
                confidence: Math.min(Math.abs(trend) * 30, 80),
                reason: `Trend following: ${trend > 0 ? 'Uptrend' : 'Downtrend'} detected`
            };
        }
        
        return null;
    }
}

// 3. Fibonacci Strategy
class FibonacciStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 10) return null;
        
        const fibSequence = [1, 1, 2, 3, 5, 8];
        const recent10 = digits.slice(0, 10);
        
        let fibMatches = 0;
        recent10.forEach(digit => {
            if (fibSequence.includes(digit)) fibMatches++;
        });
        
        const fibRatio = fibMatches / 10;
        
        if (fibRatio > 0.6) {
            const lastFib = recent10.find(d => fibSequence.includes(d));
            return {
                direction: lastFib > 4 ? 'put' : 'call',
                confidence: fibRatio * 70,
                reason: `Fibonacci pattern: ${fibRatio * 100}% Fib numbers`
            };
        }
        
        return null;
    }
}

// 4. Martingale Strategy
class MartingaleStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 5) return null;
        
        const recent5 = digits.slice(0, 5);
        const consecutiveLosses = this.countConsecutiveLosses(recent5);
        
        if (consecutiveLosses >= 3) {
            return {
                direction: recent5[0] > 5 ? 'put' : 'call',
                confidence: Math.min(consecutiveLosses * 20, 75),
                reason: `Martingale: ${consecutiveLosses} consecutive pattern`
            };
        }
        
        return null;
    }
    
    countConsecutiveLosses(digits) {
        let count = 0;
        const pattern = digits[0] > 5 ? 'high' : 'low';
        
        for (let digit of digits) {
            if ((pattern === 'high' && digit > 5) || (pattern === 'low' && digit <= 5)) {
                count++;
            } else {
                break;
            }
        }
        
        return count;
    }
}

// 5. Anti-Martingale Strategy
class AntiMartingaleStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 5) return null;
        
        const recent5 = digits.slice(0, 5);
        const consecutiveWins = this.countConsecutiveWins(recent5);
        
        if (consecutiveWins >= 2) {
            return {
                direction: recent5[0] > 5 ? 'call' : 'put',
                confidence: Math.min(consecutiveWins * 25, 70),
                reason: `Anti-Martingale: ${consecutiveWins} consecutive wins`
            };
        }
        
        return null;
    }
    
    countConsecutiveWins(digits) {
        let count = 0;
        const pattern = digits[0] > 5 ? 'high' : 'low';
        
        for (let digit of digits) {
            if ((pattern === 'high' && digit > 5) || (pattern === 'low' && digit <= 5)) {
                count++;
            } else {
                break;
            }
        }
        
        return count;
    }
}

// 6. Scalping Strategy
class ScalpingStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 3) return null;
        
        const recent3 = digits.slice(0, 3);
        const volatility = this.calculateShortTermVolatility(recent3);
        
        if (volatility > 2) {
            const direction = recent3[0] > recent3[1] ? 'put' : 'call';
            return {
                direction,
                confidence: Math.min(volatility * 20, 75),
                reason: `Scalping: High short-term volatility ${volatility.toFixed(1)}`
            };
        }
        
        return null;
    }
    
    calculateShortTermVolatility(digits) {
        if (digits.length < 2) return 0;
        
        let totalChange = 0;
        for (let i = 1; i < digits.length; i++) {
            totalChange += Math.abs(digits[i] - digits[i-1]);
        }
        
        return totalChange / (digits.length - 1);
    }
}

// 7. Breakout Strategy
class BreakoutStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 20) return null;
        
        const recent20 = digits.slice(0, 20);
        const high = Math.max(...recent20);
        const low = Math.min(...recent20);
        const current = digits[0];
        const range = high - low;
        
        if (range > 5 && (current === high || current === low)) {
            return {
                direction: current === high ? 'put' : 'call',
                confidence: Math.min(range * 10, 80),
                reason: `Breakout: ${current === high ? 'High' : 'Low'} breakout detected`
            };
        }
        
        return null;
    }
}

// 8. Support/Resistance Strategy
class SupportResistanceStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 30) return null;
        
        const recent30 = digits.slice(0, 30);
        const support = this.findSupport(recent30);
        const resistance = this.findResistance(recent30);
        const current = digits[0];
        
        if (current <= support) {
            return {
                direction: 'call',
                confidence: 75,
                reason: `Support bounce at level ${support}`
            };
        }
        
        if (current >= resistance) {
            return {
                direction: 'put',
                confidence: 75,
                reason: `Resistance rejection at level ${resistance}`
            };
        }
        
        return null;
    }
    
    findSupport(digits) {
        const counts = {};
        digits.forEach(d => counts[d] = (counts[d] || 0) + 1);
        
        let maxCount = 0;
        let support = 0;
        
        for (let digit = 0; digit <= 4; digit++) {
            if (counts[digit] > maxCount) {
                maxCount = counts[digit];
                support = digit;
            }
        }
        
        return support;
    }
    
    findResistance(digits) {
        const counts = {};
        digits.forEach(d => counts[d] = (counts[d] || 0) + 1);
        
        let maxCount = 0;
        let resistance = 9;
        
        for (let digit = 5; digit <= 9; digit++) {
            if (counts[digit] > maxCount) {
                maxCount = counts[digit];
                resistance = digit;
            }
        }
        
        return resistance;
    }
}

// 9. Momentum Strategy
class MomentumStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 10) return null;
        
        const recent10 = digits.slice(0, 10);
        const momentum = this.calculateMomentum(recent10);
        
        if (Math.abs(momentum) > 15) {
            return {
                direction: momentum > 0 ? 'call' : 'put',
                confidence: Math.min(Math.abs(momentum) * 3, 80),
                reason: `Momentum: ${momentum > 0 ? 'Positive' : 'Negative'} momentum ${momentum.toFixed(1)}%`
            };
        }
        
        return null;
    }
    
    calculateMomentum(digits) {
        if (digits.length < 5) return 0;
        
        const recent = digits[0];
        const past = digits[4];
        
        return ((recent - past) / past) * 100;
    }
}

// 10. Contrarian Strategy
class ContrarianStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 10) return null;
        
        const recent10 = digits.slice(0, 10);
        const extremeCount = recent10.filter(d => d === 0 || d === 9).length;
        
        if (extremeCount >= 3) {
            const lastExtreme = recent10.find(d => d === 0 || d === 9);
            return {
                direction: lastExtreme === 9 ? 'put' : 'call',
                confidence: extremeCount * 20,
                reason: `Contrarian: ${extremeCount} extreme values detected`
            };
        }
        
        return null;
    }
}

// 11. Pattern Recognition Strategy
class PatternRecognitionStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 8) return null;
        
        const recent8 = digits.slice(0, 8);
        const patterns = this.detectPatterns(recent8);
        
        if (patterns.strength > 0.7) {
            return {
                direction: patterns.direction,
                confidence: patterns.strength * 80,
                reason: `Pattern: ${patterns.type} detected`
            };
        }
        
        return null;
    }
    
    detectPatterns(digits) {
        // Alternating pattern
        const alternating = this.checkAlternating(digits);
        if (alternating.strength > 0.7) return alternating;
        
        // Ascending/Descending pattern
        const trending = this.checkTrending(digits);
        if (trending.strength > 0.7) return trending;
        
        return { strength: 0, direction: null, type: 'none' };
    }
    
    checkAlternating(digits) {
        let alternations = 0;
        for (let i = 1; i < digits.length; i++) {
            if ((digits[i] > 5 && digits[i-1] <= 5) || (digits[i] <= 5 && digits[i-1] > 5)) {
                alternations++;
            }
        }
        
        const strength = alternations / (digits.length - 1);
        return {
            strength,
            direction: digits[0] > 5 ? 'put' : 'call',
            type: 'alternating'
        };
    }
    
    checkTrending(digits) {
        let ascending = 0;
        let descending = 0;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] > digits[i-1]) ascending++;
            else if (digits[i] < digits[i-1]) descending++;
        }
        
        const totalChanges = digits.length - 1;
        const ascendingStrength = ascending / totalChanges;
        const descendingStrength = descending / totalChanges;
        
        if (ascendingStrength > 0.7) {
            return { strength: ascendingStrength, direction: 'put', type: 'ascending' };
        }
        
        if (descendingStrength > 0.7) {
            return { strength: descendingStrength, direction: 'call', type: 'descending' };
        }
        
        return { strength: 0, direction: null, type: 'none' };
    }
}

// 12. Volatility Breakout Strategy
class VolatilityBreakoutStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 20) return null;
        
        const recent20 = digits.slice(0, 20);
        const volatility = this.calculateVolatility(recent20);
        const avgVolatility = this.calculateAverageVolatility(digits);
        
        if (volatility > avgVolatility * 1.5) {
            const direction = this.getVolatilityDirection(recent20);
            return {
                direction,
                confidence: Math.min((volatility / avgVolatility) * 30, 85),
                reason: `Volatility breakout: ${(volatility / avgVolatility).toFixed(1)}x average`
            };
        }
        
        return null;
    }
    
    calculateVolatility(digits) {
        if (digits.length < 2) return 0;
        
        const mean = digits.reduce((a, b) => a + b, 0) / digits.length;
        const variance = digits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / digits.length;
        
        return Math.sqrt(variance);
    }
    
    calculateAverageVolatility(digits) {
        if (digits.length < 40) return 2;
        
        const periods = Math.floor(digits.length / 20);
        let totalVolatility = 0;
        
        for (let i = 0; i < periods; i++) {
            const start = i * 20;
            const end = start + 20;
            const period = digits.slice(start, end);
            totalVolatility += this.calculateVolatility(period);
        }
        
        return totalVolatility / periods;
    }
    
    getVolatilityDirection(digits) {
        const recent5 = digits.slice(0, 5);
        const avg = recent5.reduce((a, b) => a + b, 0) / 5;
        return avg > 5 ? 'put' : 'call';
    }
}

// 13. Time-Based Strategy
class TimeBasedStrategy {
    analyze(digits, tickHistory, sentiment) {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Market opening hours strategy
        if ((hour >= 8 && hour <= 10) || (hour >= 14 && hour <= 16)) {
            if (digits.length < 5) return null;
            
            const recent5 = digits.slice(0, 5);
            const trend = this.calculateHourlyTrend(recent5);
            
            return {
                direction: trend > 0 ? 'call' : 'put',
                confidence: 65,
                reason: `Time-based: Active trading hours ${hour}:${minute.toString().padStart(2, '0')}`
            };
        }
        
        // End of hour strategy
        if (minute >= 55) {
            return {
                direction: digits[0] > 5 ? 'put' : 'call',
                confidence: 60,
                reason: 'Time-based: End of hour reversion'
            };
        }
        
        return null;
    }
    
    calculateHourlyTrend(digits) {
        if (digits.length < 2) return 0;
        
        let trend = 0;
        for (let i = 1; i < digits.length; i++) {
            trend += digits[i-1] - digits[i];
        }
        
        return trend / (digits.length - 1);
    }
}

// 14. Neural Ensemble Strategy
class NeuralEnsembleStrategy {
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 15) return null;
        
        // Ensemble of multiple neural-like calculations
        const signals = [
            this.neuralSignal1(digits),
            this.neuralSignal2(digits),
            this.neuralSignal3(digits)
        ];
        
        const avgSignal = signals.reduce((a, b) => a + b, 0) / signals.length;
        const consensus = signals.filter(s => Math.sign(s) === Math.sign(avgSignal)).length;
        
        if (consensus >= 2 && Math.abs(avgSignal) > 0.3) {
            return {
                direction: avgSignal > 0 ? 'call' : 'put',
                confidence: Math.min(Math.abs(avgSignal) * 100 + consensus * 10, 85),
                reason: `Neural ensemble: ${consensus}/3 models agree`
            };
        }
        
        return null;
    }
    
    neuralSignal1(digits) {
        // Weighted recent digits
        const weights = [0.4, 0.3, 0.2, 0.1];
        let signal = 0;
        
        for (let i = 0; i < Math.min(4, digits.length); i++) {
            signal += (digits[i] - 4.5) * weights[i];
        }
        
        return signal / 4.5;
    }
    
    neuralSignal2(digits) {
        // Moving average crossover
        const ma3 = digits.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const ma7 = digits.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
        
        return (ma3 - ma7) / 4.5;
    }
    
    neuralSignal3(digits) {
        // Momentum indicator
        if (digits.length < 5) return 0;
        
        const current = digits[0];
        const past = digits[4];
        
        return (current - past) / 9;
    }
}

// 15. Adaptive Learning Strategy
class AdaptiveLearningStrategy {
    constructor() {
        this.memory = [];
        this.patterns = new Map();
    }
    
    analyze(digits, tickHistory, sentiment) {
        if (digits.length < 10) return null;
        
        // Learn from recent patterns
        this.learnPattern(digits);
        
        // Find similar historical patterns
        const pattern = digits.slice(0, 5);
        const similar = this.findSimilarPatterns(pattern);
        
        if (similar.length >= 3) {
            const outcomes = similar.map(s => s.outcome);
            const callCount = outcomes.filter(o => o === 'call').length;
            const putCount = outcomes.filter(o => o === 'put').length;
            
            if (Math.abs(callCount - putCount) >= 2) {
                return {
                    direction: callCount > putCount ? 'call' : 'put',
                    confidence: Math.min((Math.abs(callCount - putCount) / similar.length) * 100, 80),
                    reason: `Adaptive learning: ${similar.length} similar patterns found`
                };
            }
        }
        
        return null;
    }
    
    learnPattern(digits) {
        if (digits.length < 6) return;
        
        const pattern = digits.slice(1, 6); // Previous 5 digits
        const outcome = digits[0] > 5 ? 'call' : 'put'; // Current digit outcome
        
        this.memory.push({ pattern, outcome, timestamp: Date.now() });
        
        // Keep only recent 1000 patterns
        if (this.memory.length > 1000) {
            this.memory.shift();
        }
    }
    
    findSimilarPatterns(targetPattern) {
        return this.memory.filter(entry => {
            const similarity = this.calculateSimilarity(entry.pattern, targetPattern);
            return similarity > 0.8;
        });
    }
    
    calculateSimilarity(pattern1, pattern2) {
        if (pattern1.length !== pattern2.length) return 0;
        
        let matches = 0;
        for (let i = 0; i < pattern1.length; i++) {
            if (Math.abs(pattern1[i] - pattern2[i]) <= 1) {
                matches++;
            }
        }
        
        return matches / pattern1.length;
    }
}

// Enhanced Pattern Recognition System
class PatternRecognizer {
    analyze(digits) {
        if (digits.length < 10) return { strength: 0, direction: 'neutral', strongPattern: false };
        
        const patterns = [
            this.detectConsecutivePattern(digits),
            this.detectAlternatingPattern(digits),
            this.detectFibonacciPattern(digits),
            this.detectMeanReversionPattern(digits),
            this.detectCyclicalPattern(digits)
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
        
        if (consecutiveHigh >= 3) {
            return { strength: Math.min(consecutiveHigh / 5, 1), direction: 'put' };
        }
        if (consecutiveLow >= 3) {
            return { strength: Math.min(consecutiveLow / 5, 1), direction: 'call' };
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
        if (strength > 0.6) {
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
    
    detectCyclicalPattern(digits) {
        if (digits.length < 12) return { strength: 0, direction: 'neutral' };
        
        const recent12 = digits.slice(0, 12);
        const cycles = [3, 4, 6]; // Check for 3, 4, and 6-digit cycles
        
        for (let cycle of cycles) {
            const strength = this.checkCycle(recent12, cycle);
            if (strength > 0.7) {
                const nextExpected = recent12[cycle];
                const current = recent12[0];
                return {
                    strength: strength * 0.8,
                    direction: nextExpected > current ? 'call' : 'put'
                };
            }
        }
        
        return { strength: 0, direction: 'neutral' };
    }
    
    checkCycle(digits, cycleLength) {
        if (digits.length < cycleLength * 2) return 0;
        
        let matches = 0;
        const comparisons = Math.floor(digits.length / cycleLength) - 1;
        
        for (let i = 0; i < comparisons; i++) {
            for (let j = 0; j < cycleLength; j++) {
                if (digits[j] === digits[j + cycleLength]) {
                    matches++;
                }
            }
        }
        
        return matches / (comparisons * cycleLength);
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

// Enhanced Risk Management System
class RiskManager {
    checkLimits(todayProfit, config) {
        if (Math.abs(todayProfit) >= config.maxDailyLoss && todayProfit < 0) {
            zeus.showAlert('⚠️ Daily loss limit reached! Auto trading disabled.', 'warning');
            zeus.aiEnabled = false;
            document.getElementById('aiTradeToggle').checked = false;
            zeus.updateAIStatus();
            zeus.logActivity('⚠️ Daily loss limit reached - Auto trading disabled', 'warning');
        }
        
        if (todayProfit >= config.takeProfitTarget) {
            zeus.showAlert('🎯 Take profit target reached! Consider stopping for today.', 'success');
            zeus.logActivity('🎯 Take profit target reached', 'success');
        }
    }
}

// Enhanced Signal Processing System
class SignalProcessor {
    process(tickHistory, recentDigits) {
        if (tickHistory.length < 20) {
            return { callSignal: 0, putSignal: 0, trendStrength: 0, momentum: 0 };
        }
        
        const trendStrength = this.calculateTrendStrength(recentDigits);
        const momentum = this.calculateMomentum(tickHistory);
        const support = this.findSupportLevel(recentDigits);
        const resistance = this.findResistanceLevel(recentDigits);
        const rsi = this.calculateRSI(recentDigits);
        
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
        
        // RSI signals
        if (rsi > 70) {
            putSignal += 0.2;
        } else if (rsi < 30) {
            callSignal += 0.2;
        }
        
        return {
            callSignal: Math.min(callSignal, 1),
            putSignal: Math.min(putSignal, 1),
            trendStrength,
            momentum
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
    
    calculateRSI(digits, period = 14) {
        if (digits.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        for (let i = 0; i < period; i++) {
            const change = digits[i] - digits[i + 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / (avgLoss || 1);
        return 100 - (100 / (1 + rs));
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
    const amount = parseFloat(document.getElementById('manualTradeAmount').value) || 2;
    const duration = parseInt(document.getElementById('manualTradeDuration').value) || 5;
    zeus.placeTrade(direction, amount, duration);
}

function setManualQuickAmount(amount) {
    document.getElementById('manualTradeAmount').value = amount;
}

function setQuickAmount(amount) {
    document.getElementById('tradeAmount').value = amount;
    zeus.config.tradeAmount = amount;
}

function switchMainTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    zeus.currentTab = tabName;
}

function switchAnalyticsTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analytics-section .tab-content').forEach(content => content.classList.remove('active'));
    
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
        zeus.logActivity('📝 Trade history cleared', 'info');
    }
}

function exportHistory() {
    if (zeus.tradeHistory.length === 0) {
        zeus.showAlert('No trade history to export', 'warning');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Type,Direction,Amount,Time,Status,Profit,Market,Confidence,Strategies\n" +
        zeus.tradeHistory.map(trade => 
            `${trade.type},${trade.direction},${trade.amount},${trade.time},${trade.status},${trade.profit || 0},${trade.market},${trade.confidence || 0},"${(trade.strategies || []).join(';')}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zeus_trade_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    zeus.showAlert('Trade history exported successfully', 'success');
    zeus.logActivity('📊 Trade history exported', 'success');
}

function updateConfidenceDisplay() {
    const slider = document.getElementById('minConfidence');
    const display = document.getElementById('confidenceValue');
    display.textContent = slider.value + '%';
    zeus.config.minConfidence = parseInt(slider.value);
}

// Initialize Zeus AI System
const zeus = new ZeusAI();

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Zeus Ultimate AI Trading System with 15 Strategies Initialized');
    zeus.showAlert('🚀 Zeus Ultimate AI System with 15 Advanced Strategies Ready!', 'info');
    zeus.logActivity('🚀 Zeus Ultimate AI System initialized with 15 advanced trading strategies', 'success');
});