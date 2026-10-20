const db = require('../config/db');

/**
 * GET /customers
 * Fetch all registered customers
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, name, phone, email, registered_on FROM Customer ORDER BY customer_id ASC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /customers/:id
 * Fetch a single customer by customer_id
 */
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT customer_id, name, phone, email, registered_on FROM Customer WHERE customer_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /customers
 * Register a new customer
 */
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, registered_on } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'name, phone, and email are required fields.' });
    }

    const regDate = registered_on || new Date().toISOString().slice(0, 10);

    const [result] = await db.query(
      'INSERT INTO Customer (name, phone, email, registered_on) VALUES (?, ?, ?, ?)',
      [name.trim(), phone.trim(), email.trim(), regDate]
    );

    const [newCustomer] = await db.query(
      'SELECT customer_id, name, phone, email, registered_on FROM Customer WHERE customer_id = ?',
      [result.insertId]
    );

    res.status(201).json(newCustomer[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /customers/:id
 * Update an existing customer's details
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const [existing] = await db.query(
      'SELECT customer_id, name, phone, email, registered_on FROM Customer WHERE customer_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedName = name !== undefined ? name.trim() : existing[0].name;
    const updatedPhone = phone !== undefined ? phone.trim() : existing[0].phone;
    const updatedEmail = email !== undefined ? email.trim() : existing[0].email;

    await db.query(
      'UPDATE Customer SET name = ?, phone = ?, email = ? WHERE customer_id = ?',
      [updatedName, updatedPhone, updatedEmail, id]
    );

    const [updated] = await db.query(
      'SELECT customer_id, name, phone, email, registered_on FROM Customer WHERE customer_id = ?',
      [id]
    );

    res.status(200).json(updated[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /customers/:id
 * Remove a customer by customer_id
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT customer_id FROM Customer WHERE customer_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.query('DELETE FROM Customer WHERE customer_id = ?', [id]);

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /customers/:id/addresses
 * Fetch all addresses for a specific customer
 */
const getCustomerAddresses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT address_id, customer_id, address_line, city, pincode FROM Address WHERE customer_id = ? ORDER BY address_id ASC',
      [id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerAddresses,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
