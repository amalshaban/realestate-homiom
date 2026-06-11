import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiKey } from '../../../../constants/Validations.js';
import { AGENT_URLs, GENERAL_URLs, LOCATIONS_URLs, BASE_URL } from '../../../../constants/EndPoints.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddRent() {

  const { t } = useTranslation();

  const [properties,    setProperties]    = useState([]);
  const [rentRequests,  setRentRequests]  = useState([]);
  const [rentTypes,     setRentTypes]     = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [nationalTypes, setNationalTypes] = useState([]);
  const [existingRent,  setExistingRent]  = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ mode: 'onBlur' });

  // ── Fetch all dropdowns ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [propsRes, rentReqRes, rentTypesRes, natRes, natTypesRes] = await Promise.all([
          axios.get(AGENT_URLs.Properties,                                    { headers: headers() }),
          axios.get(AGENT_URLs.RentalRequests,                                { headers: headers() }),
          axios.get(GENERAL_URLs.RentTypes,                                   { headers: headers() }),
          axios.get(`${BASE_URL}/Locations/Nationalities`,                    { headers: headers() }),
          axios.get(`${BASE_URL}/General/NationalTypes`,                      { headers: headers() }),
        ]);
        setProperties(propsRes.data.properties   || propsRes.data   || []);
        setRentRequests(rentReqRes.data           || []);
        setRentTypes(rentTypesRes.data            || []);
        setNationalities(natRes.data              || []);
        setNationalTypes(natTypesRes.data         || []);
      } catch {}
    };
    fetchAll();
  }, []);

  // ── Handle Property Select ──
  const handlePropertyRent = useCallback((propertyId) => {
    const rent = rentRequests.find(r => r.propertyId === Number(propertyId));
    if (rent) {
      setExistingRent(rent);
      setValue('rentRequestId', rent.requestId);
      setValue('fullName',      rent.userName);
      setValue('mobile',        rent.userPhone);
      setValue('rentTypeId',    rent.rentTypeId);
    } else {
      setExistingRent(null);
      setValue('rentRequestId', '');
      setValue('fullName',      '');
      setValue('mobile',        '');
      setValue('rentTypeId',    '');
    }
  }, [rentRequests, setValue]);

  // ── Submit ──
  const onSubmit = useCallback(async (data) => {
    setSubmitting(true);
    try {
      await axios.post(AGENT_URLs.RentCreate, data, { headers: headers() });
      toast.success(t('rent_contract_created'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('rent_contract_failed'));
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  return (
    <div className="add-prop-page">

      <h2 className="add-prop-title">
        <i className="fa-solid fa-file-contract me-2" style={{ color: '#0088BD' }} />
        {t('add_rental_contract')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <Row className="g-3">

          {/* Property */}
          <Col md={12}>
            <label className="add-prop-label">{t('property')}</label>
            <select className="add-prop-input"
              {...register('propertyId', {
                required: t('required'),
                onChange: e => handlePropertyRent(e.target.value),
              })}>
              <option value="">{t('select_property')}</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {errors.propertyId && <p className="add-prop-error-text">{errors.propertyId.message}</p>}
          </Col>

          {/* Start Date */}
          <Col md={6}>
            <label className="add-prop-label">{t('start_date')}</label>
            <input type="date" className="add-prop-input"
              {...register('startDate', { required: t('required') })} />
            {errors.startDate && <p className="add-prop-error-text">{errors.startDate.message}</p>}
          </Col>

          {/* End Date */}
          <Col md={6}>
            <label className="add-prop-label">{t('end_date')}</label>
            <input type="date" className="add-prop-input"
              {...register('endDate', { required: t('required') })} />
            {errors.endDate && <p className="add-prop-error-text">{errors.endDate.message}</p>}
          </Col>

          {/* Rent Type */}
          <Col md={6}>
            <label className="add-prop-label">{t('rent_type')}</label>
            <select className="add-prop-input"
              disabled={!!existingRent}
              {...register('rentTypeId', { required: t('required') })}>
              <option value="">{t('select_rent_type')}</option>
              {rentTypes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.rentTypeId && <p className="add-prop-error-text">{errors.rentTypeId.message}</p>}
          </Col>

          {/* Monthly Payment */}
          <Col md={6}>
            <label className="add-prop-label">{t('monthly_payment')}</label>
            <input type="number" className="add-prop-input"
              placeholder="0"
              {...register('monthlyPayment', { required: t('required') })} />
            {errors.monthlyPayment && <p className="add-prop-error-text">{errors.monthlyPayment.message}</p>}
          </Col>

          {/* Total Amount */}
          <Col md={6}>
            <label className="add-prop-label">{t('total_amount')}</label>
            <input type="number" className="add-prop-input"
              placeholder="0"
              {...register('totalAmount', { required: t('required') })} />
            {errors.totalAmount && <p className="add-prop-error-text">{errors.totalAmount.message}</p>}
          </Col>

          {/* Monthly Amount */}
          <Col md={6}>
            <label className="add-prop-label">{t('monthly_amount')}</label>
            <input type="number" className="add-prop-input"
              placeholder="0"
              {...register('monthlyAmount', { required: t('required') })} />
            {errors.monthlyAmount && <p className="add-prop-error-text">{errors.monthlyAmount.message}</p>}
          </Col>

          {/* Rent Request ID */}
          <Col md={6}>
            <label className="add-prop-label">{t('rent_request_id')}</label>
            <input type="text" className="add-prop-input"
              disabled={!!existingRent}
              {...register('rentRequestId', { required: t('required') })} />
            {errors.rentRequestId && <p className="add-prop-error-text">{errors.rentRequestId.message}</p>}
          </Col>

          {/* Full Name */}
          <Col md={6}>
            <label className="add-prop-label">{t('full_name')}</label>
            <input type="text" className="add-prop-input"
              disabled={!!existingRent}
              {...register('fullName', { required: t('required') })} />
            {errors.fullName && <p className="add-prop-error-text">{errors.fullName.message}</p>}
          </Col>

          {/* Nationality */}
          <Col md={6}>
            <label className="add-prop-label">{t('nationality')}</label>
            <select className="add-prop-input"
              {...register('nationalityId', { required: t('required') })}>
              <option value="">{t('select_nationality')}</option>
              {nationalities.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
            {errors.nationalityId && <p className="add-prop-error-text">{errors.nationalityId.message}</p>}
          </Col>

          {/* National Type */}
          <Col md={6}>
            <label className="add-prop-label">{t('national_type')}</label>
            <select className="add-prop-input"
              {...register('nationalTypeId', { required: t('required') })}>
              <option value="">{t('select_national_type')}</option>
              {nationalTypes.map(nt => (
                <option key={nt.id} value={nt.id}>{nt.name}</option>
              ))}
            </select>
            {errors.nationalTypeId && <p className="add-prop-error-text">{errors.nationalTypeId.message}</p>}
          </Col>

          {/* National ID */}
          <Col md={6}>
            <label className="add-prop-label">{t('national_id')}</label>
            <input type="text" className="add-prop-input"
              placeholder={t('national_id_placeholder')}
              {...register('nationalId', { required: t('required') })} />
            {errors.nationalId && <p className="add-prop-error-text">{errors.nationalId.message}</p>}
          </Col>

          {/* Mobile */}
          <Col md={6}>
            <label className="add-prop-label">{t('mobile')}</label>
            <input type="text" className="add-prop-input"
              disabled={!!existingRent}
              {...register('mobile', { required: t('required') })} />
            {errors.mobile && <p className="add-prop-error-text">{errors.mobile.message}</p>}
          </Col>

          {/* Status */}
          <Col md={6}>
            <label className="add-prop-label">{t('status')}</label>
            <input type="text" className="add-prop-input"
              placeholder={t('status_placeholder')}
              {...register('status', { required: t('required') })} />
            {errors.status && <p className="add-prop-error-text">{errors.status.message}</p>}
          </Col>

        </Row>

        {/* Footer */}
        <div className="add-prop-footer">
          <button type="submit" className="add-prop-submit-btn" disabled={submitting}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />{t('adding')}</>
              : <><i className="fa-solid fa-file-contract me-2" />{t('add_rental_contract')}</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}