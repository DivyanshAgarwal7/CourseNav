# 🎓 CourseNav — Smart Online Course Recommender

**An algorithm-driven course recommendation system that helps learners build optimal study plans within a limited weekly time budget.**

CourseNav is a **Design and Analysis of Algorithms (DAA)** project that combines efficient data structures, dynamic programming, and algorithmic optimization to recommend valuable online courses based on career relevance, user ratings, course difficulty, and available study hours.

The project features two implementations:

- **C++ CLI Engine:** A high-performance command-line application implementing the core algorithms.
- **Vanilla JavaScript Web Visualizer:** An interactive dashboard that visualizes AVL Trees, Dynamic Programming tables, priority queues, and course analytics.

---

## ✨ Key Features

- **🎯 Dynamic Course Scoring:** Calculates a score for each course using career relevance, user ratings, and difficulty penalties.
- **⏱️ Optimal Study Planning:** Uses the 0/1 Knapsack algorithm to select the highest-value combination of courses within a weekly time budget.
- **⚡ Top-K Quick Wins:** Identifies the highest-scoring short-duration courses (5 hours or less) using a Min-Heap.
- **🌳 Self-Balancing AVL Tree:** Supports efficient course insertion, deletion, and searching based on computed scores.
- **📊 Interactive Algorithm Visualization:** Displays AVL Tree operations, step-by-step Knapsack DP table generation, and Chart.js analytics.
- **🔍 Course Management:** Allows users to add, remove, search, and organize courses.
- **💻 Dual Implementation:** Demonstrates the same core algorithmic concepts in C++ and JavaScript.

## 🧠 Algorithmic Architecture

### 1. AVL Tree — Self-Balancing Binary Search Tree

**Implementation:** `Avltree.h` and `app.js`

The AVL Tree serves as the primary data structure for organizing courses according to their computed scores.

**Why AVL Trees?**

A normal Binary Search Tree can become skewed, resulting in linear-time operations. An AVL Tree maintains height balance through rotations, ensuring efficient operations.

**Key operations:**
- Insert a course.
- Delete a course.
- Search for a course.
- Retrieve courses in descending score order using reverse in-order traversal.

**Complexity:**

| Operation | Time Complexity |
|---|---|
| Insertion | O(log n) |
| Deletion | O(log n) |
| Search | O(log n) |
| Sorted traversal | O(n) |

The tree requires O(n) space to store n courses.

### 2. 0/1 Knapsack — Dynamic Programming

**Implementation:** `Knapsack.h` and `app.js`

The Knapsack algorithm powers CourseNav's optimal recommendation engine. It selects a subset of courses that maximizes the total recommendation score without exceeding the learner's available study hours.

**Problem formulation:**

- **Capacity (W):** Maximum study hours available per week.
- **Weight (wᵢ):** Duration of course i.
- **Value (vᵢ):** Computed score of course i.
- **Decision:** Select or skip each course.

**DP recurrence:**

For a course with duration \(w_i\) and score \(v_i\):

\[
DP[i][c] =
\begin{cases}
DP[i-1][c], & w_i > c\\
\max(DP[i-1][c],\,v_i+DP[i-1][c-w_i]), & w_i \leq c
\end{cases}
\]

The algorithm considers both possibilities—excluding a course or including it if sufficient capacity remains—and chooses the better result.

**Why Dynamic Programming?**

A greedy strategy based on score or score-per-hour may produce a suboptimal combination. The 0/1 Knapsack algorithm systematically evaluates feasible combinations to obtain the maximum total score.

**Complexity:**
- Time: O(n × W)
- Space: O(n × W) for the full DP table.

*Note: W represents the discretized study-time capacity, so the standard implementation assumes integer-valued course durations and capacity.*

### 3. Min-Heap — Top-K Quick Wins

**Implementation:** `MinHeap.h` and `app.js`

The Min-Heap identifies the highest-scoring courses with a duration of five hours or less.

Instead of sorting every eligible course, the algorithm maintains a heap of at most K courses.

**How it works:**

1. Filter courses with a duration of at most five hours.
2. Insert eligible courses into a Min-Heap of size K.
3. When the heap exceeds K elements, remove the lowest-scoring course.
4. Return the remaining K highest-scoring eligible courses.

**Complexity:**
- Time: O(n log K) for the bounded-heap selection approach.
- Auxiliary space: O(K).

This is particularly useful when the dataset contains many courses but the learner only wants a small number of quick recommendations.

### 4. Dynamic Course Scoring

Each course receives a score based on three factors:

- **Career relevance:** How closely the course aligns with the learner's career goals.
- **User rating:** The course's rating or perceived quality.
- **Difficulty penalty:** An adjustment reflecting the course's difficulty.

The resulting score is used by the AVL Tree, Knapsack algorithm, and Quick Wins engine.

*The precise scoring formula and weights depend on the implementation in `Scorer.h` and `app.js`.*

---

## 📊 Complexity Analysis

Let:
- **n** = Number of courses
- **W** = Weekly study-time capacity
- **K** = Number of Quick Win courses requested

| Operation | Algorithm / Data Structure | Time Complexity | Space Complexity |
|---|---|---|---|
| Insert course | AVL Tree | O(log n) | O(n) total storage |
| Search course | AVL Tree | O(log n) | O(1) auxiliary |
| Delete course | AVL Tree | O(log n) | O(1) auxiliary, excluding implementation-specific recursion |
| Score all courses | Linear scan | O(n) | O(1) auxiliary |
| Optimal selection | 0/1 Knapsack DP | O(nW) | O(nW) |
| Top-K Quick Wins | Bounded Min-Heap | O(n log K) | O(K) |
| Sorted traversal | Reverse in-order AVL traversal | O(n) | O(n) worst-case output/stack bound |

The complexities describe standard implementations and exclude any additional storage used for returned result collections.

---

## 🏗️ Project Structure

```text
CourseNav/
│
├── Frontend/
│   ├── index.html       # Dashboard layout
│   ├── styles.css       # UI styling
│   └── app.js           # JavaScript algorithms and visualization
│
└── course_recommender/
    ├── Main.cpp         # CLI entry point and menu loop
    ├── CourseDB.h       # Course structure and mock dataset
    ├── Scorer.h         # Course scoring logic
    ├── Avltree.h        # AVL Tree implementation
    ├── MinHeap.h        # Min-Heap implementation
    └── Knapsack.h       # Knapsack DP and traceback
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| C++ | Core algorithmic engine |
| HTML5 | Frontend structure |
| CSS3 | Dashboard styling |
| Vanilla JavaScript | Interactive visualizer and algorithm implementations |
| Chart.js | Course analytics and charts |
| GCC / MinGW | Compiling the C++ application |

---

## 🚀 Getting Started

### Prerequisites

For the web visualizer:
- A modern web browser.

For the C++ CLI:
- A C++ compiler supporting the required C++ standard, such as GCC or MinGW.
- A terminal or command prompt.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CourseNav
```

Replace the placeholder with your actual repository URL.

### 2. Run the Web Visualizer

1. Navigate to the `Frontend` directory.
2. Open `index.html` in a modern web browser.
3. Explore the course dashboard and interactive algorithm visualizations.

```text
CourseNav/
└── Frontend/
    └── index.html
```

The frontend does not require a build step or local server, provided its dependencies are available as configured in the project.

### 3. Run the C++ CLI Engine

Navigate to the C++ project directory:

```bash
cd course_recommender
```

Compile the program:

```bash
g++ Main.cpp -o CourseNav
```

Run it on Linux or macOS:

```bash
./CourseNav
```

On Windows Command Prompt or PowerShell:

```powershell
.\CourseNav.exe
```

If your compiler requires a specific C++ standard, add the corresponding flag, for example `-std=c++17`.

---

## 🖥️ How CourseNav Works

The recommendation workflow follows these steps:

1. **Load courses:** Initialize the course database.
2. **Calculate scores:** Evaluate each course using its scoring factors.
3. **Organize courses:** Store courses in the AVL Tree for efficient management and retrieval.
4. **Set a weekly budget:** Specify the maximum number of hours available for learning.
5. **Optimize recommendations:** Apply 0/1 Knapsack DP to select the combination with the highest total score.
6. **Find Quick Wins:** Use a bounded Min-Heap to identify high-scoring courses requiring five hours or less.
7. **Visualize results:** Inspect the AVL Tree, DP table, and course analytics in the web dashboard.

---

## 🎯 Project Objectives

- Apply fundamental and advanced DAA concepts to a practical recommendation problem.
- Demonstrate the use of self-balancing trees, heaps, and dynamic programming.
- Compare efficient algorithmic approaches for searching, ranking, and optimization.
- Visualize data structures and algorithm execution interactively.
- Help learners allocate their limited study time more effectively.

## 🔮 Future Enhancements

- Personalized learning paths based on career goals and skill levels.
- Course recommendations using prerequisite dependencies.
- Persistent storage for user profiles and course progress.
- Integration with real course catalogs and live ratings.
- Adaptive scoring based on learner feedback.
- Advanced analytics for tracking learning progress and completed courses.

## 📚 DAA Concepts Demonstrated

| Concept | Application |
|---|---|
| Self-balancing Binary Search Trees | AVL Tree |
| Tree rotations and height balancing | Maintaining AVL invariants |
| Dynamic Programming | 0/1 Knapsack |
| Greedy versus optimal strategies | Comparing course selection methods |
| Priority Queues and Heaps | Top-K Quick Wins |
| Complexity analysis | Evaluating time and space efficiency |
| Algorithm visualization | Interactive dashboard |

## 👥 Contributors

Developed as a **Design and Analysis of Algorithms (DAA) academic project**.

Add the project contributors' names and GitHub profiles here.

## 📄 License

No license has been specified yet. If you intend to distribute or accept contributions to this project publicly, consider adding an appropriate open-source license.

---

**CourseNav — Plan smarter. Learn efficiently. Make every study hour count.**