import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services';
import Alert from '../../components/Alert/Alert';
import LoadingSpinner from '../../components/Loading/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './BrowseServices.module.css';

export default function BrowseServices() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories and initial services
  useEffect(() => {
    Promise.all([customerService.getCategories(), customerService.getServices()])
      .then(([catData, servData]) => {
        setCategories(catData);
        setServices(servData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setLoading(true);
    customerService.getServices(catId)
      .then((data) => {
        setServices(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1>Browse Home Services</h1>
          <p>Explore standard catalog pricing, duration, and verified technician offerings.</p>
        </div>
      </div>

      <Alert message={error} type="error" />

      {/* Category Filter Tabs */}
      <div className={styles.categoryTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${selectedCategory === 'ALL' ? styles.tabButtonActive : ''}`}
          onClick={() => handleSelectCategory('ALL')}
        >
          All Categories ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category_id}
            type="button"
            className={`${styles.tabButton} ${
              selectedCategory === cat.category_id ? styles.tabButtonActive : ''
            }`}
            onClick={() => handleSelectCategory(cat.category_id)}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner message="Loading service catalog from MySQL..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No Services Found"
          description="No available services registered under the selected category."
        />
      ) : (
        <div className={styles.servicesGrid}>
          {services.map((s) => (
            <div key={s.service_id} className={styles.serviceCard}>
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.categoryTag}>{s.category_name}</span>
                  <span className={styles.durationTag}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {s.duration_min} mins
                  </span>
                </div>

                <h3 className={styles.serviceName}>{s.service_name}</h3>
              </div>

              <div className={styles.cardBottom}>
                <div className={styles.priceWrapper}>
                  <span className={styles.priceLabel}>Base Rate</span>
                  <span className={styles.priceValue}>₹{s.base_price}</span>
                </div>

                <Link to={`/book?serviceId=${s.service_id}`} className={styles.bookButton}>
                  <span>Book Now</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
