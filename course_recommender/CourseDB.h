#pragma once
#include <string>
#include <vector>

// ─────────────────────────────────────────────
//  Course – core data record
// ─────────────────────────────────────────────
struct Course {
    int    id;
    std::string name;
    std::string category;
    int    duration;      // hours
    int    difficulty;    // 1-5
    double rating;        // 1-5
    int    relevance;     // 1-10  (career relevance)
    double score;         // computed by Scorer

    Course() : id(0), duration(0), difficulty(0), rating(0.0), relevance(0), score(0.0) {}

    Course(int id, std::string name, std::string category,
           int duration, int difficulty, double rating, int relevance)
        : id(id), name(std::move(name)), category(std::move(category)),
          duration(duration), difficulty(difficulty),
          rating(rating), relevance(relevance), score(0.0) {}
};

// ─────────────────────────────────────────────
//  Pre-loaded dataset  (20 courses)
// ─────────────────────────────────────────────
inline std::vector<Course> getDefaultCourses() {
    return {
        {1,  "Data Structures & Algorithms",   "CS",       15, 4, 4.8, 10},
        {2,  "Machine Learning Fundamentals",  "AI",       20, 4, 4.7,  9},
        {3,  "Web Dev with React",             "Web",      12, 2, 4.5,  8},
        {4,  "Python for Beginners",           "CS",        8, 1, 4.6,  7},
        {5,  "Deep Learning Specialization",   "AI",       30, 5, 4.9, 10},
        {6,  "SQL & Database Design",          "DB",       10, 2, 4.4,  8},
        {7,  "System Design Interviews",       "CS",       14, 4, 4.7,  9},
        {8,  "Docker & Kubernetes",            "DevOps",   10, 3, 4.5,  8},
        {9,  "Cloud Computing (AWS)",          "Cloud",    18, 3, 4.6,  9},
        {10, "Linux Command Line",             "OS",        5, 2, 4.3,  7},
        {11, "Computer Networks",              "Networks",  8, 3, 4.2,  7},
        {12, "Cybersecurity Basics",           "Security", 10, 3, 4.4,  8},
        {13, "Agile & Scrum",                  "PM",        4, 1, 4.1,  6},
        {14, "TypeScript Advanced",            "Web",       6, 3, 4.5,  7},
        {15, "NLP with Transformers",          "AI",       22, 5, 4.8, 10},
        {16, "iOS App Development",            "Mobile",   16, 3, 4.3,  7},
        {17, "Blockchain Fundamentals",        "Web3",      9, 4, 4.0,  6},
        {18, "Statistics for Data Science",   "Math",     11, 3, 4.6,  9},
        {19, "Git & GitHub Mastery",           "Tools",     3, 1, 4.4,  6},
        {20, "Competitive Programming",        "CS",       20, 5, 4.7,  9},
    };
}
