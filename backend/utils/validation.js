export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateNote = (note) => {
  const errors = [];

  if (!note.title || note.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!note.content || note.content.trim().length === 0) {
    errors.push('Content is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

