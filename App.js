import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const GRID = 20;
const CELL = Math.floor((width - 40) / GRID);
const BOARD = CELL * GRID;

const RAINBOW = ['#ff6b6b','#ff9f43','#ffd32a','#0be881','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#00d2d3','#ff6b81'];

function segColor(i, total) {
  const t = i / Math.max(total - 1, 1);
  return RAINBOW[Math.floor(t * (RAINBOW.length - 1)) % RAINBOW.length];
}

export default function App() {
  const [snake, setSnake] = useState([{x:10,y:10},{x:9,y:10},{x:8,y:10}]);
  const [food, setFood] = useState({x:5,y:5});
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [speed, setSpeed] = useState(250);

  const dirRef = useRef({x:1,y:0});
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);

  const rndFood = (s) => {
    let f;
    do { f = {x:Math.floor(Math.random()*GRID), y:Math.floor(Math.random()*GRID)}; }
    while (s.some(p => p.x===f.x && p.y===f.y));
    return f;
  };

  const start = () => {
    const init = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dirRef.current = {x:1,y:0};
    scoreRef.current = 0;
    setSnake(init);
    setFood(rndFood(init));
    setScore(0);
    setOver(false);
    setSpeed(250);
    setRunning(true);
  };

  // Speed length ke hisab se
  useEffect(() => {
    const newSpeed = Math.max(60, 280 - snakeRef.current.length * 10);
    setSpeed(newSpeed);
  }, [snake]);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      const s = snakeRef.current;
      const d = dirRef.current;
      const h = {x: s[0].x + d.x, y: s[0].y + d.y};

      if (h.x<0||h.x>=GRID||h.y<0||h.y>=GRID||s.some(p=>p.x===h.x&&p.y===h.y)) {
        setRunning(false);
        setOver(true);
        setBest(b => Math.max(b, scoreRef.current));
        return;
      }

      const ate = h.x===foodRef.current.x && h.y===foodRef.current.y;
      const ns = ate ? [h,...s] : [h,...s.slice(0,-1)];
      setSnake(ns);

      if (ate) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        setFood(rndFood(ns));
      }

    }, Math.max(60, 280 - snakeRef.current.length * 10));
    return () => clearInterval(iv);
  }, [running, snake]);

  const move = (dx, dy) => {
    const d = dirRef.current;
    if (dx!==0 && d.x!==0) return;
    if (dy!==0 && d.y!==0) return;
    dirRef.current = {x:dx, y:dy};
  };

  // Speed label
  const speedLabel = () => {
    if (speed >= 220) return '🐢 Slow';
    if (speed >= 150) return '😊 Normal';
    if (speed >= 100) return '🐍 Fast';
    return '⚡ Bahut Fast';
  };

  return (
    <View style={st.wrap}>

      {/* Title */}
      <Text style={st.title}>🐍 Snake Game</Text>

      {/* Score Cards */}
      <View style={st.scoreRow}>
        <View style={st.card}>
          <Text style={st.cardLabel}>SCORE</Text>
          <Text style={[st.cardVal, {color:'#4ade80'}]}>{score}</Text>
        </View>
        <View style={st.card}>
          <Text style={st.cardLabel}>BEST</Text>
          <Text style={[st.cardVal, {color:'#fbbf24'}]}>{best}</Text>
        </View>
        <View style={st.card}>
          <Text style={st.cardLabel}>LENGTH</Text>
          <Text style={[st.cardVal, {color:'#60a5fa'}]}>{snake.length}</Text>
        </View>
      </View>

      {/* Speed Indicator */}
      <View style={st.speedBox}>
        <Text style={st.speedTxt}>Speed: {speedLabel()}</Text>
        <View style={st.speedBar}>
          <View style={[st.speedFill, {
            width: `${Math.min(100, ((280 - speed) / 220) * 100)}%`,
            backgroundColor: speed >= 220 ? '#4ade80' : speed >= 150 ? '#fbbf24' : speed >= 100 ? '#ff9f43' : '#ff6b6b',
          }]}/>
        </View>
      </View>

      {/* Game Board */}
      <View style={[st.board, {width:BOARD, height:BOARD}]}>

        {/* Food */}
        <View style={[st.food, {
          left: food.x * CELL,
          top: food.y * CELL,
          width: CELL - 2,
          height: CELL - 2,
        }]}/>

        {/* Rainbow Snake */}
        {snake.map((p, i) => (
          <View key={i} style={[st.seg, {
            left: p.x * CELL,
            top: p.y * CELL,
            width: CELL - 2,
            height: CELL - 2,
            backgroundColor: segColor(i, snake.length),
            borderRadius: i === 0 ? 5 : 3,
          }]}/>
        ))}

        {/* Overlay */}
        {(over || !running) && (
          <View style={st.overlay}>
            <Text style={st.ovTitle}>{over ? '💀 Game Over!' : '🐍 Snake'}</Text>
            <Text style={st.ovSub}>
              {over
                ? `Score: ${score}${score === best && score > 0 ? ' 🏆 Best!' : ''}`
                : 'Start dabao!'}
            </Text>
          </View>
        )}
      </View>

      {/* D-Pad */}
      <View style={st.dpad}>
        <TouchableOpacity style={st.btn} onPress={() => move(0,-1)}>
          <Text style={st.arr}>▲</Text>
        </TouchableOpacity>
      </View>
      <View style={st.dpad}>
        <TouchableOpacity style={st.btn} onPress={() => move(-1,0)}>
          <Text style={st.arr}>◀</Text>
        </TouchableOpacity>
        <View style={[st.btn, {backgroundColor:'transparent', borderColor:'transparent'}]}/>
        <TouchableOpacity style={st.btn} onPress={() => move(1,0)}>
          <Text style={st.arr}>▶</Text>
        </TouchableOpacity>
      </View>
      <View style={st.dpad}>
        <TouchableOpacity style={st.btn} onPress={() => move(0,1)}>
          <Text style={st.arr}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Start Button */}
      <TouchableOpacity style={st.startBtn} onPress={start}>
        <Text style={st.startTxt}>{over ? '🔄 Phir Khelo' : '▶ Start'}</Text>
      </TouchableOpacity>

    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex:1, backgroundColor:'#1a1a2e', alignItems:'center', paddingTop:50 },
  title: { color:'#4ade80', fontSize:26, fontWeight:'bold', marginBottom:12 },

  // Score Cards
  scoreRow: { flexDirection:'row', gap:10, marginBottom:10 },
  card: { backgroundColor:'#16213e', borderRadius:10, paddingVertical:8, paddingHorizontal:16, alignItems:'center', borderWidth:1, borderColor:'#334' },
  cardLabel: { color:'#888', fontSize:10, fontWeight:'600', letterSpacing:1 },
  cardVal: { fontSize:26, fontWeight:'bold', marginTop:2 },

  // Speed Bar
  speedBox: { width: BOARD, marginBottom:10 },
  speedTxt: { color:'#aaa', fontSize:12, marginBottom:4 },
  speedBar: { height:6, backgroundColor:'#16213e', borderRadius:10, overflow:'hidden' },
  speedFill: { height:6, borderRadius:10 },

  // Board
  board: { backgroundColor:'#111', borderRadius:8, borderWidth:1, borderColor:'#333', position:'relative', overflow:'hidden' },
  seg: { position:'absolute' },
  food: { position:'absolute', backgroundColor:'#ff4757', borderRadius:100 },

  // Overlay
  overlay: { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center' },
  ovTitle: { color:'#fff', fontSize:24, fontWeight:'bold' },
  ovSub: { color:'#aaa', fontSize:15, marginTop:6 },

  // Controls
  dpad: { flexDirection:'row', gap:6, marginVertical:3 },
  btn: { width:56, height:56, backgroundColor:'#16213e', borderRadius:10, borderWidth:1, borderColor:'#334', alignItems:'center', justifyContent:'center' },
  arr: { color:'#fff', fontSize:22 },
  startBtn: { marginTop:12, backgroundColor:'#4ade80', paddingHorizontal:36, paddingVertical:12, borderRadius:10 },
  startTxt: { color:'#111', fontSize:16, fontWeight:'bold' },
});
