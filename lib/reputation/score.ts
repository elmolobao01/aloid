export function technicalRiskLabel(level?: string | null) {
  if (!level) return 'Não classificado';
  if (level === 'low') return 'Baixo risco';
  if (level === 'medium') return 'Atenção';
  if (level === 'high') return 'Alto risco';
  return level;
}

export function communityReputationLabel(score: number | null, reports: number) {
  if (!reports) return 'Sem avaliações';
  if (score === null) return 'Sem classificação';
  if (score >= 75) return 'Boa reputação';
  if (score >= 50) return 'Reputação moderada';
  if (score >= 25) return 'Atenção';
  return 'Reputação baixa';
}
