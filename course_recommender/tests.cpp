#include <cassert>
#include <vector>
#include "Knapsack.h"

static Course makeCourse(int id, int duration, double score) {
    Course c(id, "Test Course", "Test", duration, 2, 4.0, 8);
    c.score = score;
    return c;
}

int main() {
    Knapsack solver;

    // Empty datasets must return safely instead of dereferencing courses[0].
    auto empty = solver.solve({}, 20);
    assert(empty.selected.empty());
    assert(empty.skipped.empty());

    // Negative capacity is clamped to a safe zero-capacity result.
    auto negativeBudget = solver.solve({ makeCourse(1, 2, 10.0) }, -50);
    assert(negativeBudget.selected.empty());
    assert(negativeBudget.skipped.size() == 1);
    assert(negativeBudget.unusedTime == 0);

    // Invalid negative durations must never create an invalid DP index.
    auto invalidDuration = solver.solve({ makeCourse(1, -2, 10.0), makeCourse(2, 2, 5.0) }, 4);
    assert(invalidDuration.totalTime >= 0);
    assert(invalidDuration.totalTime <= 4);

    // Extreme capacity is bounded while still allowing valid work to complete.
    auto hugeBudget = solver.solve({ makeCourse(1, 1, 10.0) }, 1000000000);
    assert(hugeBudget.totalTime == 1);
    assert(hugeBudget.unusedTime == 999);

    return 0;
}
