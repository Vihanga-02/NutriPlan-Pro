import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  addFoodMealType,
  removeFoodMealType,
  getFoodsByMealType
} from '../models/foodModel.js';

export const create = async (req, res) => {
  try {
    const foodData = req.body;
    const mealTypes = foodData.meal_types || [];
    delete foodData.meal_types;

    const food = await createFood(foodData);

    for (const mealType of mealTypes) {
      await addFoodMealType(food.id, mealType);
    }

    res.status(201).json(food);
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const { category, is_active } = req.query;
    const foods = await getAllFoods(
      category || null,
      is_active !== undefined ? is_active === 'true' : true
    );
    res.json(foods);
  } catch (error) {
    console.error('Get all foods error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await getFoodById(parseInt(id));

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Get food by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const mealTypes = updates.meal_types;
    delete updates.meal_types;

    const food = await updateFood(parseInt(id), updates);

    if (mealTypes) {
      const currentFood = await getFoodById(parseInt(id));
      const currentMealTypes = currentFood.food_meal_types?.map(fmt => fmt.meal_type) || [];

      const toAdd = mealTypes.filter(mt => !currentMealTypes.includes(mt));
      const toRemove = currentMealTypes.filter(mt => !mealTypes.includes(mt));

      for (const mealType of toAdd) {
        await addFoodMealType(parseInt(id), mealType);
      }
      for (const mealType of toRemove) {
        await removeFoodMealType(parseInt(id), mealType);
      }
    }

    res.json(food);
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFood(parseInt(id));
    res.json({ message: 'Food deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByMealType = async (req, res) => {
  try {
    const { mealType } = req.params;
    const foods = await getFoodsByMealType(mealType);
    res.json(foods);
  } catch (error) {
    console.error('Get foods by meal type error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  getByMealType
};
