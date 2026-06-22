import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiKey } from '../../../constants/Validations.js';
import { BASE_URL } from '../../../constants/EndPoints.js';
import '../PropertyDetails.css';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DeleteProperty({ propertyId, propertyTitle, onClose, onDeleted }) {

  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await axios.post(
        `${BASE_URL}Agent/Property/Delete`,
        { propertyId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.token}`,
            apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(t('property_deleted'));
      await onDeleted?.(propertyId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('failed_delete_property'));
    } finally {
      setDeleting(false);
    }
  }, [propertyId, onDeleted, onClose, t]);

  return (
    <div className="dp-overlay" onClick={onClose}>
      <div className="dp-modal" onClick={e => e.stopPropagation()}>

        <div className="dp-icon">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>

        <h5 className="dp-title">{t('delete_property_title')}</h5>
        <p className="dp-text">
          {t('delete_property_confirm')} <strong>"{propertyTitle}"</strong>?
          <br />
          {t('action_cannot_undone')}
        </p>

        <div className="dp-actions">
          <button className="dp-btn-cancel" onClick={onClose} disabled={deleting}>
            {t('cancel')}
          </button>
          <button className="dp-btn-delete" onClick={handleDelete} disabled={deleting}>
            {deleting
              ? <><span className="spinner-border spinner-border-sm me-2" />{t('deleting')}</>
              : <><i className="fa-solid fa-trash me-2" />{t('delete')}</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}