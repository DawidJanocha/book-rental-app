import React from 'react';

// ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΔΗΜΙΟΥΡΓΙΑ ΛΙΣΤΑΣ ΕΠΙΛΟΓΩΝ ΧΡΟΝΟΥ (15 ΕΩΣ 180 ΛΕΠΤΑ, ΚΑΘΕ 15 ΛΕΠΤΑ)
const generateDeliveryOptions = () => {
  const options = [];
  for (let minutes = 15; minutes <= 180; minutes += 15) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let label = '';
    if (hours > 0) label += `${hours} ώρα${hours > 1 ? 'ς' : ''}`;
    if (mins > 0) label += `${hours > 0 ? ' ' : ''}${mins} λεπτά`;
    options.push({ value: `${minutes}`, label });
  }
  return options;
};

// COMPONENT ΓΙΑ DROPDOWN ΜΕ ΕΚΤΙΜΩΜΕΝΟ ΧΡΟΝΟ ΠΑΡΑΔΟΣΗΣ
const DeliveryTimeDropdown = ({ value, onChange }) => {
  const options = generateDeliveryOptions();

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <label htmlFor="deliveryTime" style={{ fontWeight: 'bold' }}>
        ΕΚΤΙΜΩΜΕΝΟΣ ΧΡΟΝΟΣ ΠΑΡΑΔΟΣΗΣ:
      </label>
      <select
        id="deliveryTime"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '0.4rem',
          marginTop: '0.3rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '100%',
        }}
      >
        <option value="">-- ΕΠΙΛΕΞΤΕ ΧΡΟΝΟ --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeliveryTimeDropdown;

