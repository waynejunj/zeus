// Zeus Ultimate AI Trading System - Enhanced Neural Network
class ZeusAI {
    constructor() {
        this.weights = [];
        this.biases = [];
        this.learningRate = 0.01;
        this.momentum = 0.9;
        this.previousWeightChanges = [];
        this.previousBiasChanges = [];
        this.digitHistory = [];
        this.predictions = [];
        this.accuracy = 0;
        this.totalPredictions = 0;
        this.correctPredictions = 0;
        this.isTraining = false;
        this.networkLayers = [20, 15, 10, 2]; // Input, hidden, output layers
        this.activationCache = [];
        this.gradientCache = [];
        
        this.initializeAdvancedWeights();
        this.initializeOptimizer();
    }

    initializeAdvancedWeights() {
        this.weights = [];
        this.biases = [];
        this.previousWeightChanges = [];
        this.previousBiasChanges = [];

        for (let i = 0; i < this.networkLayers.length - 1; i++) {
            const inputSize = this.networkLayers[i];
            const outputSize = this.networkLayers[i + 1];
            
            // Xavier initialization for better convergence
            const limit = Math.sqrt(6 / (inputSize + outputSize));
            const layerWeights = [];
            const layerPrevChanges = [];
            
            for (let j = 0; j < outputSize; j++) {
                const neuronWeights = [];
                const neuronPrevChanges = [];
                for (let k = 0; k < inputSize; k++) {
                    neuronWeights.push((Math.random() * 2 - 1) * limit);
                    neuronPrevChanges.push(0);
                }
                layerWeights.push(neuronWeights);
                layerPrevChanges.push(neuronPrevChanges);
            }
            
            this.weights.push(layerWeights);
            this.previousWeightChanges.push(layerPrevChanges);
            
            // Initialize biases
            const layerBiases = [];
            const layerBiasPrevChanges = [];
            for (let j = 0; j < outputSize; j++) {
                layerBiases.push((Math.random() * 2 - 1) * 0.1);
                layerBiasPrevChanges.push(0);
            }
            this.biases.push(layerBiases);
            this.previousBiasChanges.push(layerBiasPrevChanges);
        }
    }

    initializeOptimizer() {
        this.adamOptimizer = {
            beta1: 0.9,
            beta2: 0.999,
            epsilon: 1e-8,
            t: 0,
            m_weights: [],
            v_weights: [],
            m_biases: [],
            v_biases: []
        };

        // Initialize Adam optimizer parameters
        for (let i = 0; i < this.weights.length; i++) {
            this.adamOptimizer.m_weights.push(this.weights[i].map(row => row.map(() => 0)));
            this.adamOptimizer.v_weights.push(this.weights[i].map(row => row.map(() => 0)));
            this.adamOptimizer.m_biases.push(this.biases[i].map(() => 0));
            this.adamOptimizer.v_biases.push(this.biases[i].map(() => 0));
        }
    }

    // Advanced activation functions
    relu(x) {
        return Math.max(0, x);
    }

    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }

    leakyReluDerivative(x, alpha = 0.01) {
        return x > 0 ? 1 : alpha;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
    }

    sigmoidDerivative(x) {
        const s = this.sigmoid(x);
        return s * (1 - s);
    }

    tanh(x) {
        return Math.tanh(x);
    }

    tanhDerivative(x) {
        const t = Math.tanh(x);
        return 1 - t * t;
    }

    softmax(inputs) {
        const maxInput = Math.max(...inputs);
        const exps = inputs.map(x => Math.exp(x - maxInput));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(exp => exp / sumExps);
    }

    // Feature engineering
    extractAdvancedFeatures(digits) {
        if (digits.length < 20) return null;

        const recent = digits.slice(-20);
        const features = [];

        // Basic statistics
        const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length;
        const std = Math.sqrt(variance);

        features.push(mean / 10, std / 3);

        // Trend analysis
        let upTrend = 0, downTrend = 0;
        for (let i = 1; i < recent.length; i++) {
            if (recent[i] > recent[i-1]) upTrend++;
            else if (recent[i] < recent[i-1]) downTrend++;
        }
        features.push(upTrend / recent.length, downTrend / recent.length);

        // Pattern recognition
        const patterns = this.detectPatterns(recent);
        features.push(...patterns);

        // Frequency analysis
        const freq = new Array(10).fill(0);
        recent.forEach(d => freq[d]++);
        features.push(...freq.map(f => f / recent.length));

        // Momentum indicators
        const momentum = this.calculateMomentum(recent);
        features.push(...momentum);

        return features.slice(0, 20); // Ensure exactly 20 features
    }

    detectPatterns(digits) {
        const patterns = [];
        
        // Consecutive patterns
        let consecutive = 1;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] === digits[i-1]) consecutive++;
            else consecutive = 1;
        }
        patterns.push(consecutive / digits.length);

        // Alternating patterns
        let alternating = 0;
        for (let i = 2; i < digits.length; i++) {
            if (digits[i] === digits[i-2] && digits[i] !== digits[i-1]) alternating++;
        }
        patterns.push(alternating / (digits.length - 2));

        // Ascending/Descending sequences
        let ascending = 0, descending = 0;
        for (let i = 2; i < digits.length; i++) {
            if (digits[i] > digits[i-1] && digits[i-1] > digits[i-2]) ascending++;
            if (digits[i] < digits[i-1] && digits[i-1] < digits[i-2]) descending++;
        }
        patterns.push(ascending / (digits.length - 2), descending / (digits.length - 2));

        return patterns;
    }

    calculateMomentum(digits) {
        const momentum = [];
        
        // Short-term momentum (last 5 digits)
        const shortTerm = digits.slice(-5);
        const shortMean = shortTerm.reduce((a, b) => a + b, 0) / shortTerm.length;
        momentum.push(shortMean / 10);

        // Medium-term momentum (last 10 digits)
        const mediumTerm = digits.slice(-10);
        const mediumMean = mediumTerm.reduce((a, b) => a + b, 0) / mediumTerm.length;
        momentum.push(mediumMean / 10);

        // Rate of change
        const roc = (digits[digits.length - 1] - digits[digits.length - 5]) / 5;
        momentum.push(roc / 10);

        return momentum;
    }

    // Forward propagation with advanced techniques
    forwardPropagate(inputs) {
        this.activationCache = [inputs];
        let currentInputs = [...inputs];

        for (let layer = 0; layer < this.weights.length; layer++) {
            const outputs = [];
            
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                let sum = this.biases[layer][neuron];
                
                for (let input = 0; input < currentInputs.length; input++) {
                    sum += currentInputs[input] * this.weights[layer][neuron][input];
                }

                // Use different activation functions for different layers
                if (layer === this.weights.length - 1) {
                    // Output layer - sigmoid for probability
                    outputs.push(this.sigmoid(sum));
                } else {
                    // Hidden layers - leaky ReLU for better gradient flow
                    outputs.push(this.leakyRelu(sum));
                }
            }

            this.activationCache.push(outputs);
            currentInputs = outputs;
        }

        // Apply softmax to output layer for probability distribution
        if (currentInputs.length === 2) {
            currentInputs = this.softmax(currentInputs);
        }

        return currentInputs;
    }

    // Backpropagation with Adam optimizer
    backPropagate(inputs, expectedOutputs) {
        const outputs = this.forwardPropagate(inputs);
        this.adamOptimizer.t++;

        // Calculate output layer error
        const outputErrors = [];
        for (let i = 0; i < outputs.length; i++) {
            outputErrors.push(expectedOutputs[i] - outputs[i]);
        }

        // Backpropagate errors
        let currentErrors = outputErrors;
        
        for (let layer = this.weights.length - 1; layer >= 0; layer--) {
            const layerInputs = this.activationCache[layer];
            const layerOutputs = this.activationCache[layer + 1];
            const nextErrors = [];

            // Calculate gradients
            for (let neuron = 0; neuron < this.weights[layer].length; neuron++) {
                const error = currentErrors[neuron];
                
                // Calculate derivative based on activation function
                let derivative;
                if (layer === this.weights.length - 1) {
                    derivative = this.sigmoidDerivative(layerOutputs[neuron]);
                } else {
                    derivative = this.leakyReluDerivative(layerOutputs[neuron]);
                }
                
                const delta = error * derivative;

                // Update weights using Adam optimizer
                for (let input = 0; input < layerInputs.length; input++) {
                    const gradient = delta * layerInputs[input];
                    
                    // Adam optimizer update
                    this.adamOptimizer.m_weights[layer][neuron][input] = 
                        this.adamOptimizer.beta1 * this.adamOptimizer.m_weights[layer][neuron][input] + 
                        (1 - this.adamOptimizer.beta1) * gradient;
                    
                    this.adamOptimizer.v_weights[layer][neuron][input] = 
                        this.adamOptimizer.beta2 * this.adamOptimizer.v_weights[layer][neuron][input] + 
                        (1 - this.adamOptimizer.beta2) * gradient * gradient;
                    
                    const m_corrected = this.adamOptimizer.m_weights[layer][neuron][input] / 
                        (1 - Math.pow(this.adamOptimizer.beta1, this.adamOptimizer.t));
                    const v_corrected = this.adamOptimizer.v_weights[layer][neuron][input] / 
                        (1 - Math.pow(this.adamOptimizer.beta2, this.adamOptimizer.t));
                    
                    this.weights[layer][neuron][input] += this.learningRate * m_corrected / 
                        (Math.sqrt(v_corrected) + this.adamOptimizer.epsilon);
                }

                // Update bias
                this.adamOptimizer.m_biases[layer][neuron] = 
                    this.adamOptimizer.beta1 * this.adamOptimizer.m_biases[layer][neuron] + 
                    (1 - this.adamOptimizer.beta1) * delta;
                
                this.adamOptimizer.v_biases[layer][neuron] = 
                    this.adamOptimizer.beta2 * this.adamOptimizer.v_biases[layer][neuron] + 
                    (1 - this.adamOptimizer.beta2) * delta * delta;
                
                const m_bias_corrected = this.adamOptimizer.m_biases[layer][neuron] / 
                    (1 - Math.pow(this.adamOptimizer.beta1, this.adamOptimizer.t));
                const v_bias_corrected = this.adamOptimizer.v_biases[layer][neuron] / 
                    (1 - Math.pow(this.adamOptimizer.beta2, this.adamOptimizer.t));
                
                this.biases[layer][neuron] += this.learningRate * m_bias_corrected / 
                    (Math.sqrt(v_bias_corrected) + this.adamOptimizer.epsilon);

                // Calculate error for previous layer
                if (layer > 0) {
                    for (let prevNeuron = 0; prevNeuron < layerInputs.length; prevNeuron++) {
                        if (!nextErrors[prevNeuron]) nextErrors[prevNeuron] = 0;
                        nextErrors[prevNeuron] += delta * this.weights[layer][neuron][prevNeuron];
                    }
                }
            }

            currentErrors = nextErrors;
        }
    }

    // Enhanced prediction with confidence scoring
    predict(digits) {
        const features = this.extractAdvancedFeatures(digits);
        if (!features) return { direction: 'HOLD', confidence: 0, probabilities: [0.5, 0.5] };

        const outputs = this.forwardPropagate(features);
        const callProb = outputs[0];
        const putProb = outputs[1];

        // Normalize probabilities
        const total = callProb + putProb;
        const normalizedCall = callProb / total;
        const normalizedPut = putProb / total;

        const confidence = Math.abs(normalizedCall - normalizedPut) * 100;
        const direction = normalizedCall > normalizedPut ? 'CALL' : 'PUT';

        return {
            direction,
            confidence: Math.round(confidence),
            probabilities: [normalizedCall, normalizedPut],
            callProb: Math.round(normalizedCall * 100),
            putProb: Math.round(normalizedPut * 100)
        };
    }

    // Continuous learning from trade results
    learn(digits, actualResult) {
        const features = this.extractAdvancedFeatures(digits);
        if (!features) return;

        // Create target output based on actual result
        const target = actualResult === 'win' ? [1, 0] : [0, 1];
        
        // Train the network
        this.backPropagate(features, target);
        
        // Update accuracy metrics
        this.totalPredictions++;
        const prediction = this.predict(digits);
        const predictedCorrectly = 
            (prediction.direction === 'CALL' && actualResult === 'win') ||
            (prediction.direction === 'PUT' && actualResult === 'win');
        
        if (predictedCorrectly) {
            this.correctPredictions++;
        }
        
        this.accuracy = (this.correctPredictions / this.totalPredictions) * 100;
    }

    // Get current accuracy
    getAccuracy() {
        return Math.round(this.accuracy);
    }

    // Advanced market analysis
    analyzeMarket(digits) {
        if (digits.length < 50) return null;

        const recent50 = digits.slice(-50);
        const recent20 = digits.slice(-20);
        const recent10 = digits.slice(-10);

        return {
            volatility: this.calculateVolatility(recent20),
            trend: this.calculateTrend(recent20),
            momentum: this.calculateMomentumStrength(recent10),
            support: this.findSupportLevel(recent50),
            resistance: this.findResistanceLevel(recent50),
            sentiment: this.analyzeSentiment(recent20)
        };
    }

    calculateVolatility(digits) {
        const mean = digits.reduce((a, b) => a + b, 0) / digits.length;
        const variance = digits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / digits.length;
        return Math.round(Math.sqrt(variance) * 10);
    }

    calculateTrend(digits) {
        let upMoves = 0;
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] > digits[i-1]) upMoves++;
        }
        const trendStrength = (upMoves / (digits.length - 1)) * 100;
        
        if (trendStrength > 60) return 'Bullish';
        if (trendStrength < 40) return 'Bearish';
        return 'Neutral';
    }

    calculateMomentumStrength(digits) {
        const recent = digits.slice(-5);
        const previous = digits.slice(-10, -5);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        
        return Math.round(Math.abs(recentAvg - previousAvg) * 10);
    }

    findSupportLevel(digits) {
        const sorted = [...digits].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.2)];
    }

    findResistanceLevel(digits) {
        const sorted = [...digits].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.8)];
    }

    analyzeSentiment(digits) {
        const bullish = digits.filter((d, i) => i > 0 && d > digits[i-1]).length;
        const bearish = digits.filter((d, i) => i > 0 && d < digits[i-1]).length;
        const neutral = digits.length - bullish - bearish - 1;
        
        const total = bullish + bearish + neutral;
        return {
            bullish: Math.round((bullish / total) * 100),
            bearish: Math.round((bearish / total) * 100),
            neutral: Math.round((neutral / total) * 100)
        };
    }
}

// Global variables
let ws = null;
let isConnected = false;
let currentBalance = 0;
let digitHistory = [];
let tradeHistory = [];
let liveTradesList = [];
let zeusAI = null;
let isAITrading = false;
let sessionStartTime = null;
let tickCount = 0;
let connectionStartTime = null;

// Trading statistics
let totalTrades = 0;
let winningTrades = 0;
let totalProfit = 0;
let currentStreak = 0;
let bestStreak = 0;
let todayProfit = 0;

// AI specific stats
let aiTrades = 0;
let aiWins = 0;
let aiProfit = 0;

// Risk management
let dailyLoss = 0;
let maxDailyLoss = 50;
let takeProfitTarget = 100;
let martingaleEnabled = false;
let antiMartingaleEnabled = false;
let lastTradeAmount = 2;

// Market analysis data
let marketAnalysis = {
    volatility: 0,
    trend: 'Neutral',
    momentum: 0,
    support: 0,
    resistance: 0,
    sentiment: { bullish: 33, bearish: 33, neutral: 34 }
};

// Initialize Zeus AI
function initializeZeusAI() {
    try {
        zeusAI = new ZeusAI();
        showAlert('Zeus AI Neural Network Initialized', 'success');
        updateAIStatus('Ready');
        logAIActivity('Neural network initialized with advanced architecture');
    } catch (error) {
        console.error('Error initializing Zeus AI:', error);
        showAlert('Failed to initialize AI system', 'error');
    }
}

// WebSocket connection management
function connect() {
    const appId = document.getElementById('appId').value;
    const apiToken = document.getElementById('apiToken').value;
    const market = document.getElementById('marketSelect').value;

    if (!appId || !apiToken) {
        showAlert('Please enter App ID and API Token', 'error');
        return;
    }

    showLoadingOverlay('Connecting to Deriv API...');

    try {
        ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
        
        ws.onopen = function() {
            console.log('Connected to Deriv API');
            
            // Authorize first
            const authMessage = {
                authorize: apiToken
            };
            
            ws.send(JSON.stringify(authMessage));
        };

        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            zeusAI.handleMessage(data);
        };

        ws.onclose = function() {
            console.log('Disconnected from Deriv API');
            handleDisconnection();
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            showAlert('Connection failed', 'error');
            hideLoadingOverlay();
        };

    } catch (error) {
        console.error('Connection error:', error);
        showAlert('Failed to connect', 'error');
        hideLoadingOverlay();
    }
}

function disconnect() {
    if (ws) {
        ws.close();
    }
    handleDisconnection();
}

function handleDisconnection() {
    isConnected = false;
    ws = null;
    
    // Update UI
    document.getElementById('connectionDot').classList.remove('connected');
    document.getElementById('connectionText').textContent = 'Offline';
    document.getElementById('connectBtn').style.display = 'inline-flex';
    document.getElementById('disconnectBtn').style.display = 'none';
    document.getElementById('marketStatus').textContent = 'Closed';
    
    // Stop AI trading
    if (isAITrading) {
        toggleAITrade();
    }
    
    hideLoadingOverlay();
    showAlert('Disconnected from Deriv API', 'info');
}

// Enhanced message handler for Zeus AI
ZeusAI.prototype.handleMessage = function(data) {
    try {
        if (data.error) {
            console.error('API Error:', data.error.message);
            showAlert(`API Error: ${data.error.message}`, 'error');
            hideLoadingOverlay();
            return;
        }

        // Handle authorization
        if (data.authorize) {
            console.log('Authorization successful');
            isConnected = true;
            connectionStartTime = new Date();
            
            // Update UI
            document.getElementById('connectionDot').classList.add('connected');
            document.getElementById('connectionText').textContent = 'Connected';
            document.getElementById('connectBtn').style.display = 'none';
            document.getElementById('disconnectBtn').style.display = 'inline-flex';
            document.getElementById('marketStatus').textContent = 'Open';
            
            hideLoadingOverlay();
            showAlert('Successfully connected to Deriv API', 'success');
            
            // Get initial balance
            this.getBalance();
            
            // Start tick subscription
            this.subscribeToTicks();
            
            return;
        }

        // Handle balance response
        if (data.balance) {
            currentBalance = parseFloat(data.balance.balance);
            updateBalanceDisplay();
            return;
        }

        // Handle tick data
        if (data.tick) {
            this.processTick(data.tick);
            return;
        }

        // Handle buy response (trade placement)
        if (data.buy) {
            this.handleTradeResponse(data.buy);
            return;
        }

        // Handle proposal response (for getting payout info)
        if (data.proposal) {
            this.handleProposalResponse(data.proposal);
            return;
        }

        // Handle proposal open contract response
        if (data.proposal_open_contract) {
            this.handleContractUpdate(data.proposal_open_contract);
            return;
        }

    } catch (error) {
        console.error('Error handling message:', error);
        showAlert('Error processing API response', 'error');
    }
};

// Get account balance
ZeusAI.prototype.getBalance = function() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            balance: 1,
            req_id: Date.now()
        };
        ws.send(JSON.stringify(message));
    }
};

// Subscribe to tick data
ZeusAI.prototype.subscribeToTicks = function() {
    const market = document.getElementById('marketSelect').value;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            ticks: market,
            req_id: Date.now()
        };
        ws.send(JSON.stringify(message));
    }
};

// Process incoming tick data
ZeusAI.prototype.processTick = function(tick) {
    const quote = parseFloat(tick.quote);
    const lastDigit = Math.floor(quote * 10) % 10;
    
    // Update tick count
    tickCount++;
    document.getElementById('tickCount').textContent = tickCount;
    
    // Add to digit history
    digitHistory.push(lastDigit);
    if (digitHistory.length > 1000) {
        digitHistory = digitHistory.slice(-1000); // Keep last 1000 digits
    }
    
    // Update digit displays
    updateDigitDisplay(lastDigit);
    updateRecentDigits();
    
    // Update server time
    const serverTime = new Date(tick.epoch * 1000);
    document.getElementById('serverTime').textContent = serverTime.toLocaleTimeString();
    
    // Update session uptime
    if (connectionStartTime) {
        const uptime = new Date() - connectionStartTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        document.getElementById('sessionUptime').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Generate AI prediction
    if (digitHistory.length >= 20) {
        const prediction = this.predict(digitHistory);
        updatePredictionDisplay(prediction);
        
        // Update market analysis
        const analysis = this.analyzeMarket(digitHistory);
        if (analysis) {
            marketAnalysis = analysis;
            updateMarketAnalysis();
        }
        
        // Auto trading logic
        if (isAITrading && this.shouldTrade(prediction)) {
            this.executeAITrade(prediction);
        }
    }
};

// Enhanced trade placement with payout calculation
ZeusAI.prototype.placeTradeWithPayout = function(direction, amount, duration) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        showAlert('Not connected to API', 'error');
        return;
    }

    const market = document.getElementById('marketSelect').value;
    
    // First get proposal to calculate payout
    const proposalMessage = {
        proposal: 1,
        amount: amount,
        basis: "stake",
        contract_type: direction.toUpperCase(),
        currency: "USD",
        duration: duration,
        duration_unit: "t",
        symbol: market,
        req_id: `proposal_${Date.now()}`
    };
    
    // Store trade details for when we get the proposal response
    this.pendingTrade = {
        direction: direction,
        amount: amount,
        duration: duration,
        market: market,
        timestamp: Date.now()
    };
    
    ws.send(JSON.stringify(proposalMessage));
};

// Handle proposal response and place actual trade
ZeusAI.prototype.handleProposalResponse = function(proposal) {
    if (!this.pendingTrade) return;
    
    const payout = parseFloat(proposal.payout);
    const askPrice = parseFloat(proposal.ask_price);
    
    // Calculate potential profit
    const potentialProfit = payout - askPrice;
    
    // Now place the actual trade
    const buyMessage = {
        buy: proposal.id,
        price: askPrice,
        req_id: `buy_${Date.now()}`
    };
    
    // Store payout info for this trade
    this.pendingTrade.payout = payout;
    this.pendingTrade.askPrice = askPrice;
    this.pendingTrade.potentialProfit = potentialProfit;
    
    ws.send(JSON.stringify(buyMessage));
};

// Handle trade response
ZeusAI.prototype.handleTradeResponse = function(buyResponse) {
    if (!this.pendingTrade) return;
    
    const contractId = buyResponse.contract_id;
    const purchaseTime = new Date(buyResponse.purchase_time * 1000);
    
    // Create trade object with payout information
    const trade = {
        id: contractId,
        direction: this.pendingTrade.direction,
        amount: this.pendingTrade.amount,
        duration: this.pendingTrade.duration,
        market: this.pendingTrade.market,
        timestamp: purchaseTime,
        status: 'open',
        payout: this.pendingTrade.payout,
        askPrice: this.pendingTrade.askPrice,
        potentialProfit: this.pendingTrade.potentialProfit,
        isAI: isAITrading
    };
    
    // Add to live trades
    liveTradesList.push(trade);
    updateLiveTradesDisplay();
    
    // Subscribe to contract updates
    this.subscribeToContract(contractId);
    
    // Update statistics
    totalTrades++;
    if (trade.isAI) {
        aiTrades++;
    }
    updateStatistics();
    
    // Log activity
    const tradeType = trade.isAI ? 'AI' : 'Manual';
    logAIActivity(`${tradeType} ${trade.direction} trade placed: $${trade.amount} (Potential: $${trade.potentialProfit.toFixed(2)})`);
    
    showAlert(`${trade.direction} trade placed successfully`, 'success');
    
    // Clear pending trade
    this.pendingTrade = null;
};

// Subscribe to contract updates
ZeusAI.prototype.subscribeToContract = function(contractId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            proposal_open_contract: 1,
            contract_id: contractId,
            req_id: `contract_${contractId}`
        };
        ws.send(JSON.stringify(message));
    }
};

// Handle contract updates (trade results)
ZeusAI.prototype.handleContractUpdate = function(contract) {
    const contractId = contract.contract_id;
    const tradeIndex = liveTradesList.findIndex(trade => trade.id === contractId);
    
    if (tradeIndex === -1) return;
    
    const trade = liveTradesList[tradeIndex];
    
    // Check if trade is finished
    if (contract.is_sold || contract.status === 'sold') {
        const sellPrice = parseFloat(contract.sell_price || contract.payout || 0);
        const profit = sellPrice - trade.askPrice;
        const isWin = profit > 0;
        
        // Update trade with final results
        trade.status = isWin ? 'win' : 'loss';
        trade.sellPrice = sellPrice;
        trade.actualProfit = profit;
        trade.endTime = new Date(contract.sell_time * 1000);
        
        // Move to history
        tradeHistory.unshift(trade);
        liveTradesList.splice(tradeIndex, 1);
        
        // Update balance
        currentBalance += profit;
        updateBalanceDisplay();
        
        // Update statistics
        if (isWin) {
            winningTrades++;
            currentStreak++;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
            }
            if (trade.isAI) {
                aiWins++;
            }
        } else {
            currentStreak = 0;
        }
        
        // Update profit tracking
        totalProfit += profit;
        todayProfit += profit;
        if (trade.isAI) {
            aiProfit += profit;
        }
        
        // Update daily loss tracking
        if (profit < 0) {
            dailyLoss += Math.abs(profit);
        }
        
        // AI learning
        if (zeusAI && digitHistory.length >= 20) {
            const recentDigits = digitHistory.slice(-20);
            zeusAI.learn(recentDigits, trade.status);
        }
        
        // Update displays
        updateStatistics();
        updateLiveTradesDisplay();
        updateTradeHistory();
        
        // Log result
        const tradeType = trade.isAI ? 'AI' : 'Manual';
        const resultText = isWin ? 'WON' : 'LOST';
        logAIActivity(`${tradeType} ${trade.direction} trade ${resultText}: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`);
        
        // Show alert
        const alertType = isWin ? 'success' : 'error';
        showAlert(`Trade ${resultText}: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`, alertType);
        
        // Risk management checks
        if (dailyLoss >= maxDailyLoss) {
            if (isAITrading) {
                toggleAITrade();
            }
            showAlert(`Daily loss limit reached: $${dailyLoss.toFixed(2)}`, 'warning');
        }
        
        if (todayProfit >= takeProfitTarget) {
            if (isAITrading) {
                toggleAITrade();
            }
            showAlert(`Take profit target reached: $${todayProfit.toFixed(2)}`, 'success');
        }
    }
};

// AI trading decision logic
ZeusAI.prototype.shouldTrade = function(prediction) {
    const minConfidence = parseInt(document.getElementById('minConfidence').value);
    
    // Check confidence threshold
    if (prediction.confidence < minConfidence) {
        return false;
    }
    
    // Check if we have any open trades
    if (liveTradesList.length > 0) {
        return false;
    }
    
    // Risk management checks
    if (dailyLoss >= maxDailyLoss) {
        logAIActivity('Daily loss limit reached, stopping AI trading');
        toggleAITrade();
        return false;
    }
    
    if (todayProfit >= takeProfitTarget) {
        logAIActivity('Take profit target reached, stopping AI trading');
        toggleAITrade();
        return false;
    }
    
    // Check balance
    const tradeAmount = parseFloat(document.getElementById('tradeAmount').value);
    if (currentBalance < tradeAmount) {
        logAIActivity('Insufficient balance for trading');
        toggleAITrade();
        return false;
    }
    
    return true;
};

// Execute AI trade
ZeusAI.prototype.executeAITrade = function(prediction) {
    let amount = parseFloat(document.getElementById('tradeAmount').value);
    const duration = parseInt(document.getElementById('tradeDuration').value);
    
    // Martingale logic
    if (martingaleEnabled && tradeHistory.length > 0) {
        const lastTrade = tradeHistory[0];
        if (lastTrade.status === 'loss' && lastTrade.isAI) {
            amount = lastTradeAmount * 2;
        }
    }
    
    // Anti-Martingale logic
    if (antiMartingaleEnabled && tradeHistory.length > 0) {
        const lastTrade = tradeHistory[0];
        if (lastTrade.status === 'win' && lastTrade.isAI) {
            amount = lastTradeAmount * 1.5;
        }
    }
    
    // Ensure amount doesn't exceed balance
    amount = Math.min(amount, currentBalance * 0.1); // Max 10% of balance per trade
    
    lastTradeAmount = amount;
    
    this.placeTradeWithPayout(prediction.direction.toLowerCase(), amount, duration);
    
    logAIActivity(`AI executing ${prediction.direction} trade: $${amount} (Confidence: ${prediction.confidence}%)`);
};

// Manual trading functions
function placeManualTrade(direction) {
    if (!isConnected) {
        showAlert('Please connect to Deriv API first', 'error');
        return;
    }
    
    const amount = parseFloat(document.getElementById('manualTradeAmount').value);
    const duration = parseInt(document.getElementById('manualTradeDuration').value);
    
    if (amount <= 0) {
        showAlert('Please enter a valid trade amount', 'error');
        return;
    }
    
    if (currentBalance < amount) {
        showAlert('Insufficient balance', 'error');
        return;
    }
    
    zeusAI.placeTradeWithPayout(direction, amount, duration);
}

function setManualQuickAmount(amount) {
    document.getElementById('manualTradeAmount').value = amount;
}

// AI control functions
function toggleAITrade() {
    const toggle = document.getElementById('aiTradeToggle');
    isAITrading = toggle.checked;
    
    if (isAITrading) {
        if (!isConnected) {
            showAlert('Please connect to Deriv API first', 'error');
            toggle.checked = false;
            isAITrading = false;
            return;
        }
        
        updateAIStatus('Active');
        logAIActivity('AI trading system activated');
        showAlert('AI trading activated', 'success');
    } else {
        updateAIStatus('Standby');
        logAIActivity('AI trading system deactivated');
        showAlert('AI trading deactivated', 'info');
    }
}

function updateConfidenceDisplay() {
    const confidence = document.getElementById('minConfidence').value;
    document.getElementById('confidenceValue').textContent = confidence + '%';
}

// UI update functions
function updateDigitDisplay(digit) {
    const displays = ['currentDigit', 'currentDigitManual'];
    displays.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = digit;
            element.className = 'current-digit';
            
            // Add signal class based on AI prediction
            if (zeusAI && digitHistory.length >= 20) {
                const prediction = zeusAI.predict(digitHistory);
                if (prediction.confidence > 70) {
                    element.classList.add(prediction.direction.toLowerCase() + '-signal');
                }
            }
        }
    });
    
    // Update trend indicators
    const trendElements = ['digitTrend', 'digitTrendManual'];
    trendElements.forEach(id => {
        const element = document.getElementById(id);
        if (element && digitHistory.length >= 2) {
            const current = digitHistory[digitHistory.length - 1];
            const previous = digitHistory[digitHistory.length - 2];
            
            if (current > previous) {
                element.innerHTML = '<i class="fas fa-arrow-up" style="color: var(--success);"></i>';
            } else if (current < previous) {
                element.innerHTML = '<i class="fas fa-arrow-down" style="color: var(--danger);"></i>';
            } else {
                element.innerHTML = '<i class="fas fa-minus" style="color: var(--text-secondary);"></i>';
            }
        }
    });
}

function updateRecentDigits() {
    const containers = ['recentDigits', 'recentDigitsManual'];
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            const recent = digitHistory.slice(-10);
            container.innerHTML = recent.map(digit => 
                `<div class="recent-digit">${digit}</div>`
            ).join('');
        }
    });
}

function updatePredictionDisplay(prediction) {
    // Update main prediction displays
    const directionElements = ['predictionDirection', 'predictionDirectionAuto'];
    const confidenceElements = ['predictionConfidence', 'predictionConfidenceAuto'];
    
    directionElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = prediction.direction;
            element.className = 'prediction-direction ' + prediction.direction.toLowerCase();
        }
    });
    
    confidenceElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = prediction.confidence + '%';
        }
    });
    
    // Update probability displays
    const callProbElements = ['callProbValue', 'callProbValueAuto'];
    const putProbElements = ['putProbValue', 'putProbValueAuto'];
    const callBarElements = ['callProbBar', 'callProbBarAuto'];
    const putBarElements = ['putProbBar', 'putProbBarAuto'];
    
    callProbElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = prediction.callProb + '%';
    });
    
    putProbElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = prediction.putProb + '%';
    });
    
    callBarElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.width = prediction.callProb + '%';
    });
    
    putBarElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.width = prediction.putProb + '%';
    });
    
    // Update manual trading button probabilities
    const callBtn = document.getElementById('callBtnProb');
    const putBtn = document.getElementById('putBtnProb');
    if (callBtn) callBtn.textContent = prediction.callProb + '%';
    if (putBtn) putBtn.textContent = prediction.putProb + '%';
    
    // Update prediction status
    const statusElements = ['predictionStatus', 'predictionStatusAuto'];
    statusElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `Confidence: ${prediction.confidence}%`;
        }
    });
}

function updateBalanceDisplay() {
    const balanceElements = ['currentBalance'];
    balanceElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '$' + currentBalance.toFixed(2);
        }
    });
}

function updateStatistics() {
    // Calculate win rate
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const aiWinRate = aiTrades > 0 ? (aiWins / aiTrades) * 100 : 0;
    
    // Update header stats
    document.getElementById('totalProfit').textContent = '$' + totalProfit.toFixed(2);
    document.getElementById('winStreakDisplay').textContent = currentStreak;
    document.getElementById('aiAccuracyHeader').textContent = zeusAI ? zeusAI.getAccuracy() + '%' : '0%';
    
    // Update sidebar stats
    document.getElementById('todayProfitStat').textContent = '$' + todayProfit.toFixed(2);
    document.getElementById('totalTradesStat').textContent = totalTrades;
    document.getElementById('winRateStat').textContent = winRate.toFixed(1) + '%';
    document.getElementById('currentStreak').textContent = currentStreak;
    
    // Update AI stats
    document.getElementById('aiWinRate').textContent = aiWinRate.toFixed(1) + '%';
    document.getElementById('aiTotalTrades').textContent = aiTrades;
    document.getElementById('aiProfit').textContent = '$' + aiProfit.toFixed(2);
    
    // Update summary stats
    document.getElementById('summaryTotalTrades').textContent = totalTrades;
    document.getElementById('summaryWinningTrades').textContent = winningTrades;
    document.getElementById('summaryLosingTrades').textContent = totalTrades - winningTrades;
    document.getElementById('summaryWinRate').textContent = winRate.toFixed(1) + '%';
    document.getElementById('summaryTotalProfit').textContent = '$' + totalProfit.toFixed(2);
    document.getElementById('summaryBestStreak').textContent = bestStreak;
}

function updateLiveTradesDisplay() {
    const container = document.getElementById('liveTradesList');
    
    if (liveTradesList.length === 0) {
        container.innerHTML = `
            <div class="no-trades">
                <i class="fas fa-chart-line"></i>
                <p>No active trades</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = liveTradesList.map(trade => `
        <div class="trade-item open">
            <div class="trade-icon ${trade.direction}">
                <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
            </div>
            <div class="trade-info">
                <div class="trade-type">${trade.direction.toUpperCase()} - ${trade.isAI ? 'AI' : 'Manual'}</div>
                <div class="trade-time">${trade.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="trade-result">
                <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                <div class="trade-profit pending">Potential: $${trade.potentialProfit.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

function updateTradeHistory() {
    const container = document.getElementById('tradeHistoryList');
    
    if (tradeHistory.length === 0) {
        container.innerHTML = `
            <div class="no-trades">
                <i class="fas fa-chart-line"></i>
                <p>No trades yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tradeHistory.slice(0, 50).map(trade => `
        <div class="trade-item ${trade.status}">
            <div class="trade-icon ${trade.direction}">
                <i class="fas fa-arrow-${trade.direction === 'call' ? 'up' : 'down'}"></i>
            </div>
            <div class="trade-info">
                <div class="trade-type">${trade.direction.toUpperCase()} - ${trade.isAI ? 'AI' : 'Manual'}</div>
                <div class="trade-time">${trade.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="trade-result">
                <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                <div class="trade-profit ${trade.actualProfit >= 0 ? 'positive' : 'negative'}">
                    ${trade.actualProfit >= 0 ? '+' : ''}$${trade.actualProfit.toFixed(2)}
                </div>
            </div>
        </div>
    `).join('');
}

function updateMarketAnalysis() {
    // Update volatility index
    document.getElementById('volatilityIndex').textContent = marketAnalysis.volatility + '%';
    
    // Update trend direction
    document.getElementById('trendDirection').textContent = marketAnalysis.trend;
    
    // Update trend strength
    document.getElementById('trendStrengthValue').textContent = marketAnalysis.momentum + '%';
    
    // Update support and resistance
    document.getElementById('supportLevel').textContent = marketAnalysis.support;
    document.getElementById('resistanceLevel').textContent = marketAnalysis.resistance;
    
    // Update sentiment analysis
    document.getElementById('bullishSentiment').textContent = marketAnalysis.sentiment.bullish + '%';
    document.getElementById('bearishSentiment').textContent = marketAnalysis.sentiment.bearish + '%';
    document.getElementById('neutralSentiment').textContent = marketAnalysis.sentiment.neutral + '%';
    
    // Update volatility level
    let volatilityLevel = 'Low';
    if (marketAnalysis.volatility > 30) volatilityLevel = 'High';
    else if (marketAnalysis.volatility > 15) volatilityLevel = 'Medium';
    document.getElementById('volatilityLevel').textContent = volatilityLevel;
    
    // Update pattern strength
    const patternStrength = Math.min(marketAnalysis.volatility * 2, 100);
    const strengthBar = document.getElementById('patternStrength');
    if (strengthBar) {
        strengthBar.style.width = patternStrength + '%';
    }
    
    // Update signal strength
    const signalStrength = Math.round((marketAnalysis.volatility + marketAnalysis.momentum) / 2);
    document.getElementById('signalStrengthValue').textContent = signalStrength + '%';
    
    // Update signal indicators
    const indicators = ['trendIndicator', 'momentumIndicator', 'volumeIndicator'];
    indicators.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            const isActive = signalStrength > 50 + (index * 10);
            element.classList.toggle('active', isActive);
        }
    });
}

function updateAIStatus(status) {
    const statusElement = document.getElementById('aiStatusText');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

function logAIActivity(message) {
    const container = document.getElementById('aiActivityLog');
    if (!container) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <span>${message}</span>
        <span class="activity-time">${timestamp}</span>
    `;
    
    // Remove "no activity" message if present
    const noActivity = container.querySelector('.no-activity');
    if (noActivity) {
        noActivity.remove();
    }
    
    container.insertBefore(activityItem, container.firstChild);
    
    // Keep only last 50 activities
    const activities = container.querySelectorAll('.activity-item');
    if (activities.length > 50) {
        activities[activities.length - 1].remove();
    }
}

// Tab management
function switchMainTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.closest('.nav-tab').classList.add('active');
    
    // Update content
    document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

function switchAnalyticsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.analytics-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.analytics-section .tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// History management
function filterHistory(filter) {
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter and update display
    let filteredHistory = tradeHistory;
    
    switch(filter) {
        case 'wins':
            filteredHistory = tradeHistory.filter(trade => trade.status === 'win');
            break;
        case 'losses':
            filteredHistory = tradeHistory.filter(trade => trade.status === 'loss');
            break;
        case 'ai':
            filteredHistory = tradeHistory.filter(trade => trade.isAI);
            break;
        case 'manual':
            filteredHistory = tradeHistory.filter(trade => !trade.isAI);
            break;
    }
    
    // Update display with filtered history
    const container = document.getElementById('tradeHistoryList');
    if (filteredHistory.length === 0) {
        container.innerHTML = `
            <div class="no-trades">
                <i class="fas fa-chart-line"></i>
                <p>No trades match the filter</p>
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
                <div class="trade-type">${trade.direction.toUpperCase()} - ${trade.isAI ? 'AI' : 'Manual'}</div>
                <div class="trade-time">${trade.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="trade-result">
                <div class="trade-amount">$${trade.amount.toFixed(2)}</div>
                <div class="trade-profit ${trade.actualProfit >= 0 ? 'positive' : 'negative'}">
                    ${trade.actualProfit >= 0 ? '+' : ''}$${trade.actualProfit.toFixed(2)}
                </div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all trade history?')) {
        tradeHistory = [];
        updateTradeHistory();
        showAlert('Trade history cleared', 'info');
    }
}

function exportHistory() {
    if (tradeHistory.length === 0) {
        showAlert('No trade history to export', 'info');
        return;
    }
    
    const csvContent = [
        'Timestamp,Direction,Amount,Duration,Status,Profit,Type',
        ...tradeHistory.map(trade => 
            `${trade.timestamp.toISOString()},${trade.direction},${trade.amount},${trade.duration},${trade.status},${trade.actualProfit},${trade.isAI ? 'AI' : 'Manual'}`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeus_trade_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showAlert('Trade history exported', 'success');
}

// Utility functions
function togglePassword() {
    const passwordInput = document.getElementById('apiToken');
    const toggleIcon = document.getElementById('passwordToggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

function showAlert(message, type = 'info') {
    const alertSystem = document.getElementById('alertSystem');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
    `;
    
    alertSystem.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('.loading-text');
    text.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Zeus Ultimate AI Trading System Initializing...');
    
    // Initialize Zeus AI
    initializeZeusAI();
    
    // Update confidence display
    updateConfidenceDisplay();
    
    // Initialize statistics
    updateStatistics();
    
    // Set up risk management from localStorage
    const savedSettings = localStorage.getItem('zeusAISettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('maxDailyLoss').value = settings.maxDailyLoss || 50;
        document.getElementById('takeProfitTarget').value = settings.takeProfitTarget || 100;
        document.getElementById('martingaleEnabled').checked = settings.martingaleEnabled || false;
        document.getElementById('antiMartingaleEnabled').checked = settings.antiMartingaleEnabled || false;
        
        maxDailyLoss = settings.maxDailyLoss || 50;
        takeProfitTarget = settings.takeProfitTarget || 100;
        martingaleEnabled = settings.martingaleEnabled || false;
        antiMartingaleEnabled = settings.antiMartingaleEnabled || false;
    }
    
    // Save settings on change
    ['maxDailyLoss', 'takeProfitTarget', 'martingaleEnabled', 'antiMartingaleEnabled'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function() {
                const settings = {
                    maxDailyLoss: parseFloat(document.getElementById('maxDailyLoss').value),
                    takeProfitTarget: parseFloat(document.getElementById('takeProfitTarget').value),
                    martingaleEnabled: document.getElementById('martingaleEnabled').checked,
                    antiMartingaleEnabled: document.getElementById('antiMartingaleEnabled').checked
                };
                localStorage.setItem('zeusAISettings', JSON.stringify(settings));
                
                maxDailyLoss = settings.maxDailyLoss;
                takeProfitTarget = settings.takeProfitTarget;
                martingaleEnabled = settings.martingaleEnabled;
                antiMartingaleEnabled = settings.antiMartingaleEnabled;
            });
        }
    });
    
    console.log('Zeus Ultimate AI Trading System Ready!');
});