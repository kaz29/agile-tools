import { Box, Typography, Card, CardActionArea, Alert } from '@mui/material';
import { Style as StyleIcon } from '@mui/icons-material';

const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

interface CardSelectionProps {
  selectedCard: string | null;
  isRevealed: boolean;
  onCardSelect: (card: string) => void;
}

export function CardSelection({
  selectedCard,
  isRevealed,
  onCardSelect,
}: CardSelectionProps) {
  return (
    <Box sx={{ p: 2, pt: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <StyleIcon />
        <Typography variant="h6">
          カードを選択
        </Typography>
      </Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(5, 1fr)',
          sm: 'repeat(5, 1fr)',
          md: 'repeat(10, 1fr)'
        },
        gap: 1,
        maxWidth: '100%',
      }}>
        {CARDS.map((card) => (
          <Box key={card}>
            <Card
              elevation={selectedCard === card ? 8 : 1}
              sx={{
                aspectRatio: '2/3',
                maxWidth: '80px',
                margin: '0 auto',
                border: selectedCard === card ? 2 : 1,
                borderColor: selectedCard === card ? 'primary.main' : 'grey.300',
                bgcolor: selectedCard === card ? 'primary.50' : 'white',
                opacity: isRevealed ? 0.5 : 1,
                transition: 'all 0.2s',
                '&:hover': !isRevealed ? {
                  transform: 'scale(1.05)',
                  borderColor: 'grey.400',
                } : {},
              }}
            >
              <CardActionArea
                onClick={() => onCardSelect(card)}
                disabled={isRevealed}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: selectedCard === card ? 'primary.main' : 'text.primary',
                  }}
                >
                  {card}
                </Typography>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
      {selectedCard && !isRevealed && (
        <Alert severity="info" sx={{ mt: 2 }}>
          選択: <strong>{selectedCard}</strong>
        </Alert>
      )}
    </Box>
  );
}
