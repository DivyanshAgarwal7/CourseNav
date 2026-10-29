#pragma once
#include "CourseDB.h"
#include <vector>
#include <algorithm>
#include <cstdio>

// ─────────────────────────────────────────────
//  AVL Tree – self-balancing BST
//  Key  : course.score  (double)
//  Value: Course object
//
//  Guarantees O(log n) insert / search / delete
//  In-order traversal gives courses sorted by score (ascending)
// ─────────────────────────────────────────────

struct AVLNode {
    Course  data;
    int     height;
    AVLNode* left;
    AVLNode* right;

    explicit AVLNode(const Course& c)
        : data(c), height(1), left(nullptr), right(nullptr) {}
};

class AVLTree {
public:
    AVLTree() : root_(nullptr), size_(0) {}
    ~AVLTree() { destroy(root_); }

    // ── Public interface ──────────────────────
    void   insert(const Course& c);
    void   remove(int courseId);
    bool   search(int courseId, Course& out) const;

    // Returns all courses sorted by score (desc) via reverse in-order
    std::vector<Course> getSortedDesc() const;

    // Returns courses whose score >= minScore
    std::vector<Course> getAboveScore(double minScore) const;

    int  size()   const { return size_; }
    bool empty()  const { return size_ == 0; }

    void printTree() const;           // ASCII visualisation

private:
    AVLNode* root_;
    int      size_;

    // ── Core AVL helpers ────
    int      height(AVLNode* n) const { return n ? n->height : 0; }
    int      balanceFactor(AVLNode* n) const {
                 return n ? height(n->left) - height(n->right) : 0; }
    void     updateHeight(AVLNode* n) {
                 if (n) n->height = 1 + std::max(height(n->left), height(n->right)); }

    // ── Rotations ───
    AVLNode* rotateRight(AVLNode* y);   // LL case
    AVLNode* rotateLeft (AVLNode* x);   // RR case
    // LR and RL are handled as double rotations in balance()

    AVLNode* balance(AVLNode* n);

    // ── Recursive helpers ─
    AVLNode* insert(AVLNode* node, const Course& c);
    AVLNode* remove(AVLNode* node, int courseId);
    AVLNode* minValueNode(AVLNode* node) const;
    bool     search(AVLNode* node, int courseId, Course& out) const;

    void     inorderDesc(AVLNode* node, std::vector<Course>& result) const;
    void     aboveScore (AVLNode* node, double minScore,
                         std::vector<Course>& result) const;
    void     destroy(AVLNode* node);

    // ASCII print helpers
    void printHelper(AVLNode* node, const std::string& prefix,
                     bool isLeft) const;
};

// ══════════════════════════════════════════════
//  IMPLEMENTATION
// ══════════════════════════════════════════════

// ── Rotations ────────────────────────────────

inline AVLNode* AVLTree::rotateRight(AVLNode* y) {
    AVLNode* x  = y->left;
    AVLNode* T2 = x->right;

    x->right = y;
    y->left  = T2;

    updateHeight(y);
    updateHeight(x);
    return x;   // new root
}

inline AVLNode* AVLTree::rotateLeft(AVLNode* x) {
    AVLNode* y  = x->right;
    AVLNode* T2 = y->left;

    y->left  = x;
    x->right = T2;

    updateHeight(x);
    updateHeight(y);
    return y;   // new root
}

// ── Balance ───────────────────────────────────
inline AVLNode* AVLTree::balance(AVLNode* n) {
    updateHeight(n);
    int bf = balanceFactor(n);

    // LL case
    if (bf > 1 && balanceFactor(n->left) >= 0)
        return rotateRight(n);

    // LR case
    if (bf > 1 && balanceFactor(n->left) < 0) {
        n->left = rotateLeft(n->left);
        return rotateRight(n);
    }

    // RR case
    if (bf < -1 && balanceFactor(n->right) <= 0)
        return rotateLeft(n);

    // RL case
    if (bf < -1 && balanceFactor(n->right) > 0) {
        n->right = rotateRight(n->right);
        return rotateLeft(n);
    }

    return n;   // already balanced
}

// ── Insert ────────────────────────────────────
inline AVLNode* AVLTree::insert(AVLNode* node, const Course& c) {
    if (!node) { ++size_; return new AVLNode(c); }

    if (c.score < node->data.score)
        node->left  = insert(node->left,  c);
    else if (c.score > node->data.score)
        node->right = insert(node->right, c);
    else {
        // Tie-break by id to keep duplicates (same score, diff course)
        if (c.id < node->data.id)
            node->left  = insert(node->left,  c);
        else
            node->right = insert(node->right, c);
    }
    return balance(node);
}

inline void AVLTree::insert(const Course& c) {
    root_ = insert(root_, c);
}

// ── Remove ────────────────────────────────────
inline AVLNode* AVLTree::minValueNode(AVLNode* node) const {
    AVLNode* cur = node;
    while (cur->left) cur = cur->left;
    return cur;
}

inline AVLNode* AVLTree::remove(AVLNode* node, int courseId) {
    if (!node) return nullptr;

    // Search by id (not score) — requires full tree scan approach:
    // We do a standard BST remove but search both subtrees for the id
    // because score-keyed tree can't directly navigate to an id.
    // Solution: use a helper that finds score first via search(), then remove by score+id.
    // Here we just traverse the whole tree (O(n) worst case for remove-by-id).
    node->left  = remove(node->left,  courseId);
    node->right = remove(node->right, courseId);

    if (node->data.id == courseId) {
        --size_;
        if (!node->left || !node->right) {
            AVLNode* temp = node->left ? node->left : node->right;
            delete node;
            return temp;
        }
        AVLNode* successor = minValueNode(node->right);
        node->data  = successor->data;
        node->right = remove(node->right, successor->data.id);
    }
    return balance(node);
}

inline void AVLTree::remove(int courseId) {
    root_ = remove(root_, courseId);
}

// ── Search ────────────────────────────────────
inline bool AVLTree::search(AVLNode* node, int courseId, Course& out) const {
    if (!node) return false;
    if (node->data.id == courseId) { out = node->data; return true; }
    return search(node->left, courseId, out) ||
           search(node->right, courseId, out);
}

inline bool AVLTree::search(int courseId, Course& out) const {
    return search(root_, courseId, out);
}

// ── Traversals ────────────────────────────────
inline void AVLTree::inorderDesc(AVLNode* node, std::vector<Course>& result) const {
    if (!node) return;
    inorderDesc(node->right, result);   // right first → descending
    result.push_back(node->data);
    inorderDesc(node->left,  result);
}

inline std::vector<Course> AVLTree::getSortedDesc() const {
    std::vector<Course> result;
    result.reserve(size_);
    inorderDesc(root_, result);
    return result;
}

inline void AVLTree::aboveScore(AVLNode* node, double minScore,
                                 std::vector<Course>& result) const {
    if (!node) return;
    if (node->data.score >= minScore) {
        result.push_back(node->data);
        aboveScore(node->left,  minScore, result);
        aboveScore(node->right, minScore, result);
    } else {
        // Only right subtree can have higher scores
        aboveScore(node->right, minScore, result);
    }
}

inline std::vector<Course> AVLTree::getAboveScore(double minScore) const {
    std::vector<Course> result;
    aboveScore(root_, minScore, result);
    return result;
}

// ── Destroy ───────────────────────────────────
inline void AVLTree::destroy(AVLNode* node) {
    if (!node) return;
    destroy(node->left);
    destroy(node->right);
    delete node;
}

// ── ASCII Print ───────────────────────────────
inline void AVLTree::printHelper(AVLNode* node, const std::string& prefix,
                                  bool isLeft) const {
    if (!node) return;
    printf("%s%s[%.1f] %s (id=%d, dur=%dh)\n",
           prefix.c_str(),
           isLeft ? "├──L " : "└──R ",
           node->data.score,
           node->data.name.c_str(),
           node->data.id,
           node->data.duration);

    std::string newPrefix = prefix + (isLeft ? "│   " : "    ");
    printHelper(node->left,  newPrefix, true);
    printHelper(node->right, newPrefix, false);
}

inline void AVLTree::printTree() const {
    if (!root_) { printf("[AVL Tree is empty]\n"); return; }
    printf("\n╔══════════════════════════════════════╗\n");
    printf("║         AVL TREE  (key=score)        ║\n");
    printf("╚══════════════════════════════════════╝\n");
    printf("[%.1f] %s (root, h=%d)\n",
           root_->data.score, root_->data.name.c_str(), root_->height);
    printHelper(root_->left,  "", true);
    printHelper(root_->right, "", false);
    printf("\nTree size: %d nodes | Root height: %d\n", size_, root_->height);
}
