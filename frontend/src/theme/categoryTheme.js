export const categoryColors = {
  'Outdoor Recreation': '#4E8C6B',
  'Indoor Leisure': '#8A6BAE',
  'Fitness': '#D46B4E',
  'Social': '#3D8FB0',
  'Creative': '#C99A2E',
  'Errands & Chores': '#6B7685',
};

export function getCategoryColor(name) {
  return categoryColors[name] || '#5B6B7F';
}
