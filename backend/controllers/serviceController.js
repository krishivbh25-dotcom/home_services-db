const db = require('../config/db');

/**
 * GET /categories
 * Fetch all service categories
 */
const getAllCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT category_id, category_name FROM Service_Category ORDER BY category_id ASC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /services
 * Fetch all services, optionally filtered by categoryId (?categoryId=1)
 */
const getAllServices = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    if (categoryId) {
      const [rows] = await db.query(
        `SELECT s.service_id, s.category_id, sc.category_name, s.service_name, s.base_price, s.duration_min 
         FROM Service s 
         JOIN Service_Category sc ON s.category_id = sc.category_id 
         WHERE s.category_id = ? 
         ORDER BY s.service_id ASC`,
        [categoryId]
      );
      return res.status(200).json(rows);
    }

    const [rows] = await db.query(
      `SELECT s.service_id, s.category_id, sc.category_name, s.service_name, s.base_price, s.duration_min 
       FROM Service s 
       JOIN Service_Category sc ON s.category_id = sc.category_id 
       ORDER BY s.service_id ASC`
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /services/:id
 * Fetch a single service by service_id
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT s.service_id, s.category_id, sc.category_name, s.service_name, s.base_price, s.duration_min 
       FROM Service s 
       JOIN Service_Category sc ON s.category_id = sc.category_id 
       WHERE s.service_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /categories/:id/services
 * Fetch all services belonging to a specific category_id
 */
const getServicesByCategoryId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [category] = await db.query(
      'SELECT category_id, category_name FROM Service_Category WHERE category_id = ?',
      [id]
    );

    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const [rows] = await db.query(
      `SELECT service_id, category_id, service_name, base_price, duration_min 
       FROM Service 
       WHERE category_id = ? 
       ORDER BY service_id ASC`,
      [id]
    );

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getAllServices,
  getServiceById,
  getServicesByCategoryId
};
