import json
import asyncio
import websockets
from collections import deque, Counter
from flask import Flask, render_template_string, request, jsonify
import threading
import time

app = Flask(__name__)

# Settings
watch_count = 10
over_threshold = 6
last_digits = deque(maxlen=watch_count)
trade_enabled = False
market_symbol = "R_10"
deriv_ws_url = "wss://ws.binaryws.com/websockets/v3?app_id=1089"

def mock_trade_action():
    print("🔁 Mock Trade Executed: CALL on Over 4")

# Enhanced UI Template with circular digits
HTML_PAGE = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digit Over 4 Watcher</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f5f7fa; 
            margin: 0; 
            padding: 20px; 
            color: #333;
        }
        .container { 
            max-width: 900px; 
            margin: auto; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.05); 
        }
        h1 { 
            text-align: center; 
            color: #2c3e50; 
            margin-bottom: 25px;
            font-weight: 600;
        }
        .market-options { 
            text-align: center; 
            margin-bottom: 25px; 
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        .market-options select { 
            padding: 10px 15px; 
            font-size: 16px; 
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
        }
        .market-options label { 
            margin-left: 20px; 
            font-size: 16px; 
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .market-options input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        .stats { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            gap: 20px;
        }
        .stats > div { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            width: 100%; 
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        .stats h3 {
            margin-top: 0;
            color: #555;
            font-size: 16px;
        }
        .stats p {
            font-size: 24px;
            margin: 10px 0 0;
            font-weight: 600;
        }
        #signal.good { color: #27ae60; }
        #signal.wait { color: #f39c12; }
        .history { 
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        .history h3, .frequency h3 {
            margin-top: 0;
            color: #555;
        }
        .history ul { 
            list-style: none; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            gap: 15px;
            flex-wrap: wrap;
        }
        .digit-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: bold;
            box-shadow: 0 3px 6px rgba(0,0,0,0.1);
        }
        .digit-under { 
            background: #e74c3c; 
            color: white;
        }
        .digit-over { 
            background: #3498db; 
            color: white;
        }
        .frequency { 
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        .frequency table { 
            width: 100%; 
            margin: auto; 
            border-collapse: collapse; 
        }
        .frequency th, .frequency td { 
            border: 1px solid #ddd; 
            padding: 10px; 
            text-align: center; 
        }
        .frequency th { 
            background: #3498db; 
            color: white; 
            font-weight: 500;
        }
        .frequency .digit-row-under { background-color: #ffebee; }
        .frequency .digit-row-over { background-color: #e3f2fd; }
        .legend { 
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        .legend-item { 
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
        .legend-under .legend-color { background: #e74c3c; }
        .legend-over .legend-color { background: #3498db; }
        .prediction {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 14px;
        }
        #predicted {
            font-weight: 600;
            color: #2c3e50;
        }
    </style>
    <script>
        async function updateStats() {
            const res = await fetch('/check');
            const data = await res.json();
            document.getElementById('over_count').innerText = data.over_count;
            document.getElementById('signal').innerText = data.signal;
            document.getElementById('signal').className = data.signal.includes('Good') ? 'good' : 'wait';
            document.getElementById('predicted').innerText = data.predicted;
            
            // Update digits with circular design
            const digitsList = document.getElementById('last_digits');
            digitsList.innerHTML = '';
            data.last_digits.forEach(d => {
                const li = document.createElement('li');
                const div = document.createElement('div');
                div.className = `digit-circle ${d > 4 ? 'digit-over' : 'digit-under'}`;
                div.innerText = d;
                li.appendChild(div);
                digitsList.appendChild(li);
            });
            
            // Update frequency table with color coding
            const freqTable = document.getElementById('digit_freq');
            freqTable.innerHTML = '<tr><th>Digit</th><th>Count</th></tr>';
            data.digit_counts.forEach((count, i) => {
                const row = freqTable.insertRow();
                row.className = i > 4 ? 'digit-row-over' : 'digit-row-under';
                row.insertCell().innerText = i;
                row.insertCell().innerText = count;
            });
        }
        function changeMarket() {
            const symbol = document.getElementById('market').value;
            fetch(`/change_market?symbol=${symbol}`);
        }
        async function toggleTrade(checkbox) {
            await fetch(`/toggle_trade?state=${checkbox.checked ? 'on' : 'off'}`);
        }
        setInterval(updateStats, 1000);
        window.onload = updateStats;
    </script>
</head>
<body>
    <div class="container">
        <h1>📊 Digit Over 4 Watcher</h1>
        
        <div class="market-options">
            <select id="market" onchange="changeMarket()">
                <option value="R_10">Volatility 10</option>
                <option value="R_25">Volatility 25</option>
                <option value="R_50">Volatility 50</option>
                <option value="R_75">Volatility 75</option>
                <option value="R_100">Volatility 100</option>
            </select>
            <label><input type="checkbox" onchange="toggleTrade(this)"> Enable Auto-Trade</label>
        </div>
        
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
        
        <div class="stats">
            <div>
                <h3>Over 4 Count</h3>
                <p id="over_count">0</p>
            </div>
            <div>
                <h3>Signal</h3>
                <p id="signal">Checking...</p>
            </div>
            <div>
                <h3>Prediction</h3>
                <p id="predicted">-</p>
            </div>
        </div>
        
        <div class="history">
            <h3>🔢 Last 10 Digits</h3>
            <ul id="last_digits"></ul>
        </div>
        
        <div class="frequency">
            <h3>📈 Digit Frequency</h3>
            <table id="digit_freq">
                <tr><th>Digit</th><th>Count</th></tr>
            </table>
        </div>
    </div>
</body>
</html>
'''

# [Rest of the code remains exactly the same...]
@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

def detect_pattern(digits):
    """Analyze the sequence of digits for patterns and return a prediction."""
    if len(digits) < 3:
        return None, "Insufficient data for pattern analysis"

    # Check for repeating digits (e.g., 5,5,5)
    last_three = list(digits)[-3:]
    if len(set(last_three)) == 1:
        return last_three[0], "Repeating digit detected"

    # Check for high/low trend (digits > 4 or <= 4)
    high_count = sum(1 for d in last_three if d > 4)
    if high_count == 3:
        return max(digits), "Strong trend of high digits (>4)"
    elif high_count == 0:
        return min(digits), "Strong trend of low digits (<=4)"

    # Check for alternating or repeating short sequences (e.g., 3,5,3,5)
    sequence = list(digits)
    for length in range(2, min(5, len(sequence) // 2 + 1)):
        for i in range(len(sequence) - 2 * length + 1):
            if sequence[i:i+length] == sequence[i+length:i+2*length]:
                return sequence[i+length-1], f"Repeating sequence of length {length} detected"
    
    # Fallback to most frequent digit if no clear pattern
    counter = Counter(digits)
    most_common = counter.most_common(1)
    if most_common:
        return most_common[0][0], "Most frequent digit (no clear pattern)"
    
    return None, "No pattern detected"

@app.route('/check')
def check():
    over_count = sum(1 for d in last_digits if d > 4)
    digit_counts = [last_digits.count(i) for i in range(10)]
    
    if len(last_digits) < watch_count:
        signal = "🔄 Collecting Data..."
    else:
        predicted_digit, pattern_reason = detect_pattern(last_digits)
        # Strengthen signal if close to threshold and a strong pattern is detected
        if over_count >= over_threshold:
            signal = "✅ Good to Enter"
        elif over_count >= over_threshold - 1 and pattern_reason.startswith("Repeating") and predicted_digit > 4:
            signal = "✅ Good to Enter (Pattern Boost)"
        else:
            signal = "⏳ Wait"
    
    predicted = f"{predicted_digit} ({pattern_reason})" if predicted_digit is not None else "-"

    return jsonify({
        "last_digits": list(last_digits),
        "over_count": over_count,
        "signal": signal,
        "digit_counts": digit_counts,
        "predicted": predicted
    })

@app.route('/change_market')
def change_market():
    global market_symbol, last_digits
    market_symbol = request.args.get("symbol", "R_10")
    last_digits = deque(maxlen=watch_count)  # Reset digits when market changes
    return '', 204

@app.route('/toggle_trade')
def toggle_trade():
    global trade_enabled
    trade_enabled = request.args.get("state") == "on"
    print("Auto-trade is", "enabled" if trade_enabled else "disabled")
    return '', 204

async def deriv_tick_listener():
    global market_symbol, trade_enabled
    while True:
        try:
            async with websockets.connect(deriv_ws_url) as ws:
                await ws.send(json.dumps({"ticks": market_symbol}))
                while True:
                    response = await ws.recv()
                    data = json.loads(response)
                    if 'tick' in data:
                        last_digit = int(str(data['tick']['quote'])[-1])
                        last_digits.append(last_digit)

                        over_count = sum(1 for d in last_digits if d > 4)
                        if trade_enabled and over_count >= over_threshold:
                            mock_trade_action()
                            await asyncio.sleep(2)  # Cooldown
        except Exception as e:
            print(f"WebSocket Error: {e}. Reconnecting...")
            await asyncio.sleep(3)

# Start WebSocket listener in a background thread
def start_ws_listener():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(deriv_tick_listener())

threading.Thread(target=start_ws_listener, daemon=True).start()

if __name__ == '__main__':
    app.run(debug=True,port=5001)