const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 5001;

// Settings
let watchCount = 10;
let overThreshold = 6;
let lastDigits = [];
let tradeEnabled = false;
let marketSymbol = "R_10";
const derivWsUrl = "wss://ws.binaryws.com/websockets/v3?app_id=1089";
let tradeHistory = [];
let connectionStatus = "Disconnected";
let lastTickTime = null;
let ws = null;

// Account settings
let userApiToken = "";
let accountInfo = null;
let isAccountConnected = false;

// Middleware
app.use(express.json());

// Utility functions
function mockTradeAction() {
    const tradeTime = new Date().toLocaleTimeString();
    const tradeData = {
        time: tradeTime,
        action: "CALL",
        reason: "Over 4 threshold reached",
        digits: lastDigits.slice(-5) // Last 5 digits
    };
    tradeHistory.push(tradeData);
    if (tradeHistory.length > 10) { // Keep only last 10 trades
        tradeHistory.shift();
    }
    console.log(`🔁 Mock Trade Executed at ${tradeTime}: CALL on Over 4`);
}

function detectPattern(digits) {
    if (digits.length < 3) {
        return { digit: null, reason: "Insufficient data for pattern analysis", confidence: 0 };
    }

    const sequence = [...digits];
    
    // Check for consecutive sequences
    for (let i = 0; i < sequence.length - 2; i++) {
        if (sequence[i] + 1 === sequence[i+1] && sequence[i+1] + 1 === sequence[i+2]) {
            const nextDigit = sequence[i+2] < 9 ? sequence[i+2] + 1 : sequence[i+2] - 1;
            return { digit: nextDigit, reason: "Ascending sequence detected", confidence: 85 };
        }
        if (sequence[i] - 1 === sequence[i+1] && sequence[i+1] - 1 === sequence[i+2]) {
            const nextDigit = sequence[i+2] > 0 ? sequence[i+2] - 1 : sequence[i+2] + 1;
            return { digit: nextDigit, reason: "Descending sequence detected", confidence: 85 };
        }
    }
    
    // Check for repeating digits
    const lastThree = sequence.slice(-3);
    if (new Set(lastThree).size === 1) {
        const digit = lastThree[0] <= 4 ? 9 - lastThree[0] : lastThree[0] - 5;
        return { digit, reason: "Breaking repeating pattern", confidence: 75 };
    }

    // Check for alternating patterns
    if (sequence.length >= 4) {
        const len = sequence.length;
        if (sequence[len-4] === sequence[len-2] && sequence[len-3] === sequence[len-1]) {
            return { digit: sequence[len-4], reason: "Alternating pattern detected", confidence: 70 };
        }
    }

    // High/low trend analysis
    const lastFive = sequence.slice(-5);
    const highCount = lastFive.filter(d => d > 4).length;
    
    if (highCount >= 4) {
        return { digit: Math.min(...sequence), reason: "Strong high trend - expecting reversal", confidence: 65 };
    } else if (highCount <= 1) {
        return { digit: Math.max(...sequence), reason: "Strong low trend - expecting reversal", confidence: 65 };
    }

    // Fibonacci-like sequence detection
    if (sequence.length >= 3) {
        for (let i = 0; i < sequence.length - 2; i++) {
            if (sequence[i] + sequence[i+1] === sequence[i+2]) {
                const nextFib = (sequence[i+1] + sequence[i+2]) % 10;
                return { digit: nextFib, reason: "Fibonacci-like sequence detected", confidence: 60 };
            }
        }
    }

    // Most frequent digit
    const counter = {};
    digits.forEach(d => counter[d] = (counter[d] || 0) + 1);
    const sorted = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length > 1 && sorted[0][1] > sorted[1][1]) {
        const confidence = Math.min(90, (sorted[0][1] / digits.length) * 100);
        return { 
            digit: parseInt(sorted[0][0]), 
            reason: `Most frequent digit (${sorted[0][1]}/${digits.length} occurrences)`,
            confidence: Math.round(confidence)
        };
    }
    
    // Weighted recent bias
    const recentWeight = sequence.slice(-3).reduce((sum, d, i) => sum + d * (i + 1), 0);
    const predicted = Math.floor(recentWeight / 6) % 10;
    return { digit: predicted, reason: "Weighted recent trend analysis", confidence: 45 };
}

// Enhanced HTML template with mobile improvements
const HTML_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeus - Digit Over 4 Watcher</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 0.75rem 0;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 1rem;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .connection-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .connection-status.connected {
            background: #d4edda;
            color: #155724;
        }
        
        .connection-status.disconnected {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .status-dot.connected {
            background: #28a745;
        }
        
        .status-dot.disconnected {
            background: #dc3545;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .container { 
            max-width: 1200px; 
            margin: 1rem auto; 
            padding: 0 1rem;
            display: grid;
            gap: 1rem;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .account-card {
            background: linear-gradient(135deg, #e8f5e8, #f0fff0);
            border: 1px solid #28a745;
        }
        
        .account-card.disconnected {
            background: linear-gradient(135deg, #fff5f5, #ffe8e8);
            border: 1px solid #dc3545;
        }
        
        .api-input-group {
            display: flex;
            gap: 0.75rem;
            align-items: end;
            margin-bottom: 1rem;
        }
        
        .api-input-group input {
            flex: 1;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 0.9rem;
            background: white;
            transition: border-color 0.3s ease;
            min-width: 0;
        }
        
        .api-input-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .api-button {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.3s ease;
            white-space: nowrap;
            font-size: 0.9rem;
        }
        
        .api-button:hover {
            transform: translateY(-2px);
        }
        
        .api-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .account-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
        }
        
        .account-stat {
            background: rgba(255, 255, 255, 0.7);
            padding: 0.75rem;
            border-radius: 10px;
            text-align: center;
        }
        
        .account-stat h4 {
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .account-stat .value {
            font-size: 1rem;
            font-weight: 700;
            color: #333;
            word-break: break-all;
        }
        
        .controls-card {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            align-items: center;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .control-group label {
            font-weight: 600;
            color: #555;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .control-group select {
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 0.9rem;
            background: white;
            transition: border-color 0.3s ease;
        }
        
        .control-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 28px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 28px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #667eea;
        }
        
        input:checked + .slider:before {
            transform: translateX(22px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .stat-card h3 {
            font-size: 0.75rem;
            color: #666;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
        }
        
        .stat-card .description {
            font-size: 0.7rem;
            color: #888;
        }
        
        .signal-good { color: #28a745; }
        .signal-wait { color: #ffc107; }
        .signal-collecting { color: #6c757d; }
        
        .digits-container {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin: 1rem 0;
        }
        
        .digit-circle {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
            position: relative;
        }
        
        .digit-circle:hover {
            transform: scale(1.05);
        }
        
        .digit-under { 
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
        }
        
        .digit-over { 
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
            color: white;
        }
        
        .digit-circle::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
            z-index: -1;
        }
        
        .frequency-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
        
        .frequency-table th,
        .frequency-table td {
            padding: 0.75rem 0.5rem;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .frequency-table th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.8rem;
        }
        
        .frequency-table tr:hover {
            background: #f8f9fa;
        }
        
        .digit-row-under { background: linear-gradient(90deg, #fff5f5, #ffe8e8); }
        .digit-row-over { background: linear-gradient(90deg, #f0fdfa, #e6fffa); }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin: 1rem 0;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .legend-under .legend-color { 
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        }
        
        .legend-over .legend-color { 
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
        }
        
        .prediction-card {
            background: linear-gradient(135deg, #fff9e6, #fff3cd);
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
        }
        
        .prediction-card h4 {
            color: #856404;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }
        
        .prediction-value {
            font-size: 1rem;
            font-weight: 700;
            color: #533f03;
            margin-bottom: 0.5rem;
        }
        
        .confidence-bar {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            margin-top: 0.5rem;
            overflow: hidden;
        }
        
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #ffc107, #28a745);
            border-radius: 3px;
            transition: width 0.5s ease;
        }
        
        .confidence-text {
            font-size: 0.8rem;
            color: #666;
            margin-top: 0.25rem;
            text-align: center;
        }
        
        .trade-history {
            max-height: 250px;
            overflow-y: auto;
        }
        
        .trade-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
            transition: background 0.3s ease;
            font-size: 0.9rem;
        }
        
        .trade-item:hover {
            background: #f8f9fa;
        }
        
        .trade-time {
            font-weight: 600;
            color: #667eea;
            font-size: 0.8rem;
        }
        
        .trade-action {
            background: #28a745;
            color: white;
            padding: 0.2rem 0.6rem;
            border-radius: 15px;
            font-size: 0.7rem;
            font-weight: 600;
        }
        
        .trade-digits {
            display: flex;
            gap: 0.2rem;
        }
        
        .trade-digit {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.6rem;
            font-weight: 600;
            color: white;
        }
        
        .section-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 0.75rem;
            border: 1px solid #f5c6cb;
            font-size: 0.9rem;
        }
        
        .tick-info {
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            border: 1px solid #2196f3;
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .tick-price {
            font-size: 1.5rem;
            font-weight: 800;
            color: #1976d2;
            margin-bottom: 0.25rem;
        }
        
        .tick-time {
            font-size: 0.8rem;
            color: #666;
        }
        
        @media (max-width: 768px) {
            body {
                font-size: 13px;
            }
            
            .container {
                padding: 0 0.75rem;
                gap: 0.75rem;
            }
            
            .card {
                padding: 1rem;
                border-radius: 12px;
            }
            
            .controls-card {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
            }
            
            .header-content {
                padding: 0 0.75rem;
            }
            
            .logo {
                font-size: 1.3rem;
            }
            
            .connection-status {
                font-size: 0.7rem;
                padding: 0.3rem 0.6rem;
            }
            
            .digits-container {
                gap: 0.4rem;
            }
            
            .digit-circle {
                width: 40px;
                height: 40px;
                font-size: 1.1rem;
            }
            
            .api-input-group {
                flex-direction: column;
                align-items: stretch;
                gap: 0.5rem;
            }
            
            .api-button {
                padding: 0.75rem;
            }
            
            .account-info {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            
            .account-stat .value {
                font-size: 0.9rem;
            }
            
            .section-title {
                font-size: 1.1rem;
            }
            
            .frequency-table th,
            .frequency-table td {
                padding: 0.5rem 0.25rem;
                font-size: 0.8rem;
            }
            
            .trade-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .legend {
                gap: 1rem;
            }
            
            .legend-item {
                font-size: 0.8rem;
            }
        }
        
        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .digit-circle {
                width: 35px;
                height: 35px;
                font-size: 1rem;
            }
            
            .account-stat h4 {
                font-size: 0.7rem;
            }
            
            .account-stat .value {
                font-size: 0.85rem;
            }
        }
    </style>
    <script>
        let lastUpdateTime = Date.now();
        let lastTickPrice = null;
        
        async function updateStats() {
            try {
                const res = await fetch('/check');
                const data = await res.json();
                
                // Update connection status
                const statusElement = document.getElementById('connection-status');
                if (data.connection_status === 'Connected') {
                    statusElement.className = 'connection-status connected';
                    statusElement.innerHTML = '<div class="status-dot connected" id="status-dot"></div>Connected';
                    lastUpdateTime = Date.now();
                } else {
                    statusElement.className = 'connection-status disconnected';
                    statusElement.innerHTML = '<div class="status-dot disconnected" id="status-dot"></div>Disconnected';
                }
                
                // Update tick info
                if (data.last_tick_price && data.last_tick_time) {
                    document.getElementById('tick-price').innerText = data.last_tick_price;
                    document.getElementById('tick-time').innerText = 'Last update: ' + data.last_tick_time;
                }
                
                // Update stats
                document.getElementById('over_count').innerText = data.over_count;
                document.getElementById('total_digits').innerText = data.total_digits;
                document.getElementById('over_percentage').innerText = data.over_percentage + '%';
                
                // Update signal with appropriate styling
                const signalElement = document.getElementById('signal');
                signalElement.innerText = data.signal;
                signalElement.className = 'value ' + getSignalClass(data.signal);
                
                // Update prediction with confidence
                document.getElementById('predicted').innerText = data.predicted;
                const confidenceBar = document.getElementById('confidence-fill');
                const confidenceText = document.getElementById('confidence-text');
                if (data.confidence !== undefined) {
                    confidenceBar.style.width = data.confidence + '%';
                    confidenceText.innerText = \`Confidence: \${data.confidence}%\`;
                }
                
                // Update account info
                updateAccountInfo(data.account_info, data.is_account_connected);
                
                // Update digits with enhanced circular design
                const digitsList = document.getElementById('last_digits');
                digitsList.innerHTML = '';
                data.last_digits.forEach((d, index) => {
                    const div = document.createElement('div');
                    div.className = \`digit-circle \${d > 4 ? 'digit-over' : 'digit-under'}\`;
                    div.innerText = d;
                    div.style.animationDelay = \`\${index * 0.1}s\`;
                    digitsList.appendChild(div);
                });
                
                // Update frequency table
                const freqTable = document.getElementById('digit_freq');
                freqTable.innerHTML = '<tr><th>Digit</th><th>Count</th><th>%</th></tr>';
                data.digit_counts.forEach((count, i) => {
                    const row = freqTable.insertRow();
                    row.className = i > 4 ? 'digit-row-over' : 'digit-row-under';
                    row.insertCell().innerText = i;
                    row.insertCell().innerText = count;
                    const percentage = data.total_digits > 0 ? ((count / data.total_digits) * 100).toFixed(1) : '0.0';
                    row.insertCell().innerText = percentage + '%';
                });
                
                // Update trade history
                updateTradeHistory(data.trade_history);
                
            } catch (error) {
                console.error('Error updating stats:', error);
                document.getElementById('connection-status').className = 'connection-status disconnected';
                document.getElementById('connection-status').innerHTML = '<div class="status-dot disconnected"></div>Connection Error';
            }
        }
        
        function updateAccountInfo(accountInfo, isConnected) {
            const accountCard = document.getElementById('account-card');
            const accountInfoDiv = document.getElementById('account-info');
            
            if (isConnected && accountInfo) {
                accountCard.className = 'card account-card';
                accountInfoDiv.innerHTML = \`
                    <div class="account-stat">
                        <h4>Account ID</h4>
                        <div class="value">\${accountInfo.loginid || 'N/A'}</div>
                    </div>
                    <div class="account-stat">
                        <h4>Balance</h4>
                        <div class="value">\${accountInfo.balance || '0'} \${accountInfo.currency || 'USD'}</div>
                    </div>
                    <div class="account-stat">
                        <h4>Country</h4>
                        <div class="value">\${accountInfo.country || 'N/A'}</div>
                    </div>
                    <div class="account-stat">
                        <h4>Email</h4>
                        <div class="value">\${accountInfo.email || 'N/A'}</div>
                    </div>
                \`;
            } else {
                accountCard.className = 'card account-card disconnected';
                accountInfoDiv.innerHTML = '<div style="text-align: center; color: #666;">Enter your API token to view account details</div>';
            }
        }
        
        function getSignalClass(signal) {
            if (signal.includes('Good') || signal.includes('Strong')) return 'signal-good';
            if (signal.includes('Wait') || signal.includes('Weak')) return 'signal-wait';
            return 'signal-collecting';
        }
        
        function updateTradeHistory(trades) {
            const historyContainer = document.getElementById('trade_history');
            historyContainer.innerHTML = '';
            
            if (trades.length === 0) {
                historyContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 1.5rem;">No trades executed yet</div>';
                return;
            }
            
            trades.slice().reverse().forEach(trade => {
                const tradeItem = document.createElement('div');
                tradeItem.className = 'trade-item';
                
                const digitsHtml = trade.digits.map(d => 
                    \`<div class="trade-digit \${d > 4 ? 'digit-over' : 'digit-under'}">\${d}</div>\`
                ).join('');
                
                tradeItem.innerHTML = \`
                    <div class="trade-time">\${trade.time}</div>
                    <div class="trade-action">\${trade.action}</div>
                    <div class="trade-digits">\${digitsHtml}</div>
                \`;
                
                historyContainer.appendChild(tradeItem);
            });
        }
        
        function changeMarket() {
            const symbol = document.getElementById('market').value;
            fetch(\`/change_market?symbol=\${symbol}\`);
        }
        
        async function toggleTrade(checkbox) {
            await fetch(\`/toggle_trade?state=\${checkbox.checked ? 'on' : 'off'}\`);
        }
        
        async function connectAccount() {
            const apiToken = document.getElementById('api-token').value.trim();
            const button = document.getElementById('connect-btn');
            const errorDiv = document.getElementById('api-error');
            
            if (!apiToken) {
                showError('Please enter your API token');
                return;
            }
            
            button.disabled = true;
            button.innerText = 'Connecting...';
            errorDiv.style.display = 'none';
            
            try {
                const response = await fetch('/connect_account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ api_token: apiToken })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    button.innerText = 'Connected ✓';
                    button.style.background = '#28a745';
                } else {
                    showError(result.error || 'Failed to connect account');
                    button.disabled = false;
                    button.innerText = 'Connect Account';
                }
            } catch (error) {
                showError('Connection failed: ' + error.message);
                button.disabled = false;
                button.innerText = 'Connect Account';
            }
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('api-error');
            errorDiv.innerText = message;
            errorDiv.style.display = 'block';
        }
        
        // Check for connection timeout
        setInterval(() => {
            if (Date.now() - lastUpdateTime > 10000) { // 10 seconds timeout
                document.getElementById('connection-status').className = 'connection-status disconnected';
                document.getElementById('connection-status').innerHTML = '<div class="status-dot disconnected"></div>Connection Timeout';
            }
        }, 5000);
        
        setInterval(updateStats, 1000);
        window.onload = updateStats;
    </script>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">⚡ ZEUS</div>
            <div id="connection-status" class="connection-status disconnected">
                <div class="status-dot disconnected" id="status-dot"></div>
                Disconnected
            </div>
        </div>
    </div>
    
    <div class="container">
        <div class="card account-card disconnected" id="account-card">
            <h2 class="section-title">👤 Account Integration</h2>
            <div class="api-input-group">
                <input type="password" id="api-token" placeholder="Enter your Deriv API token..." />
                <button class="api-button" id="connect-btn" onclick="connectAccount()">Connect Account</button>
            </div>
            <div id="api-error" class="error-message" style="display: none;"></div>
            <div class="account-info" id="account-info">
                <div style="text-align: center; color: #666;">Enter your API token to view account details</div>
            </div>
        </div>
        
        <div class="card controls-card">
            <div class="control-group">
                <label>Market Selection</label>
                <select id="market" onchange="changeMarket()">
                    <option value="R_10">Volatility 10 Index</option>
                    <option value="R_25">Volatility 25 Index</option>
                    <option value="R_50">Volatility 50 Index</option>
                    <option value="R_75">Volatility 75 Index</option>
                    <option value="R_100">Volatility 100 Index</option>
                </select>
            </div>
            <div class="control-group">
                <label>Auto-Trade</label>
                <label class="toggle-switch">
                    <input type="checkbox" onchange="toggleTrade(this)">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        
        <div class="card">
            <div class="tick-info">
                <div class="tick-price" id="tick-price">Waiting for data...</div>
                <div class="tick-time" id="tick-time">Connecting...</div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Over 4 Count</h3>
                    <div class="value" id="over_count">0</div>
                    <div class="description">Last 10 digits</div>
                </div>
                <div class="stat-card">
                    <h3>Total Digits</h3>
                    <div class="value" id="total_digits">0</div>
                    <div class="description">Collected so far</div>
                </div>
                <div class="stat-card">
                    <h3>Over 4 Rate</h3>
                    <div class="value" id="over_percentage">0%</div>
                    <div class="description">Historical average</div>
                </div>
                <div class="stat-card">
                    <h3>Signal</h3>
                    <div class="value" id="signal">Checking...</div>
                    <div class="description">Trading signal</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2 class="section-title">🔢 Last 10 Digits</h2>
            <div class="legend">
                <div class="legend-item legend-under">
                    <div class="legend-color"></div>
                    <span>0-4 (Under)</span>
                </div>
                <div class="legend-item legend-over">
                    <div class="legend-color"></div>
                    <span>5-9 (Over)</span>
                </div>
            </div>
            <div class="digits-container" id="last_digits"></div>
            
            <div class="prediction-card">
                <h4>🔮 Pattern Analysis</h4>
                <div class="prediction-value" id="predicted">-</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" id="confidence-fill" style="width: 0%"></div>
                </div>
                <div class="confidence-text" id="confidence-text">Confidence: 0%</div>
            </div>
        </div>
        
        <div class="card">
            <h2 class="section-title">📊 Digit Frequency Analysis</h2>
            <table class="frequency-table" id="digit_freq">
                <tr><th>Digit</th><th>Count</th><th>%</th></tr>
            </table>
        </div>
        
        <div class="card">
            <h2 class="section-title">📈 Trade History</h2>
            <div class="trade-history" id="trade_history">
                <div style="text-align: center; color: #666; padding: 1.5rem;">No trades executed yet</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Express routes
app.get('/', (req, res) => {
    res.send(HTML_PAGE);
});

app.get('/check', (req, res) => {
    const overCount = lastDigits.filter(d => d > 4).length;
    const totalDigits = lastDigits.length;
    const overPercentage = totalDigits > 0 ? Math.round((overCount / totalDigits) * 100 * 10) / 10 : 0;
    const digitCounts = Array.from({length: 10}, (_, i) => lastDigits.filter(d => d === i).length);
    
    // Enhanced signal logic
    let signal;
    let predicted = "Analyzing patterns...";
    let confidence = 0;
    
    if (lastDigits.length < watchCount) {
        signal = "🔄 Collecting Data...";
    } else {
        const pattern = detectPattern(lastDigits);
        confidence = pattern.confidence || 0;
        
        // Multi-factor signal analysis
        let signalStrength = 0;
        
        // Factor 1: Over threshold
        if (overCount >= overThreshold) {
            signalStrength += 3;
        } else if (overCount >= overThreshold - 1) {
            signalStrength += 2;
        } else if (overCount >= overThreshold - 2) {
            signalStrength += 1;
        }
            
        // Factor 2: Pattern confidence
        if (pattern.confidence >= 80) {
            signalStrength += 3;
        } else if (pattern.confidence >= 60) {
            signalStrength += 2;
        } else if (pattern.confidence >= 40) {
            signalStrength += 1;
        }
            
        // Factor 3: Recent trend
        const recentThree = lastDigits.slice(-3);
        if (recentThree.filter(d => d > 4).length >= 2) {
            signalStrength += 1;
        }
            
        // Determine signal based on strength
        if (signalStrength >= 6) {
            signal = "🚀 Strong Entry Signal";
        } else if (signalStrength >= 4) {
            signal = "✅ Good to Enter";
        } else if (signalStrength >= 2) {
            signal = "⚠️ Weak Signal";
        } else {
            signal = "⏳ Wait for Better Setup";
        }
        
        predicted = pattern.digit !== null ? `${pattern.digit} - ${pattern.reason}` : "Analyzing patterns...";
    }

    res.json({
        last_digits: lastDigits,
        over_count: overCount,
        total_digits: totalDigits,
        over_percentage: overPercentage,
        signal: signal,
        digit_counts: digitCounts,
        predicted: predicted,
        confidence: confidence,
        trade_history: tradeHistory,
        connection_status: connectionStatus,
        account_info: accountInfo,
        is_account_connected: isAccountConnected,
        last_tick_price: lastTickTime ? ws?.lastPrice : null,
        last_tick_time: lastTickTime ? lastTickTime.toLocaleTimeString() : null
    });
});

app.post('/connect_account', async (req, res) => {
    const { api_token } = req.body;
    
    if (!api_token) {
        return res.json({ success: false, error: 'API token is required' });
    }
    
    try {
        // Create a new WebSocket connection for account info
        const accountWs = new WebSocket(derivWsUrl);
        
        accountWs.on('open', () => {
            // Authorize with the API token
            accountWs.send(JSON.stringify({
                authorize: api_token
            }));
        });
        
        accountWs.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());
                
                if (response.authorize) {
                    // Successfully authorized, get account info
                    userApiToken = api_token;
                    accountInfo = {
                        loginid: response.authorize.loginid,
                        balance: response.authorize.balance,
                        currency: response.authorize.currency,
                        country: response.authorize.country,
                        email: response.authorize.email
                    };
                    isAccountConnected = true;
                    
                    console.log(`✅ Account connected: ${accountInfo.loginid}`);
                    accountWs.close();
                    
                    res.json({ success: true, account_info: accountInfo });
                } else if (response.error) {
                    console.log(`❌ Account connection failed: ${response.error.message}`);
                    accountWs.close();
                    
                    res.json({ success: false, error: response.error.message });
                }
            } catch (error) {
                console.error('Error parsing account response:', error);
                accountWs.close();
                res.json({ success: false, error: 'Failed to parse account response' });
            }
        });
        
        accountWs.on('error', (error) => {
            console.error('Account WebSocket error:', error);
            res.json({ success: false, error: 'Connection failed' });
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (accountWs.readyState === WebSocket.OPEN) {
                accountWs.close();
                res.json({ success: false, error: 'Connection timeout' });
            }
        }, 10000);
        
    } catch (error) {
        console.error('Account connection error:', error);
        res.json({ success: false, error: 'Failed to connect to account' });
    }
});

app.get('/change_market', (req, res) => {
    marketSymbol = req.query.symbol || "R_10";
    lastDigits = []; // Reset digits when market changes
    tradeHistory = []; // Reset trade history
    console.log(`Market changed to: ${marketSymbol}`);
    
    // Reconnect WebSocket with new market
    if (ws) {
        ws.close();
    }
    connectToDerivWS();
    
    res.status(204).send();
});

app.get('/toggle_trade', (req, res) => {
    tradeEnabled = req.query.state === "on";
    const status = tradeEnabled ? "enabled" : "disabled";
    console.log(`🔄 Auto-trade is now ${status}`);
    res.status(204).send();
});

// WebSocket connection to Deriv - FIXED digit extraction
function connectToDerivWS() {
    try {
        connectionStatus = "Connecting...";
        ws = new WebSocket(derivWsUrl);
        
        ws.on('open', () => {
            connectionStatus = "Connected";
            console.log(`✅ Connected to Deriv WebSocket for ${marketSymbol}`);
            
            // Subscribe to ticks
            ws.send(JSON.stringify({ ticks: marketSymbol }));
        });
        
        ws.on('message', (data) => {
            try {
                const response = JSON.parse(data.toString());
                
                if (response.tick) {
                    lastTickTime = new Date();
                    const quote = response.tick.quote;
                    
                    // FIXED: Proper digit extraction matching Deriv's method
                    // Convert to string, remove decimal point, get last digit
                    const quoteStr = quote.toString();
                    const digitsOnly = quoteStr.replace('.', '');
                    const lastDigit = parseInt(digitsOnly.slice(-1));
                    
                    // Store the price for display
                    ws.lastPrice = quote;
                    
                    // Maintain array size
                    lastDigits.push(lastDigit);
                    if (lastDigits.length > watchCount) {
                        lastDigits.shift();
                    }
                    
                    console.log(`📊 ${marketSymbol}: ${quote} -> Digit: ${lastDigit} (from: ${digitsOnly})`);

                    // Enhanced trading logic with proper auto-trade functionality
                    const overCount = lastDigits.filter(d => d > 4).length;
                    if (tradeEnabled && lastDigits.length >= watchCount) {
                        let shouldTrade = false;
                        
                        // Condition 1: Basic threshold
                        if (overCount >= overThreshold) {
                            shouldTrade = true;
                        }
                        
                        // Condition 2: Pattern-based entry with confidence
                        const pattern = detectPattern(lastDigits);
                        if (overCount >= overThreshold - 1 && 
                            pattern.confidence >= 70) {
                            shouldTrade = true;
                        }
                        
                        // Condition 3: Strong signal with lower threshold
                        if (overCount >= overThreshold - 2 && 
                            pattern.confidence >= 85) {
                            shouldTrade = true;
                        }
                        
                        if (shouldTrade) {
                            mockTradeAction();
                        }
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        });
        
        ws.on('close', () => {
            connectionStatus = "Disconnected";
            console.log("❌ WebSocket connection closed. Reconnecting...");
            setTimeout(connectToDerivWS, 3000);
        });
        
        ws.on('error', (error) => {
            connectionStatus = "Error";
            console.log(`❌ WebSocket Error: ${error}. Reconnecting in 5 seconds...`);
            setTimeout(connectToDerivWS, 5000);
        });
        
    } catch (error) {
        connectionStatus = "Error";
        console.error('Failed to connect to WebSocket:', error);
        setTimeout(connectToDerivWS, 5000);
    }
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Starting Zeus - Digit Over 4 Watcher');
    console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
    
    // Start WebSocket connection
    connectToDerivWS();
});