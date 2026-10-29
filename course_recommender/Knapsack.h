#pragma once
#include "CourseDB.h"
#include <vector>
#include <cstdio>
#include <algorithm>

// ─────────────────────────────────────────────
//  Knapsack – 0/1 DP Course Selector
//
//  Mapping:
//    capacity W  = availableTime (hours)
//    item weight = course.duration
//    item value  = course.score  (scaled × 10 → integer for DP)
//
//  Space-optimised:  1-D dp[W+1]  → O(W) space
//  Full table kept for traceback: dp_table[n+1][W+1]
//
//  Time:  O(n × W)
//  Space: O(n × W) for traceback table (n≤20, W≤100 → 2100 cells — tiny)
// ─────────────────────────────────────────────

struct KnapsackResult {
    std::vector<Course> selected;
    std::vector<Course> skipped;
    int    totalTime;
    double totalScore;
    int    unusedTime;
};

class Knapsack {
public:
    // Main solve — returns selected & skipped courses
    KnapsackResult solve(const std::vector<Course>& courses, int W);

    // Print the full DP table (for visualisation / debugging)
    void printDPTable(const std::vector<Course>& courses, int W);

private:
    // Scale score to positive integer (scores can be negative for bad courses)
    // Shift so minimum becomes 1
    int scaleScore(double score, double minScore) const {
        return (int)((score - minScore) * 10.0) + 1;
    }
};

// ══════════════════════════════════════════════
//  IMPLEMENTATION
// ══════════════════════════════════════════════

inline KnapsackResult Knapsack::solve(const std::vector<Course>& courses, int W) {
    int n = (int)courses.size();

    // Find min score for scaling (all values must be positive for DP)
    double minScore = courses[0].score;
    for (const auto& c : courses) minScore = std::min(minScore, c.score);

    // Build scaled value array
    std::vector<int> val(n), wt(n);
    for (int i = 0; i < n; i++) {
        val[i] = scaleScore(courses[i].score, minScore);
        wt[i]  = courses[i].duration;
    }

    // ── DP Table  dp[i][w] = max value using first i items, capacity w ──
    // Using full table for traceback
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i-1][w];                        // skip item i
            if (wt[i-1] <= w) {                            // can include
                int include = dp[i-1][w - wt[i-1]] + val[i-1];
                dp[i][w] = std::max(dp[i][w], include);   // take better
            }
        }
    }

    // ── Traceback: find which items were selected ─────────────────────
    std::vector<bool> chosen(n, false);
    int w = W;
    for (int i = n; i >= 1; i--) {
        if (dp[i][w] != dp[i-1][w]) {   // item i was included
            chosen[i-1] = true;
            w -= wt[i-1];
        }
    }

    // ── Build result ──────────────────────────────────────────────────
    KnapsackResult result;
    result.totalTime  = 0;
    result.totalScore = 0.0;

    for (int i = 0; i < n; i++) {
        if (chosen[i]) {
            result.selected.push_back(courses[i]);
            result.totalTime  += courses[i].duration;
            result.totalScore += courses[i].score;
        } else {
            result.skipped.push_back(courses[i]);
        }
    }
    result.unusedTime = W - result.totalTime;
    return result;
}

inline void Knapsack::printDPTable(const std::vector<Course>& courses, int W) {
    int n = (int)courses.size();
    double minScore = courses[0].score;
    for (const auto& c : courses) minScore = std::min(minScore, c.score);

    std::vector<int> val(n), wt(n);
    for (int i = 0; i < n; i++) {
        val[i] = scaleScore(courses[i].score, minScore);
        wt[i]  = courses[i].duration;
    }

    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i-1][w];
            if (wt[i-1] <= w) {
                int include = dp[i-1][w - wt[i-1]] + val[i-1];
                dp[i][w] = std::max(dp[i][w], include);
            }
        }
    }

    printf("\n╔════════════════════════════════════════════╗\n");
    printf("║     0/1 KNAPSACK DP TABLE  (W=%2d hours)   ║\n", W);
    printf("╚════════════════════════════════════════════╝\n");

    // Print only every 5th column to keep output readable
    int step = std::max(1, W / 20);
    printf("%-22s |", "Course");
    for (int w = 0; w <= W; w += step) printf(" %3d", w);
    printf("\n");
    printf("%-22s-+", "----------------------");
    for (int w = 0; w <= W; w += step) printf("----");
    printf("\n");

    printf("%-22s |", "(empty)");
    for (int w = 0; w <= W; w += step) printf(" %3d", dp[0][w]);
    printf("\n");

    for (int i = 1; i <= n; i++) {
        // Truncate long names
        std::string name = courses[i-1].name;
        if (name.size() > 20) name = name.substr(0, 19) + "…";
        printf("%-22s |", name.c_str());
        for (int w = 0; w <= W; w += step) printf(" %3d", dp[i][w]);
        printf("\n");
    }
    printf("\nOptimal value (scaled) = %d  at dp[%d][%d]\n", dp[n][W], n, W);
}
