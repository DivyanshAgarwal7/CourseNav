export const COURSES = [
  ['Data Structures & Algorithms','DSA',15,4.8,4,9.5], ['Machine Learning Fundamentals','ML/AI',12,4.7,3,9], ['React & Modern Frontend','Web Dev',8,4.6,2,8], ['System Design','Systems',10,4.9,5,9.8], ['Deep Learning with PyTorch','ML/AI',14,4.8,4,9.2], ['Operating Systems','Systems',12,4.5,4,7.5], ['Computer Networks','Systems',9,4.4,3,7], ['Database Systems','Systems',10,4.6,3,8.5], ['Linear Algebra for ML','Math',6,4.7,3,8.8], ['AWS Cloud Practitioner','Cloud',5,4.3,2,7.5], ['Cybersecurity Fundamentals','Security',8,4.5,3,7.8], ['Node.js Backend Development','Web Dev',7,4.4,2,7.2], ['Kubernetes & Docker','Cloud',6,4.6,3,8], ['Statistics for Data Science','Math',5,4.7,3,9], ['NLP with Transformers','ML/AI',11,4.8,5,9.5], ['Compiler Design','Systems',13,4.2,5,6], ['iOS Development Swift','Mobile',9,4.4,3,6.5], ['GraphQL APIs','Web Dev',4,4.3,2,6.8], ['Reinforcement Learning','ML/AI',13,4.6,5,8.5], ['Git & DevOps Workflows','Other',3,4.5,1,7]
].map(([name, topic, duration, rating, difficulty, relevance], id) => ({ id, name, topic, duration, rating, difficulty, relevance }));
export const TOPIC_COLORS = { DSA:'#a69bff', 'ML/AI':'#67d5ff', 'Web Dev':'#d9ff54', Systems:'#ff9d5c', Math:'#ff7597', Cloud:'#6ee7c8', Security:'#f59ad8', Mobile:'#b9dd6c', Other:'#89909e' };
export function scoreCourse(course, weights = { rel:.4, rat:.35, dif:.25 }) { return +(100 * (weights.rel * course.relevance / 10 + weights.rat * course.rating / 5 - weights.dif * course.difficulty / 5)).toFixed(2); }
export function getScoredCourses(courses, weights) { return courses.map(course => ({ ...course, score: scoreCourse(course, weights) })).sort((a,b) => b.score - a.score); }
export function getPlan(courses, budget, weights) {
  const scored = getScoredCourses(courses, weights); const dp = Array.from({ length: scored.length + 1 }, () => Array(budget + 1).fill(0));
  for (let i=1;i<=scored.length;i++) for (let hours=0;hours<=budget;hours++) { const course=scored[i-1]; dp[i][hours]=dp[i-1][hours]; if(course.duration<=hours) dp[i][hours]=Math.max(dp[i][hours],dp[i-1][hours-course.duration]+course.score); }
  const selected=[]; let hours=budget; for(let i=scored.length;i>0;i--) if(dp[i][hours]!==dp[i-1][hours]) { selected.push(scored[i-1]); hours-=scored[i-1].duration; }
  return { scored, selected:selected.reverse(), totalHours:budget-hours, totalScore:dp[scored.length][budget], dp, n:scored.length, W:budget };
}

export function getDPExecution(plan) {
  const stride=Math.max(1,Math.floor(plan.W/20)); const steps=[];
  for(let i=1;i<=plan.n;i++) for(let j=stride;j<=plan.W;j+=stride) steps.push({i,j});
  const maxCols=Math.min(plan.W,30); const stride2=Math.max(1,Math.floor(plan.W/maxCols)); const columns=[];
  for(let j=0;j<=plan.W;j+=stride2) columns.push(j);
  return { steps, columns };
}

export function buildAVL(courses, weights) {
  const scored = getScoredCourses(courses, weights);
  const insert = (node, course) => {
    if (!node) return { course, left:null, right:null, height:1 };
    if (course.score < node.course.score || (course.score === node.course.score && course.id < node.course.id)) node.left = insert(node.left, course);
    else node.right = insert(node.right, course);
    node.height = 1 + Math.max(node.left?.height || 0, node.right?.height || 0);
    const balance = (node.left?.height || 0) - (node.right?.height || 0);
    if (balance > 1 && course.score < node.left.course.score) return rotateRight(node);
    if (balance < -1 && course.score >= node.right.course.score) return rotateLeft(node);
    if (balance > 1) { node.left = rotateLeft(node.left); return rotateRight(node); }
    if (balance < -1) { node.right = rotateRight(node.right); return rotateLeft(node); }
    return node;
  };
  const rotateRight = y => { const x=y.left; const t=x.right; x.right=y; y.left=t; y.height=1+Math.max(y.left?.height||0,y.right?.height||0); x.height=1+Math.max(x.left?.height||0,x.right?.height||0); return x; };
  const rotateLeft = x => { const y=x.right; const t=y.left; y.left=x; x.right=t; x.height=1+Math.max(x.left?.height||0,x.right?.height||0); y.height=1+Math.max(y.left?.height||0,y.right?.height||0); return y; };
  return { root: scored.reduce((root, course) => insert(root, course), null), scored };
}

export function flattenAVL(root) {
  const nodes=[]; const walk=(node, depth=0, order={ value:0 }) => { if(!node) return; walk(node.left, depth+1, order); nodes.push({ ...node, depth, order:order.value++ }); walk(node.right, depth+1, order); }; walk(root); return nodes;
}

export function layoutAVL(root) {
  const nodes=[]; const edges=[]; let order=0; const walk=(node, depth=0, parent=null) => {
    if(!node) return null;
    const left=walk(node.left, depth+1, node); const current={...node, depth, order:order++}; nodes.push(current); const right=walk(node.right, depth+1, node);
    if(left) edges.push({from:current.course.id,to:left.course.id}); if(right) edges.push({from:current.course.id,to:right.course.id}); return current;
  }; walk(root); return { nodes, edges };
}

export function getBinarySearchSteps(values, target) {
  const states=[]; let low=0, high=values.length-1, found=-1;
  while(low<=high){ const mid=Math.floor((low+high)/2); states.push({low,mid,high,comparison:values[mid]}); if(values[mid]===target){found=mid;break;} if(values[mid]<target) low=mid+1; else high=mid-1; }
  states.push({low,mid:-1,high,comparison:null,found}); return states;
}
