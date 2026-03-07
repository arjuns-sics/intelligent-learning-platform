/**
 * Migration Script: Move quizzes and assignments from course level to module level
 * Run this once to update existing courses
 */

const mongoose = require("mongoose");
const path = require("path");
const Course = require(path.join(__dirname, "../src/models/Course"));

async function migrateQuizzesAndAssignments() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learning-system";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all courses with quizzes or assignments at course level
    const courses = await Course.find({
      $or: [
        { quizzes: { $exists: true, $ne: [] } },
        { assignments: { $exists: true, $ne: [] } },
      ],
    });

    console.log(`Found ${courses.length} courses with quizzes/assignments at course level`);

    let updatedCount = 0;

    for (const course of courses) {
      console.log(`\nProcessing course: ${course.title}`);

      let needsUpdate = false;
      const hasCourseQuizzes = course.quizzes && course.quizzes.length > 0;
      const hasCourseAssignments = course.assignments && course.assignments.length > 0;

      if (hasCourseQuizzes || hasCourseAssignments) {
        // If no modules exist, create one
        if (!course.modules || course.modules.length === 0) {
          course.modules = [{
            title: "Course Content",
            description: "Auto-generated module for existing content",
            lessons: [],
            quizzes: course.quizzes || [],
            assignments: course.assignments || [],
            order: 0,
          }];
          needsUpdate = true;
          console.log(`  - Created new module and moved ${course.quizzes?.length || 0} quizzes and ${course.assignments?.length || 0} assignments`);
        } else {
          // Move quizzes and assignments to the first module
          const firstModule = course.modules[0];
          
          if (hasCourseQuizzes) {
            if (!firstModule.quizzes) {
              firstModule.quizzes = [];
            }
            firstModule.quizzes.push(...course.quizzes);
            console.log(`  - Moved ${course.quizzes.length} quizzes to first module`);
            needsUpdate = true;
          }

          if (hasCourseAssignments) {
            if (!firstModule.assignments) {
              firstModule.assignments = [];
            }
            firstModule.assignments.push(...course.assignments);
            console.log(`  - Moved ${course.assignments.length} assignments to first module`);
            needsUpdate = true;
          }
        }

        // Clear course-level quizzes and assignments
        if (needsUpdate) {
          course.quizzes = [];
          course.assignments = [];
        }
      }

      if (needsUpdate) {
        await course.save();
        updatedCount++;
        console.log(`  ✓ Course updated`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} courses`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateQuizzesAndAssignments();
