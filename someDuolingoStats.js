// ==UserScript==
// @name         Some Duolingo Stats
// @version      0.1
// @description  Shows some stats on Duolingo
// @match        http://www.duolingo.com/*
// @match        https://www.duolingo.com/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

// Get the state data.
var DuoState = JSON.parse(localStorage.getItem('duo.state'));

var username = DuoState.user.username;

// Get list of courses
var courseList = DuoState.courses;

var allSkills = DuoState.skills;
var levelsXPRequired = DuoState.config.xpLevelCutoffs;

for (var course in courseList) {
    var currentCourse = courseList[course];
    if (currentCourse.wordsLearned > 0 && currentCourse.id == DuoState.user.courseId) {
        var currentSkillLevel = currentCourse.skills;

        var totalSkills = 0;
        var skillCodes = [];

        // Count the skills and get the list of identifiers.
        for (var currentLevel in currentSkillLevel) {
            var currentSkills = currentSkillLevel[currentLevel];

            totalSkills = totalSkills + currentLevel.length;

            for (var currentSkill in currentSkills) {
                skillCodes.push(currentSkills[currentSkill]);
            }
        }

        var totalLessons = 0;
        var completedLessons = 0;
        var skillsCompleted = 0;

        var weakWords = 0;

        for (var currentSkill in skillCodes) {
            let skillData = allSkills[skillCodes[currentSkill]];
            totalLessons = totalLessons + skillData.lessons;
            completedLessons = completedLessons + skillData.finishedLessons;
            if (skillData.lessons == skillData.finishedLessons) {
                skillsCompleted = skillsCompleted + 1;
            }

            if (skillData.weakWords) {
                weakWords = weakWords + skillData.weakWords.length;
            }
        }

        // Calculate the XP for the next level.
        var nextLevelXP = 0;
        var currentLevelXP = 0;
        var previousAmount = 0;
        for (var levelXPRequired in levelsXPRequired) {
            if (levelsXPRequired[levelXPRequired] > currentCourse.xp) {
                nextLevelXP = levelsXPRequired[levelXPRequired];
                currentLevelXP = previousAmount;
                break;
            }
            previousAmount = levelsXPRequired[levelXPRequired];
        }

        var totalExpForCurrentLevel = nextLevelXP - currentLevelXP;
        var expForCurrentLevel = currentCourse.xp - currentLevelXP;
        var expPercentageForCurrentLevel = expForCurrentLevel / totalExpForCurrentLevel;
        console.log("---- " + currentCourse.title + " ----");

        // Trees
        var maxTrees = currentCourse.trackingProperties.max_tree_level;
        var totalTrees = currentSkillLevel.length;

        var insertString = "<div class='someDuoStats'><br><table>";

        insertString = insertString + printProgress("Total XP", currentCourse.xp, nextLevelXP);
        insertString = insertString + printProgress("Curr XP", expForCurrentLevel, totalExpForCurrentLevel);

        insertString = insertString + printProgress("Weak", weakWords, currentCourse.wordsLearned);

        insertString = insertString + printProgress("Trees", maxTrees, totalTrees);

        // Skills
        insertString = insertString + printProgress("Skills", skillsCompleted, totalSkills);
        insertString = insertString + printProgress("Gold", currentCourse.trackingProperties.gold_skill_count, skillsCompleted);

        // Lessons
        insertString = insertString + printProgress("Lessons", completedLessons, totalLessons);

        insertString = insertString + "</table></div>";
        $(insertString).insertAfter("._3qiOl");
    }
}

function printProgress(title, current, total) {
    var percentageDisplay = formatPercent(current / total);
    console.log(title + " : " + current + "/" + total + " (" + percentageDisplay + "%)");
    return "<tr><td>" + title + "</td><td>" + current + "</td><td>" + total + "</td><td>" + percentageDisplay + "%</tr>";
}

function formatPercent(value) {
    return (value * 100).toFixed(1);
}