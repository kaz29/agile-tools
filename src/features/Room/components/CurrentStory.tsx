'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Link, IconButton, TextField, Button } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

interface CurrentStoryProps {
  story: string | null;
  storyUrl: string | null;
  isHost?: boolean;
  onClear?: () => void;
  onSetStory?: (story: string, storyUrl: string) => void;
}

export function CurrentStory({ story, storyUrl, isHost, onClear, onSetStory }: CurrentStoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [storyInput, setStoryInput] = useState(story || '');
  const [urlInput, setUrlInput] = useState(storyUrl || '');

  const hasStory = story || storyUrl;

  const handleSave = () => {
    if (onSetStory) {
      onSetStory(storyInput, urlInput);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setStoryInput(story || '');
    setUrlInput(storyUrl || '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setStoryInput(story || '');
    setUrlInput(storyUrl || '');
    setIsEditing(true);
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: hasStory ? 'primary.50' : 'grey.100',
        borderLeft: 4,
        borderColor: hasStory ? 'primary.main' : 'grey.400',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="overline" color="text.secondary">
          現在のストーリー
        </Typography>
        {isHost && hasStory && !isEditing && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleEdit}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
              aria-label="ストーリーを編集"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
              aria-label="ストーリーをクリア"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="タイトル"
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            fullWidth
            size="small"
            placeholder="例: ユーザーログイン機能の実装"
          />
          <TextField
            label="URL（任意）"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            fullWidth
            size="small"
            placeholder="例: https://jira.example.com/browse/PROJ-123"
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCancel} size="small">
              キャンセル
            </Button>
            <Button variant="contained" onClick={handleSave} size="small">
              保存
            </Button>
          </Box>
        </Box>
      ) : hasStory ? (
        <>
          {story && (
            <Typography variant="h6" gutterBottom>
              {story}
            </Typography>
          )}
          {storyUrl && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon fontSize="small" color="primary" />
              <Link
                href={storyUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {storyUrl}
              </Link>
            </Box>
          )}
        </>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ストーリーが設定されていません。
          </Typography>
          {isHost && onSetStory && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                size="small"
              >
                ストーリーを設定
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
