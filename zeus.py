import json
import asyncio
import websockets
from collections import deque, Counter
from flask import Flask, render_template_string, request, jsonify
import threading
import time
from datetime import datetime

app = Flask(__name__)

# Settings
watch_count = 10
over_threshold = 6
last_digits = deque(maxlen=watch_count)
trade_enabled = False
market_symbol = "R_10"
deriv_ws_url = "wss://ws.binaryws.com/websockets/v3?app_id=1089"
trade_history = []
connection_status = "Disconnected"
last_tick_time = None

def mock_trade_action():
    global trade_history
    trade_time = datetime.now().strftime("%H:%M:%S")
    trade_data = {
        "time": trade_time,
        "action": "CALL",
        "reason": "Over 4 threshold reached",
        "digits": list(last_digits)[-5:]  # Last 5 digits
    }
    trade_history.append(trade_data)
    if len(trade_history) > 10:  # Keep only last 10 trades
        trade_history.pop(0)
    print(f"🔁 Mock Trade Executed at {trade_time}: CALL on Over 4")

# Enhanced UI Template with modern design
HTML_PAGE = '''
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
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 0;
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
            padding: 0 2rem;
        }
        
        .logo {
            font-size: 2rem;
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
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
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
            width: 8px;
            height: 8px;
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
            margin: 2rem auto; 
            padding: 0 2rem;
            display: grid;
            gap: 2rem;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .controls-card {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: center;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .control-group label {
            font-weight: 600;
            color: #555;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .control-group select {
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 12px;
            font-size: 1rem;
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
            width: 60px;
            height: 34px;
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
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #667eea;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
            padding: 1.5rem;
            border-radius: 16px;
            text-align: center;
            border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .stat-card h3 {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
        }
        
        .stat-card .description {
            font-size: 0.8rem;
            color: #888;
        }
        
        .signal-good { color: #28a745; }
        .signal-wait { color: #ffc107; }
        .signal-collecting { color: #6c757d; }
        
        .digits-container {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin: 1rem 0;
        }
        
        .digit-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
            position: relative;
        }
        
        .digit-circle:hover {
            transform: scale(1.1);
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
        }
        
        .frequency-table th,
        .frequency-table td {
            padding: 1rem;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .frequency-table th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .frequency-table tr:hover {
            background: #f8f9fa;
        }
        
        .digit-row-under { background: linear-gradient(90deg, #fff5f5, #ffe8e8); }
        .digit-row-over { background: linear-gradient(90deg, #f0fdfa, #e6fffa); }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 1.5rem 0;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
        }
        
        .legend-color {
            width: 24px;
            height: 24px;
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
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 1rem;
        }
        
        .prediction-card h4 {
            color: #856404;
            margin-bottom: 0.5rem;
        }
        
        .prediction-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #533f03;
        }
        
        .trade-history {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .trade-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #eee;
            transition: background 0.3s ease;
        }
        
        .trade-item:hover {
            background: #f8f9fa;
        }
        
        .trade-time {
            font-weight: 600;
            color: #667eea;
        }
        
        .trade-action {
            background: #28a745;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .trade-digits {
            display: flex;
            gap: 0.25rem;
        }
        
        .trade-digit {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 600;
            color: white;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            .controls-card {
                grid-template-columns: 1fr;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .header-content {
                padding: 0 1rem;
                flex-direction: column;
                gap: 1rem;
            }
            
            .digits-container {
                gap: 0.5rem;
            }
            
            .digit-circle {
                width: 50px;
                height: 50px;
                font-size: 1.2rem;
            }
        }
    </style>
    <script>
        let lastUpdateTime = Date.now();
        
        async function updateStats() {
            try {
                const res = await fetch('/check');
                const data = await res.json();
                
                // Update connection status
                const statusElement = document.getElementById('connection-status');
                const statusDot = document.getElementById('status-dot');
                if (data.connection_status === 'Connected') {
                    statusElement.className = 'connection-status connected';
                    statusElement.innerHTML = '<div class="status-dot connected" id="status-dot"></div>Connected';
                    lastUpdateTime = Date.now();
                } else {
                    statusElement.className = 'connection-status disconnected';
                    statusElement.innerHTML = '<div class="status-dot disconnected" id="status-dot"></div>Disconnected';
                }
                
                // Update stats
                document.getElementById('over_count').innerText = data.over_count;
                document.getElementById('total_digits').innerText = data.total_digits;
                document.getElementById('over_percentage').innerText = data.over_percentage + '%';
                
                // Update signal with appropriate styling
                const signalElement = document.getElementById('signal');
                signalElement.innerText = data.signal;
                signalElement.className = 'value ' + getSignalClass(data.signal);
                
                // Update prediction
                document.getElementById('predicted').innerText = data.predicted;
                
                // Update digits with enhanced circular design
                const digitsList = document.getElementById('last_digits');
                digitsList.innerHTML = '';
                data.last_digits.forEach((d, index) => {
                    const div = document.createElement('div');
                    div.className = `digit-circle ${d > 4 ? 'digit-over' : 'digit-under'}`;
                    div.innerText = d;
                    div.style.animationDelay = `${index * 0.1}s`;
                    digitsList.appendChild(div);
                });
                
                // Update frequency table
                const freqTable = document.getElementById('digit_freq');
                freqTable.innerHTML = '<tr><th>Digit</th><th>Count</th><th>Percentage</th></tr>';
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
        
        function getSignalClass(signal) {
            if (signal.includes('Good')) return 'signal-good';
            if (signal.includes('Wait')) return 'signal-wait';
            return 'signal-collecting';
        }
        
        function updateTradeHistory(trades) {
            const historyContainer = document.getElementById('trade_history');
            historyContainer.innerHTML = '';
            
            if (trades.length === 0) {
                historyContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">No trades executed yet</div>';
                return;
            }
            
            trades.reverse().forEach(trade => {
                const tradeItem = document.createElement('div');
                tradeItem.className = 'trade-item';
                
                const digitsHtml = trade.digits.map(d => 
                    `<div class="trade-digit ${d > 4 ? 'digit-over' : 'digit-under'}">${d}</div>`
                ).join('');
                
                tradeItem.innerHTML = `
                    <div class="trade-time">${trade.time}</div>
                    <div class="trade-action">${trade.action}</div>
                    <div class="trade-digits">${digitsHtml}</div>
                `;
                
                historyContainer.appendChild(tradeItem);
            });
        }
        
        function changeMarket() {
            const symbol = document.getElementById('market').value;
            fetch(`/change_market?symbol=${symbol}`);
        }
        
        async function toggleTrade(checkbox) {
            await fetch(`/toggle_trade?state=${checkbox.checked ? 'on' : 'off'}`);
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
            </div>
        </div>
        
        <div class="card">
            <h2 class="section-title">📊 Digit Frequency Analysis</h2>
            <table class="frequency-table" id="digit_freq">
                <tr><th>Digit</th><th>Count</th><th>Percentage</th></tr>
            </table>
        </div>
        
        <div class="card">
            <h2 class="section-title">📈 Trade History</h2>
            <div class="trade-history" id="trade_history">
                <div style="text-align: center; color: #666; padding: 2rem;">No trades executed yet</div>
            </div>
        </div>
    </div>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

def detect_pattern(digits):
    """Enhanced pattern analysis with more sophisticated algorithms."""
    if len(digits) < 3:
        return None, "Insufficient data for pattern analysis"

    sequence = list(digits)
    
    # Check for consecutive sequences (e.g., 1,2,3 or 7,6,5)
    for i in range(len(sequence) - 2):
        if sequence[i] + 1 == sequence[i+1] == sequence[i+2] - 1:
            return sequence[i+2] + 1 if sequence[i+2] < 9 else sequence[i+2] - 1, "Ascending sequence detected"
        if sequence[i] - 1 == sequence[i+1] == sequence[i+2] + 1:
            return sequence[i+2] - 1 if sequence[i+2] > 0 else sequence[i+2] + 1, "Descending sequence detected"
    
    # Check for repeating digits (e.g., 5,5,5)
    last_three = sequence[-3:]
    if len(set(last_three)) == 1:
        # Predict opposite tendency
        return 9 - last_three[0] if last_three[0] <= 4 else last_three[0] - 5, "Breaking repeating pattern"

    # Check for alternating patterns (e.g., 1,8,1,8)
    if len(sequence) >= 4:
        if sequence[-4] == sequence[-2] and sequence[-3] == sequence[-1]:
            return sequence[-4], "Alternating pattern detected"

    # Check for high/low trend analysis
    last_five = sequence[-5:] if len(sequence) >= 5 else sequence
    high_count = sum(1 for d in last_five if d > 4)
    
    if high_count >= 4:
        return min(sequence), "Strong high trend - expecting reversal"
    elif high_count <= 1:
        return max(sequence), "Strong low trend - expecting reversal"

    # Fibonacci-like sequence detection
    if len(sequence) >= 3:
        for i in range(len(sequence) - 2):
            if sequence[i] + sequence[i+1] == sequence[i+2]:
                next_fib = sequence[i+1] + sequence[i+2]
                return next_fib % 10, "Fibonacci-like sequence detected"

    # Most frequent digit with confidence scoring
    counter = Counter(digits)
    most_common = counter.most_common(2)
    if most_common and len(most_common) > 1:
        if most_common[0][1] > most_common[1][1]:
            return most_common[0][0], f"Most frequent digit (confidence: {most_common[0][1]}/{len(digits)})"
    
    # Weighted recent bias
    recent_weight = sum(d * (i + 1) for i, d in enumerate(sequence[-3:]))
    predicted = int(recent_weight / 6) % 10
    return predicted, "Weighted recent trend analysis"

@app.route('/check')
def check():
    global connection_status, last_tick_time
    
    over_count = sum(1 for d in last_digits if d > 4)
    total_digits = len(last_digits)
    over_percentage = round((over_count / total_digits * 100), 1) if total_digits > 0 else 0
    digit_counts = [last_digits.count(i) for i in range(10)]
    
    # Enhanced signal logic
    if len(last_digits) < watch_count:
        signal = "🔄 Collecting Data..."
    else:
        predicted_digit, pattern_reason = detect_pattern(last_digits)
        
        # Multi-factor signal analysis
        signal_strength = 0
        
        # Factor 1: Over threshold
        if over_count >= over_threshold:
            signal_strength += 3
        elif over_count >= over_threshold - 1:
            signal_strength += 2
        elif over_count >= over_threshold - 2:
            signal_strength += 1
            
        # Factor 2: Pattern confidence
        if pattern_reason and ("sequence" in pattern_reason or "pattern" in pattern_reason):
            signal_strength += 2
        elif pattern_reason and "frequent" in pattern_reason:
            signal_strength += 1
            
        # Factor 3: Recent trend
        recent_three = list(last_digits)[-3:]
        if sum(1 for d in recent_three if d > 4) >= 2:
            signal_strength += 1
            
        # Determine signal based on strength
        if signal_strength >= 5:
            signal = "🚀 Strong Entry Signal"
        elif signal_strength >= 3:
            signal = "✅ Good to Enter"
        elif signal_strength >= 2:
            signal = "⚠️ Weak Signal"
        else:
            signal = "⏳ Wait for Better Setup"
    
    predicted = f"{predicted_digit} - {pattern_reason}" if 'predicted_digit' in locals() and predicted_digit is not None else "Analyzing patterns..."

    return jsonify({
        "last_digits": list(last_digits),
        "over_count": over_count,
        "total_digits": total_digits,
        "over_percentage": over_percentage,
        "signal": signal,
        "digit_counts": digit_counts,
        "predicted": predicted,
        "trade_history": trade_history,
        "connection_status": connection_status
    })

@app.route('/change_market')
def change_market():
    global market_symbol, last_digits, trade_history
    market_symbol = request.args.get("symbol", "R_10")
    last_digits = deque(maxlen=watch_count)  # Reset digits when market changes
    trade_history = []  # Reset trade history
    print(f"Market changed to: {market_symbol}")
    return '', 204

@app.route('/toggle_trade')
def toggle_trade():
    global trade_enabled
    trade_enabled = request.args.get("state") == "on"
    status = "enabled" if trade_enabled else "disabled"
    print(f"🔄 Auto-trade is now {status}")
    return '', 204

async def deriv_tick_listener():
    global market_symbol, trade_enabled, connection_status, last_tick_time
    
    while True:
        try:
            connection_status = "Connecting..."
            async with websockets.connect(deriv_ws_url) as ws:
                connection_status = "Connected"
                print(f"✅ Connected to Deriv WebSocket for {market_symbol}")
                
                # Subscribe to ticks
                await ws.send(json.dumps({"ticks": market_symbol}))
                
                while True:
                    response = await ws.recv()
                    data = json.loads(response)
                    
                    if 'tick' in data:
                        last_tick_time = datetime.now()
                        quote = data['tick']['quote']
                        last_digit = int(str(quote)[-1])
                        last_digits.append(last_digit)
                        
                        print(f"📊 {market_symbol}: {quote} -> Digit: {last_digit}")

                        # Enhanced trading logic
                        over_count = sum(1 for d in last_digits if d > 4)
                        if trade_enabled and len(last_digits) >= watch_count:
                            # Multiple conditions for trade execution
                            should_trade = False
                            
                            # Condition 1: Basic threshold
                            if over_count >= over_threshold:
                                should_trade = True
                                
                            # Condition 2: Pattern-based entry
                            predicted_digit, pattern_reason = detect_pattern(last_digits)
                            if (over_count >= over_threshold - 1 and 
                                pattern_reason and 
                                ("sequence" in pattern_reason or "pattern" in pattern_reason)):
                                should_trade = True
                            
                            if should_trade:
                                mock_trade_action()
                                await asyncio.sleep(5)  # Longer cooldown to prevent overtrading
                                
        except websockets.exceptions.ConnectionClosed:
            connection_status = "Disconnected"
            print("❌ WebSocket connection closed. Reconnecting...")
            await asyncio.sleep(3)
        except Exception as e:
            connection_status = "Error"
            print(f"❌ WebSocket Error: {e}. Reconnecting in 5 seconds...")
            await asyncio.sleep(5)

# Start WebSocket listener in a background thread
def start_ws_listener():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(deriv_tick_listener())

threading.Thread(target=start_ws_listener, daemon=True).start()

if __name__ == '__main__':
    print("🚀 Starting Zeus - Digit Over 4 Watcher")
    print("📊 Dashboard will be available at: http://localhost:5001")
    app.run(debug=True, port=5001, host='0.0.0.0')