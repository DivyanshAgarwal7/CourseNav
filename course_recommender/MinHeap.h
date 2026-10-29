#pragma once
#include "CourseDB.h"
#include <vector>
#include <stdexcept>
#include <cstdio>

// ─────────────────────────────────────────────
//  MinHeap – extracts Top-K courses by score
//
//  Strategy:
//    • Maintain a min-heap of size K
//    • For each course, if its score > heap.top() → push & pop
//    • Result: heap contains K highest-scored courses
//    • Time: O(n log k)   Space: O(k)
//
//  Also used as a standalone priority queue for
//  "Quick Wins" (duration < 5 h).
// ─────────────────────────────────────────────

class MinHeap {
public:
    explicit MinHeap(int capacity = 0) : capacity_(capacity) {}

    // ── Core operations ───────────────────────
    void push(const Course& c);
    void pop();
    const Course& top() const;
    bool  empty() const { return heap_.empty(); }
    int   size()  const { return (int)heap_.size(); }

    // Extract Top-K from a list of courses (O(n log k))
    std::vector<Course> topK(const std::vector<Course>& courses, int k);

    // Extract all "Quick Win" courses (duration <= maxDuration) sorted by score desc
    std::vector<Course> quickWins(const std::vector<Course>& courses,
                                  int maxDuration = 5);

    void printHeap() const;

private:
    std::vector<Course> heap_;
    int capacity_;   // 0 = unlimited

    // Comparator: min-heap on score
    static bool less_(const Course& a, const Course& b) {
        return a.score < b.score;
    }

    void siftUp  (int i);
    void siftDown(int i);
    int  parent(int i)  const { return (i - 1) / 2; }
    int  leftChild(int i)  const { return 2 * i + 1; }
    int  rightChild(int i) const { return 2 * i + 2; }
};

// ══════════════════════════════════════════════
//  IMPLEMENTATION
// ══════════════════════════════════════════════

inline void MinHeap::siftUp(int i) {
    while (i > 0 && less_(heap_[i], heap_[parent(i)])) {
        std::swap(heap_[i], heap_[parent(i)]);
        i = parent(i);
    }
}

inline void MinHeap::siftDown(int i) {
    int n = (int)heap_.size();
    while (true) {
        int smallest = i;
        int l = leftChild(i), r = rightChild(i);
        if (l < n && less_(heap_[l], heap_[smallest])) smallest = l;
        if (r < n && less_(heap_[r], heap_[smallest])) smallest = r;
        if (smallest == i) break;
        std::swap(heap_[i], heap_[smallest]);
        i = smallest;
    }
}

inline void MinHeap::push(const Course& c) {
    heap_.push_back(c);
    siftUp((int)heap_.size() - 1);
}

inline void MinHeap::pop() {
    if (heap_.empty()) throw std::underflow_error("Heap is empty");
    heap_[0] = heap_.back();
    heap_.pop_back();
    if (!heap_.empty()) siftDown(0);
}

inline const Course& MinHeap::top() const {
    if (heap_.empty()) throw std::underflow_error("Heap is empty");
    return heap_[0];
}

// Top-K algorithm: O(n log k)
inline std::vector<Course> MinHeap::topK(const std::vector<Course>& courses, int k) {
    heap_.clear();
    capacity_ = k;

    for (const auto& c : courses) {
        if ((int)heap_.size() < k) {
            push(c);
        } else if (!heap_.empty() && c.score > top().score) {
            pop();
            push(c);
        }
    }

    // Extract in descending order
    std::vector<Course> result;
    result.reserve(heap_.size());
    while (!empty()) {
        result.push_back(top());
        pop();
    }
    // Reverse to get descending order
    std::reverse(result.begin(), result.end());
    return result;
}

// Quick Wins: duration <= maxDuration, sorted by score desc
inline std::vector<Course> MinHeap::quickWins(const std::vector<Course>& courses,
                                               int maxDuration) {
    heap_.clear();
    for (const auto& c : courses) {
        if (c.duration <= maxDuration) {
            push(c);
        }
    }

    std::vector<Course> result;
    result.reserve(heap_.size());
    while (!empty()) {
        result.push_back(top());
        pop();
    }
    std::reverse(result.begin(), result.end());
    return result;
}

inline void MinHeap::printHeap() const {
    if (heap_.empty()) { printf("[Heap is empty]\n"); return; }
    printf("\n╔══════════════════════════════════════╗\n");
    printf("║         MIN-HEAP  (key=score)        ║\n");
    printf("╚══════════════════════════════════════╝\n");
    printf("Size: %d\n", (int)heap_.size());
    for (int i = 0; i < (int)heap_.size(); i++) {
        printf("  [%d] score=%.1f  %s  (dur=%dh)\n",
               i, heap_[i].score, heap_[i].name.c_str(), heap_[i].duration);
    }
}
