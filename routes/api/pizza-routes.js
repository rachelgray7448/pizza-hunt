const router = require('express').Router();
const { getAllPizza, getPizzaById, createPizza, updatePizza, deletePizza } = require('../../controllers/pizza-controller');

// for /api/pizzas
router
    .route('/')
    .get(getAllPizza)
    .post(createPizza);

// for /api/pizzas/:id 
router
    .route('/:id')
    .get(getPizzaById)
    .put(updatePizza)
    .delete(deletePizza);


module.exports = router;