const sqlite3 = require('sqlite3').verbose();

// Use in-memory database for testing
const DBSOURCE = ':memory:';

const db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    console.error('Error opening database', err.message);
    return;
  }
  console.log('Connected to the database.');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create recipes table
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    instructions TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    prep_time INTEGER NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error creating recipes table', err.message);
    } else {
      console.log('Recipes table created successfully.');

      // Insert sample recipes
      const sampleRecipes = [
        {
          name: "Pasta Carbonara",
          category: "dinner",
          instructions: "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine with pasta.",
          ingredients: "Pasta, Eggs, Cheese, Bacon",
          prep_time: 30
        },
        {
          name: "Banana Smoothie",
          category: "breakfast",
          instructions: "1. Add all ingredients to blender. 2. Blend until smooth.",
          ingredients: "Banana, Milk, Yogurt, Honey",
          prep_time: 5
        }
      ];

      const insertRecipeSql = `INSERT INTO recipes (name, category, instructions, ingredients, prep_time) 
                              VALUES (?, ?, ?, ?, ?)`;

      sampleRecipes.forEach(recipe => {
        db.run(insertRecipeSql, [
          recipe.name,
          recipe.category,
          recipe.instructions,
          recipe.ingredients,
          recipe.prep_time
        ]);
      });
    }
  });

  // Create meal_plans table
  db.run(`CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    recipe_ids TEXT NOT NULL,
    notes TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating meal_plans table', err.message);
    } else {
      console.log('Meal plans table created successfully.');

      // Insert sample meal plan
      const sampleMealPlan = {
        name: "Test Week Plan",
        date: "2023-06-01",
        recipe_ids: "[1,2]",
        notes: "Test meal plan"
      };

      const insertMealPlanSql = `INSERT INTO meal_plans (name, date, recipe_ids, notes) 
                                VALUES (?, ?, ?, ?)`;

      db.run(insertMealPlanSql, [
        sampleMealPlan.name,
        sampleMealPlan.date,
        sampleMealPlan.recipe_ids,
        sampleMealPlan.notes
      ]);
    }
  });
});

// Export a function to wait for database initialization
const waitForDbInit = () => {
  return new Promise((resolve) => {
    const checkTables = () => {
      db.get("SELECT count(*) as count FROM recipes", [], (err, result) => {
        if (!err && result && result.count > 0) {
          resolve();
        } else {
          setTimeout(checkTables, 100);
        }
      });
    };
    checkTables();
  });
};

module.exports = { db, waitForDbInit };