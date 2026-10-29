#include <iostream>

#include <vector>
#include <string>
#include <limits>
#include <algorithm>
#include <cstdio>

#include "CourseDB.h"
#include "Scorer.h"
#include "AVLTree.h"
#include "MinHeap.h"
#include "Knapsack.h"

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
static void clearInput() {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

static void printSeparator(char c = '-', int n = 55) {
    for (int i = 0; i < n; i++) putchar(c);
    putchar('\n');
}

static void printCourseCard(const Course& c, int rank = -1) {
    if (rank >= 0) printf("  %2d. ", rank + 1);
    else            printf("      ");
    printf("%-35s  score=%5.1f\n", c.name.c_str(), c.score);
    printf("       Category: %-12s  Duration: %2dh  "
           "Difficulty: %d/5  Rating: %.1f  Relevance: %d/10\n",
           c.category.c_str(), c.duration,
           c.difficulty, c.rating, c.relevance);
}

static void printResult(const KnapsackResult& res,
                         int availableTime,
                         const std::vector<Course>& quickWins,
                         const std::vector<Course>& hardHigh) {
    printf("\n");
    printSeparator('=');
    printf("  RECOMMENDATION RESULTS\n");
    printSeparator('=');

    printf("\n📚 OPTIMAL COURSE LIST  (0/1 Knapsack DP)\n");
    printSeparator();
    if (res.selected.empty()) {
        printf("  No courses fit within your time budget.\n");
    } else {
        for (int i = 0; i < (int)res.selected.size(); i++)
            printCourseCard(res.selected[i], i);
    }

    printf("\n📊 SUMMARY\n");
    printSeparator();
    printf("  Available time  : %2d h\n", availableTime);
    printf("  Time used       : %2d h\n", res.totalTime);
    printf("  Unused time     : %2d h\n", res.unusedTime);
    printf("  Total score     : %5.1f\n", res.totalScore);
    printf("  Courses selected: %d\n",   (int)res.selected.size());
    printf("  Courses skipped : %d\n",   (int)res.skipped.size());

    if (!res.skipped.empty()) {
        printf("\n⏭️  SKIPPED COURSES\n");
        printSeparator();
        for (const auto& c : res.skipped)
            printf("  ✗  %-35s  (%dh, score=%.1f)\n",
                   c.name.c_str(), c.duration, c.score);
    }

    if (!quickWins.empty()) {
        printf("\n⚡ QUICK WINS  (≤ 5 hours)\n");
        printSeparator();
        for (int i = 0; i < (int)quickWins.size() && i < 3; i++)
            printCourseCard(quickWins[i], i);
    }

    if (!hardHigh.empty()) {
        printf("\n🔥 HARD BUT HIGH-IMPACT  (difficulty ≥ 4, relevance ≥ 8)\n");
        printSeparator();
        for (const auto& c : hardHigh)
            printf("  ★  %-35s  diff=%d  rel=%d  score=%.1f\n",
                   c.name.c_str(), c.difficulty, c.relevance, c.score);
    }
    printf("\n");
}

// ─────────────────────────────────────────────
//  Add custom course interactively
// ─────────────────────────────────────────────
static Course inputCourse(int nextId) {
    Course c;
    c.id = nextId;

    clearInput();
    printf("  Course name      : ");
    std::getline(std::cin, c.name);
    printf("  Category         : ");
    std::getline(std::cin, c.category);

    printf("  Duration (hours) : ");
    std::cin >> c.duration;
    printf("  Difficulty (1-5) : ");
    std::cin >> c.difficulty;
    c.difficulty = std::max(1, std::min(5, c.difficulty));
    printf("  Rating (1.0-5.0) : ");
    std::cin >> c.rating;
    c.rating = std::max(1.0, std::min(5.0, c.rating));
    printf("  Relevance (1-10) : ");
    std::cin >> c.relevance;
    c.relevance = std::max(1, std::min(10, c.relevance));

    return c;
}

// ─────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────
int main() {
    printf("\n");
    printSeparator('=');
    printf("   SMART ONLINE COURSE RECOMMENDER\n");
    printf("   AVL Tree + 0/1 Knapsack DP + Min-Heap\n");
    printSeparator('=');

    // ── 1. Load default courses ───────────────
    std::vector<Course> courses = getDefaultCourses();
    int nextId = 21;

    // ── 2. Get user time budget ───────────────
    int availableTime = 0;
    printf("\nEnter your available study time per week (hours): ");
    std::cin >> availableTime;
    if (availableTime <= 0) availableTime = 20;

    // ── 3. Score all courses ──────────────────
    Scorer scorer(availableTime);
    scorer.printWeights();
    scorer.computeScores(courses);

    // ── 4. Build AVL tree ─────────────────────
    AVLTree tree;
    for (const auto& c : courses) tree.insert(c);

    // ── Menu loop ─────────────────────────────
    int choice = 0;
    do {
        printf("\n");
        printSeparator();
        printf("  MENU\n");
        printSeparator();
        printf("  1. Run Recommendation (DP Knapsack)\n");
        printf("  2. Show AVL Tree\n");
        printf("  3. Show DP Table\n");
        printf("  4. Show All Courses (sorted by score)\n");
        printf("  5. Add a Custom Course\n");
        printf("  6. Remove a Course by ID\n");
        printf("  7. Search Course by ID\n");
        printf("  8. Change Time Budget\n");
        printf("  0. Exit\n");
        printSeparator();
        printf("  Choice: ");
        std::cin >> choice;

        switch (choice) {

        case 1: {
            // Get sorted courses from AVL tree
            std::vector<Course> sorted = tree.getSortedDesc();

            // Run 0/1 Knapsack
            Knapsack ks;
            KnapsackResult res = ks.solve(sorted, availableTime);

            // Quick Wins via MinHeap
            MinHeap heap;
            std::vector<Course> qw = heap.quickWins(sorted, 5);

            // Hard but High-Impact via AVL filter
            std::vector<Course> hardHigh;
            for (const auto& c : sorted) {
                if (c.difficulty >= 4 && c.relevance >= 8)
                    hardHigh.push_back(c);
            }

            printResult(res, availableTime, qw, hardHigh);
            break;
        }

        case 2:
            tree.printTree();
            break;

        case 3: {
            std::vector<Course> sorted = tree.getSortedDesc();
            Knapsack ks;
            ks.printDPTable(sorted, availableTime);
            break;
        }

        case 4: {
            std::vector<Course> sorted = tree.getSortedDesc();
            printf("\n  ALL COURSES  (sorted by score, desc)\n");
            printSeparator();
            for (int i = 0; i < (int)sorted.size(); i++)
                printCourseCard(sorted[i], i);
            break;
        }

        case 5: {
            printf("\n  ADD CUSTOM COURSE\n");
            printSeparator();
            Course c = inputCourse(nextId++);
            c.score  = scorer.computeScore(c);
            tree.insert(c);
            courses.push_back(c);
            printf("  ✓ Course '%s' added (id=%d, score=%.1f)\n",
                   c.name.c_str(), c.id, c.score);
            break;
        }

        case 6: {
            int id;
            printf("  Enter course ID to remove: ");
            std::cin >> id;
            Course found;
            if (tree.search(id, found)) {
                tree.remove(id);
                courses.erase(std::remove_if(courses.begin(), courses.end(),
                    [id](const Course& c){ return c.id == id; }), courses.end());
                printf("  ✓ Removed: %s\n", found.name.c_str());
            } else {
                printf("  ✗ Course ID %d not found.\n", id);
            }
            break;
        }

        case 7: {
            int id;
            printf("  Enter course ID to search: ");
            std::cin >> id;
            Course found;
            if (tree.search(id, found)) {
                printf("\n  Found:\n");
                printCourseCard(found);
            } else {
                printf("  ✗ Course ID %d not found.\n", id);
            }
            break;
        }

        case 8: {
            printf("  Enter new time budget (hours): ");
            std::cin >> availableTime;
            Scorer newScorer(availableTime);
            newScorer.printWeights();
            // Recompute scores and rebuild tree
            tree = AVLTree();
            courses = getDefaultCourses();
            nextId = courses.size() + 1;
            newScorer.computeScores(courses);
            for (const auto& c : courses) tree.insert(c);
            printf("  ✓ Time budget updated. Scores recalculated.\n");
            // Update scorer reference for future custom inserts
            // (reassign local scorer)
            new (&scorer) Scorer(availableTime);
            break;
        }

        case 0:
            printf("\n  Goodbye! Happy learning 📖\n\n");
            break;

        default:
            printf("  Invalid choice. Try again.\n");
        }

    } while (choice != 0);

    return 0;
}