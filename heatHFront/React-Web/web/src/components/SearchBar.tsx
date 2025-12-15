import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextField, Box, Paper, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import semanticSearchService from '../services/semanticSearchService';

interface Recipe {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  recipeName?: string;
  photo?: string;
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
  summary?: string;
  description?: string;
}

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleRecipeClick = (recipe: Recipe): void => {
    const id = recipe?.id ?? recipe?._id;
    if (id) {
      navigate(`/recipe/${id}`);
      setQuery('');
      setOpen(false);
      setResults([]);
    }
  };

  const doSearch = useCallback(async (q: string): Promise<void> => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setError(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const res = await semanticSearchService.search(trimmed);
      setResults(res || []);
    } catch (e) {
      setError(t('semanticSearch.searchFailed'));
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Box ref={searchRef} sx={{ position: 'relative', flex: 1, maxWidth: 800, mx: 3 }}>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder={t('semanticSearch.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length >= 3) setOpen(true);
        }}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 1,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.7)',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
            opacity: 1,
          },
        }}
      />

      {open && (loading || results.length > 0 || error || (query.trim().length >= 3 && results.length === 0)) && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1.5,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">{t('semanticSearch.loading')}</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2 }}>
              <Typography color="error" variant="body2">{error}</Typography>
            </Box>
          )}

          {!loading && !error && results.length === 0 && query.trim().length >= 3 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">{t('semanticSearch.noResults')}</Typography>
            </Box>
          )}

          {!loading && !error && results.length > 0 && (
            <List sx={{ p: 0 }}>
              {results.map((r, idx) => (
                <ListItemButton
                  key={r.id ?? r._id ?? idx}
                  onClick={() => handleRecipeClick(r)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={r.photo ?? r.imageUrl ?? r.image ?? r.thumbnail}
                      alt={r.title ?? r.name ?? 'recipe'}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={r.title ?? r.name ?? r.recipeName ?? t('semanticSearch.untitled')}
                    secondary={r.summary ?? r.description ?? null}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;

