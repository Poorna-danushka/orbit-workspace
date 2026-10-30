'use client';

import { useState } from 'react';

export default function useAuthRequestFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  return { loading, setLoading, error, setError, success, setSuccess };
}
