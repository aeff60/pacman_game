from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

players = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    session_id = request.sid
    players[session_id] = {
        'x': 200,  # Assuming canvas width is 400
        'y': 200,  # Assuming canvas height is 400
        'dir': 'RIGHT'
    }
    emit('update_game', {'players': players})

@socketio.on('player_move')
def handle_player_move(data):
    session_id = request.sid
    players[session_id] = data['pacman']
    emit('update_game', {'players': players}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    if session_id in players:
        del players[session_id]
    emit('update_game', {'players': players}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
