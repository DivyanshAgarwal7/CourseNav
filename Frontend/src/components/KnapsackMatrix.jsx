export default function KnapsackMatrix({ plan, execution, step, setStep, playing, setPlaying }) {
  const current = execution.steps[Math.max(0, step - 1)];
  const showTrace = step > execution.steps.length;
  const traceback = new Map();
  let capacity = plan.W;
  for (let i = plan.n; i > 0; i--) {
    const picked = plan.dp[i][capacity] !== plan.dp[i - 1][capacity];
    traceback.set(`${i}-${capacity}`, picked ? 'traceback' : 'highlight');
    if (picked) capacity -= plan.scored[i - 1].duration;
  }
  const cellClass = (i, column) => {
    if (showTrace) return traceback.get(`${i}-${column}`) || '';
    if (!current) return '';
    const course = plan.scored[current.i - 1];
    if (i === current.i && column === current.j) return 'cur-cell';
    if (i === current.i - 1 && column === current.j) return 'skip-option';
    if (course.duration <= current.j && i === current.i - 1 && column === current.j - course.duration) return 'include-option';
    return '';
  };
  return <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Dynamic programming / 0-1 knapsack</span><h1>Find the <em>best fit.</em></h1><p>The matrix is the detailed proof: every cell stores the best score possible for a number of courses and hours.</p></div><div className="heading-stat"><b>{Math.min(step, execution.steps.length)}/{execution.steps.length}</b><span>cells executed</span></div></div><div className="dp-controls"><button onClick={() => setStep(Math.max(0, step - 1))}>← Previous</button><button className="primary" onClick={() => setStep(Math.min(execution.steps.length, step + 1))}>Next cell →</button><button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Auto play'}</button><button onClick={() => { setPlaying(false); setStep(0); }}>Reset</button><button onClick={() => setStep(execution.steps.length + 1)}>Show traceback</button><span>{current ? `Course: ${plan.scored[current.i - 1].name.slice(0, 20)} · W=${current.j} · Value=${plan.dp[current.i][current.j].toFixed(1)}` : showTrace ? 'Traceback highlighted' : `Step 0 / ${execution.steps.length}`}</span></div><div className="dp-wrap"><table className="dp-table"><thead><tr><th>Course \\ W</th>{execution.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{plan.dp.map((values, i) => <tr key={i}><th>{i === 0 ? '∅' : `${plan.scored[i - 1].name.slice(0, 14)}…`}</th>{execution.columns.map(column => <td key={column} className={cellClass(i, column)}>{values[column] > 0 ? values[column].toFixed(0) : '0'}</td>)}</tr>)}</tbody></table></div><div className="traceback"><span>↗</span><b>{showTrace ? 'Traceback path highlighted' : 'Selected courses'}</b><div>{plan.selected.map(course => <span className="tag" key={course.id}>{course.name}</span>)}</div></div></section>;
}
