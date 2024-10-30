// routes/recipes.js

const express = require('express');
const router = express.Router();

let recipes = require('../data/recipes');

// **CRUD Básico**

/**
 * GET /recipes
 * Lista todas as receitas
 */
router.get('/', (req, res) => {
  res.json(recipes);
});

/**
 * GET /recipes/:id
 * Obtém uma receita pelo ID
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const recipe = recipes.find(r => r.id === id);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ message: 'Receita não encontrada' });
  }
});

/**
 * POST /recipes
 * Adiciona uma nova receita
 */
router.post('/', (req, res) => {
  const { name, ingredients, type } = req.body;
  const newRecipe = {
    id: recipes.length + 1,
    name,
    ingredients,
    type
  };
  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
});

/**
 * PUT /recipes/:id
 * Atualiza uma receita existente
 */
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, ingredients, type } = req.body;
  const index = recipes.findIndex(r => r.id === id);
  if (index !== -1) {
    recipes[index] = { id, name, ingredients, type };
    res.json(recipes[index]);
  } else {
    res.status(404).json({ message: 'Receita não encontrada' });
  }
});

/**
 * DELETE /recipes/:id
 * Remove uma receita
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = recipes.findIndex(r => r.id === id);
  if (index !== -1) {
    const removedRecipe = recipes.splice(index, 1);
    res.json(removedRecipe);
  } else {
    res.status(404).json({ message: 'Receita não encontrada' });
  }
});

// **Funcionalidades Extras**

/**
 * GET /recipes/search
 * Pesquisa receitas por ingrediente ou tipo
 * Exemplos:
 *   /recipes/search?ingredient=chocolate
 *   /recipes/search?type=sobremesa
 */
router.get('/search', (req, res) => {
  const { ingredient, type } = req.query;
  let results = recipes;

  if (ingredient) {
    results = results.filter(recipe =>
      recipe.ingredients.includes(ingredient)
    );
  }

  if (type) {
    results = results.filter(recipe => recipe.type === type);
  }

  res.json(results);
});

module.exports = router;
