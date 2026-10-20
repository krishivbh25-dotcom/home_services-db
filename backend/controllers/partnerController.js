const db = require('../config/db');

/**
 * GET /partners
 * List all service partners
 */
const getAllPartners = async (req, res, next) => {
  try {
    const { categoryId, status } = req.query;
    let query = `
      SELECT 
        sp.partner_id,
        sp.category_id,
        sc.category_name,
        sp.verified_by,
        a.name AS verified_by_name,
        sp.name,
        sp.phone,
        sp.experience_yrs,
        sp.verification_status,
        sp.account_status
      FROM Service_Partner sp
      JOIN Service_Category sc ON sp.category_id = sc.category_id
      LEFT JOIN Admin a ON sp.verified_by = a.admin_id
    `;
    const params = [];
    const conditions = [];

    if (categoryId) {
      conditions.push('sp.category_id = ?');
      params.push(categoryId);
    }
    if (status) {
      conditions.push('sp.verification_status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sp.partner_id ASC';

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/pending-kyc
 * Fetch partners awaiting KYC approval directly from the pending_kyc SQL view
 */
const getPendingKyc = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM pending_kyc');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/ratings
 * Fetch partner rating metrics directly from the partner_ratings SQL view
 */
const getPartnerRatings = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM partner_ratings');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/:id
 * Fetch a single partner by partner_id
 */
const getPartnerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        sp.partner_id,
        sp.category_id,
        sc.category_name,
        sp.verified_by,
        a.name AS verified_by_name,
        sp.name,
        sp.phone,
        sp.experience_yrs,
        sp.verification_status,
        sp.account_status
      FROM Service_Partner sp
      JOIN Service_Category sc ON sp.category_id = sc.category_id
      LEFT JOIN Admin a ON sp.verified_by = a.admin_id
      WHERE sp.partner_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/:id/availability
 * Fetch weekly availability schedule for a partner
 */
const getPartnerAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT availability_id, partner_id, day_of_week, start_time, end_time FROM Partner_Availability WHERE partner_id = ? ORDER BY day_of_week, start_time',
      [id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/:id/services
 * Fetch services offered and custom rates for a partner
 */
const getPartnerServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT 
        ps.partner_id,
        ps.service_id,
        s.service_name,
        sc.category_name,
        s.base_price,
        ps.custom_price,
        ps.is_active,
        s.duration_min
      FROM Partner_Service ps
      JOIN Service s ON ps.service_id = s.service_id
      JOIN Service_Category sc ON s.category_id = sc.category_id
      WHERE ps.partner_id = ?
      ORDER BY s.service_name ASC`,
      [id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /partners/:id/documents
 * Fetch KYC documents uploaded by a partner
 */
const getPartnerDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT document_id, partner_id, document_type, file_url, approval_status FROM Partner_Document WHERE partner_id = ? ORDER BY document_id ASC',
      [id]
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /partners/:id/services/:serviceId
 * Update custom pricing or active status of a service offered by a partner
 */
const updatePartnerService = async (req, res, next) => {
  try {
    const { id, serviceId } = req.params;
    const { customPrice, isActive } = req.body;

    const [existing] = await db.query(
      'SELECT custom_price, is_active FROM Partner_Service WHERE partner_id = ? AND service_id = ?',
      [id, serviceId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Partner service mapping not found' });
    }

    const price = customPrice !== undefined ? customPrice : existing[0].custom_price;
    const active = isActive !== undefined ? isActive : existing[0].is_active;

    await db.query(
      'UPDATE Partner_Service SET custom_price = ?, is_active = ? WHERE partner_id = ? AND service_id = ?',
      [price, active, id, serviceId]
    );

    res.status(200).json({ message: 'Partner service updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPartners,
  getPendingKyc,
  getPartnerRatings,
  getPartnerById,
  getPartnerAvailability,
  getPartnerServices,
  getPartnerDocuments,
  updatePartnerService
};
