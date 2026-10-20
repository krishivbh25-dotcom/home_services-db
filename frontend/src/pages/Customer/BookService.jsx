import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customerService, bookingService } from '../../services';
import { useRole } from '../../hooks/useRole';
import Alert from '../../components/Alert/Alert';
import styles from './BookService.module.css';

export default function BookService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeCustomerId, setActiveCustomerId } = useRole();

  const preselectedServiceId = searchParams.get('serviceId') || '';

  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [services, setServices] = useState([]);

  const [customerId, setCustomerId] = useState(activeCustomerId || '');
  const [addressId, setAddressId] = useState('');
  const [serviceId, setServiceId] = useState(preselectedServiceId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch customers and services on mount
  useEffect(() => {
    Promise.all([customerService.getAllCustomers(), customerService.getServices()])
      .then(([custList, servList]) => {
        setCustomers(custList);
        setServices(servList);
        if (!customerId && custList.length > 0) {
          setCustomerId(custList[0].customer_id);
        }
        if (!serviceId && servList.length > 0) {
          setServiceId(servList[0].service_id);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Whenever customerId changes, fetch their addresses
  useEffect(() => {
    if (!customerId) return;
    setActiveCustomerId(Number(customerId));
    customerService.getCustomerAddresses(customerId)
      .then((addrList) => {
        setAddresses(addrList);
        if (addrList.length > 0) {
          setAddressId(addrList[0].address_id);
        } else {
          setAddressId('');
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [customerId]);

  const selectedService = services.find((s) => String(s.service_id) === String(serviceId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const scheduledOn = `${date} ${time}:00`;

    try {
      const newBooking = await bookingService.createBooking({
        customerId: Number(customerId),
        serviceId: Number(serviceId),
        addressId: Number(addressId),
        scheduledOn,
      });

      const successMsg = `Booking #${newBooking.booking_id} created successfully! Assigned partner: ${newBooking.partner_name || 'Assigned'}.`;
      setSuccess(successMsg);
      toast.success(successMsg);

      setTimeout(() => {
        navigate(`/bookings/${newBooking.booking_id}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerArea}>
        <h1>Book a Service</h1>
        <p>
          Select customer profile, service address, and scheduled appointment time. The stored procedure
          will automatically match an eligible, verified partner.
        </p>
      </div>

      <div className={styles.formCard}>
        <Alert message={error} type="error" />
        <Alert message={success} type="success" />

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Customer Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="customerSelect" className={styles.label}>
              Customer Profile <span className={styles.subLabel}>(Who is booking)</span>
            </label>
            <select
              id="customerSelect"
              className={styles.select}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.name} — {c.phone} (ID: {c.customer_id})
                </option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="serviceSelect" className={styles.label}>
              Requested Service
            </label>
            <select
              id="serviceSelect"
              className={styles.select}
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
            >
              {services.map((s) => (
                <option key={s.service_id} value={s.service_id}>
                  {s.service_name} ({s.category_name}) — ₹{s.base_price} ({s.duration_min} mins)
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className={styles.servicePreview}>
              <span>
                Standard Price: <strong>₹{selectedService.base_price}</strong>
              </span>
              <span>
                Estimated Duration: <strong>{selectedService.duration_min} minutes</strong>
              </span>
            </div>
          )}

          {/* Service Address Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="addressSelect" className={styles.label}>
              Service Address
            </label>
            {addresses.length === 0 ? (
              <select id="addressSelect" className={styles.select} disabled>
                <option>No saved addresses found for this customer</option>
              </select>
            ) : (
              <select
                id="addressSelect"
                className={styles.select}
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                required
              >
                {addresses.map((a) => (
                  <option key={a.address_id} value={a.address_id}>
                    {a.address_line}, {a.city} - {a.pincode}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date and Time Row */}
          <div className={styles.rowTwo}>
            <div className={styles.formGroup}>
              <label htmlFor="dateInput" className={styles.label}>
                Appointment Date
              </label>
              <input
                id="dateInput"
                type="date"
                className={styles.input}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="timeInput" className={styles.label}>
                Appointment Time
              </label>
              <input
                id="timeInput"
                type="time"
                className={styles.input}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading || !addressId}>
            {loading ? 'Submitting to create_booking()...' : 'Confirm & Request Booking'}
          </button>
        </form>

        <div className={styles.infoNote}>
          <strong>Database Note:</strong> Booking validation (future dates, customer address ownership,
          and partner availability) is enforced directly by MySQL stored procedure{' '}
          <code>create_booking</code> and associated triggers.
        </div>
      </div>
    </div>
  );
}
