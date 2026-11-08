# CourseNav

CourseNav is an interactive course recommendation engine built as a Design and Analysis of Algorithms project. It helps learners choose the highest-value combination of courses within a weekly time budget and makes the underlying algorithms understandable through live visualizations.

The application combines course scoring, an AVL index, 0/1 Knapsack dynamic programming, binary search, analytics, and responsive interaction design.

## Features

- Personalized course scoring using relevance, rating, and difficulty weights.
- Recommendation planning with 0/1 Knapsack optimization.
- Interactive DP matrix with cell-by-cell execution, skip/include decisions, and traceback visualization.
- AVL Tree visualization with balance explanation, parent-child edges, score ordering, and responsive inspection on small screens.
- Binary Search visualization with low, mid, and high pointers.
- Course search, quick-add controls, weekly budget controls, and scoring sliders.
- Analytics for score distribution, topic coverage, route quality, and complexity.
- Responsive layouts for desktop, tablet, and mobile screens.
- Premium hero experience with lazy-loaded React Three Fiber visual effects.
- Reduced-motion support for accessibility.

## System Design

```text
┌──────────────────────────────────────────────────────────────┐
│                         React UI                             │
│  Hero · Recommendations · AVL · DP · Binary Search · Stats   │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Application State                          │
│ courses · budget · scoring weights · active tab · step state │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Algorithm / Domain Layer                     │
│ scoreCourse → getPlan → AVL index → DP execution → analytics │
└───────────────┬──────────────────┬───────────────────────────┘
                │                  │
                ▼                  ▼
       ┌────────────────┐  ┌────────────────────┐
       │ Recommendation │  │ Visual explanations │
       │ result + route │  │ matrix/tree/search  │
       └────────────────┘  └────────────────────┘

Separate reference implementation:
Main.cpp → CourseDB → Scorer → AVLTree / MinHeap / Knapsack
```

### Runtime flow

1. The course catalogue is loaded into React state.
2. User inputs update the weekly budget and scoring weights.
3. `scoreCourse` calculates a score for every course.
4. `getPlan` builds the dynamic-programming table and reconstructs the selected route.
5. `buildAVL` creates the balanced score index used by the AVL visualization.
6. Execution helpers produce explainable states for the DP and Binary Search visualizers.
7. React renders the active workspace and analytics from the same computed model.

### Frontend architecture

- `App.jsx` owns page composition, navigation, shared state, and algorithm visualizer views.
- `algorithms.js` contains deterministic course scoring, planning, AVL construction, and search/DP step generation.
- `components/KnapsackMatrix.jsx` renders the interactive matrix and traceback state.
- `components/Hero3D.jsx` renders the interactive 3D hero network.
- `styles.css` contains the responsive design system, dark theme, visual states, and reduced-motion rules.
- GSAP and ScrollTrigger handle entrance, scroll, and section-transition animation.
- The 3D hero is loaded with `React.lazy()` so Three.js/R3F is code-split into a separate chunk.

### C++ architecture

The C++ CLI mirrors the algorithmic model independently:

```text
Main.cpp
 ├── CourseDB.h   course model and default catalogue
 ├── Scorer.h     score calculation
 ├── Avltree.h    balanced score index
 ├── MinHeap.h   top-K quick wins
 └── Knapsack.h  0/1 DP selection and traceback
```

## Algorithms

### Dynamic scoring

Each course score combines career relevance, course rating, and a difficulty penalty. The weights are user-adjustable and the resulting scores feed the AVL tree, recommendation planner, and analytics.

### AVL Tree

The AVL tree stores courses by score and maintains a balance factor between `-1` and `+1`. When insertion makes a subtree too tall, the implementation restores balance with LL, RR, LR, or RL rotations.

| Operation | Complexity |
|---|---:|
| Insert | O(log n) |
| Search | O(log n) |
| Delete | O(log n) |
| In-order traversal | O(n) |

### 0/1 Knapsack

For each course and available capacity, the DP table stores the best score possible using the first `i` courses:

```text
DP[i][w] = max(
  DP[i - 1][w],
  DP[i - 1][w - duration[i]] + score[i]
)
```

The visualizer shows the current cell, skipped option, included option, winning value, and final traceback path.

| Operation | Complexity |
|---|---:|
| Planning | O(n × W) |
| Full DP table | O(n × W) |

### Binary Search

The search visualizer operates on sorted course scores and shows how each comparison discards half of the remaining interval.

### Min-Heap

The bounded min-heap keeps the highest-scoring short courses without sorting the complete eligible catalogue.

| Operation | Complexity |
|---|---:|
| Top-K quick wins | O(n log K) |
| Heap storage | O(K) |

## Project Structure

```text
CourseNav/
├── Frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── public/
│   │   └── _headers              # Netlify / Cloudflare security headers
│   └── src/
│       ├── App.jsx               # Main application and views
│       ├── algorithms.js         # Recommendation algorithms
│       ├── styles.css            # Responsive UI and animations
│       └── components/
│           ├── Hero3D.jsx        # Lazy-loaded 3D hero
│           └── KnapsackMatrix.jsx
├── course_recommender/
│   ├── Main.cpp
│   ├── CourseDB.h
│   ├── Scorer.h
│   ├── Avltree.h
│   ├── MinHeap.h
│   ├── Knapsack.h
│   └── tests.cpp                 # C++ validation tests
├── .gitignore
└── Readme.md
```

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based application UI |
| Vite | Frontend development and production bundling |
| Tailwind CSS | Utility CSS configuration |
| GSAP + ScrollTrigger | Entrance and scroll-based animation |
| Three.js + React Three Fiber | Interactive 3D hero network |
| Lucide React | Interface icons |
| C++17-compatible compiler | Reference CLI algorithm engine |

## Getting Started

### Frontend

```powershell
cd Frontend
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with:

```powershell
npm run build
```

The generated production files are written to `Frontend/dist`.

### C++ CLI

From the repository root:

```powershell
cd course_recommender
g++ -std=c++17 Main.cpp -o CourseNav.exe
.\CourseNav.exe
```

On Linux or macOS:

```bash
g++ -std=c++17 Main.cpp -o CourseNav
./CourseNav
```

## Testing and Security

The project validates C++ budgets and course durations, clamps extreme values, guards empty course lists before Knapsack execution, and safely escapes user-controlled values in the legacy renderer.

Run the C++ regression tests with:

```powershell
cd course_recommender
g++ -std=c++17 tests.cpp -o course_nav_tests.exe
.\course_nav_tests.exe
```

The tests cover empty course datasets, negative budgets, invalid course durations, and extremely large budgets.

Run the frontend dependency audit with:

```powershell
cd Frontend
npm audit
```

Production security headers are configured in both `Frontend/public/_headers` and `Frontend/vercel.json`. They include CSP, HSTS, clickjacking protection, MIME sniffing protection, referrer policy, permissions policy, and cross-origin isolation controls.

## Deployment

- For Vercel, deploy with `Frontend` as the project root so `vercel.json` is applied.
- For Netlify or Cloudflare Pages, deploy the Vite output from `Frontend/dist`; the copied `_headers` file provides the security headers.
- The 3D hero is lazy-loaded and code-split from the main JavaScript bundle.

## Design Principles

- Recommendation first: every animation supports understanding the engine.
- Explainable algorithms: intermediate states are visible instead of showing only final results.
- Responsive by default: dense visualizations remain usable on phones and tablets.
- Accessible motion: users who prefer reduced motion receive static transitions.
- Defensive inputs: budgets, durations, empty data, and extreme values are handled safely.

## License

No license has been specified yet. Add an appropriate license before public distribution.

---

**CourseNav — plan smarter, learn efficiently, and make every study hour count.**
