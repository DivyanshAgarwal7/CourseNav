#pragma once
#include "CourseDB.h"
#include <vector>

// ─────────────────────────────────────────────
//  Scorer – multi-criteria weighted formula
//
//  score = (α × relevance) + (β × rating) − (γ × difficulty_penalty)
//
//  difficulty_penalty is amplified when time budget is tight:
//    if available_time < 15h  → γ = 2.0  (penalise hard courses heavily)
//    if available_time < 30h  → γ = 1.0
//    else                     → γ = 0.5
// ─────────────────────────────────────────────
class Scorer {
public:
    double alpha;   // weight for relevance
    double beta;    // weight for rating
    double gamma;   // weight for difficulty penalty

    explicit Scorer(int availableTime) {
        alpha = 2.0;
        beta  = 1.0;
        if      (availableTime < 15) gamma = 2.0;
        else if (availableTime < 30) gamma = 1.0;
        else                         gamma = 0.5;
    }

    // Compute and assign score in-place
    void computeScores(std::vector<Course>& courses) const {
        for (auto& c : courses) {
            c.score = (alpha * c.relevance)
                    + (beta  * c.rating)
                    - (gamma * c.difficulty);
        }
    }

    // Score a single course (used by AVL tree insert)
    double computeScore(const Course& c) const {
        return (alpha * c.relevance)
             + (beta  * c.rating)
             - (gamma * c.difficulty);
    }

    void printWeights() const {
        printf("\n[Scorer] α(relevance)=%.1f  β(rating)=%.1f  γ(difficulty)=%.1f\n",
               alpha, beta, gamma);
    }
};
