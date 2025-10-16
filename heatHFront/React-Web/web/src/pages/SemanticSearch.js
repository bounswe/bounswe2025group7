import React, { useState, useEffect, useRef, useCallback } from 'react';
import Template from '../components/Template';
import semanticSearchService from '../services/semanticSearchService';
import { Box, TextField, Typography, List, ListItem, ListItemText, CircularProgress, ListItemAvatar, Avatar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function SemanticSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // navigate to recipe detail
  const handleRecipeClick = (recipe) => {
    const id = recipe?.id ?? recipe?._id;
    if (id) navigate(`/recipe/${id}`);
  };

  const doSearch = useCallback(async (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await semanticSearchService.search(trimmed);
      setResults(res || []);
    } catch (e) {
      setError(t('') || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <Template>
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 2 }}>
        <Typography variant="h5" gutterBottom>
          {t('') || 'Semantic Search'}
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('') || 'Search recipes'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          helperText={query.trim().length > 0 && query.trim().length < 3 ? (t('') || 'Please type at least 3 characters to search.') : ' '}
        />

        <Box sx={{ mt: 2 }}>
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography>{t('') || 'Loading...'}</Typography>
            </Box>
          )}

          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && results.length === 0 && query.trim().length >= 3 && (
            <Typography>{t('') || 'No results found.'}</Typography>
          )}

          <List>
            {results.map((r, idx) => (
              <ListItem
                key={r.id ?? r._id ?? idx}
                divider
                button
                onClick={() => handleRecipeClick(r)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={r.photo ?? r.imageUrl ?? r.image ?? r.thumbnail}
                    alt={r.title ?? r.name ?? 'recipe'}
                    variant="rounded"
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={r.title ?? r.name ?? r.recipeName ?? 'Untitled'}
                  secondary={r.summary ?? r.description ?? null}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Template>
  );
}