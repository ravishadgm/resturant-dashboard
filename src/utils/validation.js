export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[+]?[-\d\s()]{8,18}$/;
export function validateEntity(values, fields) {
  const errors = {};
  fields.forEach(({ name, label, required = true }) => {
    if (required && !String(values[name] ?? '').trim()) errors[name] = `${label} is required`;
  });
  if (values.email && !emailRegex.test(values.email)) errors.email = 'Enter a valid email address';
  if (values.phone && !phoneRegex.test(values.phone)) errors.phone = 'Enter a valid phone number';
  return errors;
}

