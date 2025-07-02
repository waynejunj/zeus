// Zeus Ultimate AI Trading System - Enhanced Version
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
        
        // Enhanced Neural Network with multiple layers
        this.neuralNetwork = {
            patterns: [],
            weights: {},
            learningRate: 0.015,
            momentum: 0.9,
            previousWeightChanges: {}, // Initialize this first
            layers: {
                input: 25,
                hidden1: 50,
                hidden2: 30,
                output: 2
            }
        };
        
        // Now initialize weights after previousWeightChanges is defined
        this.neuralNetwork.weights = this.initializeAdvancedWeights();
        
        // Advanced market analysis
        this.marketAnalysis = {
            volatility: 0,
            trend: 'neutral',
            momentum: 0,
            support: 0,
            resistance: 0,
            fibonacci: [],
            movingAverages: {
                sma5: 0,
                sma10: 0,
                sma20: 0,
                ema5: 0,
                ema10: 0
            }
        };
        
        // Risk management system
        this.riskManager = {
            maxConsecutiveLosses: 3,
            consecutiveLosses: 0,
            dailyLossLimit: 50,
            dailyLoss: 0,
            profitTarget: 100,
            dailyProfit: 0,
            martingaleMultiplier: 2.1,
            antiMartingaleMultiplier: 1.5,
            maxMartingaleSteps: 4,
            currentMartingaleStep: 0
        };
        
        // Pattern recognition system
        this.patternRecognition = {
            sequences: new Map(),
            frequencies: new Map(),
            correlations: new Map(),
            seasonality: new Map(),
            cyclicalPatterns: []
        };
        
        // Advanced prediction models
        this.predictionModels = {
            lstm: new LSTMModel(),
            randomForest: new RandomForestModel(),
            svm: new SVMModel(),
            ensemble: new EnsembleModel()
        };
        
        this.initializeEventListeners();
        this.startAdvancedAIAnalysis();
        this.updateUI();
        this.initializeAdvancedFeatures();
    }
    
    initializeAdvancedWeights() {
        const weights = {};
        const patterns = [
            'consecutive_same', 'alternating', 'ascending', 'descending',
            'even_odd_pattern', 'fibonacci_like', 'prime_pattern', 'sum_pattern',
            'volatility_pattern', 'momentum_pattern', 'trend_reversal', 'support_resistance',
            'moving_average_cross', 'rsi_pattern', 'bollinger_pattern', 'macd_pattern',
            'volume_pattern', 'time_pattern', 'seasonal_pattern', 'correlation_pattern',
            'fractal_pattern', 'chaos_pattern', 'neural_pattern', 'genetic_pattern',
            'quantum_pattern'
        ];
        
        patterns.forEach(pattern => {
            weights[pattern] = (Math.random() * 2 - 1) * 0.5; // Smaller initial weights
            // Ensure previousWeightChanges exists before accessing it
            if (this.neuralNetwork && this.neuralNetwork.previousWeightChanges) {
                this.neuralNetwork.previousWeightChanges[pattern] = 0;
            }
        });
        
        return weights;
    }
    
    initializeAdvancedFeatures() {
        // Initialize pattern recognition database
        this.loadPatternDatabase();
        
        // Start market sentiment analysis
        this.startSentimentAnalysis();
        
        // Initialize risk management
        this.initializeRiskManagement();
        
        // Start advanced analytics
        this.startAdvancedAnalytics();
    }
    
    loadPatternDatabase() {
        // Load historical patterns from localStorage
        const savedPatterns = localStorage.getItem('zeusPatterns');
        if (savedPatterns) {
            try {
                const patterns = JSON.parse(savedPatterns);
                this.patternRecognition.sequences = new Map(patterns.sequences || []);
                this.patternRecognition.frequencies = new Map(patterns.frequencies || []);
                this.patternRecognition.correlations = new Map(patterns.correlations || []);
            } catch (error) {
                console.error('Error loading pattern database:', error);
            }
        }
    }
    
    savePatternDatabase() {
        const patterns = {
            sequences: Array.from(this.patternRecognition.sequences.entries()),
            frequencies: Array.from(this.patternRecognition.frequencies.entries()),
            correlations: Array.from(this.patternRecognition.correlations.entries())
        };
        localStorage.setItem('zeusPatterns', JSON.stringify(patterns));
    }
    
    startSentimentAnalysis() {
        setInterval(() => {
            this.analyzeSentiment();
        }, 5000);
    }
    
    analyzeSentiment() {
        if (this.recentDigits.length < 20) return;
        
        const recentData = this.recentDigits.slice(-20);
        
        // Calculate market sentiment indicators
        const bullishSignals = this.calculateBullishSignals(recentData);
        const bearishSignals = this.calculateBearishSignals(recentData);
        const neutralSignals = 100 - bullishSignals - bearishSignals;
        
        // Update sentiment display
        this.updateSentimentDisplay(bullishSignals, bearishSignals, neutralSignals);
    }
    
    calculateBullishSignals(data) {
        let bullishScore = 0;
        
        // Ascending trend
        const ascendingCount = data.filter((val, i) => i > 0 && val > data[i-1]).length;
        bullishScore += (ascendingCount / (data.length - 1)) * 30;
        
        // Higher highs pattern
        const highs = this.findLocalMaxima(data);
        if (highs.length >= 2 && highs[highs.length-1] > highs[highs.length-2]) {
            bullishScore += 20;
        }
        
        // Volume analysis (simulated)
        const avgVolume = this.calculateAverageVolume(data);
        if (avgVolume > 0.7) {
            bullishScore += 15;
        }
        
        // Momentum indicators
        const momentum = this.calculateMomentum(data);
        if (momentum > 0) {
            bullishScore += momentum * 35;
        }
        
        return Math.min(bullishScore, 100);
    }
    
    calculateBearishSignals(data) {
        let bearishScore = 0;
        
        // Descending trend
        const descendingCount = data.filter((val, i) => i > 0 && val < data[i-1]).length;
        bearishScore += (descendingCount / (data.length - 1)) * 30;
        
        // Lower lows pattern
        const lows = this.findLocalMinima(data);
        if (lows.length >= 2 && lows[lows.length-1] < lows[lows.length-2]) {
            bearishScore += 20;
        }
        
        // Negative momentum
        const momentum = this.calculateMomentum(data);
        if (momentum < 0) {
            bearishScore += Math.abs(momentum) * 35;
        }
        
        // Volatility spike (often bearish)
        const volatility = this.calculateVolatility(data);
        if (volatility > 0.8) {
            bearishScore += 15;
        }
        
        return Math.min(bearishScore, 100);
    }
    
    findLocalMaxima(data) {
        const maxima = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i-1] && data[i] > data[i+1]) {
                maxima.push(data[i]);
            }
        }
        return maxima;
    }
    
    findLocalMinima(data) {
        const minima = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] < data[i-1] && data[i] < data[i+1]) {
                minima.push(data[i]);
            }
        }
        return minima;
    }
    
    calculateAverageVolume(data) {
        // Simulate volume based on digit variance
        const variance = this.calculateVariance(data);
        return Math.min(variance / 10, 1);
    }
    
    calculateMomentum(data) {
        if (data.length < 5) return 0;
        
        const recent = data.slice(-5);
        const older = data.slice(-10, -5);
        
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        
        return (recentAvg - olderAvg) / 10; // Normalize
    }
    
    calculateVolatility(data) {
        const variance = this.calculateVariance(data);
        return Math.sqrt(variance) / 10; // Normalize
    }
    
    calculateVariance(data) {
        const mean = data.reduce((a, b) => a + b) / data.length;
        const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b) / data.length;
    }
    
    initializeRiskManagement() {
        // Load risk settings from localStorage
        const savedRisk = localStorage.getItem('zeusRiskSettings');
        if (savedRisk) {
            try {
                const riskSettings = JSON.parse(savedRisk);
                Object.assign(this.riskManager, riskSettings);
            } catch (error) {
                console.error('Error loading risk settings:', error);
            }
        }
    }
    
    saveRiskSettings() {
        localStorage.setItem('zeusRiskSettings', JSON.stringify(this.riskManager));
    }
    
    startAdvancedAnalytics() {
        setInterval(() => {
            this.performAdvancedAnalysis();
        }, 2000);
    }
    
    performAdvancedAnalysis() {
        if (this.recentDigits.length < 30) return;
        
        // Update moving averages
        this.updateMovingAverages();
        
        // Analyze support and resistance
        this.analyzeSupportResistance();
        
        // Calculate technical indicators
        this.calculateTechnicalIndicators();
        
        // Update pattern recognition
        this.updatePatternRecognition();
        
        // Perform ensemble prediction
        this.performEnsemblePrediction();
    }
    
    updateMovingAverages() {
        const data = this.recentDigits.slice(-20);
        
        // Simple Moving Averages
        this.marketAnalysis.movingAverages.sma5 = this.calculateSMA(data, 5);
        this.marketAnalysis.movingAverages.sma10 = this.calculateSMA(data, 10);
        this.marketAnalysis.movingAverages.sma20 = this.calculateSMA(data, 20);
        
        // Exponential Moving Averages
        this.marketAnalysis.movingAverages.ema5 = this.calculateEMA(data, 5);
        this.marketAnalysis.movingAverages.ema10 = this.calculateEMA(data, 10);
    }
    
    calculateSMA(data, period) {
        if (data.length < period) return 0;
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b) / period;
    }
    
    calculateEMA(data, period) {
        if (data.length < period) return 0;
        
        const multiplier = 2 / (period + 1);
        let ema = data[0];
        
        for (let i = 1; i < data.length; i++) {
            ema = (data[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }
    
    analyzeSupportResistance() {
        const data = this.recentDigits.slice(-50);
        if (data.length < 20) return;
        
        // Find support levels (local minima)
        const supports = this.findLocalMinima(data);
        this.marketAnalysis.support = supports.length > 0 ? Math.min(...supports) : 0;
        
        // Find resistance levels (local maxima)
        const resistances = this.findLocalMaxima(data);
        this.marketAnalysis.resistance = resistances.length > 0 ? Math.max(...resistances) : 9;
        
        // Update display
        document.getElementById('supportLevel').textContent = this.marketAnalysis.support.toFixed(0);
        document.getElementById('resistanceLevel').textContent = this.marketAnalysis.resistance.toFixed(0);
    }
    
    calculateTechnicalIndicators() {
        const data = this.recentDigits.slice(-30);
        
        // RSI (Relative Strength Index)
        const rsi = this.calculateRSI(data, 14);
        
        // MACD
        const macd = this.calculateMACD(data);
        
        // Bollinger Bands
        const bollinger = this.calculateBollingerBands(data, 20, 2);
        
        // Update volatility index
        this.marketAnalysis.volatility = this.calculateVolatility(data);
        document.getElementById('volatilityIndex').textContent = `${(this.marketAnalysis.volatility * 100).toFixed(1)}%`;
        
        // Update trend strength
        const trendStrength = this.calculateTrendStrength(data);
        document.getElementById('trendStrengthValue').textContent = `${(trendStrength * 100).toFixed(1)}%`;
    }
    
    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = data[i] - data[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (data.length < slowPeriod) return { macd: 0, signal: 0, histogram: 0 };
        
        const fastEMA = this.calculateEMA(data, fastPeriod);
        const slowEMA = this.calculateEMA(data, slowPeriod);
        const macd = fastEMA - slowEMA;
        
        // For simplicity, using a basic signal calculation
        const signal = macd * 0.8; // Simplified
        const histogram = macd - signal;
        
        return { macd, signal, histogram };
    }
    
    calculateBollingerBands(data, period = 20, stdDev = 2) {
        if (data.length < period) return { upper: 9, middle: 5, lower: 0 };
        
        const sma = this.calculateSMA(data, period);
        const variance = this.calculateVariance(data.slice(-period));
        const standardDeviation = Math.sqrt(variance);
        
        return {
            upper: sma + (standardDeviation * stdDev),
            middle: sma,
            lower: sma - (standardDeviation * stdDev)
        };
    }
    
    calculateTrendStrength(data) {
        if (data.length < 10) return 0;
        
        const recent = data.slice(-10);
        let upMoves = 0;
        let downMoves = 0;
        
        for (let i = 1; i < recent.length; i++) {
            if (recent[i] > recent[i-1]) upMoves++;
            else if (recent[i] < recent[i-1]) downMoves++;
        }
        
        const totalMoves = upMoves + downMoves;
        if (totalMoves === 0) return 0;
        
        return Math.abs(upMoves - downMoves) / totalMoves;
    }
    
    updatePatternRecognition() {
        if (this.recentDigits.length < 10) return;
        
        // Analyze sequences
        this.analyzeSequencePatterns();
        
        // Update frequency analysis
        this.updateFrequencyAnalysis();
        
        // Detect cyclical patterns
        this.detectCyclicalPatterns();
        
        // Save patterns to database
        this.savePatternDatabase();
    }
    
    analyzeSequencePatterns() {
        const sequences = this.recentDigits.slice(-10);
        
        for (let length = 3; length <= 5; length++) {
            for (let i = 0; i <= sequences.length - length; i++) {
                const pattern = sequences.slice(i, i + length).join('');
                const nextDigit = sequences[i + length];
                
                if (nextDigit !== undefined) {
                    const key = `${pattern}->${nextDigit}`;
                    const count = this.patternRecognition.sequences.get(key) || 0;
                    this.patternRecognition.sequences.set(key, count + 1);
                }
            }
        }
    }
    
    updateFrequencyAnalysis() {
        const lastDigit = this.recentDigits[this.recentDigits.length - 1];
        if (lastDigit !== undefined) {
            const count = this.patternRecognition.frequencies.get(lastDigit) || 0;
            this.patternRecognition.frequencies.set(lastDigit, count + 1);
        }
    }
    
    detectCyclicalPatterns() {
        if (this.recentDigits.length < 20) return;
        
        const data = this.recentDigits.slice(-20);
        
        // Look for repeating cycles of different lengths
        for (let cycleLength = 2; cycleLength <= 8; cycleLength++) {
            const cycles = [];
            for (let i = 0; i <= data.length - cycleLength; i++) {
                cycles.push(data.slice(i, i + cycleLength));
            }
            
            // Find repeating cycles
            const cycleMap = new Map();
            cycles.forEach(cycle => {
                const key = cycle.join('');
                const count = cycleMap.get(key) || 0;
                cycleMap.set(key, count + 1);
            });
            
            // Store significant cycles
            cycleMap.forEach((count, pattern) => {
                if (count >= 2) {
                    this.patternRecognition.cyclicalPatterns.push({
                        pattern: pattern.split('').map(Number),
                        frequency: count,
                        length: cycleLength
                    });
                }
            });
        }
    }
    
    performEnsemblePrediction() {
        if (this.recentDigits.length < 20) return;
        
        // Get predictions from multiple models
        const predictions = {
            neural: this.getNeuralPrediction(),
            pattern: this.getPatternPrediction(),
            technical: this.getTechnicalPrediction(),
            sentiment: this.getSentimentPrediction(),
            cyclical: this.getCyclicalPrediction()
        };
        
        // Combine predictions using weighted ensemble
        const weights = {
            neural: 0.3,
            pattern: 0.25,
            technical: 0.2,
            sentiment: 0.15,
            cyclical: 0.1
        };
        
        let callScore = 0;
        let putScore = 0;
        
        Object.keys(predictions).forEach(model => {
            const pred = predictions[model];
            const weight = weights[model];
            
            callScore += pred.callProbability * weight;
            putScore += pred.putProbability * weight;
        });
        
        // Normalize scores
        const total = callScore + putScore;
        const finalCallProb = total > 0 ? (callScore / total) * 100 : 50;
        const finalPutProb = total > 0 ? (putScore / total) * 100 : 50;
        
        const direction = finalCallProb > finalPutProb ? 'call' : 'put';
        const confidence = Math.max(finalCallProb, finalPutProb);
        
        const ensemblePrediction = {
            direction,
            confidence: Math.round(confidence),
            callProbability: Math.round(finalCallProb),
            putProbability: Math.round(finalPutProb)
        };
        
        this.updatePredictionDisplay(ensemblePrediction);
        
        return ensemblePrediction;
    }
    
    getNeuralPrediction() {
        const patterns = this.analyzeAdvancedPatterns();
        return this.calculateAdvancedPrediction(patterns);
    }
    
    getPatternPrediction() {
        if (this.recentDigits.length < 5) {
            return { callProbability: 50, putProbability: 50 };
        }
        
        const lastPattern = this.recentDigits.slice(-4).join('');
        let callCount = 0;
        let putCount = 0;
        
        // Check historical outcomes for this pattern
        this.patternRecognition.sequences.forEach((count, key) => {
            if (key.startsWith(lastPattern)) {
                const outcome = parseInt(key.split('->')[1]);
                const lastDigit = this.recentDigits[this.recentDigits.length - 1];
                
                if (outcome > lastDigit) {
                    callCount += count;
                } else if (outcome < lastDigit) {
                    putCount += count;
                }
            }
        });
        
        const total = callCount + putCount;
        if (total === 0) {
            return { callProbability: 50, putProbability: 50 };
        }
        
        return {
            callProbability: (callCount / total) * 100,
            putProbability: (putCount / total) * 100
        };
    }
    
    getTechnicalPrediction() {
        const data = this.recentDigits.slice(-20);
        if (data.length < 10) {
            return { callProbability: 50, putProbability: 50 };
        }
        
        let technicalScore = 0;
        
        // Moving average crossover
        const sma5 = this.marketAnalysis.movingAverages.sma5;
        const sma10 = this.marketAnalysis.movingAverages.sma10;
        if (sma5 > sma10) technicalScore += 20;
        else technicalScore -= 20;
        
        // RSI analysis
        const rsi = this.calculateRSI(data);
        if (rsi < 30) technicalScore += 30; // Oversold, expect bounce
        else if (rsi > 70) technicalScore -= 30; // Overbought, expect decline
        
        // Bollinger Bands
        const bollinger = this.calculateBollingerBands(data);
        const currentPrice = data[data.length - 1];
        if (currentPrice < bollinger.lower) technicalScore += 25;
        else if (currentPrice > bollinger.upper) technicalScore -= 25;
        
        // Momentum
        const momentum = this.calculateMomentum(data);
        technicalScore += momentum * 25;
        
        // Convert to probabilities
        const normalizedScore = Math.max(-100, Math.min(100, technicalScore));
        const callProb = 50 + (normalizedScore / 2);
        const putProb = 100 - callProb;
        
        return {
            callProbability: callProb,
            putProbability: putProb
        };
    }
    
    getSentimentPrediction() {
        const data = this.recentDigits.slice(-15);
        const bullishSignals = this.calculateBullishSignals(data);
        const bearishSignals = this.calculateBearishSignals(data);
        
        return {
            callProbability: bullishSignals,
            putProbability: bearishSignals
        };
    }
    
    getCyclicalPrediction() {
        if (this.patternRecognition.cyclicalPatterns.length === 0) {
            return { callProbability: 50, putProbability: 50 };
        }
        
        const recentData = this.recentDigits.slice(-8);
        let bestMatch = null;
        let bestScore = 0;
        
        // Find the best matching cyclical pattern
        this.patternRecognition.cyclicalPatterns.forEach(cycle => {
            if (cycle.pattern.length <= recentData.length) {
                const score = this.calculatePatternSimilarity(
                    recentData.slice(-cycle.pattern.length),
                    cycle.pattern
                );
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = cycle;
                }
            }
        });
        
        if (!bestMatch || bestScore < 0.7) {
            return { callProbability: 50, putProbability: 50 };
        }
        
        // Predict next value based on cycle
        const currentPos = recentData.length % bestMatch.pattern.length;
        const nextPos = (currentPos + 1) % bestMatch.pattern.length;
        const predictedNext = bestMatch.pattern[nextPos];
        const currentDigit = recentData[recentData.length - 1];
        
        if (predictedNext > currentDigit) {
            return { callProbability: 70, putProbability: 30 };
        } else if (predictedNext < currentDigit) {
            return { callProbability: 30, putProbability: 70 };
        } else {
            return { callProbability: 50, putProbability: 50 };
        }
    }
    
    calculatePatternSimilarity(pattern1, pattern2) {
        if (pattern1.length !== pattern2.length) return 0;
        
        let matches = 0;
        for (let i = 0; i < pattern1.length; i++) {
            if (pattern1[i] === pattern2[i]) matches++;
        }
        
        return matches / pattern1.length;
    }
    
    analyzeAdvancedPatterns() {
        const digits = this.recentDigits.slice(-25);
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
        patterns.volatility_pattern = this.analyzeVolatilityPattern(digits);
        patterns.momentum_pattern = this.analyzeMomentumPattern(digits);
        patterns.trend_reversal = this.analyzeTrendReversal(digits);
        patterns.support_resistance = this.analyzeSupportResistancePattern(digits);
        patterns.moving_average_cross = this.analyzeMovingAverageCross(digits);
        patterns.rsi_pattern = this.analyzeRSIPattern(digits);
        patterns.bollinger_pattern = this.analyzeBollingerPattern(digits);
        patterns.macd_pattern = this.analyzeMACDPattern(digits);
        patterns.volume_pattern = this.analyzeVolumePattern(digits);
        patterns.time_pattern = this.analyzeTimePattern(digits);
        patterns.seasonal_pattern = this.analyzeSeasonalPattern(digits);
        patterns.correlation_pattern = this.analyzeCorrelationPattern(digits);
        patterns.fractal_pattern = this.analyzeFractalPattern(digits);
        patterns.chaos_pattern = this.analyzeChaosPattern(digits);
        patterns.neural_pattern = this.analyzeNeuralPattern(digits);
        patterns.genetic_pattern = this.analyzeGeneticPattern(digits);
        patterns.quantum_pattern = this.analyzeQuantumPattern(digits);
        
        return patterns;
    }
    
    analyzeConsecutiveSame(digits) {
        if (digits.length < 2) return 0;
        let consecutive = 0;
        let maxConsecutive = 0;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] === digits[i-1]) {
                consecutive++;
                maxConsecutive = Math.max(maxConsecutive, consecutive);
            } else {
                consecutive = 0;
            }
        }
        
        return maxConsecutive / digits.length;
    }
    
    analyzeAlternating(digits) {
        if (digits.length < 3) return 0;
        let alternating = 0;
        
        for (let i = 2; i < digits.length; i++) {
            if ((digits[i] > digits[i-1] && digits[i-1] < digits[i-2]) ||
                (digits[i] < digits[i-1] && digits[i-1] > digits[i-2])) {
                alternating++;
            }
        }
        
        return alternating / (digits.length - 2);
    }
    
    analyzeAscending(digits) {
        if (digits.length < 2) return 0;
        let ascending = 0;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] > digits[i-1]) {
                ascending++;
            }
        }
        
        return ascending / (digits.length - 1);
    }
    
    analyzeDescending(digits) {
        if (digits.length < 2) return 0;
        let descending = 0;
        
        for (let i = 1; i < digits.length; i++) {
            if (digits[i] < digits[i-1]) {
                descending++;
            }
        }
        
        return descending / (digits.length - 1);
    }
    
    analyzeEvenOdd(digits) {
        const evenCount = digits.filter(d => d % 2 === 0).length;
        const oddCount = digits.length - evenCount;
        return Math.abs(evenCount - oddCount) / digits.length;
    }
    
    analyzeFibonacci(digits) {
        const fibSequence = [0, 1, 1, 2, 3, 5, 8];
        let fibMatches = 0;
        
        for (let i = 0; i < digits.length - 2; i++) {
            const sum = digits[i] + digits[i+1];
            if (sum === digits[i+2] || fibSequence.includes(digits[i])) {
                fibMatches++;
            }
        }
        
        return fibMatches / Math.max(digits.length - 2, 1);
    }
    
    analyzePrimes(digits) {
        const primes = [2, 3, 5, 7];
        const primeCount = digits.filter(d => primes.includes(d)).length;
        return primeCount / digits.length;
    }
    
    analyzeSumPatterns(digits) {
        if (digits.length < 3) return 0;
        let sumPatterns = 0;
        
        for (let i = 0; i < digits.length - 2; i++) {
            const sum = (digits[i] + digits[i+1]) % 10;
            if (sum === digits[i+2]) {
                sumPatterns++;
            }
        }
        
        return sumPatterns / (digits.length - 2);
    }
    
    analyzeVolatilityPattern(digits) {
        const volatility = this.calculateVolatility(digits);
        return Math.min(volatility, 1);
    }
    
    analyzeMomentumPattern(digits) {
        const momentum = this.calculateMomentum(digits);
        return Math.max(-1, Math.min(1, momentum));
    }
    
    analyzeTrendReversal(digits) {
        if (digits.length < 10) return 0;
        
        const recent = digits.slice(-5);
        const older = digits.slice(-10, -5);
        
        const recentTrend = this.calculateTrend(recent);
        const olderTrend = this.calculateTrend(older);
        
        // Check for trend reversal
        if ((recentTrend > 0 && olderTrend < 0) || (recentTrend < 0 && olderTrend > 0)) {
            return 1;
        }
        
        return 0;
    }
    
    calculateTrend(data) {
        if (data.length < 2) return 0;
        
        let upCount = 0;
        let downCount = 0;
        
        for (let i = 1; i < data.length; i++) {
            if (data[i] > data[i-1]) upCount++;
            else if (data[i] < data[i-1]) downCount++;
        }
        
        return (upCount - downCount) / (data.length - 1);
    }
    
    analyzeSupportResistancePattern(digits) {
        const currentDigit = digits[digits.length - 1];
        const support = this.marketAnalysis.support;
        const resistance = this.marketAnalysis.resistance;
        
        if (currentDigit <= support + 0.5) return 0.8; // Near support, likely bounce
        if (currentDigit >= resistance - 0.5) return -0.8; // Near resistance, likely decline
        
        return 0;
    }
    
    analyzeMovingAverageCross(digits) {
        const sma5 = this.marketAnalysis.movingAverages.sma5;
        const sma10 = this.marketAnalysis.movingAverages.sma10;
        
        if (sma5 > sma10) return 0.6; // Bullish cross
        if (sma5 < sma10) return -0.6; // Bearish cross
        
        return 0;
    }
    
    analyzeRSIPattern(digits) {
        const rsi = this.calculateRSI(digits);
        
        if (rsi < 30) return 0.7; // Oversold
        if (rsi > 70) return -0.7; // Overbought
        
        return (50 - rsi) / 50; // Normalized RSI
    }
    
    analyzeBollingerPattern(digits) {
        const bollinger = this.calculateBollingerBands(digits);
        const currentPrice = digits[digits.length - 1];
        
        if (currentPrice < bollinger.lower) return 0.8; // Below lower band
        if (currentPrice > bollinger.upper) return -0.8; // Above upper band
        
        return 0;
    }
    
    analyzeMACDPattern(digits) {
        const macd = this.calculateMACD(digits);
        
        if (macd.macd > macd.signal) return 0.5; // Bullish
        if (macd.macd < macd.signal) return -0.5; // Bearish
        
        return 0;
    }
    
    analyzeVolumePattern(digits) {
        const volume = this.calculateAverageVolume(digits);
        return Math.min(volume, 1);
    }
    
    analyzeTimePattern(digits) {
        const hour = new Date().getHours();
        
        // Market hours pattern (simplified)
        if (hour >= 8 && hour <= 16) return 0.3; // Active hours
        if (hour >= 20 || hour <= 4) return -0.2; // Low activity
        
        return 0;
    }
    
    analyzeSeasonalPattern(digits) {
        const day = new Date().getDay();
        const month = new Date().getMonth();
        
        // Weekly pattern
        let seasonalScore = 0;
        if (day >= 1 && day <= 5) seasonalScore += 0.2; // Weekdays
        
        // Monthly pattern (simplified)
        if (month >= 3 && month <= 8) seasonalScore += 0.1; // Active months
        
        return seasonalScore;
    }
    
    analyzeCorrelationPattern(digits) {
        if (digits.length < 10) return 0;
        
        const correlations = [];
        for (let lag = 1; lag <= 5; lag++) {
            const correlation = this.calculateAutocorrelation(digits, lag);
            correlations.push(correlation);
        }
        
        return correlations.reduce((a, b) => a + b) / correlations.length;
    }
    
    calculateAutocorrelation(data, lag) {
        if (data.length <= lag) return 0;
        
        const n = data.length - lag;
        const mean = data.reduce((a, b) => a + b) / data.length;
        
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
            numerator += (data[i] - mean) * (data[i + lag] - mean);
        }
        
        for (let i = 0; i < data.length; i++) {
            denominator += Math.pow(data[i] - mean, 2);
        }
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    analyzeFractalPattern(digits) {
        // Simplified fractal analysis
        const fractals = this.findFractals(digits);
        return fractals.length / digits.length;
    }
    
    findFractals(data) {
        const fractals = [];
        for (let i = 2; i < data.length - 2; i++) {
            // Bullish fractal
            if (data[i] < data[i-1] && data[i] < data[i-2] && 
                data[i] < data[i+1] && data[i] < data[i+2]) {
                fractals.push({ type: 'bullish', index: i, value: data[i] });
            }
            // Bearish fractal
            if (data[i] > data[i-1] && data[i] > data[i-2] && 
                data[i] > data[i+1] && data[i] > data[i+2]) {
                fractals.push({ type: 'bearish', index: i, value: data[i] });
            }
        }
        return fractals;
    }
    
    analyzeChaosPattern(digits) {
        // Simplified chaos theory application
        const lyapunov = this.calculateLyapunovExponent(digits);
        return Math.max(-1, Math.min(1, lyapunov));
    }
    
    calculateLyapunovExponent(data) {
        if (data.length < 10) return 0;
        
        let sum = 0;
        for (let i = 1; i < data.length; i++) {
            const ratio = Math.abs(data[i] - data[i-1]) + 0.001; // Avoid log(0)
            sum += Math.log(ratio);
        }
        
        return sum / (data.length - 1);
    }
    
    analyzeNeuralPattern(digits) {
        // Use existing neural network weights as pattern indicator
        const avgWeight = Object.values(this.neuralNetwork.weights)
            .reduce((a, b) => a + b, 0) / Object.keys(this.neuralNetwork.weights).length;
        
        return Math.max(-1, Math.min(1, avgWeight));
    }
    
    analyzeGeneticPattern(digits) {
        // Simplified genetic algorithm pattern
        const fitness = this.calculateFitness(digits);
        return Math.max(-1, Math.min(1, fitness));
    }
    
    calculateFitness(data) {
        // Fitness based on pattern consistency
        let consistency = 0;
        for (let i = 2; i < data.length; i++) {
            const trend1 = data[i-1] - data[i-2];
            const trend2 = data[i] - data[i-1];
            
            if ((trend1 > 0 && trend2 > 0) || (trend1 < 0 && trend2 < 0)) {
                consistency++;
            }
        }
        
        return (consistency / (data.length - 2)) * 2 - 1; // Normalize to [-1, 1]
    }
    
    analyzeQuantumPattern(digits) {
        // Simplified quantum-inspired pattern analysis
        const entropy = this.calculateEntropy(digits);
        return Math.max(-1, Math.min(1, entropy - 0.5));
    }
    
    calculateEntropy(data) {
        const frequencies = new Map();
        data.forEach(digit => {
            frequencies.set(digit, (frequencies.get(digit) || 0) + 1);
        });
        
        let entropy = 0;
        const total = data.length;
        
        frequencies.forEach(count => {
            const probability = count / total;
            entropy -= probability * Math.log2(probability);
        });
        
        return entropy / Math.log2(10); // Normalize for digits 0-9
    }
    
    calculateAdvancedPrediction(patterns) {
        let callScore = 0;
        let putScore = 0;
        
        // Apply enhanced neural network with momentum
        for (let pattern in patterns) {
            const weight = this.neuralNetwork.weights[pattern] || 0;
            const value = patterns[pattern] * weight;
            
            if (value > 0) {
                callScore += value;
            } else {
                putScore += Math.abs(value);
            }
        }
        
        // Apply momentum to weights
        this.applyMomentum(patterns);
        
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
    
    applyMomentum(patterns) {
        for (let pattern in patterns) {
            if (this.neuralNetwork.weights[pattern] !== undefined) {
                const previousChange = this.neuralNetwork.previousWeightChanges[pattern] || 0;
                const currentChange = this.neuralNetwork.learningRate * patterns[pattern];
                const momentumChange = this.neuralNetwork.momentum * previousChange;
                
                this.neuralNetwork.weights[pattern] += currentChange + momentumChange;
                this.neuralNetwork.previousWeightChanges[pattern] = currentChange + momentumChange;
            }
        }
    }
    
    // Enhanced risk management
    checkRiskManagement(direction, amount) {
        // Check daily loss limit
        if (this.riskManager.dailyLoss >= this.riskManager.dailyLossLimit) {
            this.logAIActivity('Daily loss limit reached. Trading suspended.');
            return false;
        }
        
        // Check consecutive losses
        if (this.riskManager.consecutiveLosses >= this.riskManager.maxConsecutiveLosses) {
            this.logAIActivity('Max consecutive losses reached. Reducing trade size.');
            return false;
        }
        
        // Check if profit target reached
        if (this.riskManager.dailyProfit >= this.riskManager.profitTarget) {
            this.logAIActivity('Daily profit target reached. Consider stopping.');
            return true; // Still allow trading but log the achievement
        }
        
        return true;
    }
    
    calculateOptimalTradeSize(baseAmount, prediction) {
        let optimalAmount = baseAmount;
        
        // Adjust based on confidence
        const confidenceMultiplier = prediction.confidence / 100;
        optimalAmount *= (0.5 + confidenceMultiplier * 0.5);
        
        // Apply martingale if enabled
        if (document.getElementById('martingaleEnabled')?.checked && 
            this.riskManager.consecutiveLosses > 0) {
            const martingaleStep = Math.min(this.riskManager.consecutiveLosses, 
                                          this.riskManager.maxMartingaleSteps);
            optimalAmount *= Math.pow(this.riskManager.martingaleMultiplier, martingaleStep);
        }
        
        // Apply anti-martingale if enabled
        if (document.getElementById('antiMartingaleEnabled')?.checked && 
            this.winStreak > 0) {
            optimalAmount *= Math.pow(this.riskManager.antiMartingaleMultiplier, 
                                    Math.min(this.winStreak, 3));
        }
        
        // Ensure amount doesn't exceed balance percentage
        const maxAmount = this.balance * 0.1; // Max 10% of balance per trade
        optimalAmount = Math.min(optimalAmount, maxAmount);
        
        // Ensure minimum amount
        optimalAmount = Math.max(optimalAmount, 0.35);
        
        return Math.round(optimalAmount * 100) / 100; // Round to 2 decimal places
    }
    
    checkAutoTrade() {
        const prediction = this.performEnsemblePrediction();
        const minConfidence = parseInt(document.getElementById('minConfidence').value);
        
        if (prediction.confidence >= minConfidence) {
            const baseAmount = parseFloat(document.getElementById('tradeAmount').value);
            const duration = document.getElementById('tradeDuration').value;
            
            // Check risk management
            if (!this.checkRiskManagement(prediction.direction, baseAmount)) {
                return;
            }
            
            // Calculate optimal trade size
            const optimalAmount = this.calculateOptimalTradeSize(baseAmount, prediction);
            
            this.placeAITrade(prediction.direction, optimalAmount, duration, prediction);
        }
    }
    
    placeAITrade(direction, amount, duration, prediction) {
        this.logAIActivity(`AI Signal: ${direction.toUpperCase()} (${prediction.confidence}% confidence)`);
        this.logAIActivity(`Placing optimized trade: $${amount} for ${duration} ticks`);
        this.placeTrade(direction, amount, duration, 'ai');
    }
    
    // Enhanced UI updates
    updateSentimentDisplay(bullish, bearish, neutral) {
        document.getElementById('bullishSentiment').textContent = `${bullish.toFixed(1)}%`;
        document.getElementById('bearishSentiment').textContent = `${bearish.toFixed(1)}%`;
        document.getElementById('neutralSentiment').textContent = `${neutral.toFixed(1)}%`;
    }
    
    updateAnalyticsDisplay(patterns) {
        // Update pattern analysis
        const trendDirection = patterns.ascending > patterns.descending ? 'Bullish' : 
                              patterns.descending > patterns.ascending ? 'Bearish' : 'Neutral';
        document.getElementById('trendDirection').textContent = trendDirection;
        
        const volatilityLevel = patterns.volatility_pattern > 0.7 ? 'High' :
                               patterns.volatility_pattern > 0.3 ? 'Medium' : 'Low';
        document.getElementById('volatilityLevel').textContent = volatilityLevel;
        
        // Update pattern strength
        const avgPatternStrength = Object.values(patterns).reduce((a, b) => a + Math.abs(b), 0) / Object.keys(patterns).length;
        const strengthPercentage = Math.min(avgPatternStrength * 100, 100);
        document.getElementById('patternStrength').style.width = `${strengthPercentage}%`;
        
        // Update signal indicators
        this.updateSignalIndicators(patterns);
    }
    
    updateSignalIndicators(patterns) {
        const trendIndicator = document.getElementById('trendIndicator');
        const momentumIndicator = document.getElementById('momentumIndicator');
        const volumeIndicator = document.getElementById('volumeIndicator');
        
        // Update trend indicator
        if (patterns.trend_reversal > 0.5) {
            trendIndicator.classList.add('active');
        } else {
            trendIndicator.classList.remove('active');
        }
        
        // Update momentum indicator
        if (Math.abs(patterns.momentum_pattern) > 0.3) {
            momentumIndicator.classList.add('active');
        } else {
            momentumIndicator.classList.remove('active');
        }
        
        // Update volume indicator
        if (patterns.volume_pattern > 0.5) {
            volumeIndicator.classList.add('active');
        } else {
            volumeIndicator.classList.remove('active');
        }
        
        // Update signal strength meter
        const overallStrength = (Math.abs(patterns.trend_reversal) + 
                               Math.abs(patterns.momentum_pattern) + 
                               patterns.volume_pattern) / 3 * 100;
        
        document.getElementById('signalStrengthValue').textContent = `${overallStrength.toFixed(0)}%`;
        
        // Update signal meter visual
        const meterFill = document.getElementById('signalMeter');
        if (meterFill) {
            const rotation = (overallStrength / 100) * 180;
            meterFill.style.transform = `rotate(${rotation}deg)`;
        }
    }
    
    startAdvancedAIAnalysis() {
        setInterval(() => {
            if (this.recentDigits.length >= 15) {
                this.performAdvancedAnalysis();
            }
        }, 1000);
    }
    
    // Enhanced connection and trading methods (keeping existing functionality)
    connect() {
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
        
        if (data.authorize) {
            this.handleAuthorization(data.authorize);
            return;
        }
        
        if (data.balance) {
            this.handleBalanceUpdate(data.balance);
            return;
        }
        
        if (data.tick) {
            this.handleTick(data.tick);
            return;
        }
        
        if (data.buy) {
            this.handleTradeResult(data.buy);
            return;
        }
        
        if (data.proposal) {
            this.handleProposal(data.proposal);
            return;
        }
        
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
        
        this.getBalance();
        this.subscribeTicks();
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
        this.updateLiveTradesDisplay(portfolioData.contracts || []);
    }
    
    handleTick(tickData) {
        this.currentTick = tickData;
        this.tickCount++;
        
        const lastDigit = parseInt(tickData.quote.toString().slice(-1));
        this.recentDigits.push(lastDigit);
        
        if (this.recentDigits.length > 100) { // Keep more history for advanced analysis
            this.recentDigits.shift();
        }
        
        this.updateDigitDisplay(lastDigit);
        this.updateMarketInfo();
        
        // Run enhanced AI analysis
        if (this.recentDigits.length >= 15) {
            this.performAdvancedAnalysis();
        }
        
        // Enhanced auto trade logic
        if (this.aiEnabled && this.recentDigits.length >= 20) {
            this.checkAutoTrade();
        }
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
            this.logAIActivity(`Trade executed: ${trade.direction.toUpperCase()} $${trade.amount}`);
        }
        
        this.showAlert(`${trade.direction.toUpperCase()} trade placed: $${trade.amount}`, 'success');
    }
    
    // Keep all existing UI update methods and add new ones
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
        const balanceElements = ['currentBalance'];
        balanceElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `$${this.balance.toFixed(2)}`;
            }
        });
    }
    
    updateDigitDisplay(digit) {
        const digitElements = ['currentDigit', 'currentDigitManual'];
        const trendElements = ['digitTrend', 'digitTrendManual'];
        const recentElements = ['recentDigits', 'recentDigitsManual'];
        
        digitElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = digit;
                element.className = 'current-digit';
                
                const prediction = this.performEnsemblePrediction();
                if (prediction && prediction.confidence > 70) {
                    element.classList.add(prediction.direction === 'call' ? 'call-signal' : 'put-signal');
                }
            }
        });
        
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
        this.updatePredictionElements('', prediction);
        this.updatePredictionElements('Auto', prediction);
        
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
    
    initializeEventListeners() {
        const confidenceSlider = document.getElementById('minConfidence');
        if (confidenceSlider) {
            confidenceSlider.addEventListener('input', () => {
                this.updateConfidenceDisplay();
            });
        }
    }
    
    // Placeholder classes for advanced models
    updateLiveTradesDisplay() {
        // Implementation for live trades display
    }
    
    updateTradeHistory() {
        // Implementation for trade history
    }
}

// Placeholder classes for advanced prediction models
class LSTMModel {
    predict(data) {
        return { callProbability: 50, putProbability: 50 };
    }
}

class RandomForestModel {
    predict(data) {
        return { callProbability: 50, putProbability: 50 };
    }
}

class SVMModel {
    predict(data) {
        return { callProbability: 50, putProbability: 50 };
    }
}

class EnsembleModel {
    predict(data) {
        return { callProbability: 50, putProbability: 50 };
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
        
        zeusAI.logAIActivity('Enhanced AI Trading System ACTIVATED');
        zeusAI.showAlert('Enhanced AI Trading activated with advanced algorithms', 'success');
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

function switchMainTab(tabName) {
    const tabs = document.querySelectorAll('.main-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const clickedNavTab = event.target.closest('.nav-tab');
    if (clickedNavTab) {
        clickedNavTab.classList.add('active');
    }
}

function switchAnalyticsTab(tabName) {
    const tabs = document.querySelectorAll('#analytics-tab .tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const tabBtns = document.querySelectorAll('#analytics-tab .tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const clickedBtn = event.target.closest('.tab-btn');
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeZeusAI();
});