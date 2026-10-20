import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { partnerService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './PartnerServices.module.css';

export default function PartnerServices() {
  const { activePartnerId } = useRole();
  const [services, setServices] = useState([]);
  const [partner, setPartner] = useState(null);
  const [priceMap, setPriceMap] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchServices = () => {
    if (!activePartnerId) return;
    setLoading(true);
    Promise.all([
      partnerService.getPartnerById(activePartnerId),
      partnerService.getPartnerServices(activePartnerId),
    ])
      .then(([partData, servData]) => {
        setPartner(partData);
        setServices(servData);
        const map = {};
        servData.forEach((s) => {
          map[s.service_id] = s.custom_price;
        });
        setPriceMap(map);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, [activePartnerId]);

  const handlePriceChange = (serviceId, val) => {
    setPriceMap((prev) => ({ ...prev, [serviceId]: val }));
  };

  const handleSavePrice = async (serviceId) => {
    setSavingId(serviceId);
    setError(null);
    setSuccess(null);
    const newPrice = Number(priceMap[serviceId]);

    try {
      await partnerService.updatePartnerService(activePartnerId, serviceId, {
        customPrice: newPrice,
      });
      const successMsg = 'Custom service rate updated successfully.';
      setSuccess(successMsg);
      toast.success(successMsg);
      fetchServices();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (serviceId, currentActive) => {
    setError(null);
    setSuccess(null);

    try {
      await partnerService.updatePartnerService(activePartnerId, serviceId, {
        isActive: !currentActive,
      });
      const successMsg = `Service ${!currentActive ? 'enabled' : 'disabled'} successfully.`;
      setSuccess(successMsg);
      toast.success(successMsg);
      fetchServices();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>My Offered Services</h1>
          <p>
            Manage services and custom billing rates for <strong>{partner?.name || 'Partner'}</strong> ({partner?.category_name}).
          </p>
        </div>
      </div>

      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <LoadingSpinner message="Loading offered service catalog..." />
          ) : services.length === 0 ? (
            <EmptyState
              title="No Services Mapped"
              description="No service offerings registered in table Partner_Service for this technician."
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Base Catalog Price</th>
                  <th>My Custom Rate (₹)</th>
                  <th>Duration</th>
                  <th>Offering Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.service_id}>
                    <td>
                      <strong>{s.service_name}</strong>
                    </td>
                    <td>{s.category_name}</td>
                    <td className="mono">₹{s.base_price}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          className={styles.priceInput}
                          value={priceMap[s.service_id] ?? s.custom_price}
                          onChange={(e) => handlePriceChange(s.service_id, e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.saveBtn}
                          onClick={() => handleSavePrice(s.service_id)}
                          disabled={savingId === s.service_id}
                        >
                          {savingId === s.service_id ? '...' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.duration_min} mins</td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${s.is_active ? styles.toggleActive : styles.toggleInactive}`}
                        onClick={() => handleToggleActive(s.service_id, s.is_active)}
                      >
                        {s.is_active ? 'Active Offering' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
