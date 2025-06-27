
let derivWs = null;
let isConnected = false;
let aiTradeEnabled = false;
let tickCount = 0;
let tradeHistory = [];
let currentBalance = 0;
let isTrading = false;
let recentDigits = [];
let currentMarket = 'R_75';
let tickHistory = [];
let aiPredictions = [];
let correctPredictions = 0;
let totalPredictions = 0;
let todayProfit = 0;
let lastSignal = null;
let lastTradeTime = 0;
let tradesThisHour = 0;

// AI Neural Network
let neuralNetwork = {
    weights: [],
    biases: [],
    learningRate: 0.01
};

let marketSentiment = {
    bullish: 0,
    bearish: 0,
    neutral: 0
};

let volatilityIndex = 0;

function initializeAI() {
    document.getElementById('aiStatus').textContent = 'AI System Active';
    neuralNetwork.weights = Array(20).fill().map(() => Math.random() * 2 - 1);
    neuralNetwork.biases = Array(5).fill().map(() => Math.random() * 2 - 1);
    showAlert('🧠 AI System initialized successfully!', 'success');
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function connect() {
    const appId = document.getElementById('appId').value;
    const apiToken = document.getElementById('apiToken').value;
    currentMarket = document.getElementById('marketSelect').value;

    if (!appId || !apiToken) {
        showAlert('Please enter both App ID and API Token', 'error');
        return;
    }

    try {
        derivWs = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${appId}`);
        
        derivWs.onopen = function() {
            console.log('Connected to Deriv WebSocket');
            derivWs.send(JSON.stringify({
                authorize: apiToken
            }));
        };

        derivWs.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log('Deriv message:', data);
            
            if (data.msg_type === 'authorize') {
                if (data.error) {
                    showAlert(`Authorization failed: ${data.error.message}`, 'error');
                    return;
                }
                
                isConnected = true;
                currentBalance = data.authorize.balance;
                updateConnectionStatus();
                updateBalance();
                initializeAI();
                showAlert(`🚀 Connected to ${currentMarket}!`, 'success');
                
                // Subscribe to tick stream
                derivWs.send(JSON.stringify({
                    ticks: currentMarket,
                    subscribe: 1
                }));
                
                // Get account balance
                derivWs.send(JSON.stringify({
                    balance: 1,
                    subscribe: 1
                }));
            }
            
            if (data.msg_type === 'tick') {
                handleTick(data.tick);
            }
            
            if (data.msg_type === 'balance') {
                currentBalance = data.balance.balance;
                updateBalance();
            }
            
            if (data.msg_type === 'buy') {
                handleTradeResult(data);
            }
            
            if (data.msg_type === 'proposal_open_contract') {
                handleContractUpdate(data);
            }
        };

        derivWs.onerror = function(error) {
            console.error('Deriv WebSocket error:', error);
            showAlert('Connection error occurred', 'error');
        };

        derivWs.onclose = function() {
            console.log('Deriv WebSocket closed');
            isConnected = false;
            updateConnectionStatus();
            showAlert('Disconnected from Deriv', 'info');
        };

    } catch (error) {
        console.error('Connection error:', error);
        showAlert('Failed to connect to Deriv', 'error');
    }
}

function disconnect() {
    if (derivWs) {
        derivWs.close();
    }
    isConnected = false;
    aiTradeEnabled = false;
    document.getElementById('aiTradeToggle').checked = false;
    updateConnectionStatus();
    updateAITradeStatus();
    showAlert('Disconnected from Deriv', 'info');
}

function handleTick(tick) {
    const tickQuote = tick.quote.toString();
    const lastDigit = parseInt(tickQuote.slice(-1));
    
    const tickData = {
        digit: lastDigit,
        quote: tick.quote,
        time: new Date(tick.epoch * 1000),
        epoch: tick.epoch
    };
    
    tickHistory.push(tickData);
    if (tickHistory.length > 100) {
        tickHistory.shift();
    }
    
    tickCount++;
    
    recentDigits.unshift(lastDigit);
    if (recentDigits.length > 20) {
        recentDigits.pop();
    }
    
    // Run AI analysis
    runAIAnalysis(tickData);
    
    // Update UI
    updateDigitDisplay(lastDigit);
    updateRecentDigits();
    updateStats();
    updateMarketAnalysis();
    
    // Check for AI trading opportunity
    if (aiTradeEnabled && shouldAITrade()) {
        console.log('AI Trade conditions met, executing trade...');
        setTimeout(() => executeAITrade(), 1000);
    }
}

function runAIAnalysis(tickData) {
    if (tickHistory.length < 10) return;
    
    const prediction = neuralNetworkPredict();
    const pattern = recognizePattern();
    updateMarketSentiment();
    calculateVolatility();
    
    const aiPrediction = generateAIPrediction(prediction, pattern);
    updateAIPrediction(aiPrediction);
    
    lastSignal = aiPrediction;
}

function neuralNetworkPredict() {
    if (recentDigits.length < 10) return { call: 0.5, put: 0.5 };
    
    const inputs = recentDigits.slice(0, 10).map(d => d / 9);
    let callScore = 0;
    let putScore = 0;
    
    for (let i = 0; i < inputs.length; i++) {
        callScore += inputs[i] * neuralNetwork.weights[i];
        putScore += inputs[i] * neuralNetwork.weights[i + 10];
    }
    
    callScore = 1 / (1 + Math.exp(-callScore));
    putScore = 1 / (1 + Math.exp(-putScore));
    
    const total = callScore + putScore;
    return {
        call: callScore / total,
        put: putScore / total
    };
}

function recognizePattern() {
    if (recentDigits.length < 10) return { strength: 0, direction: 'neutral' };
    
    const last10 = recentDigits.slice(0, 10);
    const consecutiveHigh = last10.slice(0, 5).filter(d => d > 5).length;
    const consecutiveLow = last10.slice(0, 5).filter(d => d < 4).length;
    
    let strength = 0;
    let direction = 'neutral';
    
    if (consecutiveHigh >= 4) {
        strength = 0.8;
        direction = 'put';
    } else if (consecutiveLow >= 4) {
        strength = 0.8;
        direction = 'call';
    }
    
    return { strength, direction };
}

function updateMarketSentiment() {
    if (recentDigits.length < 15) return;
    
    const last15 = recentDigits.slice(0, 15);
    const highDigits = last15.filter(d => d > 6).length;
    const lowDigits = last15.filter(d => d < 3).length;
    const midDigits = last15.filter(d => d >= 3 && d <= 6).length;
    
    marketSentiment.bullish = highDigits / 15;
    marketSentiment.bearish = lowDigits / 15;
    marketSentiment.neutral = midDigits / 15;
}

function calculateVolatility() {
    if (tickHistory.length < 10) return;
    
    const last10Quotes = tickHistory.slice(-10).map(t => t.quote);
    const changes = [];
    
    for (let i = 1; i < last10Quotes.length; i++) {
        changes.push(Math.abs(last10Quotes[i] - last10Quotes[i-1]));
    }
    
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    volatilityIndex = Math.min(avgChange * 100, 100);
}

function generateAIPrediction(neuralPred, pattern) {
    let callProb = neuralPred.call;
    let putProb = neuralPred.put;
    
    // Adjust based on pattern
    if (pattern.direction === 'call') {
        callProb += pattern.strength * 0.3;
    } else if (pattern.direction === 'put') {
        putProb += pattern.strength * 0.3;
    }
    
    // Adjust based on market sentiment
    callProb += marketSentiment.bullish * 0.2;
    putProb += marketSentiment.bearish * 0.2;
    
    // Normalize
    const total = callProb + putProb;
    callProb = callProb / total;
    putProb = putProb / total;
    
    const confidence = Math.abs(callProb - putProb) * 100;
    const minConfidence = parseInt(document.getElementById('minConfidence').value);
    
    let signal = 'WAIT';
    let direction = null;
    
    if (confidence >= minConfidence) {
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

function updateAIPrediction(prediction) {
    document.getElementById('aiPrediction').textContent = 
        `${prediction.signal} - ${prediction.confidence}% confidence`;
    document.getElementById('aiConfidence').textContent = `${prediction.confidence}%`;
    document.getElementById('aiSignal').textContent = prediction.signal;
    
    document.getElementById('callProbability').textContent = `${prediction.callProb}%`;
    document.getElementById('putProbability').textContent = `${prediction.putProb}%`;
    
    // Update probability bars
    document.getElementById('callProbBar').style.width = `${prediction.callProb}%`;
    document.getElementById('putProbBar').style.width = `${prediction.putProb}%`;
    
    // Update prediction display styling
    const predDisplay = document.getElementById('predictionDisplay');
    predDisplay.className = 'ai-prediction-box';
    
    if (prediction.signal === 'CALL') {
        predDisplay.classList.add('prediction-call');
    } else if (prediction.signal === 'PUT') {
        predDisplay.classList.add('prediction-put');
    }
    
    // Update signal strength
    document.getElementById('signalStrength').style.width = `${prediction.confidence}%`;
    document.getElementById('strengthPercent').textContent = `${prediction.confidence}%`;
}

function shouldAITrade() {
    if (!lastSignal || lastSignal.signal === 'WAIT') {
        console.log('AI Trade: No valid signal');
        return false;
    }
    
    const now = Date.now();
    if (now - lastTradeTime < 30000) { // 30 seconds between trades
        console.log('AI Trade: Too soon since last trade');
        return false;
    }
    
    if (isTrading) {
        console.log('AI Trade: Already trading');
        return false;
    }
    
    if (tradesThisHour >= 10) {
        console.log('AI Trade: Max trades per hour reached');
        return false;
    }
    
    console.log('AI Trade: All conditions met, ready to trade');
    return true;
}

function executeAITrade() {
    if (!lastSignal || !lastSignal.direction) {
        console.log('No valid signal for AI trade');
        return;
    }
    
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const duration = parseInt(document.getElementById('tradeDuration').value);
    
    console.log(`Executing AI trade: ${lastSignal.direction} with $${amount}`);
    placeTrade(lastSignal.direction, amount, duration, true);
}

function placeManualTrade(direction) {
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const duration = parseInt(document.getElementById('tradeDuration').value);
    
    placeTrade(direction, amount, duration, false);
}

function placeTrade(direction, amount, duration, isAI = false) {
    if (!isConnected) {
        showAlert('Please connect to Deriv first', 'error');
        return;
    }
    
    if (isTrading) {
        showAlert('Trade already in progress', 'error');
        return;
    }
    
    if (amount < 0.35) {
        showAlert('Minimum trade amount is $0.35', 'error');
        return;
    }
    
    if (amount > currentBalance) {
        showAlert('Insufficient balance', 'error');
        return;
    }
    
    isTrading = true;
    lastTradeTime = Date.now();
    tradesThisHour++;
    
    const contractType = direction === 'call' ? 'CALL' : 'PUT';
    
    const proposalRequest = {
        proposal: 1,
        amount: amount,
        basis: 'stake',
        contract_type: contractType,
        currency: 'USD',
        duration: duration,
        duration_unit: 't',
        symbol: currentMarket
    };
    
    console.log('Sending proposal:', proposalRequest);
    derivWs.send(JSON.stringify(proposalRequest));
    
    const originalOnMessage = derivWs.onmessage;
    derivWs.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.msg_type === 'proposal') {
            if (data.error) {
                showAlert(`Trade proposal failed: ${data.error.message}`, 'error');
                isTrading = false;
                derivWs.onmessage = originalOnMessage;
                return;
            }
            
            const buyRequest = {
                buy: data.proposal.id,
                price: amount
            };
            
            console.log('Buying contract:', buyRequest);
            derivWs.send(JSON.stringify(buyRequest));
        }
        
        if (data.msg_type === 'buy') {
            if (data.error) {
                showAlert(`Trade failed: ${data.error.message}`, 'error');
                isTrading = false;
            } else {
                const tradeType = isAI ? `AI ${direction.toUpperCase()}` : `Manual ${direction.toUpperCase()}`;
                showAlert(`${tradeType} trade placed!`, 'success');
                
                derivWs.send(JSON.stringify({
                    proposal_open_contract: 1,
                    contract_id: data.buy.contract_id,
                    subscribe: 1
                }));
                
                const trade = {
                    id: data.buy.contract_id,
                    type: tradeType,
                    direction: direction,
                    amount: amount,
                    time: new Date().toLocaleTimeString(),
                    status: 'open',
                    isAI: isAI,
                    market: currentMarket,
                    confidence: lastSignal ? lastSignal.confidence : 0
                };
                
                tradeHistory.unshift(trade);
                updateTradeHistory();
            }
            
            derivWs.onmessage = originalOnMessage;
        }
        
        originalOnMessage(event);
    };
}

function handleContractUpdate(data) {
    if (data.proposal_open_contract) {
        const contract = data.proposal_open_contract;
        
        const tradeIndex = tradeHistory.findIndex(t => t.id === contract.contract_id);
        if (tradeIndex !== -1) {
            const trade = tradeHistory[tradeIndex];
            
            if (contract.is_sold) {
                trade.status = contract.profit > 0 ? 'win' : 'loss';
                trade.profit = contract.profit;
                trade.payout = contract.payout;
                isTrading = false;
                
                todayProfit += contract.profit;
                
                if (trade.isAI) {
                    totalPredictions++;
                    if (contract.profit > 0) {
                        correctPredictions++;
                    }
                    updateNeuralNetwork(contract.profit > 0);
                }
                
                updateTradeHistory();
                updateTradeStats();
                
                const message = contract.profit > 0 
                    ? `🎉 ${trade.type} WON! Profit: $${contract.profit.toFixed(2)}`
                    : `😞 ${trade.type} LOST. Loss: $${Math.abs(contract.profit).toFixed(2)}`;
                
                showAlert(message, contract.profit > 0 ? 'success' : 'error');
            }
        }
    }
}

function updateNeuralNetwork(won) {
    const learningRate = neuralNetwork.learningRate;
    const adjustment = won ? learningRate : -learningRate;
    
    for (let i = 0; i < neuralNetwork.weights.length; i++) {
        neuralNetwork.weights[i] += adjustment * (Math.random() - 0.5);
    }
}

function toggleAITrade() {
    const toggle = document.getElementById('aiTradeToggle');
    aiTradeEnabled = toggle.checked;
    updateAITradeStatus();
    
    if (aiTradeEnabled && !isConnected) {
        showAlert('Please connect to Deriv first', 'error');
        toggle.checked = false;
        aiTradeEnabled = false;
        updateAITradeStatus();
        return;
    }
    
    const message = aiTradeEnabled 
        ? '🤖 AI Auto Trading ACTIVATED!' 
        : '⏹️ AI Auto Trading DEACTIVATED';
    showAlert(message, aiTradeEnabled ? 'success' : 'info');
    
    console.log(`AI Auto Trade: ${aiTradeEnabled ? 'ENABLED' : 'DISABLED'}`);
}

function updateConfidenceDisplay() {
    const confidence = document.getElementById('minConfidence').value;
    document.getElementById('confidenceDisplay').textContent = confidence + '%';
}

function updateDigitDisplay(digit) {
    const digitElement = document.getElementById('currentDigit');
    digitElement.textContent = digit;
    
    digitElement.className = 'current-digit';
    
    if (lastSignal && lastSignal.signal === 'CALL') {
        digitElement.classList.add('digit-call');
    } else if (lastSignal && lastSignal.signal === 'PUT') {
        digitElement.classList.add('digit-put');
    }
}

function updateRecentDigits() {
    const container = document.getElementById('recentDigits');
    container.innerHTML = recentDigits.slice(0, 10).map(digit => 
        `<div class="recent-digit">${digit}</div>`
    ).join('');
}

function updateMarketAnalysis() {
    const trend = calculateTrend();
    document.getElementById('marketTrend').textContent = trend;
    
    let volText = 'Low';
    if (volatilityIndex > 70) volText = 'Very High';
    else if (volatilityIndex > 50) volText = 'High';
    else if (volatilityIndex > 30) volText = 'Medium';
    
    document.getElementById('marketVolatility').textContent = volText;
    
    // Update pattern type
    const pattern = recognizePattern();
    document.getElementById('patternType').textContent = 
        pattern.direction === 'neutral' ? 'No Clear Pattern' : 
        `${pattern.direction.toUpperCase()} Pattern (${Math.round(pattern.strength * 100)}%)`;
}

function calculateTrend() {
    if (recentDigits.length < 10) return 'Insufficient Data';
    
    const last10 = recentDigits.slice(0, 10);
    const avg = last10.reduce((a, b) => a + b, 0) / 10;
    
    if (avg > 5.5) return 'Bullish';
    if (avg < 3.5) return 'Bearish';
    return 'Neutral';
}

function updateConnectionStatus() {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    
    if (isConnected) {
        statusIndicator.classList.add('connected');
        statusText.textContent = `Connected to ${currentMarket}`;
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
    } else {
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Disconnected';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
    }
}

function updateAITradeStatus() {
    document.getElementById('aiTradeStatus').textContent = aiTradeEnabled ? 'ON' : 'OFF';
}

function updateStats() {
    document.getElementById('totalTicks').textContent = tickCount;
    
    const accuracy = totalPredictions > 0 ? 
        Math.round((correctPredictions / totalPredictions) * 100) : 0;
    document.getElementById('aiAccuracy').textContent = accuracy + '%';
    
    document.getElementById('todayProfit').textContent = '$' + todayProfit.toFixed(2);
}

function updateBalance() {
    document.getElementById('balance').textContent = '$' + currentBalance.toFixed(2);
}

function updateTradeHistory() {
    const historyContainer = document.getElementById('tradeHistory');
    
    if (tradeHistory.length === 0) {
        historyContainer.innerHTML = '<div class="no-trades">No trades yet</div>';
        return;
    }
    
    historyContainer.innerHTML = tradeHistory.slice(0, 10).map(trade => `
        <div class="history-item ${trade.status}">
            <div class="trade-info">
                <strong>${trade.type}</strong>
                ${trade.isAI ? '🧠' : '👤'}
                <br>
                <small>${trade.time}</small>
            </div>
            <div class="trade-result">
                $${trade.amount.toFixed(2)}
                <br>
                <small class="${trade.status === 'win' ? 'profit' : trade.status === 'loss' ? 'loss' : 'pending'}">
                    ${trade.status === 'open' ? 'OPEN' : 
                        trade.status === 'win' ? `+$${trade.profit.toFixed(2)}` : 
                        trade.status === 'loss' ? `$${trade.profit.toFixed(2)}` : 'PENDING'}
                </small>
            </div>
        </div>
    `).join('');
}

function updateTradeStats() {
    const completedTrades = tradeHistory.filter(t => t.status === 'win' || t.status === 'loss');
    const wins = tradeHistory.filter(t => t.status === 'win').length;
    const winRate = completedTrades.length > 0 ? ((wins / completedTrades.length) * 100).toFixed(1) : 0;
    const totalProfit = tradeHistory.reduce((sum, trade) => {
        return sum + (trade.profit || 0);
    }, 0);
    
    document.getElementById('totalTrades').textContent = completedTrades.length;
    document.getElementById('winRate').textContent = winRate + '%';
}

// Reset hourly trade counter
setInterval(() => {
    tradesThisHour = 0;
}, 3600000);

// Initialize
updateConnectionStatus();
updateAITradeStatus();
updateStats();
updateBalance();
updateConfidenceDisplay();
