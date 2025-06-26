const express = require("express");
const router = express.Router();
let db = require("./database.js");

/*
GET @ /api/recipes
Returns all recipes with optional category filtering
Query Parameters:
- category: (optional) Filter recipes by category (e.g., breakfast, lunch, dinner)
Expected format:
  [
    {
        "id": 1,
        "name": "Pasta Carbonara",
        "category": "dinner",
        "instructions": "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine with pasta.",
        "ingredients": "Pasta, Eggs, Cheese, Bacon",
        "prep_time": 30
    },
    .
    .
  ]
*/
router.get('/recipes', (req, res) => {
  const { category } = req.query;

  try {

    let query = `Select * from recipes`;
    if (category) {
      query= query + ` where category = ?`;
    }
    db.all(query, [category], (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: 'Error gettin recipes'
        })
      }
      return res.status(200).json(
        rows
      )
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Error gettin recipes'
    })
  }
  
});

/*
GET @ /api/recipes/id
Returns single recipe
Expected Format:
    {
        "id": 1,
        "name": "Pasta Carbonara",
        "category": "dinner",
        "instructions": "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine with pasta.",
        "ingredients": "Pasta, Eggs, Cheese, Bacon",
        "prep_time": 30
    }
NOTE: If the recipe with id is not found, return status 404 with message 'Recipe not found'
*/
router.get('/recipes/:id', (req, res) => {
   const { id } = req.params;
   try {
      const query = `Select * from recipes Where id = ?`;
      
      db.get(query, [id], (err, rows) => {
        if (err) {
          return res.status(500).json({
            message: 'Something goes wrong getting the recipe'
          })
        }
        if (!rows) return res.status(404).json({message : 'Recipe not found'});
        return res.status(200).json(
          rows
        )
      })
    } catch (error) {
      return res.status(500).json({
        message: 'Something goes wrong getting the recipe'
      })
   }
});

/*
POST @ /api/recipes
Add a new recipe
Req body Example:
{
    "name": "Avocado Toast",
    "category": "breakfast",
    "instructions": "1. Toast bread. 2. Mash avocado. 3. Spread on toast. 4. Season.",
    "ingredients": "Bread, Avocado, Salt, Pepper, Lemon juice",
    "prep_time": 10
}
Response:
{
    "message": "Recipe added successfully",
    "recipe": 
        {
            "id": 3,
            "name": "Avocado Toast",
            "category": "breakfast",
            "instructions": "1. Toast bread. 2. Mash avocado. 3. Spread on toast. 4. Season.",
            "ingredients": "Bread, Avocado, Salt, Pepper, Lemon juice",
            "prep_time": 10
        }
}
*/
router.post('/recipes', (req, res) => {
  const { name,category, instructions, ingredients, prep_time } = req.body;
  try {
    const query = `Insert into recipes (name, category, instructions, ingredients, prep_time) VALUES (?, ?, ?, ?, ?)`
    
    db.run(query, [name,category, instructions, ingredients, prep_time], function(err) {
      if (err) {
        return res.status(500).json({
          message: 'Error Adding recipes'
        })
      }

      return res.status(201).json({
        "message": "Recipe added successfully",
        "recipe": {
          id: this.lastID,
          name,
          category, 
          instructions, 
          ingredients, 
          prep_time
        }
      })
    })
   
  } catch (error) {
    return res.status(500).json({
      message: 'Error Adding recipes'
    })
  }
});

/*
POST @ /api/meal-plans
Create a new meal plan
Req body Example:
{
    "name": "Week of June 5",
    "date": "2023-06-05",
    "recipe_ids": [1, 2],
    "notes": "Focus on quick meals this week"
}
Response:
{
    "message": "Meal plan created successfully",
    "meal_plan": 
        {
            "id": 1,
            "name": "Week of June 5",
            "date": "2023-06-05",
            "recipe_ids": "[1,2]",
            "notes": "Focus on quick meals this week"
        }
}
*/
router.post('/meal-plans', (req, res) => {
  const { name,date,recipe_ids,notes } = req.body;
  try {
    const query = `INSERT INTO meal_plans (name, date, recipe_ids, notes) 
    VALUES (?, ?, ?, ?)`
    
    db.run(query, [name,date,recipe_ids,notes], function(err) {
      if (err) {
        return res.status(500).json({
          message: 'Error Adding meal-plans'
        })
      }
      return res.status(201).json({
        "message": "Meal plan created successfully",
        "meal_plan": {
          id : this.lastID,
          name,
          date,
          recipe_ids,
          notes
        }
      })
    })

  } catch (error) {
    return res.status(500).json({
      message: 'Error Adding meal-plans'
    })
  }
});

/*
GET @ /api/meal-plans
Returns all meal plans
Expected format:
  [
    {
        "id": 1,
        "name": "Week of June 5",
        "date": "2023-06-05",
        "recipe_ids": "[1,2]",
        "notes": "Focus on quick meals this week"
    },
    .
    .
  ]
*/
router.get('/meal-plans',(req, res) => {
  try {
     const query = `Select * from meal_plans`;

     db.all(query, [], (err, rows) => {
       if (err) {
         return res.status(500).json({
           message: 'Something goes wrong getting the meal-plans'
         })
       }
       return res.status(200).json(
         rows
       )
     })

   } catch (error) {
    return res.status(500).json({
      message: 'Something goes wrong getting the meal-plans'
    })
  }
});

/*
DELETE @ api/meal-plans/id
Delete a meal plan
Response:
{
    "message": "Meal plan deleted successfully"
}
NOTE: If the meal plan with id is not found, return status 400 with error message.
*/
router.delete('/meal-plans/:id', (req, res) => {
  const { id } = req.params;
  try {
    const query = `delete from meal_plans where id = ?`;
    const exist = `select * from meal_plans where id = ?`;
    
   
    db.get(exist, [id], (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: 'Something goes wrong getting the meal-plans'
        })
      }
      if (!rows) return res.status(404).json({message: "The meal plan with id is not found"});
      
      db.run(query, [id], (err, rows) => {
        if (err) {
          return res.status(500).json({
            message: 'Something goes wrong deletting the meal-plans'
          })
        }
        
        return res.status(200).json({
          message: "Meal plan deleted successfully"
        })
      })

    })

  
  } catch (error) {
    return res.status(500).json({
      message: 'Something goes wrong deletting the meal-plans'
    })
  }
});

module.exports = router;